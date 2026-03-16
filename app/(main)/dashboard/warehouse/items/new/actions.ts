"use server";

import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryStocks,
    inventoryTransactions,
    productLines,
} from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Схема для позиции товара
const PositionSchema = z.object({
    sku: z.string().optional(),
    attributeCode: z.string().optional(),
    sizeCode: z.string().optional(),
    quantity: z.number().default(0),
    storageLocationId: z.string().optional(),
    costPrice: z.string().optional(),
    sellingPrice: z.string().optional(),
});

// Схема для создания линейки
const CreateLineSchema = z.object({
    line: z.object({
        name: z.string(),
        categoryId: z.string(),
        subcategoryId: z.string().optional(),
        brandCode: z.string().optional(),
        qualityCode: z.string().optional(),
        materialCode: z.string().optional(),
        itemType: z.enum(["base", "finished", "packaging", "consumable"]),
        unit: z.string().default("шт."),
        printId: z.string().optional(),
        printVersionId: z.string().optional(),
    }),
    positions: z.array(PositionSchema),
});

/**
 * Вспомогательная функция для маппинга типа товара в enum БД
 */
function mapItemType(type: string): "clothing" | "packaging" | "consumables" {
    if (type === "base" || type === "finished") return "clothing";
    if (type === "packaging") return "packaging";
    return "consumables";
}

/**
 * Создаёт базовую линейку (базовые товары)
 * @param data Данные для создания линейки
 */
export async function createBaseLineWithPositions(data: unknown) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return {
                success: false as const,
                error: "Необходима авторизация",
            };
        }

        const validated = CreateLineSchema.safeParse(data);
        if (!validated.success) {
            return {
                success: false as const,
                error: validated.error.issues[0].message,
            };
        }

        const { line, positions } = validated.data;

        // Проверяем дубликаты SKU
        const skus = positions.map(p => p.sku).filter((sku): sku is string => !!sku);
        if (skus.length > 0) {
            const existingItems = await db.query.inventoryItems.findMany({
                where: inArray(inventoryItems.sku, skus),
                limit: 1,
            });
            if (existingItems.length > 0) {
                return {
                    success: false as const,
                    error: `SKU "${existingItems[0].sku}" уже существует`,
                };
            }
        }

        const lineId = crypto.randomUUID();
        const slug = line.name.toLowerCase().replace(/\s+/g, '-').substring(0, 50);

        // 1. Создаём линейку
        await db.insert(productLines).values({
            id: lineId,
            name: line.name,
            slug: `${slug}-${lineId.substring(0, 6)}`,
            categoryId: line.categoryId,
            type: "base",
            createdBy: session.id,
        });

        // 2. Создаём товары и остатки
        for (const pos of positions) {
            const itemId = crypto.randomUUID();

            await db.insert(inventoryItems).values({
                id: itemId,
                productLineId: lineId,
                name: `${line.name} ${pos.sizeCode || ""}`.trim(),
                sku: pos.sku || `ITEM-${crypto.randomUUID().substring(0, 8)}`,
                categoryId: line.categoryId,
                brandCode: line.brandCode,
                qualityCode: line.qualityCode,
                materialCode: line.materialCode,
                sizeCode: pos.sizeCode,
                itemType: mapItemType("base"),
                unit: (line.unit || "шт.") as "шт.",
                costPrice: pos.costPrice || "0",
                sellingPrice: pos.sellingPrice || "0",
                createdBy: session.id,
            });

            // Создаём запись на складе
            if (pos.storageLocationId && pos.quantity > 0) {
                await db.insert(inventoryStocks).values({
                    id: crypto.randomUUID(),
                    itemId,
                    storageLocationId: pos.storageLocationId,
                    quantity: pos.quantity,
                });
            }
        }

        revalidatePath("/dashboard/warehouse");
        return { success: true as const, lineId };

    } catch (error) {
        console.error("Error creating base line:", error);
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Произошла ошибка при создании линейки",
        };
    }
}

interface FinishedLinePositionInput {
    name: string;
    sku: string;
    printDesignId: string;
    baseItemId?: string | null;
    attributes: Record<string, string>;
}

