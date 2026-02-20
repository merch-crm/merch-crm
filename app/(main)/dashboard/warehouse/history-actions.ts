"use server";

import { z } from "zod";

import { desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { inventoryTransactions } from "@/lib/schema";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";

import { type ActionResult } from "@/lib/types";
import { type ItemHistoryTransaction } from "./types";

export async function getInventoryHistory(): Promise<ActionResult<ItemHistoryTransaction[]>> {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            with: {
                item: true,
                storageLocation: true,
                fromStorageLocation: true,
                creator: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 100
        });
        return { success: true, data: history as unknown as ItemHistoryTransaction[] };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/history-actions",
            method: "getInventoryHistory"
        });
        return { success: false, error: "Не удалось загрузить историю перемещений" };
    }
}

/**
 * Delete specific inventory transactions (Admin only)
 */
export async function deleteInventoryTransactions(ids: string[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = z.array(z.string().uuid()).safeParse(ids);
    if (!validation.success) {
        return { success: false, error: "Неверный формат идентификаторов" };
    }

    try {
        await db.delete(inventoryTransactions).where(inArray(inventoryTransactions.id, ids));

        await logAction("Удаление записей истории", "inventory_transaction_bulk", ids.join(","), { count: ids.length });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/history-actions",
            method: "deleteInventoryTransactions",
            details: { ids }
        });
        return { success: false, error: "Ошибка при удалении записей" };
    }
}

/**
 * Clear all inventory movement history (Admin only)
 */
export async function clearInventoryHistory(): Promise<ActionResult> {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.delete(inventoryTransactions);
        await logAction("Очистка истории инвентаря", "inventory_history", "all", {});
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/history-actions",
            method: "clearInventoryHistory"
        });
        return { success: false, error: "Ошибка при очистке истории" };
    }
}
