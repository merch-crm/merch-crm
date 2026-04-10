"use server";

import { z } from "zod";
import { eq, asc, inArray, and, isNull, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import { 
  inventoryAttributes, 
  inventoryItemAttributes 
} from "@/lib/schema/warehouse/attributes";
import { inventoryAttributeTypes } from "@/lib/schema/warehouse/categories";
import { inventoryTransactions } from "@/lib/schema/warehouse/stock";
import { accounts } from "@/lib/schema/users";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { comparePassword } from "@/lib/password";
import { refreshWarehouse } from "../../warehouse-shared.actions";
import { AttributeTypeSchema } from "../../validation";
import { type ActionResult, okVoid, ok, ERRORS } from "@/lib/types";

export type AttributeType = InferSelectModel<typeof inventoryAttributeTypes>;

/**
 * Get all inventory attribute types
 */
export async function getInventoryAttributeTypes(): Promise<ActionResult<AttributeType[]>> {
  return withAuth(async () => {
    const types = await db.select().from(inventoryAttributeTypes)
      .orderBy(asc(inventoryAttributeTypes.sortOrder), asc(inventoryAttributeTypes.createdAt))
      .limit(100);
    return ok(types);
  }, { errorPath: "getInventoryAttributeTypes" });
}

/**
 * Create a new inventory attribute type
 */
export async function createInventoryAttributeType(
  rawInput: unknown
): Promise<ActionResult> {
  return withAuth(async (session) => {
    const validation = AttributeTypeSchema.safeParse(rawInput);
    if (!validation.success) {
      return ERRORS.VALIDATION(validation.error.issues[0].message);
    }

    const { name, slug, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition } = validation.data;
    const categoryId = validation.data.category || null;

    const baseSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    // --- EXPLICIT DUPLICATE CHECK ---
    const existingByType = await db
      .select({ id: inventoryAttributeTypes.id })
      .from(inventoryAttributeTypes)
      .where(
        and(
          eq(inventoryAttributeTypes.dataType, dataType),
          categoryId
            ? eq(inventoryAttributeTypes.categoryId, categoryId)
            : isNull(inventoryAttributeTypes.categoryId)
        )
      )
      .limit(1);

    if (existingByType.length > 0) {
      return ERRORS.VALIDATION(`Характеристика типа «${name}» уже существует в этой категории`);
    }

    const existingBySlug = await db
      .select({ id: inventoryAttributeTypes.id })
      .from(inventoryAttributeTypes)
      .where(
        and(
          eq(inventoryAttributeTypes.slug, baseSlug),
          categoryId
            ? eq(inventoryAttributeTypes.categoryId, categoryId)
            : isNull(inventoryAttributeTypes.categoryId)
        )
      )
      .limit(1);

    if (existingBySlug.length > 0) {
      return ERRORS.VALIDATION(`Характеристика с названием «${name}» уже существует в этой категории`);
    }

    const cleanSlug = baseSlug;

    await db.transaction(async (tx) => {
      await tx.insert(inventoryAttributeTypes).values({
        name,
        slug: cleanSlug,
        categoryId: categoryId,
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
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "createInventoryAttributeType" 
  });
}

/**
 * Delete an inventory attribute type
 */
export async function deleteInventoryAttributeType(id: string, password?: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID типа атрибута");
  }

  return withAuth(async (session) => {
    const [type] = await db.select().from(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id)).limit(1);
    if (!type) return ERRORS.NOT_FOUND("Тип атрибута");

    const isAdmin = session.roleSlug === "admin";

    if (type.isSystem) {
      if (!isAdmin) {
        return ERRORS.FORBIDDEN("Системные разделы может удалять только Администратор");
      }
      if (!password) {
        return ERRORS.VALIDATION("Для удаления системного раздела требуется пароль от вашей учетной записи");
      }

      const userAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.userId, session.id),
          eq(accounts.providerId, "credential")
        )
      });

      if (!userAccount || !userAccount.password) {
        return ERRORS.VALIDATION("У пользователя не установлен пароль в Better Auth");
      }

      const isMatch = await comparePassword(password, userAccount.password);
      if (!isMatch) {
        return ERRORS.VALIDATION("Неверный пароль");
      }
    }

    const childAttrs = await db.select({ id: inventoryAttributes.id })
      .from(inventoryAttributes)
      .where(eq(inventoryAttributes.type, type.slug))
      .limit(1000);

    await db.transaction(async (tx) => {
      if (childAttrs.length > 0) {
        const childAttrIds = childAttrs.map(a => a.id);

        await tx.delete(inventoryItemAttributes)
          .where(inArray(inventoryItemAttributes.attributeId, childAttrIds));

        await tx.delete(inventoryAttributes)
          .where(eq(inventoryAttributes.type, type.slug));
      }

      await tx.delete(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));

      await tx.insert(inventoryTransactions).values({
        type: "attribute_change",
        reason: `Удален тип атрибута: ${type.name}${childAttrs.length > 0 ? ` (вместе с ${childAttrs.length} значениями)` : ''}`,
        createdBy: session.id,
      });
    });

    const { logAction } = await import("@/lib/audit");
    await logAction("Удален тип атрибута", "inventory_attribute_type", id, { name: type.name });

    refreshWarehouse();
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "deleteInventoryAttributeType" 
  });
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
    return ERRORS.VALIDATION("Некорректный ID типа атрибута");
  }

  return withAuth(async (session) => {
    const validation = AttributeTypeSchema.safeParse(rawInput);
    if (!validation.success) {
      return ERRORS.VALIDATION(validation.error.issues[0].message);
    }

    const { name, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition } = validation.data;
    const categoryId = validation.data.category || null;

    await db.transaction(async (tx) => {
      await tx.update(inventoryAttributeTypes)
        .set({ name, categoryId, isSystem, showInSku, showInName, dataType, hasColor, hasUnits, hasComposition })
        .where(eq(inventoryAttributeTypes.id, id));

      await tx.insert(inventoryTransactions).values({
        type: "attribute_change",
        reason: `Изменен тип атрибута: ${name}`,
        createdBy: session.id,
      });
    });

    refreshWarehouse();
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "updateInventoryAttributeType" 
  });
}

/**
 * Update the sort order of multiple attribute types
 */
export async function reorderInventoryAttributeTypes(
  updates: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
  return withAuth(async () => {
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx.update(inventoryAttributeTypes)
          .set({ sortOrder: update.sortOrder })
          .where(eq(inventoryAttributeTypes.id, update.id));
      }
    });

    refreshWarehouse();
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "reorderInventoryAttributeTypes" 
  });
}
