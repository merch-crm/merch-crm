"use server";

import { db } from "@/lib/db";
import { orders, clients, orderStatusEnum } from "@/lib/schema";
import { count, sum, ne, inArray, sql, and, gte, lte } from "drizzle-orm";

export async function getDashboardStats(startDate?: Date, endDate?: Date) {
    try {
        // Default to current month if dates not provided
        if (!startDate || !endDate) {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const dateFilter = and(
            gte(orders.createdAt, startDate),
            lte(orders.createdAt, endDate)
        );

        // 1. Total Clients (Lifetime)
        const totalClientsResult = await db.select({ value: count() }).from(clients);
        const totalClients = totalClientsResult[0].value;

        // 2. New Clients count in period
        const newClientsResult = await db.select({ value: count() })
            .from(clients)
            .where(and(
                gte(clients.createdAt, startDate),
                lte(clients.createdAt, endDate)
            ));
        const newClients = newClientsResult[0].value;

        // 3. Total Orders count in period
        const totalOrdersResult = await db.select({ value: count() })
            .from(orders)
            .where(dateFilter);
        const totalOrders = totalOrdersResult[0].value;

        // 4. In Production count (Current snapshot)
        const inProductionResult = await db.select({ value: count() })
            .from(orders)
            .where(inArray(orders.status, ["new", "layout_pending", "layout_approved", "in_printing"]));
        const inProduction = inProductionResult[0].value;

        // 7. Total Revenue for period
        const revenueResult = await db.select({
            value: sum(orders.totalAmount)
        })
            .from(orders)
            .where(and(
                dateFilter,
                ne(orders.status, "cancelled")
            ));

        const rawRevenue = Number(revenueResult[0].value || 0);

        // 8. Average Check
        const averageCheck = totalOrders > 0 ? (rawRevenue / totalOrders) : 0;

        // Helper for formatting
        const formatMoney = (val: number) => {
            return val.toLocaleString('ru-RU') + " ₽";
        };

        const formatCondensed = (val: number) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + "M ₽";
            if (val >= 1000) return (val / 1000).toFixed(1) + "K ₽";
            return val.toLocaleString('ru-RU') + " ₽";
        };

        return {
            totalClients,
            newClients,
            totalOrders,
            inProduction,
            revenue: formatCondensed(rawRevenue),
            averageCheck: formatCondensed(averageCheck),
            rawRevenue
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalClients: 0,
            newClients: 0,
            totalOrders: 0,
            inProduction: 0,
            revenue: "0 ₽",
            averageCheck: "0 ₽",
            rawRevenue: 0
        };
    }
}
