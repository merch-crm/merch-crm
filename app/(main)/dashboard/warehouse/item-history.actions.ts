"use server";

import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryTransactions } from "@/lib/schema/warehouse/stock";
import { orderItems } from "@/lib/schema/orders";
import { withAuth } from "@/lib/action-helpers";
import { type ActionResult, ok, ERRORS } from "@/lib/types";
import { type ItemHistoryTransaction, type ActiveOrderItem } from "./types";

/**
 * Get full history of inventory transactions for a specific item
 */
export async function getItemHistory(itemId: string): Promise<ActionResult<ItemHistoryTransaction[]>> {
  const idValidation = z.string().uuid().safeParse(itemId);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID товара");
  }

  return withAuth(async () => {
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
    return ok(history as unknown as ItemHistoryTransaction[]);
  }, { errorPath: "getItemHistory" });
}

/**
 * Get active (non-shipped/non-cancelled) orders containing a specific item
 */
export async function getItemActiveOrders(itemId: string): Promise<ActionResult<ActiveOrderItem[]>> {
  const idValidation = z.string().uuid().safeParse(itemId);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID товара");
  }

  return withAuth(async () => {
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

    return ok(filtered as unknown as ActiveOrderItem[]);
  }, { errorPath: "getItemActiveOrders" });
}
