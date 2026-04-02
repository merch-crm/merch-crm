"use server";

import { eq, sql, and, inArray } from "drizzle-orm";
import { orders, orderItems } from "@/lib/schema/orders";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { OrderStatus } from "@/lib/types/orders";
import { AppSchema } from "@/lib/db";

export type Transaction = NodePgDatabase<AppSchema> | Parameters<Parameters<NodePgDatabase<AppSchema>['transaction']>[0]>[0];

/** Helper to release inventory reservations for multiple orders atomically */
export async function releaseReservationsForOrders(orderIds: string[], tx: Transaction) {
    if (orderIds.length === 0) return;

    const reservationStatuses: OrderStatus[] = ["new", "design", "production"];

    // Find all orders that have reserved status
    const targetOrders = await tx.query.orders.findMany({
        where: and(
            inArray(orders.id, orderIds), 
            inArray(orders.status, reservationStatuses)
        ),
        limit: 500
    });

    if (targetOrders.length === 0) return;

    const actualOrderIds = targetOrders.map(o => o.id);

    // Find all items for these orders
    const items = await tx.query.orderItems.findMany({
        where: inArray(orderItems.orderId, actualOrderIds),
        limit: 1000
    });

    for (const item of items) {
        if (item.inventoryId) {
            await tx.update(inventoryItems)
                .set({
                    reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${item.quantity})`
                })
                .where(eq(inventoryItems.id, item.inventoryId));
        }
    }
}
