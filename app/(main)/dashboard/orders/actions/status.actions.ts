"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { UpdateOrderStatusSchema, UpdateOrderPrioritySchema } from "../validation";
import { ActionResult } from "@/lib/types";
import { releaseOrderReservation } from "./utils";

const { orders, inventoryItems, inventoryTransactions, inventoryStocks } = schema;

export async function updateOrderStatus(orderId: string, newStatus: string, reason?: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = UpdateOrderStatusSchema.safeParse({ orderId, newStatus, reason });
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: { items: { with: { inventory: true } } }
            });

            if (!order) throw new Error("Заказ не найден");
            const oldStatus = order.status;
            if (oldStatus === newStatus) return;

            // Status transition validation
            const allowedTransitions: Record<string, string[]> = {
                "new": ["design", "production", "cancelled"],
                "design": ["new", "production", "cancelled"],
                "production": ["done", "cancelled"],
                "done": ["shipped", "cancelled"],
                "shipped": ["cancelled"],
                "cancelled": ["new", "design", "production"]
            };

            const allowed = allowedTransitions[oldStatus as string] || [];
            if (!allowed.includes(newStatus)) {
                throw new Error(`Переход из ${oldStatus} в ${newStatus} не разрешен`);
            }

            // Stock Adjustment Logic
            const deductionStatuses = ["shipped", "done"];
            const isDeduction = deductionStatuses.includes(newStatus) && !deductionStatuses.includes(oldStatus as string);
            const isCancellation = (newStatus === "cancelled") && (oldStatus !== "cancelled") && !deductionStatuses.includes(oldStatus as string);

            for (const item of order.items) {
                const inventory = (item as typeof item & { inventory: typeof inventoryItems.$inferSelect | null }).inventory;
                if (item.inventoryId && inventory) {
                    const qty = item.quantity || 0;
                    const inventoryItemData = inventory;

                    if (isDeduction) {
                        await tx.update(inventoryItems)
                            .set({
                                reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${qty})`,
                                quantity: sql`GREATEST(0, ${inventoryItems.quantity} - ${qty})`
                            })
                            .where(eq(inventoryItems.id, item.inventoryId));

                        // Find best stock location
                        const [bestStock] = await tx.select().from(inventoryStocks)
                            .where(and(eq(inventoryStocks.itemId, item.inventoryId), gte(inventoryStocks.quantity, qty)))
                            .orderBy(desc(inventoryStocks.quantity))
                            .limit(1);

                        if (bestStock) {
                            await tx.update(inventoryStocks)
                                .set({ quantity: sql`GREATEST(0, ${inventoryStocks.quantity} - ${qty})` })
                                .where(eq(inventoryStocks.id, bestStock.id));
                        }

                        await tx.insert(inventoryTransactions).values({
                            itemId: item.inventoryId,
                            changeAmount: -qty,
                            type: "out",
                            reason: `Отгрузка: Заказ #${order.orderNumber}`,
                            createdBy: session.id,
                            storageLocationId: bestStock?.storageLocationId || null,
                            costPrice: inventoryItemData.costPrice || "0",
                        });
                    } else if (isCancellation) {
                        await releaseOrderReservation(orderId, tx);
                        break; // releaseOrderReservation handles all items, so we break
                    }
                }
            }

            await tx.update(orders)
                .set({
                    status: newStatus as typeof orders.$inferSelect.status,
                    cancelReason: reason || null,
                    updatedAt: new Date()
                })
                .where(eq(orders.id, orderId));

            await logAction("Обновлен статус", "order", orderId, { from: oldStatus, to: newStatus }, tx);

            const { autoGenerateTasks } = await import("@/lib/automations");
            await autoGenerateTasks(orderId, newStatus as typeof orders.$inferSelect.status, session.id);
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/orders/${orderId}`, method: "updateOrderStatus" });
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}

export async function updateOrderPriority(orderId: string, newPriority: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = UpdateOrderPrioritySchema.safeParse({ priority: newPriority });
        if (!validated.success) return { success: false, error: "Некорректный приоритет" };

        await db.update(orders).set({ priority: validated.data.priority, updatedAt: new Date() }).where(eq(orders.id, orderId));
        await logAction("Обновлен приоритет", "order", orderId, { priority: newPriority });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/orders/${orderId}`, method: "updateOrderPriority" });
        return { success: false, error: "Ошибка" };
    }
}
