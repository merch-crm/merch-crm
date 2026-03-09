"use server";

import { eq, sql, asc, and, inArray, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    productLines,
    inventoryCategories,
    inventoryItems,
    printCollections,
} from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type ProductLine = InferSelectModel<typeof productLines>;
type InventoryCategory = InferSelectModel<typeof inventoryCategories>;
type PrintCollection = InferSelectModel<typeof printCollections>;

export interface ProductLineWithStats extends ProductLine {
    positionsCount: number;
    totalStock: number;
    category?: InventoryCategory;
    printCollection?: PrintCollection;
}

export interface ProductLineFull extends ProductLine {
    category: InventoryCategory;
    printCollection?: PrintCollection;
    items: InferSelectModel<typeof inventoryItems>[];
}

/**
 * Получить линейки по категории (подкатегории)
 */
export async function getLinesByCategory(
    categoryId: string,
    type?: "base" | "finished" | "all"
): Promise<{ success: boolean; data?: ProductLineWithStats[]; error?: string }> {
    const idValidation = z.string().uuid().safeParse(categoryId);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID категории" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const baseQuery = db
            .select({
                id: productLines.id,
                name: productLines.name,
                slug: productLines.slug,
                type: productLines.type,
                categoryId: productLines.categoryId,
                printCollectionId: productLines.printCollectionId,
                baseLineId: productLines.baseLineId,
                commonAttributes: productLines.commonAttributes,
                description: productLines.description,
                image: productLines.image,
                isActive: productLines.isActive,
                sortOrder: productLines.sortOrder,
                createdBy: productLines.createdBy,
                createdAt: productLines.createdAt,
                updatedAt: productLines.updatedAt,
                positionsCount: sql<number>`(
                    SELECT COUNT(*)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
                totalStock: sql<number>`(
                    SELECT COALESCE(SUM(${inventoryItems.quantity}), 0)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
            })
            .from(productLines)
            .where(
                type && type !== "all"
                    ? and(
                        eq(productLines.categoryId, categoryId),
                        eq(productLines.type, type),
                        eq(productLines.isActive, true)
                    )
                    : and(
                        eq(productLines.categoryId, categoryId),
                        eq(productLines.isActive, true)
                    )
            )
            .orderBy(asc(productLines.sortOrder), asc(productLines.name));

        const lines = await baseQuery;

        const finishedLines = lines.filter(l => l.type === "finished" && l.printCollectionId);
        const collectionIds = finishedLines.map(l => l.printCollectionId!);

        let collectionsMap: Record<string, PrintCollection> = {};
        if (collectionIds.length > 0) {
            const collections = await db
                .select()
                .from(printCollections)
                .where(inArray(printCollections.id, collectionIds));
            collectionsMap = Object.fromEntries(collections.map(c => [c.id, c]));
        }

        const linesWithCollections = lines.map(line => ({
            ...line,
            printCollection: line.printCollectionId
                ? collectionsMap[line.printCollectionId]
                : undefined,
        }));

        return { success: true, data: linesWithCollections };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/lines/line-query-actions",
            method: "getLinesByCategory",
            details: { categoryId, type },
        });
        return { success: false, error: "Не удалось загрузить линейки" };
    }
}

/**
 * Получить линейку по ID с позициями
 */
export async function getLineById(id: string): Promise<{ success: boolean; data?: ProductLineFull; error?: string }> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID линейки" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [line] = await db
            .select()
            .from(productLines)
            .where(eq(productLines.id, id))
            .limit(1);

        if (!line) {
            return { success: false, error: "Линейка не найдена" };
        }

        const [category] = await db
            .select()
            .from(inventoryCategories)
            .where(eq(inventoryCategories.id, line.categoryId))
            .limit(1);

        let printCollection: PrintCollection | undefined;
        if (line.printCollectionId) {
            const [collection] = await db
                .select()
                .from(printCollections)
                .where(eq(printCollections.id, line.printCollectionId))
                .limit(1);
            printCollection = collection;
        }

        const items = await db
            .select()
            .from(inventoryItems)
            .where(and(
                eq(inventoryItems.productLineId, id),
                eq(inventoryItems.isArchived, false)
            ))
            .orderBy(asc(inventoryItems.name));

        return {
            success: true,
            data: {
                ...line,
                category,
                printCollection,
                items
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/lines/line-query-actions",
            method: "getLineById",
            details: { id },
        });
        return { success: false, error: "Не удалось загрузить линейку" };
    }
}

/**
 * Получить все базовые линейки
 */
