"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray, and, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { inventoryStocks, inventoryTransactions } from "@/lib/schema/warehouse/stock";
import { storageLocations } from "@/lib/schema/storage";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { withAuth } from "@/lib/action-helpers";

import { type ActionResult, okVoid, ok, ERRORS } from "@/lib/types";
import { BulkActionSchema, BulkMoveSchema, BulkUpdateCategorySchema } from "./validation";

/**
 * Archive multiple inventory items
 */
export async function archiveInventoryItems(ids: string[], reason: string): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids, reason });
    if (!validated.success) {
        return ERRORS.VALIDATION(validated.error.issues[0].message);
    }

    return withAuth(async (session) => {
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

        return okVoid();
    }, { 
        roles: ["admin", "management", "warehouse"],
        errorPath: "archiveInventoryItems" 
    });
}

/**
 * Restore multiple inventory items from archive
 */
export async function restoreInventoryItems(ids: string[], reason: string): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids, reason });
    if (!validated.success) {
        return ERRORS.VALIDATION(validated.error.issues[0].message);
    }

    return withAuth(async () => {
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

        return okVoid();
    }, { 
        roles: ["admin", "management", "warehouse"],
        errorPath: "restoreInventoryItems" 
    });
}

/**
 * Delete multiple inventory items
 */
export async function deleteInventoryItems(ids: string[]): Promise<ActionResult> {
    const validated = BulkActionSchema.safeParse({ ids });
    if (!validated.success) {
        return ERRORS.VALIDATION(validated.error.issues[0].message);
    }

    return withAuth(async () => {
        await db.delete(inventoryItems).where(inArray(inventoryItems.id, ids));
        await logAction("Удаление товаров", "inventory_item_bulk", ids.join(","), { count: ids.length });
        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");

        return okVoid();
    }, { 
        roles: ["admin"],
        errorPath: "deleteInventoryItems" 
    });
}

/**
 * Automatically archive items with 0 stock that haven't been updated for 3 months
 */
export async function autoArchiveStaleItems(): Promise<ActionResult<{ archivedCount: number }>> {
    return withAuth(async () => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const staleItems = await db.query.inventoryItems.findMany({
            where: and(
                eq(inventoryItems.isArchived, false),
                eq(inventoryItems.quantity, 0),
                lt(inventoryItems.updatedAt, threeMonthsAgo)
            ),
            limit: 1000
        });

        if (staleItems.length === 0) {
            return ok({ archivedCount: 0 });
        }

        const ids = staleItems.map(i => i.id);
        await logAction("Запуск авто-архивации", "inventory_item_bulk", "auto", { count: ids.length });
        
        // Internal call to archiveInventoryItems (but we need to be careful with session nesting)
        // Since archiveInventoryItems also uses withAuth, it's better to perform the update directly here 
        // to avoid double auth wrapping or just pass the logic.
        
        await db.update(inventoryItems)
            .set({
                isArchived: true,
                archiveReason: "Автоматическая архивация (остаток 0 более 3 месяцев)",
                archivedAt: new Date(),
                updatedAt: new Date()
            })
            .where(inArray(inventoryItems.id, ids));

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");

        return ok({ archivedCount: staleItems.length });
    }, { errorPath: "autoArchiveStaleItems" });
}

/**
 * Bulk move items to a new storage location
 */
export async function bulkMoveInventoryItems(ids: string[], targetLocationId: string, reason: string): Promise<ActionResult> {
    const validated = BulkMoveSchema.safeParse({ itemIds: ids, targetLocationId, reason });
    if (!validated.success) {
        return ERRORS.VALIDATION(validated.error.issues[0].message);
    }

    return withAuth(async (session) => {
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

            // 7. Update updatedAt for items in bulk
            await tx.update(inventoryItems)
                .set({ updatedAt: new Date() })
                .where(inArray(inventoryItems.id, ids));
        });

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        return okVoid();
    }, { 
        roles: ["admin", "management", "warehouse"],
        errorPath: "bulkMoveInventoryItems" 
    });
}

/**
 * Bulk update category for items
 */
export async function bulkUpdateInventoryCategory(ids: string[], categoryId: string): Promise<ActionResult> {
    const validated = BulkUpdateCategorySchema.safeParse({ ids, categoryId });
    if (!validated.success) {
        return ERRORS.VALIDATION(validated.error.issues[0].message);
    }

    return withAuth(async () => {
        await db.update(inventoryItems)
            .set({ categoryId, updatedAt: new Date() })
            .where(inArray(inventoryItems.id, ids));

        invalidateCache("warehouse:*");
        revalidatePath("/dashboard/warehouse");
        return okVoid();
    }, { 
        roles: ["admin", "management", "warehouse"],
        errorPath: "bulkUpdateInventoryCategory" 
    });
}
