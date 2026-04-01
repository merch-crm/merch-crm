"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, isNull, and, asc, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema/warehouse/categories";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { generateCategoryPrefix } from "./category-utils";
import { getCategoryFullPath, updateChildrenPaths, isDescendant } from "./actions-utils";
import { InventoryCategorySchema } from "./validation";
import { z } from "zod";

import { type ActionResult, okVoid, ok, ERRORS } from "@/lib/types";

/**
 * Get all inventory categories
 */
type InventoryCategory = InferSelectModel<typeof inventoryCategories>;

export interface CategoryWithStats extends InventoryCategory {
    itemCount: number;
    totalQuantity: number;
    totalCost: number;
}

export async function getInventoryCategories(): Promise<ActionResult<CategoryWithStats[]>> {
    return withAuth(async () => {
        const categories = await db.select({
            id: inventoryCategories.id,
            name: inventoryCategories.name,
            description: inventoryCategories.description,
            icon: inventoryCategories.icon,
            color: inventoryCategories.color,
            colorMarker: inventoryCategories.colorMarker,
            slug: inventoryCategories.slug,
            fullPath: inventoryCategories.fullPath,
            prefix: inventoryCategories.prefix,
            parentId: inventoryCategories.parentId,
            sortOrder: inventoryCategories.sortOrder,
            isActive: inventoryCategories.isActive,
            isSystem: inventoryCategories.isSystem,
            defaultUnit: inventoryCategories.defaultUnit,
            gender: inventoryCategories.gender,
            singularName: inventoryCategories.singularName,
            pluralName: inventoryCategories.pluralName,
            showInSku: inventoryCategories.showInSku,
            showInName: inventoryCategories.showInName,
            level: inventoryCategories.level,
            updatedAt: inventoryCategories.updatedAt,
            createdAt: inventoryCategories.createdAt,
            itemCount: sql<number>`count(${inventoryItems.id})::int`,
            totalQuantity: sql<number>`coalesce(sum(${inventoryItems.quantity}), 0)::int`,
            totalCost: sql<number>`coalesce(sum(${inventoryItems.quantity} * ${inventoryItems.costPrice}), 0)::numeric`
        })
            .from(inventoryCategories)
            .leftJoin(inventoryItems, and(
                eq(inventoryItems.categoryId, inventoryCategories.id),
                eq(inventoryItems.isArchived, false)
            ))
            .groupBy(inventoryCategories.id)
            .orderBy(asc(inventoryCategories.sortOrder), asc(inventoryCategories.name))
            .limit(1000);

        return ok(categories as CategoryWithStats[]);
    }, { errorPath: "getInventoryCategories" });
}

/**
 * Get count of items without category
 */
export async function getOrphanedItemStats(): Promise<ActionResult<{ count: number, totalCost: number }>> {
    return withAuth(async () => {
        const result = await db.select({
            count: sql<number>`count(*)`,
            totalCost: sql<number>`coalesce(sum(${inventoryItems.quantity} * ${inventoryItems.costPrice}), 0)::numeric`
        })
            .from(inventoryItems)
            .where(and(
                isNull(inventoryItems.categoryId),
                eq(inventoryItems.isArchived, false)
            ))
            .limit(1);
        
        return ok({
            count: Number(result[0]?.count || 0),
            totalCost: Number(result[0]?.totalCost || 0)
        });
    }, { errorPath: "getOrphanedItemStats" });
}

/**
 * Add new inventory category
 */
export async function addInventoryCategory(formData: FormData): Promise<ActionResult<InventoryCategory>> {
    return withAuth(async () => {
        const validatedFields = InventoryCategorySchema.safeParse({
            name: formData.get("name"),
            parentId: formData.get("parentId"),
            description: formData.get("description"),
            icon: formData.get("icon"),
            color: formData.get("color"),
            gender: formData.get("gender"),
            prefix: formData.get("prefix"),
        });

        if (!validatedFields.success) {
            return ERRORS.VALIDATION(validatedFields.error.issues[0].message);
        }

        const { name, parentId, description, icon, color, gender, prefix } = validatedFields.data;

        const finalPrefix = prefix || generateCategoryPrefix(name);

        const [category] = await db.insert(inventoryCategories).values({
            name,
            description: description || null,
            parentId: parentId || null,
            icon: icon || "box",
            color: color || "primary",
            prefix: finalPrefix,
            gender: gender || "masculine"
        }).returning();

        const fullPath = await getCategoryFullPath(category.id);
        await db.update(inventoryCategories).set({ fullPath }).where(eq(inventoryCategories.id, category.id));

        await logAction("Создана категория", "inventory_category", category.id, { name: category.name });
        invalidateCache("warehouse:categories");
        revalidatePath("/dashboard/warehouse");

        return ok(category);
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "addInventoryCategory" 
    });
}

