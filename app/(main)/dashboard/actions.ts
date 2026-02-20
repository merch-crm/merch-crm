"use server";

import { db } from "@/lib/db";
import { orders, clients, notifications } from "@/lib/schema";
import { count, sum, inArray, and, gte, lte, eq, desc } from "drizzle-orm";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    startOfMonth,
    endOfMonth,
    startOfQuarter
} from "date-fns";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-logger";
import { z } from "zod";

const DashboardPeriodSchema = z.enum(["today", "week", "month", "quarter", "all"]).default("month");
const NotificationLimitSchema = z.number().int().min(1).max(50).default(5);

export async function getDashboardStatsByPeriod(period: string = "month") {
    try {
        const session = await getSession();
        if (!session) throw new Error("Unauthorized");

        const validated = DashboardPeriodSchema.safeParse(period);
        const finalPeriod = validated.success ? validated.data : "month";

        const now = new Date();
        let startDate: Date;
        let endDate: Date = endOfDay(now);

        switch (finalPeriod) {
            case "today":
                startDate = startOfDay(now);
                break;
            case "week":
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                break;
            case "month":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "quarter":
                startDate = startOfQuarter(now);
                break;
            case "all":
                startDate = new Date(2000, 0, 1);
                endDate = new Date(2100, 0, 1);
                break;
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
        }

        return await getDashboardStats(startDate, endDate);
    } catch (error) {
        await logError({
            error,
            path: "/dashboard",
            method: "getDashboardStatsByPeriod"
        });

        const branding = await getBrandingSettings().catch(() => ({ currencySymbol: "₽" }));
        const currencySymbol = branding?.currencySymbol || "₽";

        return {
            totalClients: 0,
            newClients: 0,
            totalOrders: 0,
            inProduction: 0,
            revenue: `0 ${currencySymbol}`,
            averageCheck: `0 ${currencySymbol}`,
            rawRevenue: 0
        };
    }
}

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
        const totalClientsResult = await db.select({ value: count() }).from(clients).limit(1);
        const totalClients = totalClientsResult[0].value;

        // 2. New Clients count in period
        const newClientsResult = await db.select({ value: count() })
            .from(clients)
            .where(and(
                gte(clients.createdAt, startDate),
                lte(clients.createdAt, endDate)
            ))
            .limit(1);
        const newClients = newClientsResult[0].value;

        // 3. Total Orders count in period
        const totalOrdersResult = await db.select({ value: count() })
            .from(orders)
            .where(dateFilter)
            .limit(1);
        const totalOrders = totalOrdersResult[0].value;

        // 4. In Production count (Current snapshot)
        const inProductionResult = await db.select({ value: count() })
            .from(orders)
            .where(inArray(orders.status, ["new", "design", "production"]))
            .limit(1);
        const inProduction = inProductionResult[0].value;

        // 7. Total Revenue for period
        const revenueResult = await db.select({
            value: sum(orders.totalAmount)
        })
            .from(orders)
            .where(dateFilter)
            .limit(1);

        const rawRevenue = Number(revenueResult[0].value || 0);

        // 8. Average Check
        const averageCheck = totalOrders > 0 ? (rawRevenue / totalOrders) : 0;

        const branding = await getBrandingSettings();
        const currencySymbol = branding?.currencySymbol || "₽";

        const formatCondensed = (val: number) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + "M " + currencySymbol;
            if (val >= 1000) return (val / 1000).toFixed(1) + "K " + currencySymbol;
            return val.toLocaleString('ru-RU') + " " + currencySymbol;
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
        await logError({
            error,
            path: "/dashboard",
            method: "getDashboardStats"
        });
        console.error("Error fetching dashboard stats:", error);

        const branding = await getBrandingSettings().catch(() => ({ currencySymbol: "₽" }));
        const currencySymbol = branding?.currencySymbol || "₽";

        return {
            totalClients: 0,
            newClients: 0,
            totalOrders: 0,
            inProduction: 0,
            revenue: `0 ${currencySymbol}`,
            averageCheck: `0 ${currencySymbol}`,
            rawRevenue: 0
        };
    }
}

export async function getDashboardNotifications(limit = 5) {
    const session = await getSession();
    if (!session?.id) return [];

    const validatedLimit = NotificationLimitSchema.safeParse(limit);
    const finalLimit = validatedLimit.success ? validatedLimit.data : 5;

    try {
        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, session.id))
            .limit(finalLimit)
            .orderBy(desc(notifications.createdAt));

        return userNotifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            isRead: n.isRead
        }));
    } catch (error) {
        await logError({
            error,
            path: "/dashboard",
            method: "getDashboardNotifications"
        });
        console.error("Error fetching notifications:", error);
        return [];
    }
}
