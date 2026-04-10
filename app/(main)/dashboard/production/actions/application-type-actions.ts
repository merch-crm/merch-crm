"use server";

import { okVoid } from "@/lib/types";

import { db } from "@/lib/db";
import { applicationTypes, productionLogs } from "@/lib/schema/production";
import { printDesigns } from "@/lib/schema/designs";
import { eq, asc, ilike, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { z } from "zod";

// Схема валидации
const ApplicationTypeSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(255),
  slug: z.string().min(1, "Slug обязателен").max(255).regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: z.string().optional().nullable(),
  category: z.enum(["print", "embroidery", "engraving", "transfer", "other"]),
  icon: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}/, "Некорректный HEX цвет").optional().nullable(),
  minQuantity: z.number().int().min(1).optional(),
  maxColors: z.number().int().min(1).optional().nullable(),
  maxPrintArea: z.string().optional().nullable(),
  baseCost: z.number().int().min(0).optional(),
  costPerUnit: z.number().int().min(0).optional(),
  setupCost: z.number().int().min(0).optional(),
  estimatedTime: z.number().int().min(0).optional().nullable(),
  setupTime: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Получить все типы нанесения
export async function getApplicationTypes(options?: {
  search?: string;
  category?: string;
  activeOnly?: boolean;
}): Promise<ActionResult<ApplicationType[]>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const conditions = [];

    if (options?.search) {
      conditions.push(ilike(applicationTypes.name, `%${options.search}%`));
    }

    if (options?.category) {
      conditions.push(eq(applicationTypes.category, options.category as typeof applicationTypes.$inferSelect.category));
    }

    if (options?.activeOnly) {
      conditions.push(eq(applicationTypes.isActive, true));
    }

    const query = db
      .select()
      .from(applicationTypes);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query
      .orderBy(asc(applicationTypes.sortOrder), asc(applicationTypes.name));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching application types:", error);
    return { success: false, error: "Не удалось загрузить типы нанесения" };
  }
}

// Получить тип по ID
export async function getApplicationTypeById(id: string): Promise<ActionResult<ApplicationType>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const result = await db.query.applicationTypes.findFirst({
      where: eq(applicationTypes.id, id),
    });

    if (!result) {
      return { success: false, error: "Тип нанесения не найден" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching application type:", error);
    return { success: false, error: "Не удалось загрузить тип нанесения" };
  }
}

// Получить тип по slug
export async function getApplicationTypeBySlug(slug: string): Promise<ActionResult<ApplicationType>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const result = await db.query.applicationTypes.findFirst({
      where: eq(applicationTypes.slug, slug),
    });

    if (!result) {
      return { success: false, error: "Тип нанесения не найден" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching application type by slug:", error);
    return { success: false, error: "Не удалось загрузить тип нанесения" };
  }
}

// Создать тип нанесения
export async function createApplicationType(
  data: z.infer<typeof ApplicationTypeSchema>
): Promise<ActionResult<ApplicationType>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Необходима авторизация" };
    }

    const validated = ApplicationTypeSchema.parse(data);

    // Проверяем уникальность slug
    const existing = await db.query.applicationTypes.findFirst({
      where: eq(applicationTypes.slug, validated.slug),
    });

    if (existing) {
      return { success: false, error: "Тип с таким slug уже существует" };
    }

    const [result] = await db
      .insert(applicationTypes)
      .values(validated)
      .returning();

    revalidatePath("/dashboard/production/application-types");
    revalidatePath("/dashboard/design/prints");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error creating application type:", error);
    return { success: false, error: "Не удалось создать тип нанесения" };
  }
}

// Обновить тип нанесения
export async function updateApplicationType(
  id: string,
  data: Partial<z.infer<typeof ApplicationTypeSchema>>
): Promise<ActionResult<ApplicationType>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Необходима авторизация" };
    }

    // Проверяем существование
    const existing = await db.query.applicationTypes.findFirst({
      where: eq(applicationTypes.id, id),
    });

    if (!existing) {
      return { success: false, error: "Тип нанесения не найден" };
    }

    // Если меняется slug, проверяем уникальность
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await db.query.applicationTypes.findFirst({
        where: eq(applicationTypes.slug, data.slug),
      });

      if (slugExists) {
        return { success: false, error: "Тип с таким slug уже существует" };
      }
    }

    const [result] = await db
      .update(applicationTypes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(applicationTypes.id, id))
      .returning();

    revalidatePath("/dashboard/production/application-types");
    revalidatePath("/dashboard/design/prints");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating application type:", error);
    return { success: false, error: "Не удалось обновить тип нанесения" };
  }
}

// Удалить тип нанесения
export async function deleteApplicationType(id: string): Promise<ActionResult> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Необходима авторизация" };
    }

    // RBAC: Только Администратор или Руководство могут удалять
    if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
      return { success: false, error: "Недостаточно прав для удаления" };
    }

    // Проверяем использование в дизайнах
    const designsCount = await db
      .select({ count: count() })
      .from(printDesigns)
      .where(eq(printDesigns.applicationTypeId, id));

    if (designsCount[0].count > 0) {
      return {
        success: false,
        error: `Невозможно удалить: тип используется в ${designsCount[0].count} дизайнах`
      };
    }

    await db.delete(applicationTypes).where(eq(applicationTypes.id, id));

    // Логируем критическое действие
    await logAction("Удален тип нанесения", "application_type", id, {      details: { applicationTypeId: id },
    } as typeof productionLogs.$inferInsert);

    revalidatePath("/dashboard/production/application-types");

    return okVoid();
  } catch (error) {
    console.error("Error deleting application type:", error);
    return { success: false, error: "Не удалось удалить тип нанесения" };
  }
}

// Обновить порядок сортировки
export async function updateApplicationTypesOrder(
  items: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Необходима авторизация" };
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(applicationTypes)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(applicationTypes.id, item.id));
      }
    });

    revalidatePath("/dashboard/production/application-types");

    return okVoid();
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Не удалось обновить порядок" };
  }
}

// Получить статистику
export async function getApplicationTypesStats(): Promise<ActionResult<{
  total: number;
  active: number;
  byCategory: Record<string, number>;
}>> {
  try {
    const session = await getSession(); // requireAdmin
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const statusCounts = await db
      .select({
        isActive: applicationTypes.isActive,
        count: count(),
      })
      .from(applicationTypes)
      .groupBy(applicationTypes.isActive);

    const categoryCounts = await db
      .select({
        category: applicationTypes.category,
        count: count(),
      })
      .from(applicationTypes)
      .groupBy(applicationTypes.category);

    const stats = {
      total: statusCounts.reduce((acc, curr) => acc + Number(curr.count), 0),
      active: Number(statusCounts.find(c => c.isActive === true)?.count || 0),
      byCategory: categoryCounts.reduce((acc, curr) => {
        acc[curr.category] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Не удалось загрузить статистику" };
  }
}

// Типы
export type ApplicationType = typeof applicationTypes.$inferSelect;
