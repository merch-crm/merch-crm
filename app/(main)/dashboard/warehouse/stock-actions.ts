"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, and, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions,
    inventoryStocks,
    inventoryTransfers,
    storageLocations,
} from "@/lib/schema";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { checkItemStockAlerts } from "@/lib/notifications";
import { AdjustStockSchema, TransferStockSchema, MoveItemSchema } from "./validation";

import { type ActionResult } from "@/lib/types";

/**
 * Adjust stock of an item (in, out, or set)
 */
export async function adjustInventoryStock(
    itemId: string,
    amount: number,
    type: "in" | "out" | "set",
    reason: string,
    storageLocationId?: string,
    costPrice?: number
): Promise<ActionResult> {
    const validation = AdjustStockSchema.safeParse({
        itemId, amount, type, reason, storageLocationId, costPrice
    });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.transaction(async (tx) => {
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
            if (!item) throw new Error("Item not found");

            let netChange = 0;
            let effectiveType: "in" | "out" = "in";

            if (type === "set") {
                let currentQty = 0;
                if (storageLocationId) {
                    const [existingStock] = await tx
                        .select()
                        .from(inventoryStocks)
                        .where(and(
                            eq(inventoryStocks.itemId, itemId),
                            eq(inventoryStocks.storageLocationId, storageLocationId)
                        ))
                        .limit(1);
                    currentQty = existingStock?.quantity || 0;
                } else {
                    currentQty = item.quantity;
                }
                netChange = amount - currentQty;
                effectiveType = netChange >= 0 ? "in" : "out";
            } else {
                netChange = amount * (type === "in" ? 1 : -1);
                effectiveType = type;
            }

            if (netChange === 0 && type === "set") return;

            if (storageLocationId) {
                const [existingStock] = await tx
                    .select()
                    .from(inventoryStocks)
                    .where(and(
                        eq(inventoryStocks.itemId, itemId),
                        eq(inventoryStocks.storageLocationId, storageLocationId)
                    ))
                    .limit(1);

                if (existingStock) {
                    await tx.update(inventoryStocks)
                        .set({ quantity: existingStock.quantity + netChange, updatedAt: new Date() })
                        .where(eq(inventoryStocks.id, existingStock.id));
                } else {
                    await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId,
                        quantity: netChange
                    });
                }
            }

            const stocksForThisItem = await tx.query.inventoryStocks.findMany({
                where: eq(inventoryStocks.itemId, itemId),
                limit: 100
            });
            const totalStockQuantity = stocksForThisItem.reduce((sum, s) => sum + s.quantity, 0);

            const updateValues: Record<string, unknown> = {
                quantity: totalStockQuantity,
                updatedAt: new Date()
            };

            if (costPrice !== undefined) {
                updateValues.costPrice = costPrice.toString();
            }

            if (totalStockQuantity <= 0) {
                if (!item.zeroStockSince) {
                    updateValues.zeroStockSince = new Date();
                }
            } else {
                updateValues.zeroStockSince = null;
            }

            await tx.update(inventoryItems)
                .set(updateValues)
                .where(eq(inventoryItems.id, itemId));

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: netChange,
                type: effectiveType,
                reason: type === "set" ? `Корректировка остатка: ${reason}` : reason,
                storageLocationId: storageLocationId || null,
                costPrice: costPrice !== undefined ? costPrice.toString() : null,
                createdBy: session.id,
            });

            await logAction(
                type === "set" ? "Корректировка" : (effectiveType === "in" ? "Поставка" : "Списание"),
                "inventory_item",
                itemId,
                {
                    name: item.name,
                    amount: Math.abs(netChange),
                    reason,
                    storageLocationId,
                    newTotalQuantity: totalStockQuantity
                },
                tx
            );
        });

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        await checkItemStockAlerts(itemId);

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/warehouse/adjust/${itemId}`,
            method: "adjustInventoryStock",
            details: { itemId, amount, type, reason, storageLocationId }
        });
        return { success: false, error: error instanceof Error ? error.message : "Не удалось скорректировать остаток" };
    }
}

/**
 * Transfer stock between locations
 */
export async function transferInventoryStock(itemId: string, fromLocationId: string, toLocationId: string, amount: number, reason: string): Promise<ActionResult> {
    const validation = TransferStockSchema.safeParse({ itemId, fromLocationId, toLocationId, amount, reason });
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (fromLocationId === toLocationId) return { success: false, error: "Точка отправления и назначения должны быть разными" };

    try {
        await db.transaction(async (tx) => {
            const [fromLoc, toLoc] = await Promise.all([
                tx.select().from(storageLocations).where(eq(storageLocations.id, fromLocationId)).limit(1),
                tx.select().from(storageLocations).where(eq(storageLocations.id, toLocationId)).limit(1)
            ]);

            const fromName = fromLoc[0]?.name || "Неизвестный склад";
            const toName = toLoc[0]?.name || "Неизвестный склад";

            const [sourceStock] = await tx
                .select()
                .from(inventoryStocks)
                .where(and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                ))
                .limit(1);

            if (!sourceStock || sourceStock.quantity < amount) {
                throw new Error("Недостаточно остатка на складе отправителе");
            }

            const [destStock] = await tx
                .select()
                .from(inventoryStocks)
                .where(and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, toLocationId)
                ))
                .limit(1);

            await tx.update(inventoryStocks)
                .set({ quantity: sourceStock.quantity - amount, updatedAt: new Date() })
                .where(eq(inventoryStocks.id, sourceStock.id));

            if (destStock) {
                await tx.update(inventoryStocks)
                    .set({ quantity: destStock.quantity + amount, updatedAt: new Date() })
                    .where(eq(inventoryStocks.id, destStock.id));
            } else {
                await tx.insert(inventoryStocks).values({
                    itemId,
                    storageLocationId: toLocationId,
                    quantity: amount
                });
            }

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: amount,
                type: "transfer",
                reason: `Перемещение со склада «${fromName}» на «${toName}». Причина: ${reason}`,
                storageLocationId: toLocationId,
                fromStorageLocationId: fromLocationId,
                createdBy: session.id,
            });

            await logAction("Перемещение", "inventory_item", itemId, {
                from: fromLocationId,
                to: toLocationId,
                amount,
                reason
            }, tx);
        });

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Не удалось переместить товары" };
    }
}

/**
 * Get stocks for a specific item
 */
type InventoryStock = InferSelectModel<typeof inventoryStocks>;
type StorageLocation = InferSelectModel<typeof storageLocations>;

export async function getItemStocks(itemId: string): Promise<ActionResult<(InventoryStock & { storageLocation: StorageLocation })[]>> {
    try {
        const stocks = await db.query.inventoryStocks.findMany({
            where: eq(inventoryStocks.itemId, itemId),
            with: {
                storageLocation: true
            },
            limit: 100
        });
        return { success: true, data: stocks };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/stock-actions",
            method: "getItemStocks",
            details: { itemId }
        });
        return { success: false, error: "Не удалось загрузить остатки" };
    }
}

/**
 * Move inventory item between storage locations (single item transfer via FormData)
 */
export async function moveInventoryItem(formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Not authorized" };

    const validation = MoveItemSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { itemId, fromLocationId, toLocationId, quantity, comment } = validation.data;

    if (fromLocationId === toLocationId) {
        return { success: false, error: "Source and destination cannot be the same" };
    }

    try {
        await db.transaction(async (tx) => {
            const [fromLocation] = await tx.select({ name: storageLocations.name }).from(storageLocations).where(eq(storageLocations.id, fromLocationId)).limit(1);
            const [toLocation] = await tx.select({ name: storageLocations.name }).from(storageLocations).where(eq(storageLocations.id, toLocationId)).limit(1);

            if (!fromLocation || !toLocation) {
                throw new Error("One or both locations not found");
            }

            const fromName = fromLocation.name;
            const toName = toLocation.name;
            const logMessage = `Перемещение со склада «${fromName}» на «${toName}»${comment ? `. Причина: ${comment}` : ""}`;

            const sourceStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                )
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error("Недостаточно товара на исходном складе");
            }

            await tx.update(inventoryStocks)
                .set({
                    quantity: sql`${inventoryStocks.quantity} - ${quantity}`,
                    updatedAt: new Date()
                })
                .where(eq(inventoryStocks.id, sourceStock.id));

            await tx.update(inventoryItems)
                .set({ updatedAt: new Date() })
                .where(eq(inventoryItems.id, itemId));

            const targetStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, toLocationId)
                )
            });

            if (targetStock) {
                await tx.update(inventoryStocks)
                    .set({
                        quantity: sql`${inventoryStocks.quantity} + ${quantity}`,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryStocks.id, targetStock.id));
            } else {
                await tx.insert(inventoryStocks).values({
                    itemId,
                    storageLocationId: toLocationId,
                    quantity: quantity,
                    updatedAt: new Date()
                });
            }

            await tx.insert(inventoryTransfers).values({
                itemId,
                fromLocationId,
                toLocationId,
                quantity,
                comment,
                createdBy: session?.id
            });

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: quantity,
                type: "transfer",
                reason: logMessage,
                storageLocationId: toLocationId,
                fromStorageLocationId: fromLocationId,
                createdBy: session?.id
            });

            const stocksForThisItem = await tx.query.inventoryStocks.findMany({
                where: eq(inventoryStocks.itemId, itemId),
                limit: 100
            });
            const totalQuantity = stocksForThisItem.reduce((sum, s) => sum + s.quantity, 0);

            await tx.update(inventoryItems)
                .set({
                    quantity: totalQuantity,
                    updatedAt: new Date()
                })
                .where(eq(inventoryItems.id, itemId));
        });

        revalidatePath("/dashboard/warehouse", "layout");
        await checkItemStockAlerts(itemId);
        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/warehouse/move",
            method: "moveInventoryItem",
            details: { itemId, fromLocationId, toLocationId, quantity }
        });
        return { success: false, error: (error as Error).message || "Failed to move inventory" };
    }
}
