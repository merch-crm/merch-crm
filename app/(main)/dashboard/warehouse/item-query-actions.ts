"use server";

import { z } from "zod";
import { desc, eq, sql, inArray, and, asc, or, ilike, type SQL, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryStocks,
} from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-logger";
import { type InventoryFilters, type InventoryItem } from "./types";
import { type ActionResult } from "@/lib/types";
import { InventoryFiltersSchema } from "./validation";
import { logAction } from "@/lib/audit";

/**
 * Get inventory items with filtering and pagination
 */
export async function getInventoryItems(filters: InventoryFilters = {}): Promise<ActionResult<{
    items: InventoryItem[];
    total: number;
    totalPages: number;
}>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = InventoryFiltersSchema.safeParse(filters || {});
        if (!validated.success) {
            return { success: false, error: "Неверные параметры фильтрации" };
        }

        const {
            page,
            limit,
            search,
            categoryIds,
            status,
            storageLocationId,
            sortBy,
            showArchived,
            onlyOrphaned,
            productLineId
        } = validated.data;

        const offset = limit > 0 ? (page - 1) * limit : 0;

        const baseConditions: SQL[] = [
            eq(inventoryItems.isArchived, showArchived)
        ];

        if (search) {
            baseConditions.push(or(
                ilike(inventoryItems.name, `%${search}%`),
                ilike(inventoryItems.sku, `%${search}%`)
            ) as SQL);
        }

        if (onlyOrphaned) {
            baseConditions.push(isNull(inventoryItems.categoryId));
        } else if (categoryIds && categoryIds.length > 0) {
            baseConditions.push(inArray(inventoryItems.categoryId, categoryIds));
        }

        if (productLineId) {
            baseConditions.push(eq(inventoryItems.productLineId, productLineId));
        }

        if (status && status !== "all") {
            if (status === "in") {
                baseConditions.push(sql`${inventoryItems.quantity} > ${inventoryItems.lowStockThreshold}`);
            } else if (status === "low") {
                baseConditions.push(and(
                    sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`,
                    sql`${inventoryItems.quantity} > ${inventoryItems.criticalStockThreshold}`
                ) as SQL);
            } else if (status === "out") {
                baseConditions.push(sql`${inventoryItems.quantity} <= ${inventoryItems.criticalStockThreshold}`);
            }
        }

        if (storageLocationId && storageLocationId !== "all") {
            baseConditions.push(sql`EXISTS (
                SELECT 1 FROM ${inventoryStocks} 
                WHERE ${inventoryStocks.itemId} = ${inventoryItems.id} 
                AND ${inventoryStocks.storageLocationId} = ${storageLocationId}
                AND ${inventoryStocks.quantity} > 0
            )`);
        }

        let orderByClause: SQL = desc(inventoryItems.createdAt);
        if (sortBy === "quantity") {
            orderByClause = desc(inventoryItems.quantity);
        } else if (sortBy === "name") {
            orderByClause = asc(inventoryItems.name);
        } else if (sortBy === "sku") {
            orderByClause = asc(inventoryItems.sku);
        } else if (sortBy === "archivedAt") {
            orderByClause = desc(inventoryItems.archivedAt);
        }

        const items = await db.query.inventoryItems.findMany({
            where: and(...baseConditions),
            with: {
                category: true,
                stocks: {
                    with: {
                        storageLocation: true
                    }
                },
                productLine: true
            },
            orderBy: orderByClause,
            limit: limit > 0 ? limit : 100,
            offset: limit > 0 ? offset : undefined
        });

        const [countRes] = await db
            .select({ count: sql<number>`count(*)` })
            .from(inventoryItems)
            .where(and(...baseConditions))
            .limit(1);

        const totalCount = Number(countRes?.count || 0);

        return {
            success: true,
            data: {
                items: items as InventoryItem[],
                total: totalCount,
                totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-query-actions",
            method: "getInventoryItems",
            details: { ...filters }
        });
        return { success: false, error: "Не удалось загрузить товары" };
    }
}

/**
 * Get only archived inventory items
 */
export async function getArchivedItems(filters: InventoryFilters = {}): Promise<ActionResult<{
    items: InventoryItem[];
    total: number;
    totalPages: number;
}>> {
    try {
        const validated = InventoryFiltersSchema.safeParse(filters || {});
        const baseFilters = validated.success ? validated.data : (InventoryFiltersSchema.parse({}));

        await logAction("Просмотр архива товаров", "inventory_item", "list", {}, undefined, "list");

        return getInventoryItems({
            ...baseFilters,
            showArchived: true,
            sortBy: baseFilters.sortBy || "archivedAt"
        } as InventoryFilters);
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-query-actions",
            method: "getArchivedItems",
            details: { ...filters }
        });
        return { success: false, error: "Не удалось загрузить архив" };
    }
}

/**
 * Get a single inventory item by ID
 */
export async function getInventoryItem(id: string): Promise<ActionResult<InventoryItem>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = z.string().uuid().safeParse(id);
    if (!validation.success) {
        return { success: false, error: "Некорректный ID товара" };
    }

    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.id, id),
            with: {
                category: {
                    with: {
                        parent: true
                    }
                },
                printDesign: true,
                stocks: {
                    with: {
                        storageLocation: true
                    }
                }
            }
        }) as unknown as InventoryItem;

        return { success: true, data: item };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-query-actions",
            method: "getInventoryItem",
            details: { id }
        });
        return { success: false, error: "Не удалось загрузить товар" };
    }
}
