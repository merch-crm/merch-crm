"use server";

import { z } from "zod";
import { eq, asc, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    inventoryAttributes,
    inventoryAttributeTypes,
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

    const { name, slug, isSystem, showInSku, showInName } = validation.data;
    const categoryId = validation.data.category;

    try {
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, "_");

        await db.insert(inventoryAttributeTypes).values({
            name,
            slug: cleanSlug,
            categoryId: categoryId || null,
            isSystem,
            showInSku,
            showInName
        });

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Создан тип атрибута: ${name} (${cleanSlug})`,
            createdBy: session.id,
        });

        refreshWarehouse();
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/type.actions",
            method: "createInventoryAttributeType",
            details: { name, slug }
        });
        return { success: false, error: "Не удалось создать раздел (возможно, такой код уже существует)" };
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

        const [hasAttrs] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.type, type.slug)).limit(1);
        if (hasAttrs) return { success: false, error: "В этом разделе есть записи. Сначала удалите их." };

        await db.delete(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален тип атрибута: ${type.name}`,
            createdBy: session.id,
        });

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

    const { name, isSystem, showInSku, showInName } = validation.data;
    const categoryId = validation.data.category;

    try {
        await db.update(inventoryAttributeTypes)
            .set({ name, categoryId, isSystem, showInSku, showInName })
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
