"use server";

import { okVoid } from "@/lib/types";

import { revalidatePath } from "next/cache";
import { eq, sql, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import { productLines } from "@/lib/schema/product-lines";
import { inventoryCategories } from "@/lib/schema/warehouse/categories";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { printCollections } from "@/lib/schema/designs";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { z } from "zod";

const ProductLineSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(200, "Максимум 200 символов"),
  type: z.enum(["base", "finished"]),
  categoryId: z.string().uuid("Некорректный ID категории"),
  printCollectionId: z.string().uuid("Некорректный ID коллекции").optional().nullable(),
  commonAttributes: z.record(z.string(), z.string()).optional(),
  description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  image: z.string().url({ message: "Некорректный URL" }).optional().nullable(),
});

type ProductLine = InferSelectModel<typeof productLines>;

/**
 * Создать линейку
 */
export async function createProductLine(data: {
  name: string;
  type: "base" | "finished";
  categoryId: string;
  printCollectionId?: string | null;
  commonAttributes?: Record<string, unknown>;
  description?: string | null;
  image?: string | null;
}): Promise<{ success: boolean; data?: ProductLine; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  const validated = ProductLineSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  if (validated.data.type === "finished" && !validated.data.printCollectionId) {
    return { success: false, error: "Для готовой линейки необходимо указать коллекцию дизайнов" };
  }

  try {
    const [category] = await db
      .select({ id: inventoryCategories.id })
      .from(inventoryCategories)
      .where(eq(inventoryCategories.id, validated.data.categoryId))
      .limit(1);

    if (!category) {
      return { success: false, error: "Категория не найдена" };
    }

    if (validated.data.printCollectionId) {
      const [collection] = await db
        .select({ id: printCollections.id })
        .from(printCollections)
        .where(eq(printCollections.id, validated.data.printCollectionId))
        .limit(1);

      if (!collection) {
        return { success: false, error: "Коллекция дизайнов не найдена" };
      }
    }

    const slug = validated.data.name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, "-")
      .replace(/^-|-$/g, "");

    const [line] = await db
      .insert(productLines)
      .values({
        id: crypto.randomUUID(),
        name: validated.data.name,
        slug,
        type: validated.data.type,
        categoryId: validated.data.categoryId,
        printCollectionId: validated.data.printCollectionId || null,
        commonAttributes: validated.data.commonAttributes || {},
        description: validated.data.description || null,
        image: validated.data.image || null,
        createdBy: session.id,
        isActive: true,
        sortOrder: 0,
      })
      .returning();

    await logAction("Создана линейка продуктов", "product_line", line.id, {
      name: line.name,
      type: line.type,
    });

    invalidateCache("warehouse:lines");
    revalidatePath("/dashboard/warehouse");

    return { success: true, data: line };
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/warehouse/lines/line-mutation-actions",
      method: "createProductLine",
    });
    return { success: false, error: "Не удалось создать линейку" };
  }
}

/**
 * Обновить линейку
 */
export async function updateProductLine(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    image?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<{ success: boolean; data?: ProductLine; error?: string }> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: "Некорректный ID линейки" };
  }

  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  try {
    const updateData: Partial<ProductLine> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, "-")
        .replace(/^-|-$/g, "");
    }

    const [line] = await db
      .update(productLines)
      .set(updateData)
      .where(eq(productLines.id, id))
      .returning();

    if (!line) {
      return { success: false, error: "Линейка не найдена" };
    }

    await logAction("Обновлена линейка продуктов", "product_line", id, {
      name: line.name
    });

    invalidateCache("warehouse:lines");
    revalidatePath("/dashboard/warehouse");
    revalidatePath(`/dashboard/warehouse/lines/${id}`);

    return { success: true, data: line };
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/warehouse/lines/line-mutation-actions",
      method: "updateProductLine",
      details: { id },
    });
    return { success: false, error: "Не удалось обновить линейку" };
  }
}

/**
 * Удалить линейку
 */
export async function deleteProductLine(id: string): Promise<{ success: boolean; error?: string }> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: "Некорректный ID линейки" };
  }

  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  try {
    const [line] = await db
      .select({ createdBy: productLines.createdBy })
      .from(productLines)
      .where(eq(productLines.id, id))
      .limit(1);

    if (!line) {
      return { success: false, error: "Линейка не найдена" };
    }

    const isAdmin = session.roleSlug === "admin" || session.roleSlug === "management";
    if (!isAdmin && line.createdBy !== session.id) {
      return { success: false, error: "Недостаточно прав для удаления" }
    }

    const [itemsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryItems)
      .where(eq(inventoryItems.productLineId, id));

    if (itemsCount.count > 0) {
      return {
        success: false,
        error: `Нельзя удалить линейку: в ней ${itemsCount.count} позиций. Сначала удалите или переместите позиции.`
      };
    }

    await db.delete(productLines).where(eq(productLines.id, id));

    await logAction("Удалена линейка продуктов", "product_line", id);

    invalidateCache("warehouse:lines");
    revalidatePath("/dashboard/warehouse");

    return okVoid();
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/warehouse/lines/line-mutation-actions",
      method: "deleteProductLine",
      details: { id },
    });
    return { success: false, error: "Не удалось удалить линейку" };
  }
}
