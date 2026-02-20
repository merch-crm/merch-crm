"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

const { inventoryItems, orderItems } = schema;

export type Transaction = NodePgDatabase<typeof schema> | Parameters<Parameters<NodePgDatabase<typeof schema>['transaction']>[0]>[0];

/**
 * Helper to release inventory reservations for a specific order.
 * This is used when an order is cancelled or deleted.
 */
export async function releaseOrderReservation(orderId: string, tx?: Transaction) {
    const d = tx || db;

    const items = await d.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
        with: { inventory: true },
        limit: 100 // Safety limit
    });

    for (const item of items) {
        if (item.inventoryId) {
            // Atomic decrement to avoid race conditions
            await d.update(inventoryItems)
                .set({
                    reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${item.quantity})`
                })
                .where(eq(inventoryItems.id, item.inventoryId));
        }
    }
}
