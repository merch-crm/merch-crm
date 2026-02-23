"use server";

import { eq, sql, gte, and, desc, inArray, isNull, isNotNull, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions,
    inventoryCategories,
    storageLocations
} from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { z } from "zod";
import { getSession as getAuthSession } from "@/lib/auth";
import { getBrandingSettings } from "@/lib/branding";

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
 * Defined transaction type for the warehouse dashboard
 */
export interface RecentTransaction {
    id: string;
    type: "in" | "out" | "transfer" | "attribute_change" | "archive" | "restore" | "stock_in" | "stock_out" | "adjustment";
    createdAt: Date;
    changeAmount: number;
    item?: {
        name: string;
        unit: string;
    } | null;
    storageLocation?: {
        name: string;
    } | null;
    fromStorageLocation?: {
        name: string;
    } | null;
    creator?: {
        name: string;
        avatar?: string | null;
    } | null;
}

/**
 * Get overall warehouse statistics for the dashboard
 */
interface WarehouseStats {
    totalItems: number;
    totalQuantity: number;
    totalReserved: number;
    totalStorages: number;
    archivedCount: number;
    totalCategories: number;
    totalSubCategories: number;
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
        adjustments: number;
    };
    financials: {
        totalCostValue: number;
        totalRetailValue: number;
        frozenCostValue: number;
        frozenRetailValue: number;
        writeOffValue30d: number;
    };
    currencySymbol: string;
    recentTransactions: RecentTransaction[];
    topSoldItems: {
        id: string;
        name: string;
        unit: string;
        totalSold: number;
    }[];
    stagnantItems: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
        lastActivityAt: Date | null;
    }[];
}

