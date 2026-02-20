"use server";

import { eq, sql, gte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions
} from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { z } from "zod";
import { getSession as getAuthSession } from "@/lib/auth";

export async function getSession() {
    try {
        return await getAuthSession();
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/warehouse-stats-actions",
            method: "getSession"
        });
        return null; // Return null on error as session might be unavailable
    }
}

import { type ActionResult } from "@/lib/types";

/**
 * Get overall warehouse statistics for the dashboard
 */
interface WarehouseStats {
    totalStock: number;
    totalReserved: number;
    archivedCount: number;
    criticalItems: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
    }[];
    activity: {
        ins: number;
        usage: number;
        waste: number;
        transfers: number;
    };
}

export async function getWarehouseStats(): Promise<ActionResult<WarehouseStats>> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [stockRes, archivedRes, criticalRes, activityRes] = await Promise.all([
            db.select({
                totalStock: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)`,
                totalReserved: sql<number>`COALESCE(SUM(${inventoryItems.reservedQuantity}), 0)`,
            }).from(inventoryItems).where(eq(inventoryItems.isArchived, false)).limit(1),

            db.select({ count: sql<number>`count(*)` })
                .from(inventoryItems)
                .where(eq(inventoryItems.isArchived, true))
                .limit(1),

            db.select({
                id: inventoryItems.id,
                name: inventoryItems.name,
                quantity: inventoryItems.quantity,
                unit: inventoryItems.unit
            })
                .from(inventoryItems)
                .where(and(
                    eq(inventoryItems.isArchived, false),
                    sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`
                ))
                .limit(20),

            db.select({
                type: inventoryTransactions.type,
                reason: inventoryTransactions.reason,
                count: sql<number>`count(*)`
            })
                .from(inventoryTransactions)
                .where(gte(inventoryTransactions.createdAt, thirtyDaysAgo))
                .groupBy(inventoryTransactions.type, inventoryTransactions.reason)
                .limit(100)
        ]);

        const stock = stockRes[0];
        const activity = { ins: 0, usage: 0, waste: 0, transfers: 0 };
        activityRes.forEach(row => {
            if (row.type === 'in') activity.ins += Number(row.count);
            else if (row.type === 'transfer') activity.transfers += Number(row.count);
            else if (row.type === 'out') {
                const reason = row.reason || "";
                const isWaste = reason.toLowerCase().includes('брак') || reason.toLowerCase().includes('списание');
                if (isWaste) activity.waste += Number(row.count);
                else activity.usage += Number(row.count);
            }
        });

        return {
            success: true,
            data: {
                totalStock: Number(stock?.totalStock || 0),
                totalReserved: Number(stock?.totalReserved || 0),
                archivedCount: Number(archivedRes[0]?.count || 0),
                criticalItems: criticalRes,
                activity
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/warehouse-stats-actions",
            method: "getWarehouseStats"
        });
        return { success: false, error: "Не удалось загрузить статистику склада" };
    }
}

export async function findItemBySKU(sku: string): Promise<string | null> {
    const validation = z.string().min(1).max(100).safeParse(sku);
    if (!validation.success) return null;

    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.sku, validation.data),
            columns: { id: true }
        });
        return item?.id || null;
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/warehouse-stats-actions",
            method: "findItemBySKU",
            details: { sku }
        });
        return null;
    }
}

/**
 * Get all users with names and IDs
 */
export async function getAllUsers(): Promise<ActionResult<{ id: string; name: string }[]>> {
    try {
        const allUsers = await db.query.users.findMany({
            columns: { id: true, name: true },
            orderBy: (users, { asc }) => [asc(users.name)],
            limit: 1000
        });
        return { success: true, data: allUsers };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/warehouse-stats-actions",
            method: "getAllUsers"
        });
        return { success: false, error: "Не удалось загрузить список пользователей" };
    }
}
