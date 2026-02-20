"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray, and, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems, inventoryStocks, inventoryTransactions, storageLocations } from "@/lib/schema";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";

import { type ActionResult } from "@/lib/types";
import { BulkActionSchema, BulkMoveSchema, BulkUpdateCategorySchema } from "./validation";


/**
 * Archive multiple inventory items
 */
export async function archiveInventoryItems(ids: string[], reason: string): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids, reason });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const session = await getSession();

    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.update(inventoryItems)
            .set({
                isArchived: true,
                archiveReason: reason,
                archivedAt: new Date(),
                archivedBy: session.id,
                updatedAt: new Date()
            })
            .where(inArray(inventoryItems.id, ids));

        await logAction("Архивация товаров", "inventory_item_bulk", ids.join(","), { count: ids.length, reason });
        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "archiveInventoryItems",
            details: { ids, reason }
        });
        return { success: false, error: "Не удалось архивировать товары" };
    }
}

/**
 * Restore multiple inventory items from archive
 */
export async function restoreInventoryItems(ids: string[], reason: string): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids, reason });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const session = await getSession();

    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.update(inventoryItems)
            .set({
                isArchived: false,
                archiveReason: null,
                archivedAt: null,
                archivedBy: null,
                updatedAt: new Date()
            })
            .where(inArray(inventoryItems.id, ids));

        await logAction("Восстановление товаров", "inventory_item_bulk", ids.join(","), { count: ids.length, reason });
        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "restoreInventoryItems",
            details: { ids, reason }
        });
        return { success: false, error: "Не удалось восстановить товары" };
    }
}

/**
 * Delete multiple inventory items
 */
export async function deleteInventoryItems(ids: string[]): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const session = await getSession();

    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Только администратор может удалять товары навсегда" };
    }

    // Optional password check logic could be here if needed, 
    // but typically it's handled in the UI before calling the action.

    try {
        await db.delete(inventoryItems).where(inArray(inventoryItems.id, ids));
        await logAction("Удаление товаров", "inventory_item_bulk", ids.join(","), { count: ids.length });
        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "deleteInventoryItems",
            details: { ids }
        });
        return { success: false, error: "Не удалось удалить товары" };
    }
}

/**
 * Automatically archive items with 0 stock that haven't been updated for 3 months
 */
export async function autoArchiveStaleItems(): Promise<ActionResult<{ archivedCount: number }>> {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const staleItems = await db.query.inventoryItems.findMany({
            where: and(
                eq(inventoryItems.isArchived, false),
                eq(inventoryItems.quantity, 0),
                eq(inventoryItems.quantity, 0),
                lt(inventoryItems.updatedAt, threeMonthsAgo)
            ),
            limit: 1000
        });

        if (staleItems.length === 0) {
            return { success: true, data: { archivedCount: 0 } };
        }

        const ids = staleItems.map(i => i.id);
        const res = await archiveInventoryItems(ids, "Автоматическая архивация (остаток 0 более 3 месяцев)");

        if (res.success) {
            return {
                success: true,
                data: { archivedCount: staleItems.length }
            };
        }

        return {
            success: false,
            error: res.error || "Не удалось запустить авто-архивацию"
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "autoArchiveStaleItems"
        });
        return { success: false, error: "Не удалось запустить авто-архивацию" };
    }
}

/**
 * Bulk move items to a new storage location
 */
export async function bulkMoveInventoryItems(ids: string[], targetLocationId: string, reason: string): Promise<ActionResult> {
    const validated = BulkMoveSchema.safeParse({ itemIds: ids, targetLocationId, reason });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const session = await getSession();

    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Fetch all existing stocks for the targeted items
            const allCurrentStocks = await tx.select()
                .from(inventoryStocks)
                .where(inArray(inventoryStocks.itemId, ids));

            // 2. Fetch target location name for the transaction reason
            const [targetLoc] = await tx.select({ name: storageLocations.name })
                .from(storageLocations)
                .where(eq(storageLocations.id, targetLocationId))
                .limit(1);

            const targetName = targetLoc?.name || "Неизвестный склад";
            const logMessage = `Массовое перемещение: ${reason} (на ${targetName})`;

            // 3. Group quantities by itemId in memory
            const itemQuantities = ids.reduce((acc, id) => {
                const itemStocks = allCurrentStocks.filter(s => s.itemId === id);
                acc[id] = itemStocks.reduce((sum, s) => sum + s.quantity, 0);
                return acc;
            }, {} as Record<string, number>);

            // 4. Delete old stock records for these items in one go
            await tx.delete(inventoryStocks).where(inArray(inventoryStocks.itemId, ids));

            // 5. Prepare batch inserts for new stocks and transactions
            const newStocks = [];
            const newTransactions = [];

            for (const id of ids) {
                const totalQty = itemQuantities[id];
                if (totalQty > 0) {
                    newStocks.push({
                        itemId: id,
                        storageLocationId: targetLocationId,
                        quantity: totalQty,
                        updatedAt: new Date()
                    });
                }

                newTransactions.push({
                    itemId: id,
                    changeAmount: totalQty,
                    type: "transfer" as const,
                    reason: logMessage,
                    storageLocationId: targetLocationId,
                    createdBy: session.id
                });
            }

            // 6. Execute batch inserts
            if (newStocks.length > 0) {
                await tx.insert(inventoryStocks).values(newStocks);
            }
            if (newTransactions.length > 0) {
                await tx.insert(inventoryTransactions).values(newTransactions);
            }

            // 7. Update updatedAt for items in bulk (optional but good for cache)
            await tx.update(inventoryItems)
                .set({ updatedAt: new Date() })
                .where(inArray(inventoryItems.id, ids));
        });

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "bulkMoveInventoryItems",
            details: { ids, targetLocationId }
        });
        return { success: false, error: "Не удалось переместить товары" };
    }
}

/**
 * Bulk update category for items
 */
export async function bulkUpdateInventoryCategory(ids: string[], categoryId: string): Promise<ActionResult> {
    const validated = BulkUpdateCategorySchema.safeParse({ ids, categoryId });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const session = await getSession();

    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.update(inventoryItems)
            .set({ categoryId, updatedAt: new Date() })
            .where(inArray(inventoryItems.id, ids));

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-actions",
            method: "bulkUpdateInventoryCategory",
            details: { ids, categoryId }
        });
        return { success: false, error: "Не удалось обновить категорию" };
    }
}
