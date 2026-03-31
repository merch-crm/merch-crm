"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { withAuth, ROLE_GROUPS, ROLES } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { UpdateOrderStatusSchema, UpdateOrderPrioritySchema } from "../validation";
import { ActionResult, okVoid, ERRORS } from "@/lib/types";
import { releaseOrderReservation } from "./utils";

const { orders, inventoryItems, inventoryTransactions, inventoryStocks } = schema;

export async function updateOrderStatus(orderId: string, newStatus: string, reason?: string): Promise<ActionResult> {
    const validated = UpdateOrderStatusSchema.safeParse({ orderId, newStatus, reason });
    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    return withAuth(async (session) => {
        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: { items: { with: { inventory: true } } }
            });

            if (!order) throw new Error("Заказ не найден");
            const oldStatus = order.status;
            if (oldStatus === newStatus) return;

            // Status transition validation
            // Admins and Management can jump any status
            const isAdmin = ROLE_GROUPS.ADMINS.includes(session.roleName);
            
            const allowedTransitions: Record<string, string[]> = {
                "new": ["design", "production", "cancelled"], 
                "design": ["new", "production", "cancelled"], 
                "production": ["done", "cancelled"], 
                "done": ["shipped", "cancelled"], 
                "shipped": ["cancelled"], 
                "cancelled": ["new", "design", "production"]
            };

            const allowed = allowedTransitions[oldStatus as string] || [];
            if (!isAdmin && !allowed.includes(newStatus)) {
                throw new Error(`Переход из ${oldStatus} в ${newStatus} не разрешен для вашей роли`);
            }

            // Stock Adjustment Logic
            const deductionStatuses = ["shipped", "done"];
            const isDeduction = deductionStatuses.includes(newStatus) && !deductionStatuses.includes(oldStatus as string);
            const isCancellation = (newStatus === "cancelled") && (oldStatus !== "cancelled") && !deductionStatuses.includes(oldStatus as string);

            for (const item of order.items) {
                const inventory = item.inventory;
                if (item.inventoryId && inventory) {
                    const qty = item.quantity || 0;

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
                            costPrice: inventory.costPrice || "0",
                        });
                    } else if (isCancellation) {
                        await releaseOrderReservation(orderId, tx);
                        break; // releaseOrderReservation handles all items, so we break
                    }
                }
            }

            await tx.update(orders)
                .set({
                    status: newStatus as typeof orders.$inferInsert.status,
                    cancelReason: reason || null,
                    updatedAt: new Date()
                })
                .where(eq(orders.id, orderId));

            await logAction("Обновлен статус", "order", orderId, { from: oldStatus, to: newStatus }, tx);

            const { autoGenerateTasks } = await import("@/lib/automations");
            await autoGenerateTasks(orderId, newStatus, session.id!);
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return okVoid();
    }, { roles: ROLE_GROUPS.CAN_EDIT_ORDERS, errorPath: "updateOrderStatus" });
}

export async function updateOrderPriority(orderId: string, newPriority: string): Promise<ActionResult> {
    const validated = UpdateOrderPrioritySchema.safeParse({ priority: newPriority });
    if (!validated.success) return ERRORS.VALIDATION("Некорректный приоритет");

    return withAuth(async () => {
        await db.update(orders).set({ priority: validated.data.priority, updatedAt: new Date() }).where(eq(orders.id, orderId));
        await logAction("Обновлен приоритет", "order", orderId, { priority: newPriority });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return okVoid();
    }, { roles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SALES], errorPath: "updateOrderPriority" });
}
