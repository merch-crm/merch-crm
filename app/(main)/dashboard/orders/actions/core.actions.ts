"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, and, gte, lte, sql, ilike, or, type SQL } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { sendStaffNotifications } from "@/lib/notifications";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
import { CreateOrderSchema, OrderIdSchema, UpdateOrderFieldSchema } from "../validation";
import { ActionResult } from "@/lib/types";
import { releaseOrderReservation } from "./utils";

const { orders, orderItems, clients, users, inventoryItems, promocodes, payments, orderAttachments } = schema;

export async function getOrders(from?: Date, to?: Date, page = 1, limit = 20, showArchived = false, search?: string): Promise<ActionResult<{
    orders: (typeof orders.$inferSelect & {
        client: typeof clients.$inferSelect | null;
        items: (typeof orderItems.$inferSelect)[];
        creator: (typeof users.$inferSelect & { role: typeof schema.roles.$inferSelect | null }) | null;
        attachments: (typeof orderAttachments.$inferSelect)[];
    })[];
    total: number;
    totalPages: number;
    currentPage: number;
}>> {
    try {
        const offset = (page - 1) * limit;
        const whereClause: (SQL | undefined)[] = [eq(orders.isArchived, showArchived)];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause.push(or(
                ilike(orders.orderNumber, searchPattern),
                ilike(clients.name, searchPattern),
                ilike(clients.phone, searchPattern),
                ilike(clients.email, searchPattern),
                ilike(orders.totalAmount, searchPattern)
            ));
        }

        const finalWhere = and(...whereClause);

        const totalRes = await db.select({ count: sql<number>`count(*)` })
            .from(orders)
            .leftJoin(clients, eq(orders.clientId, clients.id))
            .where(finalWhere)
            .limit(1);
        const total = Number(totalRes[0]?.count || 0);

        const rawData = await db.query.orders.findMany({
            where: finalWhere,
            with: {
                client: true,
                items: {
                    with: {
                        inventory: true
                    }
                },
                creator: {
                    with: {
                        role: true
                    }
                },
                attachments: true,
            },
            orderBy: desc(orders.createdAt),
            limit,
            offset
        });

        const data = (rawData || []).filter(order => order.client).map(order => {
            const client = order.client!;
            let displayName = client.name || "";

            if (!displayName && (client.firstName || client.lastName)) {
                displayName = [client.lastName, client.firstName].filter(Boolean).join(' ');
            }

            return {
                ...order,
                client: {
                    ...client,
                    name: displayName || 'Unnamed Client'
                }
            };
        });

        const session = await getSession();
        const userRole = session?.roleName;
        const shouldHidePhone = ["Печатник", "Дизайнер"].includes(userRole || "");

        if (shouldHidePhone && Array.isArray(data)) {
            data.forEach(order => {
                if (order.client) {
                    order.client.phone = "HIDDEN";
                }
            });
        }

        return {
            success: true,
            data: {
                orders: data as never,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/orders",
            method: "getOrders",
            details: { from, to, page, limit, showArchived }
        });
        return { success: false, error: "Не удалось загрузить заказы" };
    }
}

export async function archiveOrder(orderId: string, archive: boolean = true): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = OrderIdSchema.safeParse({ orderId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true, department: true }
        });

        if (user?.role?.name !== "Администратор" && user?.department?.name !== "Руководство") {
            return { success: false, error: "Недостаточно прав" };
        }

        await db.transaction(async (tx) => {
            await tx.update(orders)
                .set({ isArchived: archive, updatedAt: new Date() })
                .where(eq(orders.id, orderId));

            await logAction(archive ? "Архивация заказа" : "Разархивация заказа", "order", orderId, { isArchived: archive }, tx);
        });
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/orders",
            method: "archiveOrder",
            details: { orderId, archive }
        });
        return { success: false, error: "Не удалось изменить статус архивации" };
    }
}

type OrderComplete = typeof schema.orders.$inferSelect & {
    client: typeof schema.clients.$inferSelect | null;
    items: typeof schema.orderItems.$inferSelect[];
    creator: (typeof schema.users.$inferSelect & { role: typeof schema.roles.$inferSelect | null }) | null;
    attachments: typeof schema.orderAttachments.$inferSelect[];
    payments: typeof schema.payments.$inferSelect[];
    promocode: typeof schema.promocodes.$inferSelect | null;
};

