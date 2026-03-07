"use server";

import { z } from "zod";
import { eq, asc, inArray, and, isNull, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryAttributes,
    inventoryAttributeTypes,
    inventoryItemAttributes,
    inventoryTransactions,
    users
} from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { refreshWarehouse } from "../../warehouse-shared.actions";
import { AttributeTypeSchema } from "../../validation";
import { type ActionResult } from "@/lib/types";

export type AttributeType = InferSelectModel<typeof inventoryAttributeTypes>;

/**
 * Get all inventory attribute types
 */
export async function getInventoryAttributeTypes(): Promise<ActionResult<AttributeType[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const types = await db.select().from(inventoryAttributeTypes)
            .orderBy(asc(inventoryAttributeTypes.sortOrder), asc(inventoryAttributeTypes.createdAt))
            .limit(100);
        return { success: true, data: types };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "getInventoryAttributeTypes"
        });
        return { success: false, error: "Failed to fetch attribute types" };
    }
}

/**
 * Create a new inventory attribute type
 */
export async function createInventoryAttributeType(
    rawInput: unknown
): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = AttributeTypeSchema.safeParse(rawInput);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, slug, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition } = validation.data;
    const categoryId = validation.data.category;

    try {
        const baseSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        const resolvedCategoryId = categoryId || null;

        // --- EXPLICIT DUPLICATE CHECK ---
        // 1. Check if this dataType already exists in this category
        const existingByType = await db
            .select({ id: inventoryAttributeTypes.id, name: inventoryAttributeTypes.name })
            .from(inventoryAttributeTypes)
            .where(
                and(
                    eq(inventoryAttributeTypes.dataType, dataType),
                    resolvedCategoryId
                        ? eq(inventoryAttributeTypes.categoryId, resolvedCategoryId)
                        : isNull(inventoryAttributeTypes.categoryId)
                )
            )
            .limit(1);

        if (existingByType.length > 0) {
            return { success: false, error: `Характеристика типа «${name}» уже существует в этой категории` };
        }

        // 2. Check if a type with the same slug/name already exists
        const existingBySlug = await db
            .select({ id: inventoryAttributeTypes.id })
            .from(inventoryAttributeTypes)
            .where(
                and(
                    eq(inventoryAttributeTypes.slug, baseSlug),
                    resolvedCategoryId
                        ? eq(inventoryAttributeTypes.categoryId, resolvedCategoryId)
                        : isNull(inventoryAttributeTypes.categoryId)
                )
            )
            .limit(1);

        if (existingBySlug.length > 0) {
            return { success: false, error: `Характеристика с названием «${name}» уже существует в этой категории` };
        }

        const cleanSlug = baseSlug;

        await db.transaction(async (tx) => {
            await tx.insert(inventoryAttributeTypes).values({
                name,
                slug: cleanSlug,
                categoryId: resolvedCategoryId,
                isSystem,
                showInSku,
                showInName,
                dataType,
                hasColor,
                hasUnits,
                hasComposition
            });

            // Populate default values for specific data types
            if (dataType === "unit") {
                const defaultUnits = [
                    { name: "мм", full: "миллиметры" },
                    { name: "см", full: "сантиметры" },
                    { name: "м", full: "метры" }
                ];
                for (const unit of defaultUnits) {
                    await tx.insert(inventoryAttributes).values({
                        type: cleanSlug,
                        name: unit.name,
                        value: unit.name,
                        meta: { fullName: unit.full }
                    });
                }
            } else if (dataType === "quantity") {
                const defaultQuants = [
                    { name: "шт", full: "штуки" },
                    { name: "пар", full: "пары" },
                    { name: "компл", full: "комплекты" },
                    { name: "уп", full: "упаковки" },
                    { name: "рул", full: "рулоны" },
                    { name: "л", full: "литры" },
                    { name: "м", full: "метры" }
                ];
                for (const q of defaultQuants) {
                    await tx.insert(inventoryAttributes).values({
                        type: cleanSlug,
                        name: q.name,
                        value: q.name,
                        meta: { fullName: q.full }
                    });
                }
            } else if (dataType === "weight") {
                const defaultWeights = [
                    { name: "г", full: "граммы" },
                    { name: "кг", full: "килограммы" }
                ];
                for (const w of defaultWeights) {
                    await tx.insert(inventoryAttributes).values({
                        type: cleanSlug,
                        name: w.name,
                        value: w.name,
                        meta: { fullName: w.full }
                    });
                }
            } else if (dataType === "volume") {
                const defaultVolumes = [
                    { name: "мл", full: "миллилитры" },
                    { name: "л", full: "литры" }
                ];
                for (const v of defaultVolumes) {
                    await tx.insert(inventoryAttributes).values({
                        type: cleanSlug,
                        name: v.name,
                        value: v.name,
                        meta: { fullName: v.full }
                    });
                }
            }
            else if (dataType === "size") {
                const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
                for (const size of defaultSizes) {
                    await tx.insert(inventoryAttributes).values({
                        type: cleanSlug,
                        name: size,
                        value: size,
                    });
                }
            }

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Создан тип атрибута: ${name} (${cleanSlug})`,
                createdBy: session.id,
            });
        });

        refreshWarehouse();
        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "createInventoryAttributeType",
            details: { name, slug }
        });

        // Surface real DB errors for debugging; unique-violation code 23505
        const err = error as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "23505" || err?.message?.includes("unique");

        return {
            success: false, error: isUniqueViolation
                ? "Характеристика с таким названием уже существует в этой категории"
                : (err?.message || "Ошибка создания характеристики")
        };
    }
}

/**
 * Delete an inventory attribute type
 */
export async function deleteInventoryAttributeType(id: string, password?: string): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID типа атрибута" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        const [type] = await db.select().from(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id)).limit(1);
        if (!type) return { success: false, error: "Тип не найден" };

        const isAdmin = session.roleName === "Администратор";

        if (type.isSystem) {
            if (!isAdmin) {
                return { success: false, error: "Системные разделы может удалять только Администратор" };
            }
            if (!password) {
                return { success: false, error: "Для удаления системного раздела требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        // 1. Find all child attributes for this type
        const childAttrs = await db.select({ id: inventoryAttributes.id })
            .from(inventoryAttributes)
            .where(eq(inventoryAttributes.type, type.slug))
            .limit(1000);

        if (childAttrs.length > 0) {
            const childAttrIds = childAttrs.map(a => a.id);

            // 2. Delete item-attribute join rows (to avoid FK restrict violation)
            await db.delete(inventoryItemAttributes)
                .where(inArray(inventoryItemAttributes.attributeId, childAttrIds));

            // 3. Delete the attribute values themselves
            await db.delete(inventoryAttributes)
                .where(eq(inventoryAttributes.type, type.slug));
        }

        // 4. Delete the attribute type
        await db.delete(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален тип атрибута: ${type.name}${childAttrs.length > 0 ? ` (вместе с ${childAttrs.length} значениями)` : ''}`,
            createdBy: session.id,
        });

        const { logAction } = await import("@/lib/audit");
        await logAction("Удален тип атрибута", "inventory_attribute_type", id, { name: type.name });

        refreshWarehouse();
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "deleteInventoryAttributeType",
            details: { id }
        });
        return { success: false, error: "Не удалось удалить раздел" };
    }
}

/**
 * Update an existing inventory attribute type
 */
export async function updateInventoryAttributeType(
    id: string,
    rawInput: unknown
): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID типа атрибута" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = AttributeTypeSchema.safeParse(rawInput);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition } = validation.data;
    const categoryId = validation.data.category;

    try {
        await db.update(inventoryAttributeTypes)
            .set({ name, categoryId, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition })
            .where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменен тип атрибута: ${name}`,
            createdBy: session.id,
        });

        refreshWarehouse();
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "updateInventoryAttributeType",
            details: { id }
        });
        return { success: false, error: "Не удалось обновить раздел" };
    }
}

/**
 * Update the sort order of multiple attribute types
 */
export async function reorderInventoryAttributeTypes(
    updates: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const update of updates) {
                await tx.update(inventoryAttributeTypes)
                    .set({ sortOrder: update.sortOrder })
                    .where(eq(inventoryAttributeTypes.id, update.id));
            }
        });

        refreshWarehouse();
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "reorderInventoryAttributeTypes"
        });
        return { success: false, error: "Не удалось сохранить порядок" };
    }
}
