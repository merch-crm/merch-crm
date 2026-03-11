"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema/orders";
import { clients } from "@/lib/schema/clients/main";
import { eq, and, gte, lte, sql, count, sum, avg, desc, inArray } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, format } from "date-fns";
import { z } from "zod";

export interface OrdersStats {
    total: number;
    today: number;
    week: number;
    month: number;
    inWork: number;
    shipped: number;
    completed: number;
    totalSales: number;
    todaySales: number;
    weekSales: number;
    averageCheck: number;
}

export interface OrdersByStatus {
    status: string;
    count: number;
    percentage: number;
}

export interface SalesDataPoint {
    date: string;
    sales: number;
    orders: number;
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    totalAmount: number;
    itemsCount: number;
    createdAt: string;
}

export interface OrderRequiringAction {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    reason: string;
    createdAt: string;
    deadline?: string;
}

export async function getOrdersStats(): Promise<{
    success: boolean;
    data?: OrdersStats;
    error?: string;
}> {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);

        const [totalResult] = await db
            .select({ count: count() })
            .from(orders);

        const [todayResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(
                and(
                    gte(orders.createdAt, todayStart),
                    lte(orders.createdAt, todayEnd)
                )
            );

        const [weekResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(gte(orders.createdAt, weekStart));

        const [monthResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(gte(orders.createdAt, monthStart));

        // By status – using actual enum values
        const [inWorkResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(inArray(orders.status, ["design", "production"]));

        const [shippedResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.status, "shipped"));

        const [completedResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.status, "done"));

        // Sales
        const [totalSalesResult] = await db
            .select({ sum: sum(orders.totalAmount) })
            .from(orders)
            .where(eq(orders.status, "done"));

        const [todaySalesResult] = await db
            .select({ sum: sum(orders.totalAmount) })
            .from(orders)
            .where(
                and(
                    eq(orders.status, "done"),
                    gte(orders.createdAt, todayStart),
                    lte(orders.createdAt, todayEnd)
                )
            );

        const [weekSalesResult] = await db
            .select({ sum: sum(orders.totalAmount) })
            .from(orders)
            .where(
                and(
                    eq(orders.status, "done"),
                    gte(orders.createdAt, weekStart)
                )
            );

        const [avgResult] = await db
            .select({ avg: avg(orders.totalAmount) })
            .from(orders)
            .where(eq(orders.status, "done"));

        return {
            success: true,
            data: {
                total: totalResult?.count || 0,
                today: todayResult?.count || 0,
                week: weekResult?.count || 0,
                month: monthResult?.count || 0,
                inWork: inWorkResult?.count || 0,
                shipped: shippedResult?.count || 0,
                completed: completedResult?.count || 0,
                totalSales: Number(totalSalesResult?.sum || 0),
                todaySales: Number(todaySalesResult?.sum || 0),
                weekSales: Number(weekSalesResult?.sum || 0),
                averageCheck: Number(avgResult?.avg || 0),
            },
        };
    } catch (error) {
        console.error("Error getting orders stats:", error);
        return { success: false, error: "Не удалось получить статистику" };
    }
}

