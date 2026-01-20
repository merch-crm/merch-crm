"use server";

import { db } from "@/lib/db";
import { orderItems, orders, inventoryItems, inventoryTransactions } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { updateItemStage } from "@/lib/production";

/**
 * Action для обновления этапа производства конкретной позиции.
 * После обновления проверяет статус всего заказа.
 */
export async function updateProductionStageAction(
    orderItemId: string,
    stage: 'prep' | 'print' | 'application' | 'packaging',
    status: 'pending' | 'in_progress' | 'done' | 'failed'
) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await updateItemStage(orderItemId, stage, status);

        const item = await db.query.orderItems.findFirst({
            where: eq(orderItems.id, orderItemId),
            with: { order: true }
        });

        if (item) {
            await logAction("Обновлен этап производства", "order_item", orderItemId, {
                orderNumber: item.order.orderNumber,
                stage,
                status
            });
        }

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/orders");
        if (item?.orderId) revalidatePath(`/dashboard/orders/${item.orderId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Error updating production stage:", error);
        return { error: error.message || "Ошибка при обновлении этапа" };
    }
}

export async function getProductionStats() {
    const session = await getSession();
    if (!session) return { active: 0, urgent: 0, efficiency: 98, completedToday: 0 };

    try {
        const activeOrders = await db.query.orders.findMany({
            where: eq(orders.status, "production"),
        });

        const activeCount = activeOrders.length;
        const urgentCount = activeOrders.filter(o => o.priority === "high" || o.priority === "urgent").length;

        // Mocking daily completion and efficiency for now as we don't have historical log table fully accessible yet
        // In a real app, we would query the audit log or timestamps
        const completedToday = 12;
        const efficiency = 98;

        return {
            active: activeCount,
            urgent: urgentCount,
            efficiency,
            completedToday
        };
    } catch (error) {
        console.error("Error fetching production stats:", error);
        return { active: 0, urgent: 0, efficiency: 0, completedToday: 0 };
    }
}

export async function getProductionItems() {
    const session = await getSession();
    if (!session) return [];

    try {
        const productionOrders = await db.query.orders.findMany({
            where: eq(orders.status, "production"),
            with: {
                items: true,
                client: true,
                attachments: true,
            }
        });

        // Flatten order items with order context
        const items = productionOrders.flatMap(order =>
            order.items.map(item => ({
                ...item,
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    client: order.client,
                    priority: order.priority,
                    attachments: order.attachments,
                }
            }))
        );

        return items;
    } catch (error) {
        console.error("Error fetching production items:", error);
        return [];
    }
}


export async function reportProductionDefect(orderItemId: string, quantity: number, reason: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.transaction(async (tx) => {
            const item = await tx.query.orderItems.findFirst({
                where: eq(orderItems.id, orderItemId),
                with: { order: true }
            });

            if (!item) throw new Error("Позиция не найдена");
            if (!item.inventoryId) throw new Error("Позиция не связана с товаром на складе");

            // 1. Deduct from inventory
            await tx.update(inventoryItems)
                .set({
                    quantity: sql`GREATEST(0, ${inventoryItems.quantity} - ${quantity})`
                })
                .where(eq(inventoryItems.id, item.inventoryId));

            // 2. Create Transaction
            await tx.insert(inventoryTransactions).values({
                itemId: item.inventoryId,
                changeAmount: -quantity,
                type: "out",
                reason: `Брак (Производство): Заказ #${item.order.orderNumber}. Причина: ${reason}`,
                createdBy: session.id,
            });

            // 3. Log Action
            await logAction("Зафиксирован брак", "order_item", orderItemId, {
                orderNumber: item.order.orderNumber,
                quantity,
                reason
            });
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error: any) {
        console.error("Error reporting defect:", error);
        return { error: error.message || "Ошибка при списании брака" };
    }
}