interface CreateFinishedLineInput {
    categoryId: string;
    lineName: string;
    description?: string;
    printCollectionId: string;
    baseLineId: string;
    positions: FinishedLinePositionInput[];
    stock?: {
        quantity: number;
        locationId: string;
        minStock: number;
        userId: string;
    };
}

interface CreateFinishedLineResult {
    success: boolean;
    lineId?: string;
    positionsCount?: number;
    error?: string;
}

/**
 * Создаёт готовую линейку (изделия) на основе коллекции принтов и базовой линейки
 * @param input Данные для создания
 */
export async function createFinishedLineWithPositions(
    input: CreateFinishedLineInput
): Promise<CreateFinishedLineResult> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const {
            categoryId,
            lineName,
            description,
            printCollectionId,
            baseLineId,
            positions,
            stock,
        } = input;

        // Валидация
        if (!lineName.trim()) {
            return { success: false, error: "Название линейки обязательно" };
        }

        if (positions.length === 0) {
            return { success: false, error: "Позиции не сгенерированы" };
        }

        // Генерируем slug
        const slug = lineName
            .toLowerCase()
            .replace(/[^a-zа-яё0-9\s-]/gi, "")
            .replace(/\s+/g, "-")
            .substring(0, 100);

        // Создаём линейку и позиции в транзакции
        const result = await db.transaction(async (tx) => {
            // 1. Создаём готовую линейку
            const lineId = crypto.randomUUID();

            await tx.insert(productLines).values({
                id: lineId,
                name: lineName,
                slug: `${slug}-${lineId.substring(0, 8)}`,
                type: "finished",
                categoryId,
                printCollectionId,
                baseLineId,
                description: description || null,
                isActive: true,
                sortOrder: 0,
                createdBy: session.id,
            });

            // 2. Проверяем уникальность SKU
            const skus = positions.map((p) => p.sku);
            const existingSkus = await tx
                .select({ sku: inventoryItems.sku })
                .from(inventoryItems)
                .where(inArray(inventoryItems.sku, skus));

            if (existingSkus.length > 0) {
                // Если есть дубликаты, добавим суффикс (хотя лучше проверять заранее)
                // Но для простоты вернём ошибку
                return {
                    error: `SKU "${existingSkus[0].sku}" уже существует`,
                };
            }

            // 3. Вставляем позиции
            const insertedItems = await tx.insert(inventoryItems).values(
                positions.map((pos) => ({
                    id: crypto.randomUUID(),
                    name: pos.name,
                    sku: pos.sku,
                    categoryId,
                    productLineId: lineId,
                    baseItemId: pos.baseItemId || null,
                    printDesignId: pos.printDesignId,
                    attributes: pos.attributes,
                    itemType: "clothing" as const,
                    isActive: true,
                    createdBy: session.id,
                }))
            ).returning({ id: inventoryItems.id });

            // 4. Создаём записи о начальном остатке
            if (insertedItems.length > 0 && stock) {
                await tx.insert(inventoryStocks).values(
                    insertedItems.map((item) => ({
                        id: crypto.randomUUID(),
                        itemId: item.id,
                        quantity: stock.quantity || 0,
                        reservedQuantity: 0,
                        storageLocationId: stock.locationId || "",
                    }))
                );

                if (stock.quantity > 0) {
                    await tx.insert(inventoryTransactions).values(
                        insertedItems.map((item) => ({
                            id: crypto.randomUUID(),
                            itemId: item.id,
                            type: "in" as const,
                            changeAmount: stock.quantity,
                            storageLocationId: stock.locationId,
                            reason: "Начальный остаток готовой линейки",
                            createdBy: session.id,
                        }))
                    );
                }
            }

            return {
                lineId,
                positionsCount: positions.length,
            };
        });

        if ("error" in result && result.error) {
            return { success: false, error: result.error };
        }

        // Инвалидируем кеши
        revalidatePath("/dashboard/warehouse");
        revalidatePath("/dashboard/warehouse/lines");

        return {
            success: true,
            lineId: (result as { lineId: string }).lineId,
            positionsCount: (result as { positionsCount: number }).positionsCount,
        };
    } catch (error) {
        console.error("Error creating finished line:", error);
        return {
            success: false,
            error: "Произошла ошибка при создании линейки",
        };
    }
}

