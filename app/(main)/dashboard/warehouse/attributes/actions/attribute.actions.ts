"use server";

import { z } from "zod";
import { eq, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { type AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { inventoryAttributes } from "@/lib/schema/warehouse/attributes";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { inventoryTransactions } from "@/lib/schema/warehouse/stock";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { refreshWarehouse } from "../../warehouse-shared.actions";
import { AttributeSchema } from "../../validation";
import { type ActionResult, okVoid, ok, ERRORS } from "@/lib/types";

export type InventoryAttribute = InferSelectModel<typeof inventoryAttributes>;

/**
 * Get all inventory attributes
 */
export async function getInventoryAttributes(): Promise<ActionResult<InventoryAttribute[]>> {
  return withAuth(async () => {
    const attributes = await db.query.inventoryAttributes.findMany({
      orderBy: (attributes, { asc }) => [asc(attributes.name)],
      limit: 1000
    });
    return ok(attributes);
  }, { errorPath: "getInventoryAttributes" });
}

/**
 * Create a new inventory attribute
 */
export async function createInventoryAttribute(
  rawInput: unknown
): Promise<ActionResult<InventoryAttribute>> {
  return withAuth(async (session) => {
    const validation = AttributeSchema.safeParse(rawInput);
    if (!validation.success) {
      return ERRORS.VALIDATION(validation.error.issues[0].message);
    }

    const { type, value, categoryId } = validation.data;
    let { name, meta } = validation.data;

    // Capitalize if it's a country
    if (type.toLowerCase() === "country") {
      name = name.trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Auto-fill fullName if missing for standard units
    const nameMap: Record<string, string> = {
      "шт": "штуки", "пар": "пары", "компл": "комплекты", "уп": "упаковки", "рул": "рулоны",
      "л": "литры", "м": "метры", "мм": "миллиметры", "см": "сантиметры", "г": "граммы",
      "кг": "килограммы", "мл": "миллилитры"
    };
    const short = name.toLowerCase().replace(/\.$/, "");
    if (nameMap[short] && (!meta || !meta.fullName)) {
      meta = { ...((meta as object) || {}), fullName: nameMap[short] };
    }

    const attribute = await db.transaction(async (tx) => {
      const [newAttr] = await tx.insert(inventoryAttributes).values({
        type,
        name,
        value,
        categoryId: categoryId || null,
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

    return ok(attribute);
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "createInventoryAttribute" 
  });
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
    return ERRORS.VALIDATION("Некорректный ID атрибута");
  }

  return withAuth(async (session) => {
    const validation = AttributeSchema.safeParse(rawInput);
    if (!validation.success) {
      return ERRORS.VALIDATION(validation.error.issues[0].message);
    }

    const { value, categoryId } = validation.data;
    let { name } = validation.data;
    const { meta } = validation.data;

    const [oldAttr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id)).limit(1);
    if (!oldAttr) return ERRORS.NOT_FOUND("Атрибут");

    // Capitalize if it's a country
    if (oldAttr.type.toLowerCase() === "country") {
      name = name.trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    const attribute = await db.transaction(async (tx) => {
      const [updatedAttr] = await tx.update(inventoryAttributes)
        .set({
          name,
          value,
          categoryId: categoryId || null,
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

    return ok(attribute);
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "updateInventoryAttribute" 
  });
}

/**
 * Delete an inventory attribute
 */
export async function deleteInventoryAttribute(id: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID атрибута");
  }

  return withAuth(async (session) => {
    const [attr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id)).limit(1);
    if (!attr) return ERRORS.NOT_FOUND("Атрибут");

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
        return ERRORS.VALIDATION("Этот атрибут используется в товарах и не может быть удален");
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

    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "deleteInventoryAttribute" 
  });
}
