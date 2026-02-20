"use server";

import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryTransactions, orderItems } from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { type ActionResult } from "@/lib/types";
import { type ItemHistoryTransaction, type ActiveOrderItem } from "./types";

/**
 * Get full history of inventory transactions for a specific item
 */
export async function getItemHistory(itemId: string): Promise<ActionResult<ItemHistoryTransaction[]>> {
    const validation = z.string().uuid().safeParse(itemId);
    if (!validation.success) {
        return { success: false, error: "Некорректный ID товара" };
    }

    try {
        const history = await db.query.inventoryTransactions.findMany({
            where: eq(inventoryTransactions.itemId, itemId),
            with: {
                creator: {
                    with: {
                        role: true
                    }
                },
                storageLocation: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 1000
        });
        return { success: true, data: history as unknown as ItemHistoryTransaction[] };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-history.actions",
            method: "getItemHistory",
            details: { itemId }
        });
        return { success: false, error: "Не удалось загрузить историю товара" };
    }
}

/**
 * Get active (non-shipped/non-cancelled) orders containing a specific item
 */
export async function getItemActiveOrders(itemId: string): Promise<ActionResult<ActiveOrderItem[]>> {
    const validation = z.string().uuid().safeParse(itemId);
    if (!validation.success) {
        return { success: false, error: "Некорректный ID товара" };
    }

    try {
        const activeOrders = await db.query.orderItems.findMany({
            where: eq(orderItems.inventoryId, itemId),
            with: {
                order: {
                    with: {
                        client: true
                    }
                }
            },
            limit: 100
        });

        const filtered = activeOrders.filter(oi =>
            oi.order &&
            oi.order.status &&
            !["cancelled", "shipped"].includes(oi.order.status)
        );

        return { success: true, data: filtered as unknown as ActiveOrderItem[] };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-history.actions",
            method: "getItemActiveOrders",
            details: { itemId }
        });
        return { success: false, error: "Не удалось загрузить заказы товара" };
    }
}