export async function getWarehouseStats(): Promise<ActionResult<WarehouseStats>> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [itemsRes, stockRes, archivedRes, categoriesRes, subCategoriesRes, storagesRes, criticalRes, activityRes, recentTransactionsRes, financialsRes, writeOffRes, topSoldRes, stagnantRes] = await Promise.all([
            // 0. Total Items (non-archived SKUs count)
            db.select({ count: count() })
                .from(inventoryItems)
                .where(eq(inventoryItems.isArchived, false)),

            // 1. Total Quantity and Reserved (SUM of units)
            db.select({
                totalQuantity: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)::int`,
                totalReserved: sql<number>`COALESCE(SUM(${inventoryItems.reservedQuantity}), 0)::int`,
            }).from(inventoryItems).where(eq(inventoryItems.isArchived, false)),

            // 2. Archived count
            db.select({ count: count() })
                .from(inventoryItems)
                .where(eq(inventoryItems.isArchived, true)),

            // 3. Root Categories count
            db.select({ count: count() })
                .from(inventoryCategories)
                .where(isNull(inventoryCategories.parentId)),

            // 4. Subcategories count
            db.select({ count: count() })
                .from(inventoryCategories)
                .where(isNotNull(inventoryCategories.parentId)),

            // 5. Total Storages count
            db.select({ count: count() })
                .from(storageLocations)
                .where(eq(storageLocations.isActive, true)),

            // 6. Critical items
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

            // 7. Activity counts
            db.select({
                type: inventoryTransactions.type,
                reason: inventoryTransactions.reason,
                count: sql<number>`count(*)`
            })
                .from(inventoryTransactions)
                .where(gte(inventoryTransactions.createdAt, thirtyDaysAgo))
                .groupBy(inventoryTransactions.type, inventoryTransactions.reason)
                .limit(100),

            // 8. Recent transactions
            db.query.inventoryTransactions.findMany({
                where: inArray(inventoryTransactions.type, ['in', 'transfer']),
                with: {
                    item: true,
                    storageLocation: true,
                    fromStorageLocation: true,
                    creator: {
                        with: {
                            role: true
                        }
                    },
                },
                orderBy: [desc(inventoryTransactions.createdAt)],
                limit: 100
            }),

            // 9. Financial aggregations (cost, retail, frozen)
            db.select({
                totalCostValue: sql<string>`COALESCE(SUM(${inventoryItems.quantity}::numeric * COALESCE(${inventoryItems.costPrice}, 0)), 0)`,
                totalRetailValue: sql<string>`COALESCE(SUM(${inventoryItems.quantity}::numeric * COALESCE(${inventoryItems.sellingPrice}, 0)), 0)`,
                frozenCostValue: sql<string>`COALESCE(SUM(${inventoryItems.reservedQuantity}::numeric * COALESCE(${inventoryItems.costPrice}, 0)), 0)`,
                frozenRetailValue: sql<string>`COALESCE(SUM(${inventoryItems.reservedQuantity}::numeric * COALESCE(${inventoryItems.sellingPrice}, 0)), 0)`,
            }).from(inventoryItems).where(eq(inventoryItems.isArchived, false)),

            // 10. Write-off value for last 30 days (transactions of type 'out' that are waste/write-off)
            db.select({
                writeOffValue: sql<string>`COALESCE(SUM(ABS(${inventoryTransactions.changeAmount})::numeric * COALESCE(${inventoryItems.costPrice}, 0)), 0)`,
            })
                .from(inventoryTransactions)
                .innerJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    gte(inventoryTransactions.createdAt, thirtyDaysAgo)
                )),

            // 11. Top-5 sold items (by outbound quantity in last 30 days)
            db.select({
                id: inventoryItems.id,
                name: inventoryItems.name,
                unit: inventoryItems.unit,
                totalSold: sql<number>`COALESCE(SUM(ABS(${inventoryTransactions.changeAmount})), 0)::int`,
            })
                .from(inventoryTransactions)
                .innerJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    gte(inventoryTransactions.createdAt, thirtyDaysAgo),
                    eq(inventoryItems.isArchived, false)
                ))
                .groupBy(inventoryItems.id, inventoryItems.name, inventoryItems.unit)
                .orderBy(sql`SUM(ABS(${inventoryTransactions.changeAmount})) DESC`)
                .limit(5),

            // 12. Stagnant items (no transactions in last 30 days)
            db.select({
                id: inventoryItems.id,
                name: inventoryItems.name,
                quantity: inventoryItems.quantity,
                unit: inventoryItems.unit,
                lastActivityAt: sql<Date | null>`(
                    SELECT MAX(created_at)
                    FROM inventory_transactions
                    WHERE item_id = ${inventoryItems.id}
                )`,
            })
                .from(inventoryItems)
                .where(and(
                    eq(inventoryItems.isArchived, false),
                    sql`NOT EXISTS (
                        SELECT 1 FROM inventory_transactions
                        WHERE item_id = ${inventoryItems.id}
                        AND created_at >= ${thirtyDaysAgo}
                    )`
                ))
                .orderBy(sql`(
                    SELECT MAX(created_at)
                    FROM inventory_transactions
                    WHERE item_id = ${inventoryItems.id}
                ) ASC NULLS FIRST`)
                .limit(50)
        ]);


        const activity = { ins: 0, usage: 0, waste: 0, transfers: 0, adjustments: 0 };

        activityRes.forEach(row => {
            if (row.type === 'in') activity.ins += Number(row.count);
            else if (row.type === 'transfer') activity.transfers += Number(row.count);
            else if (row.type === 'adjustment') activity.adjustments += Number(row.count);
            else if (row.type === 'out') {
                const reason = row.reason || "";
                const isWaste = reason.toLowerCase().includes('брак') || reason.toLowerCase().includes('списание');
                if (isWaste) activity.waste += Number(row.count);
                else activity.usage += Number(row.count);
            }
        });

        const [branding] = await Promise.all([getBrandingSettings()]);
        const currencySymbol = branding.currencySymbol || '₽';

        return {
            success: true,
            data: {
                totalItems: Number(itemsRes[0]?.count || 0),
                totalQuantity: Number(stockRes[0]?.totalQuantity || 0),
                totalReserved: Number(stockRes[0]?.totalReserved || 0),
                totalStorages: Number(storagesRes[0]?.count || 0),
                archivedCount: Number(archivedRes[0]?.count || 0),
                totalCategories: Number(categoriesRes[0]?.count || 0),
                totalSubCategories: Number(subCategoriesRes[0]?.count || 0),
                criticalItems: criticalRes,
                activity,
                financials: {
                    totalCostValue: parseFloat(financialsRes[0]?.totalCostValue || '0'),
                    totalRetailValue: parseFloat(financialsRes[0]?.totalRetailValue || '0'),
                    frozenCostValue: parseFloat(financialsRes[0]?.frozenCostValue || '0'),
                    frozenRetailValue: parseFloat(financialsRes[0]?.frozenRetailValue || '0'),
                    writeOffValue30d: parseFloat(writeOffRes[0]?.writeOffValue || '0'),
                },
                currencySymbol,
                recentTransactions: recentTransactionsRes || [],
                topSoldItems: topSoldRes || [],
                stagnantItems: stagnantRes || [],
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