export async function getOrderById(id: string): Promise<ActionResult<OrderComplete>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: {
                client: true,
                items: true,
                creator: {
                    with: {
                        role: true
                    }
                },
                attachments: true,
                payments: true,
                promocode: true,
            }
        });

        if (!order) return { success: false, error: "Заказ не найден" };

        if (order.client) {
            const client = order.client;
            if (!client.name && (client.firstName || client.lastName)) {
                client.name = [client.lastName, client.firstName].filter(Boolean).join(' ');
            }
            if (!client.name) client.name = 'Неизвестный клиент';

            const userRole = session?.roleName;
            const shouldHidePhone = ["Печатник", "Дизайнер"].includes(userRole || "");

            if (shouldHidePhone) {
                client.phone = "HIDDEN";
            }
        }

        return { success: true, data: order };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/orders/${id}`,
            method: "getOrderById",
            details: { id }
        });
        return { success: false, error: "Не удалось загрузить заказ" };
    }
}

export async function createOrder(formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = CreateOrderSchema.safeParse({
        clientId: formData.get("clientId"),
        priority: formData.get("priority"),
        isUrgent: formData.get("isUrgent") === "true",
        advanceAmount: formData.get("advanceAmount"),
        promocodeId: formData.get("promocodeId"),
        paymentMethod: formData.get("paymentMethod"),
        deadline: formData.get("deadline"),
        items: JSON.parse(formData.get("items") as string || "[]"),
    });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        clientId, priority, isUrgent, advanceAmount,
        promocodeId, paymentMethod, deadline, items
    } = validation.data;

    try {
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

            const orderNumber = `ORD-${year}-${nextNum}`;

            const [newOrder] = await tx.insert(orders).values({
                orderNumber,
                clientId,
                status: "new",
                priority,
                isUrgent,
                paidAmount: String(advanceAmount),
                promocodeId,
                deadline: deadline ? new Date(deadline) : null,
                createdBy: session.id,
                totalAmount: "0",
            }).returning();

            const client = await tx.query.clients.findFirst({ where: eq(clients.id, clientId) });

            await logAction("Создан заказ", "order", newOrder.id, {
                name: `Заказ для ${client?.name || client?.firstName || "неизвестного клиента"}`,
                orderNumber,
                isUrgent
            }, tx);

            let totalAmount = 0;
            for (const item of items) {
                await tx.insert(orderItems).values({
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

                    if (result.length === 0) throw new Error(`Недостаточно товара на складе`);
                }
                totalAmount += (item.quantity * item.price);
            }

            let discountAmount = 0;
            if (promocodeId) {
                const promo = await tx.query.promocodes.findFirst({ where: eq(promocodes.id, promocodeId) });
                if (promo?.isActive) {
                    // Basic promo logic (simplified for brevity, can be expanded)
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

        const branding = await getBrandingSettings();
        await sendStaffNotifications({
            title: "Новый заказ",
            message: `Создан заказ на сумму ${advanceAmount} ${branding?.currencySymbol || "₽"}`,
            type: "success"
        });

        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/new", method: "createOrder", details: { clientId } });
        return { success: false, error: error instanceof Error ? error.message : "Не удалось создать заказ" };
    }
}

export async function deleteOrder(orderId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true, department: true }
        });

        if (user?.role?.name !== "Администратор" && user?.department?.name !== "Руководство") {
            return { success: false, error: "Недостаточно прав" };
        }

        await db.transaction(async (tx) => {
            const orderObj = await tx.query.orders.findFirst({ where: eq(orders.id, orderId), with: { client: true } });
            if (orderObj) {
                if (["new", "design", "production"].includes(orderObj.status)) {
                    await releaseOrderReservation(orderId, tx);
                }
                await logAction("Удален заказ", "order", orderId, { name: `Заказ #${orderObj.orderNumber}` }, tx);
                await tx.delete(orders).where(eq(orders.id, orderId));
            }
        });

        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/orders/${orderId}`, method: "deleteOrder" });
        return { success: false, error: "Не удалось удалить заказ" };
    }
}

export async function getOrderStats(from?: Date, to?: Date): Promise<ActionResult<{ total: number; new: number; inProduction: number; completed: number; revenue: number }>> {
    try {
        const whereClause: (SQL | undefined)[] = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const [stats] = await db.select({
            total: sql<number>`count(*)`,
            new: sql<number>`count(*) filter (where ${orders.status} = 'new')`,
            inProduction: sql<number>`count(*) filter (where ${orders.status} in ('design', 'production'))`,
            completed: sql<number>`count(*) filter (where ${orders.status} in ('done', 'shipped'))`,
            revenue: sql<number>`coalesce(sum(${orders.totalAmount}::numeric), 0)`
        }).from(orders).where(and(...whereClause)).limit(1);

        return { success: true, data: { ...stats, revenue: Number(stats.revenue) } };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/stats", method: "getOrderStats" });
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

export async function updateOrderField(orderId: string, field: string, value: unknown): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({ where: eq(orders.id, orderId) });
            if (!order) throw new Error("Заказ не найден");

            const updateData: Record<string, unknown> = { updatedAt: new Date() };
            if (field === "isUrgent") updateData.isUrgent = Boolean(value);
            else if (field === "priority") updateData.priority = value;
            else if (field === "deadline") updateData.deadline = value ? new Date(value as string) : null;
            else if (field === "status") updateData.status = value;

            await tx.update(orders).set(updateData).where(eq(orders.id, orderId));
        });
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders", method: "updateOrderField" });
        return { success: false, error: "Ошибка обновления" };
    }
}

export async function getClientsForSelect(): Promise<ActionResult<{ id: string; name: string | null }[]>> {
    try {
        const data = await db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.isArchived, false)).limit(100);
        return { success: true, data };
    } catch (_error) { return { success: false, error: "Ошибка" }; }
}

export async function getInventoryForSelect(): Promise<ActionResult<{ id: string; name: string | null; quantity: number | null }[]>> {
    try {
        const data = await db.select({ id: inventoryItems.id, name: inventoryItems.name, quantity: inventoryItems.quantity }).from(inventoryItems).limit(100);
        return { success: true, data };
    } catch (_error) { return { success: false, error: "Ошибка" }; }
}

export async function searchClients(query: string): Promise<ActionResult<typeof clients.$inferSelect[]>> {
    if (!query || query.length <= 2) return { success: true, data: [] };
    try {
        const results = await db.query.clients.findMany({
            where: (c, { or, ilike }) => or(ilike(c.name, `%${query}%`), ilike(c.phone, `%${query}%`)),
            limit: 10
        });
        return { success: true, data: results };
    } catch (_error) { return { success: false, error: "Ошибка" }; }
}
