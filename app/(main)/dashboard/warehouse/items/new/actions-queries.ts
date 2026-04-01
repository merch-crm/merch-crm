"use server";

import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { productLines } from "@/lib/schema/product-lines";
import { printDesigns } from "@/lib/schema/designs";
import { eq, and, desc } from "drizzle-orm";

/**
 * Получает последние SKU для генератора
 * @param categoryId ID категории
 */
export async function getLatestSkus(categoryId: string): Promise<string[]> {
    try {
        const items = await db.query.inventoryItems.findMany({
            where: eq(inventoryItems.categoryId, categoryId),
            orderBy: [desc(inventoryItems.createdAt)],
            limit: 5,
        });
        return (items || []).map((i) => i.sku).filter((sku): sku is string => !!sku);
    } catch (_error) {
        return [];
    }
}

/**
 * Получить базовые линейки для категории
 */
export async function getBaseLinesForCategory(categoryId: string) {
    try {
        const lines = await db
            .select({
                id: productLines.id,
                name: productLines.name,
            })
            .from(productLines)
            .where(
                and(
                    eq(productLines.categoryId, categoryId),
                    eq(productLines.type, "base"),
                    eq(productLines.isActive, true)
                )
            );

        // Для каждой линейки получаем цвета и размеры
        const result = await Promise.all(
            lines.map(async (line) => {
                const items = await db
                    .select({
                        attributes: inventoryItems.attributes,
                    })
                    .from(inventoryItems)
                    .where(
                        and(
                            eq(inventoryItems.productLineId, line.id),
                            eq(inventoryItems.isArchived, false)
                        )
                    );

                const colors = new Set<string>();
                const sizes = new Set<string>();

                for (const item of items) {
                    const attrs = item.attributes as Record<string, string>;
                    const color = attrs.color || attrs.Color;
                    const size = attrs.size || attrs.Size;
                    if (color) colors.add(color);
                    if (size) sizes.add(size);
                }

                return {
                    id: line.id,
                    name: line.name,
                    itemsCount: items?.length || 0,
                    colors: Array.from(colors),
                    sizes: Array.from(sizes).sort((a, b) => {
                        // Сортировка размеров: XS, S, M, L, XL, XXL, числовые
                        const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
                        const indexA = order.indexOf(a);
                        const indexB = order.indexOf(b);
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return a.localeCompare(b, undefined, { numeric: true });
                    }),
                };
            })
        );

        return result;
    } catch (error) {
        console.error("Error fetching base lines:", error);
        return [];
    }
}

/**
 * Получить принты коллекции для выбора
 */
export async function getPrintsForSelection(collectionId: string) {
    try {
        const prints = await db
            .select({
                id: printDesigns.id,
                name: printDesigns.name,
                preview: printDesigns.preview,
            })
            .from(printDesigns)
            .where(
                and(
                    eq(printDesigns.collectionId, collectionId),
                    eq(printDesigns.isActive, true)
                )
            )
            .orderBy(printDesigns.sortOrder, printDesigns.name);

        return prints.map((p) => ({
            ...p,
            versionsCount: 0,
        }));
    } catch (error) {
        console.error("Error fetching prints for selection:", error);
        return [];
    }
}