/**
 * Создаёт одиночный товар
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSingleItem(data: Record<string, any>) {
    try {
        const session = await getSession();
        if (!session?.id) return { success: false, error: "Необходима авторизация" };

        const itemId = crypto.randomUUID();

        await db.transaction(async (tx) => {
            await tx.insert(inventoryItems).values({
                id: itemId,
                name: data.itemName || "Без названия",
                sku: data.sku || null,
                categoryId: data.subcategoryId || data.categoryId || null,
                quantity: Number(data.quantity) || 0,
                unit: (data.unit || "шт.") as never,
                description: data.description,
                image: data.image,
                costPrice: data.costPrice || "0",
                sellingPrice: data.sellingPrice || "0",
                attributes: data.attributes || {},
                brandCode: data.brandCode || null,
                qualityCode: data.qualityCode || null,
                materialCode: data.materialCode || null,
                sizeCode: data.sizeCode || null,
                attributeCode: data.attributeCode || null,
                createdBy: session.id,
            });

            if (data.locationId) {
                await tx.insert(inventoryStocks).values({
                    id: crypto.randomUUID(),
                    itemId,
                    storageLocationId: data.locationId,
                    quantity: Number(data.quantity) || 0,
                });
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true, id: itemId };
    } catch (error) {
        console.error("Error creating single item:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка при создании товара" };
    }
}

interface PositionInput {
    sku?: string;
    sizeCode?: string;
    costPrice?: string;
    sellingPrice?: string;
    storageLocationId?: string;
    quantity: number;
    printDesignId?: string | null;
    printVersionId?: string | null;
}

/**
 * Добавляет позиции в существующую линейку
 * @param lineId ID линейки
 * @param positions Список позиций для добавления
 */
export async function addPositionsToExistingLine(lineId: string, positions: PositionInput[]) {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Не авторизован" };

    try {
        const line = await db.query.productLines.findFirst({
            where: eq(productLines.id, lineId),
        });

        if (!line) throw new Error("Линейка не найдена");

        // Проверяем дубликаты SKU
        const skus = positions.map(p => p.sku).filter((sku): sku is string => !!sku);
        if (skus.length > 0) {
            const existingItems = await db.query.inventoryItems.findMany({
                where: inArray(inventoryItems.sku, skus),
                limit: 1,
            });
            if (existingItems.length > 0) {
                return {
                    success: false as const,
                    error: `SKU "${existingItems[0].sku}" уже существует`,
                };
            }
        }

        for (const pos of positions) {
            const itemId = crypto.randomUUID();

            await db.insert(inventoryItems).values({
                id: itemId,
                productLineId: lineId,
                name: `${line.name} ${pos.sizeCode || ""}`.trim(),
                sku: pos.sku || `ITEM-${crypto.randomUUID().substring(0, 8)}`,
                categoryId: line.categoryId,
                sizeCode: pos.sizeCode,
                itemType: mapItemType(line.type || "base"),
                unit: "шт.",
                costPrice: pos.costPrice || "0",
                sellingPrice: pos.sellingPrice || "0",
                printDesignId: pos.printDesignId || undefined,
                printVersionId: pos.printVersionId || undefined,
            });

            if (pos.storageLocationId && pos.quantity > 0) {
                await db.insert(inventoryStocks).values({
                    id: crypto.randomUUID(),
                    itemId,
                    storageLocationId: pos.storageLocationId,
                    quantity: pos.quantity,
                });
            }
        }

        revalidatePath("/dashboard/warehouse");
        return { success: true as const };
    } catch (error) {
        console.error("Error adding positions:", error);
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Ошибка при добавлении позиций",
        };
    }
}

// Re-export query functions (imported first to ensure compatibility with "use server")
import { getLatestSkus, getBaseLinesForCategory, getPrintsForSelection } from "./actions-queries";
export { getLatestSkus, getBaseLinesForCategory, getPrintsForSelection };