/**
 * Update inventory category
 */
export async function updateInventoryCategory(id: string, formData: FormData): Promise<ActionResult<InventoryCategory>> {
    return withAuth(async () => {
        const validatedFields = InventoryCategorySchema.safeParse({
            name: formData.get("name"),
            parentId: formData.get("parentId"),
            description: formData.get("description"),
            icon: formData.get("icon"),
            color: formData.get("color"),
            gender: formData.get("gender"),
            prefix: formData.get("prefix"),
        });

        if (!validatedFields.success) {
            return ERRORS.VALIDATION(validatedFields.error.issues[0].message);
        }

        const { name, parentId, description, icon, color, gender, prefix } = validatedFields.data;

        if (parentId && await isDescendant(parentId, id)) {
            return ERRORS.VALIDATION("Нельзя переместить категорию в своего потомка");
        }

        const [category] = await db.update(inventoryCategories)
            .set({
                name,
                description: description || null,
                parentId: parentId || null,
                icon,
                color,
                gender: gender || "masculine",
                prefix,
                updatedAt: new Date()
            })
            .where(eq(inventoryCategories.id, id))
            .returning();

        if (!category) return ERRORS.NOT_FOUND("Категория");

        const fullPath = await getCategoryFullPath(id);
        await db.update(inventoryCategories).set({ fullPath }).where(eq(inventoryCategories.id, id));

        await updateChildrenPaths(id);

        await logAction("Обновлена категория", "inventory_category", id, { name });
        invalidateCache("warehouse:categories");
        revalidatePath("/dashboard/warehouse");

        return ok(category);
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "updateInventoryCategory"
    });
}

/**
 * Delete inventory category
 */
export async function deleteInventoryCategory(id: string): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return ERRORS.VALIDATION("Некорректный ID категории");
    }

    return withAuth(async () => {
        // Check if has items
        const itemsCount = await db.select({ count: sql`count(*)` }).from(inventoryItems).where(eq(inventoryItems.categoryId, id)).limit(1);
        if (Number(itemsCount[0].count) > 0) {
            return ERRORS.VALIDATION("Нельзя удалить категорию, в которой есть товары");
        }

        // Check if has children
        const childrenCount = await db.select({ count: sql`count(*)` }).from(inventoryCategories).where(eq(inventoryCategories.parentId, id)).limit(1);
        if (Number(childrenCount[0].count) > 0) {
            return ERRORS.VALIDATION("Нельзя удалить категорию, у которой есть подкатегории");
        }

        await db.delete(inventoryCategories).where(eq(inventoryCategories.id, id));
        await logAction("Удалена категория", "inventory_category", id);

        invalidateCache("warehouse:categories");
        revalidatePath("/dashboard/warehouse");

        return okVoid();
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "deleteInventoryCategory"
    });
}

/**
 * Update order of inventory categories
 */
export async function updateInventoryCategoriesOrder(items: { id: string; sortOrder: number }[]): Promise<ActionResult> {
    const validation = z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int()
    })).safeParse(items);

    if (!validation.success) {
        return ERRORS.VALIDATION("Неверный формат данных");
    }

    return withAuth(async () => {
        await db.transaction(async (tx) => {
            for (const item of validation.data) {
                await tx.update(inventoryCategories)
                    .set({ sortOrder: item.sortOrder })
                    .where(eq(inventoryCategories.id, item.id));
            }
        });

        invalidateCache("warehouse:categories");
        revalidatePath("/dashboard/warehouse");
        return okVoid();
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "updateInventoryCategoriesOrder"
    });
}
