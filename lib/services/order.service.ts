import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema/orders";
import { clients } from "@/lib/schema/clients/main";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { promocodes } from "@/lib/schema/promocodes";
import { payments } from "@/lib/schema/finance";
import { eq, and, sql, desc } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { releaseOrderReservation } from "@/app/(main)/dashboard/orders/actions/utils";
import { queueClientStatsUpdate } from "@/lib/queue";
import { ValidationError } from "@/lib/action-helpers";

export class OrderService {
    /**
     * Создает новый заказ со всеми связанными сущностями (позиции, баланс склада, промокоды, предоплата)
     */
    static async createOrder(data: {
        clientId: string;
        priority: "low" | "normal" | "medium" | "high" | "urgent";
        isUrgent: boolean;
        advanceAmount: number | string;
        promocodeId?: string;
        paymentMethod: string;
        deadline?: Date | string | null;
        items: { description: string, quantity: number, price: number, inventoryId?: string | null }[];
    }, userId: string) {
        const {
            clientId, priority, isUrgent, advanceAmount,
            promocodeId, paymentMethod, deadline, items
        } = data;

        let newOrderId: string | undefined;
        let createdOrderNumber: string | undefined;

        await db.transaction(async (tx) => {
            const year = new Date().getFullYear().toString().slice(-2);
            const [lastOrder] = await tx
                .select({ orderNumber: orders.orderNumber })
                .from(orders)
                .orderBy(desc(orders.id))
                .limit(1);

            let nextNum = 1000;
            if (lastOrder && lastOrder.orderNumber && lastOrder.orderNumber.includes('-')) {
                const parts = lastOrder.orderNumber.split('-');
                const lastNum = parseInt(parts[parts.length - 1]);
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }

            const orderNumberString = `ORD-${year}-${nextNum}`;

            const [newOrder] = await tx.insert(orders).values({
                orderNumber: orderNumberString,
                clientId,
                status: "new",
                priority,
                isUrgent,
                paidAmount: String(advanceAmount),
                promocodeId: promocodeId || null,
                deadline: deadline ? new Date(deadline) : null,
                createdBy: userId,
                totalAmount: "0",
            }).returning();

            newOrderId = newOrder.id;
            createdOrderNumber = orderNumberString;

            const client = await tx.query.clients.findFirst({ where: eq(clients.id, clientId) });

            await logAction("Создан заказ", "order", newOrder.id, {
                name: `Заказ для ${client?.name || client?.firstName || "неизвестного клиента"}`,
                orderNumber: orderNumberString,
                isUrgent
            }, tx);

            let totalAmount = 0;
            const itemsToInsert = [];
            
            for (const item of items) {
                itemsToInsert.push({
                    orderId: newOrder.id,
                    description: item.description,
                    quantity: item.quantity,
                    price: String(item.price),
                    inventoryId: item.inventoryId || null,
                });

                if (item.inventoryId) {
                    const result = await tx.update(inventoryItems)
                        .set({ reservedQuantity: sql`${inventoryItems.reservedQuantity} + ${item.quantity}` })
                        .where(and(
                            eq(inventoryItems.id, item.inventoryId),
                            sql`${inventoryItems.reservedQuantity} + ${item.quantity} <= ${inventoryItems.quantity}`
                        ))
                        .returning();

                    if (result.length === 0) throw ValidationError(`Недостаточно товара на складе для ID ${item.inventoryId}`);
                }
                totalAmount += (item.quantity * item.price);
            }

            if (itemsToInsert.length > 0) {
                await tx.insert(orderItems).values(itemsToInsert);
            }

            let discountAmount = 0;
            if (promocodeId) {
                const promo = await tx.query.promocodes.findFirst({ where: eq(promocodes.id, promocodeId) });
                if (promo?.isActive) {
                    if (promo.discountType === 'percentage') {
                        discountAmount = (totalAmount * Number(promo.value)) / 100;
                    } else if (promo.discountType === 'fixed') {
                        discountAmount = Number(promo.value);
                    }
                    await tx.update(promocodes).set({ usageCount: (promo.usageCount || 0) + 1 }).where(eq(promocodes.id, promo.id));
                }
            }

            const finalTotal = Math.max(0, totalAmount - discountAmount);
            await tx.update(orders).set({ totalAmount: String(finalTotal), discountAmount: String(discountAmount) }).where(eq(orders.id, newOrder.id));

            if (Number(advanceAmount) > 0) {
                await tx.insert(payments).values({
                    orderId: newOrder.id,
                    amount: String(advanceAmount),
                    method: paymentMethod as "cash" | "bank" | "online" | "account",
                    isAdvance: true,
                    comment: "Предоплата"
                });
            }
        });

        // Отложенное обновление статистики клиента
        queueClientStatsUpdate(clientId);

        return { id: newOrderId!, orderNumber: createdOrderNumber! };
    }

    static async updateField(orderId: string, field: string, value: unknown) {
        let clientId: string | undefined | null;

        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({ 
                where: eq(orders.id, orderId),
                columns: { id: true, clientId: true }
            });
            if (!order) throw new Error("Заказ не найден");
            clientId = order.clientId;

            const updateData: Record<string, unknown> = { updatedAt: new Date() };
            if (field === "isUrgent") updateData.isUrgent = Boolean(value);
            else if (field === "priority") updateData.priority = value;
            else if (field === "deadline") updateData.deadline = value ? new Date(value as string) : null;
            else if (field === "status") updateData.status = value;

            await tx.update(orders).set(updateData).where(eq(orders.id, orderId));
            
            await logAction(
                `Изменение поля ${field}`, 
                "order", 
                orderId, 
                { field, value }, 
                tx
            );
        });

        if (clientId) {
            queueClientStatsUpdate(clientId);
        }
    }

    static async deleteOrder(orderId: string) {
        await db.transaction(async (tx) => {
            const orderObj = await tx.query.orders.findFirst({ where: eq(orders.id, orderId), with: { client: true } });
            if (orderObj) {
                if (["new", "design", "production"].includes(orderObj.status)) {
                    await releaseOrderReservation(orderId, tx);
                }
                await logAction("Удален заказ", "order", orderId, { name: `Заказ #${orderObj.orderNumber}` }, tx);
                await tx.delete(orders).where(eq(orders.id, orderId));
                
                if (orderObj.clientId) {
                    queueClientStatsUpdate(orderObj.clientId);
                }
            }
        });
    }

    static async archiveOrder(orderId: string, archive: boolean) {
        await db.transaction(async (tx) => {
            await tx.update(orders)
                .set({ isArchived: archive, updatedAt: new Date() })
                .where(eq(orders.id, orderId));

            await logAction(archive ? "Архивация заказа" : "Разархивация заказа", "order", orderId, { isArchived: archive }, tx);
        });
    }
}
