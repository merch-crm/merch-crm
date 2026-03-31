"use server";

import { z } from "zod";

import { desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { inventoryTransactions } from "@/lib/schema";
import { logAction } from "@/lib/audit";
import { withAuth } from "@/lib/action-helpers";

import { type ActionResult, okVoid, ok, ERRORS } from "@/lib/types";
import { type ItemHistoryTransaction } from "./types";

export async function getInventoryHistory(): Promise<ActionResult<ItemHistoryTransaction[]>> {
    return withAuth(async () => {
        const history = await db.query.inventoryTransactions.findMany({
            with: {
                item: true,
                storageLocation: true,
                fromStorageLocation: true,
                creator: {
                    with: {
                        role: true
                    }
                }
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 100
        });
        return ok(history as unknown as ItemHistoryTransaction[]);
    }, { errorPath: "getInventoryHistory" });
}

/**
 * Delete specific inventory transactions (Admin only)
 */
export async function deleteInventoryTransactions(ids: string[]): Promise<ActionResult> {
    const validation = z.array(z.string().uuid()).safeParse(ids);
    if (!validation.success) {
        return ERRORS.VALIDATION("Неверный формат идентификаторов");
    }

    return withAuth(async () => {
        await db.delete(inventoryTransactions).where(inArray(inventoryTransactions.id, ids));

        await logAction("Удаление записей истории", "inventory_transaction_bulk", ids.join(","), { count: ids.length });

        revalidatePath("/dashboard/warehouse");
        return okVoid();
    }, { 
        roles: ["Администратор"],
        errorPath: "deleteInventoryTransactions" 
    });
}

/**
 * Clear all inventory movement history (Admin only)
 */
export async function clearInventoryHistory(): Promise<ActionResult> {
    return withAuth(async () => {
        await db.delete(inventoryTransactions);
        await logAction("Очистка истории инвентаря", "inventory_history", "all", {});
        revalidatePath("/dashboard/warehouse");
        return okVoid();
    }, { 
        roles: ["Администратор"],
        errorPath: "clearInventoryHistory" 
    });
}