export async function getOrdersByStatus(): Promise<{
    success: boolean;
    data?: OrdersByStatus[];
    error?: string;
}> {
    try {
        const result = await db
            .select({
                status: orders.status,
                count: count(),
            })
            .from(orders)
            .groupBy(orders.status);

        const total = result.reduce((acc, item) => acc + item.count, 0);

        const data = result.map((item) => ({
            status: item.status,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting orders by status:", error);
        return { success: false, error: "Не удалось получить данные" };
    }
}

export async function getSalesData(days: number = 7): Promise<{
    success: boolean;
    data?: SalesDataPoint[];
    error?: string;
}> {
    try {
        const validatedDays = z.number().int().min(1).max(365).default(7).parse(days);
        const startDate = subDays(new Date(), validatedDays - 1);

        const result = await db
            .select({
                date: sql<string>`DATE(${orders.createdAt})`,
                sales: sum(orders.totalAmount),
                orders: count(),
            })
            .from(orders)
            .where(
                and(
                    gte(orders.createdAt, startOfDay(startDate)),
                    eq(orders.status, "done")
                )
            )
            .groupBy(sql`DATE(${orders.createdAt})`)
            .orderBy(sql`DATE(${orders.createdAt})`);

        const data = result.map((item) => ({
            date: item.date,
            sales: Number(item.sales || 0),
            orders: item.orders,
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting sales data:", error);
        return { success: false, error: "Не удалось получить данные продаж" };
    }
}

export async function getRecentOrders(limit: number = 5): Promise<{
    success: boolean;
    data?: RecentOrder[];
    error?: string;
}> {
    try {
        const _validatedLimit = z.number().int().min(1).max(100).default(5).parse(limit);
        const result = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                totalAmount: orders.totalAmount,
                createdAt: orders.createdAt,
                clientId: orders.clientId,
            })
            .from(orders)
            .orderBy(desc(orders.createdAt))
            .limit(_validatedLimit);

        const data = await Promise.all(
            result.map(async (order) => {
                const [itemsResult] = await db
                    .select({ count: count() })
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.id));

                // Try to get client name if clientId is set
                let customerName = "Без имени";
                if (order.clientId) {
                    const [client] = await db
                        .select({ name: clients.name })
                        .from(clients)
                        .where(eq(clients.id, order.clientId));
                    if (client?.name) customerName = client.name;
                }

                return {
                    id: order.id,
                    orderNumber: order.orderNumber || order.id.slice(0, 8),
                    customerName,
                    status: order.status,
                    totalAmount: Number(order.totalAmount || 0),
                    itemsCount: itemsResult?.count || 0,
                    createdAt: order.createdAt.toISOString(),
                };
            })
        );

        return { success: true, data };
    } catch (error) {
        console.error("Error getting recent orders:", error);
        return { success: false, error: "Не удалось получить заказы" };
    }
}

export async function getOrdersRequiringAction(): Promise<{
    success: boolean;
    data?: OrderRequiringAction[];
    error?: string;
}> {
    try {
        // New orders awaiting review
        const newOrders = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                createdAt: orders.createdAt,
                deadline: orders.deadline,
                clientId: orders.clientId,
            })
            .from(orders)
            .where(eq(orders.status, "new"))
            .orderBy(orders.createdAt)
            .limit(5);

        // Overdue orders (deadline passed and not completed/cancelled)
        const overdue = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                createdAt: orders.createdAt,
                deadline: orders.deadline,
                clientId: orders.clientId,
            })
            .from(orders)
            .where(
                and(
                    lte(orders.deadline, new Date()),
                    sql`${orders.status} NOT IN ('done', 'cancelled')`
                )
            )
            .orderBy(orders.deadline)
            .limit(5);

        const resolveClientName = async (clientId: string | null): Promise<string> => {
            if (!clientId) return "Без имени";
            const [client] = await db
                .select({ name: clients.name })
                .from(clients)
                .where(eq(clients.id, clientId));
            return client?.name || "Без имени";
        };

        const data: OrderRequiringAction[] = [
            ...(await Promise.all(newOrders.map(async (o) => ({
                id: o.id,
                orderNumber: o.orderNumber || o.id.slice(0, 8),
                customerName: await resolveClientName(o.clientId),
                status: o.status,
                reason: "Новый заказ",
                createdAt: o.createdAt.toISOString(),
                deadline: o.deadline?.toISOString(),
            })))),
            ...(await Promise.all(overdue.map(async (o) => ({
                id: o.id,
                orderNumber: o.orderNumber || o.id.slice(0, 8),
                customerName: await resolveClientName(o.clientId),
                status: o.status,
                reason: "Просрочен",
                createdAt: o.createdAt.toISOString(),
                deadline: o.deadline?.toISOString(),
            })))),
        ];

        return { success: true, data };
    } catch (error) {
        console.error("Error getting orders requiring action:", error);
        return { success: false, error: "Не удалось получить заказы" };
    }
}

export async function getSalesDataExtended(days: number = 7): Promise<{
    success: boolean;
    data?: SalesDataPoint[];
    error?: string;
}> {
    try {
        const startDate = subDays(new Date(), days - 1);
        const dates: SalesDataPoint[] = [];

        // Generate all dates in range
        for (let i = 0; i < days; i++) {
            const date = subDays(new Date(), days - 1 - i);
            dates.push({
                date: format(date, "yyyy-MM-dd"),
                sales: 0,
                orders: 0,
            });
        }

        // Get actual data
        const result = await db
            .select({
                date: sql<string>`DATE(${orders.createdAt})`,
                sales: sum(orders.totalAmount),
                orders: count(),
            })
            .from(orders)
            .where(
                and(
                    gte(orders.createdAt, startOfDay(startDate)),
                    eq(orders.status, "done")
                )
            )
            .groupBy(sql`DATE(${orders.createdAt})`);

        // Merge with generated dates
        result.forEach((item) => {
            const index = dates.findIndex((d) => d.date === item.date);
            if (index !== -1) {
                dates[index].sales = Number(item.sales || 0);
                dates[index].orders = item.orders;
            }
        });

        return { success: true, data: dates };
    } catch (error) {
        console.error("Error getting extended sales data:", error);
        return { success: false, error: "Не удалось получить данные продаж" };
    }
}
