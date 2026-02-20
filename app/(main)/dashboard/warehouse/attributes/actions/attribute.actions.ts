"use server";

import { z } from "zod";
import { eq, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { type AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
    inventoryAttributes,
    inventoryItems,
    inventoryTransactions,
} from "@/lib/schema";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { refreshWarehouse } from "../../warehouse-shared.actions";
import { AttributeSchema } from "../../validation";
import { type ActionResult } from "@/lib/types";

export type InventoryAttribute = InferSelectModel<typeof inventoryAttributes>;

/**
 * Get all inventory attributes
 */
export async function getInventoryAttributes(): Promise<ActionResult<InventoryAttribute[]>> {
    try {
        const attributes = await db.query.inventoryAttributes.findMany({
            orderBy: (attributes, { asc }) => [asc(attributes.name)],
            limit: 1000
        });
        return { success: true, data: attributes };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/attribute.actions",
            method: "getInventoryAttributes"
        });
        return { success: false, error: "Не удалось загрузить атрибуты" };
    }
}

/**
 * Create a new inventory attribute
 */
export async function createInventoryAttribute(
    rawInput: unknown
): Promise<ActionResult<InventoryAttribute>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = AttributeSchema.safeParse(rawInput);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { type, name, value, meta } = validation.data;

    try {
        const attribute = await db.transaction(async (tx) => {
            const [newAttr] = await tx.insert(inventoryAttributes).values({
                type,
                name,
                value,
                meta: meta || null,
            }).returning();

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Добавлен атрибут: ${name} (${value}) в раздел ${type}`,
                createdBy: session.id,
            });

            await logAction("Создан атрибут", "inventory_attribute", newAttr.id, { name: newAttr.name }, tx);
            return newAttr;
        });

        invalidateCache("warehouse:attributes");
        refreshWarehouse();

        return { success: true, data: attribute };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/attribute.actions",
            method: "createInventoryAttribute",
            details: { type, name, value, meta }
        });
        return { success: false, error: "Не удалось создать атрибут" };
    }
}

/**
 * Update an existing inventory attribute
 */
export async function updateInventoryAttribute(
    id: string,
    rawInput: unknown
): Promise<ActionResult<InventoryAttribute>> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID атрибута" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = AttributeSchema.safeParse(rawInput);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, value, meta } = validation.data;

    try {
        const [oldAttr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id)).limit(1);
        if (!oldAttr) return { success: false, error: "Атрибут не найден" };

        const attribute = await db.transaction(async (tx) => {
            const [updatedAttr] = await tx.update(inventoryAttributes)
                .set({
                    name,
                    value,
                    meta: meta || null
                })
                .where(eq(inventoryAttributes.id, id))
                .returning();

            // If the code (value) OR visibility settings changed, update all items using this attribute
            const oldShowInSku = (oldAttr.meta as { showInSku?: boolean })?.showInSku ?? true;
            const newShowInSku = (meta as { showInSku?: boolean })?.showInSku ?? true;

            if (oldAttr.value !== value || oldShowInSku !== newShowInSku) {
                const typeToColumn: Record<string, AnyPgColumn> = {
                    'color': inventoryItems.attributeCode,
                    'material': inventoryItems.materialCode,
                    'brand': inventoryItems.brandCode,
                    'size': inventoryItems.sizeCode,
                    'quality': inventoryItems.qualityCode
                };

                const checkColumn = typeToColumn[oldAttr.type.toLowerCase()];

                if (checkColumn) {
                    const updates: Partial<InferInsertModel<typeof inventoryItems>> = {};

                    if (oldAttr.value !== value) {
                        const typeLow = oldAttr.type.toLowerCase();
                        if (typeLow === 'color') updates.attributeCode = value;
                        else if (typeLow === 'material') updates.materialCode = value;
                        else if (typeLow === 'brand') updates.brandCode = value;
                        else if (typeLow === 'size') updates.sizeCode = value;
                        else if (typeLow === 'quality') updates.qualityCode = value;
                    }

                    if (Object.keys(updates).length > 0) {
                        await tx.update(inventoryItems)
                            .set({ ...updates, updatedAt: new Date() })
                            .where(eq(checkColumn, oldAttr.value));
                    }
                }
            }

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Изменен атрибут: ${name} (${value})`,
                createdBy: session.id,
            });

            await logAction("Обновлен атрибут", "inventory_attribute", id, { name, value }, tx);
            return updatedAttr;
        });

        invalidateCache("warehouse:attributes");
        refreshWarehouse();

        return { success: true, data: attribute };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/attribute.actions",
            method: "updateInventoryAttribute",
            details: { id, name, value, meta }
        });
        return { success: false, error: "Не удалось обновить атрибут" };
    }
}

/**
 * Delete an inventory attribute
 */
export async function deleteInventoryAttribute(id: string): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID атрибута" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        const [attr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id)).limit(1);
        if (!attr) return { success: false, error: "Атрибут не найден" };

        const typeToColumn: Record<string, AnyPgColumn> = {
            'color': inventoryItems.attributeCode,
            'material': inventoryItems.materialCode,
            'brand': inventoryItems.brandCode,
            'size': inventoryItems.sizeCode,
            'quality': inventoryItems.qualityCode
        };

        const checkColumn = typeToColumn[attr.type.toLowerCase()];

        if (checkColumn) {
            const [usage] = await db
                .select({ id: inventoryItems.id })
                .from(inventoryItems)
                .where(eq(checkColumn, attr.value))
                .limit(1);

            if (usage) {
                return { success: false, error: "Этот атрибут используется в товарах и не может быть удален" };
            }
        }

        await db.delete(inventoryAttributes).where(eq(inventoryAttributes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален атрибут: ${attr.name} (${attr.value})`,
            createdBy: session.id,
        });

        await logAction("Удален атрибут", "inventory_attribute", id);
        invalidateCache("warehouse:attributes");
        refreshWarehouse();

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/attributes/actions/attribute.actions",
            method: "deleteInventoryAttribute",
            details: { id }
        });
        return { success: false, error: "Не удалось удалить атрибут" };
    }
}