export async function getBaseLines(categoryId?: string): Promise<{ success: boolean; data?: ProductLineWithStats[]; error?: string }> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const whereClause = categoryId
            ? and(
                eq(productLines.type, "base"),
                eq(productLines.categoryId, categoryId),
                eq(productLines.isActive, true)
            )
            : and(
                eq(productLines.type, "base"),
                eq(productLines.isActive, true)
            );

        const lines = await db
            .select({
                id: productLines.id,
                name: productLines.name,
                slug: productLines.slug,
                type: productLines.type,
                categoryId: productLines.categoryId,
                printCollectionId: productLines.printCollectionId,
                baseLineId: productLines.baseLineId,
                commonAttributes: productLines.commonAttributes,
                description: productLines.description,
                image: productLines.image,
                isActive: productLines.isActive,
                sortOrder: productLines.sortOrder,
                createdBy: productLines.createdBy,
                createdAt: productLines.createdAt,
                updatedAt: productLines.updatedAt,
                positionsCount: sql<number>`(
                    SELECT COUNT(*)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
                totalStock: sql<number>`(
                    SELECT COALESCE(SUM(${inventoryItems.quantity}), 0)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
            })
            .from(productLines)
            .where(whereClause)
            .orderBy(asc(productLines.name));

        return { success: true, data: lines };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/lines/line-query-actions",
            method: "getBaseLines",
            details: { categoryId },
        });
        return { success: false, error: "Не удалось загрузить базовые линейки" };
    }
}

/**
 * Получить все линейки
 */
export async function getAllLines(): Promise<{ success: boolean; data?: ProductLineWithStats[]; error?: string }> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const lines = await db
            .select({
                id: productLines.id,
                name: productLines.name,
                slug: productLines.slug,
                type: productLines.type,
                categoryId: productLines.categoryId,
                printCollectionId: productLines.printCollectionId,
                baseLineId: productLines.baseLineId,
                commonAttributes: productLines.commonAttributes,
                description: productLines.description,
                image: productLines.image,
                isActive: productLines.isActive,
                sortOrder: productLines.sortOrder,
                createdBy: productLines.createdBy,
                createdAt: productLines.createdAt,
                updatedAt: productLines.updatedAt,
                positionsCount: sql<number>`(
                    SELECT COUNT(*)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
                totalStock: sql<number>`(
                    SELECT COALESCE(SUM(${inventoryItems.quantity}), 0)::int 
                    FROM ${inventoryItems} 
                    WHERE ${inventoryItems.productLineId} = ${productLines.id}
                    AND ${inventoryItems.isArchived} = false
                )`,
            })
            .from(productLines)
            .where(eq(productLines.isActive, true))
            .orderBy(asc(productLines.sortOrder), asc(productLines.name));

        const finishedLines = lines.filter((l) => l.type === "finished" && l.printCollectionId);
        const collectionIds = finishedLines.map((l) => l.printCollectionId!);

        let collectionsMap: Record<string, PrintCollection> = {};
        if (collectionIds.length > 0) {
            const collections = await db
                .select()
                .from(printCollections)
                .where(inArray(printCollections.id, collectionIds));
            collectionsMap = Object.fromEntries(collections.map((c) => [c.id, c]));
        }

        const linesWithCollections = lines.map((line) => ({
            ...line,
            printCollection: line.printCollectionId
                ? collectionsMap[line.printCollectionId]
                : undefined,
        }));

        return { success: true, data: linesWithCollections };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/lines/line-query-actions",
            method: "getAllLines",
        });
        return { success: false, error: "Не удалось загрузить линейки" };
    }
}

export async function getLineAttributeValues(lineId: string): Promise<{ success: boolean; data?: Record<string, string[]>; error?: string }> {
    const idValidation = z.string().uuid().safeParse(lineId);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID линейки" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const items = await db
            .select({
                attributes: inventoryItems.attributes,
            })
            .from(inventoryItems)
            .where(and(
                eq(inventoryItems.productLineId, lineId),
                eq(inventoryItems.isArchived, false)
            ));

        const attributeValues: Record<string, Set<string>> = {};

        for (const item of items) {
            const attrs = item.attributes as Record<string, string> || {};
            for (const [key, value] of Object.entries(attrs)) {
                if (!attributeValues[key]) {
                    attributeValues[key] = new Set();
                }
                if (value) {
                    attributeValues[key].add(value);
                }
            }
        }

        const result: Record<string, string[]> = {};
        for (const [key, values] of Object.entries(attributeValues)) {
            result[key] = Array.from(values).sort();
        }

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/lines/line-query-actions",
            method: "getLineAttributeValues",
            details: { lineId },
        });
        return { success: false, error: "Не удалось загрузить значения атрибутов" };
    }
}
