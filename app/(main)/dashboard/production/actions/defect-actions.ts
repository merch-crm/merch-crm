// app/(main)/dashboard/production/actions/defect-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { productionTasks } from "@/lib/schema/production";
import { getSession } from "@/lib/session";
import { 
  DEFECT_CATEGORIES 
} from "../types/bento-dashboard-types";
import { logAction } from "@/lib/audit";
import { z } from "zod";

/** Схема валидации сохранения брака */
const saveDefectSchema = z.object({
  taskId: z.string().uuid(),
  defectQuantity: z.number().min(1),
  category: z.enum(['print', 'material', 'application', 'other'] as const),
  comment: z.string().optional(),
});

/** Сохранить информацию о браке для задачи */
export async function saveTaskDefect(
  values: z.infer<typeof saveDefectSchema>
) {
  try {
    const session = await getSession();
    if (!session?.betterAuthUser) {
      return { success: false, error: "Недостаточно прав" };
    }

    const validatedFields = saveDefectSchema.safeParse(values);
    if (!validatedFields.success) {
      return { success: false, error: "Некорректные данные" };
    }

    const { taskId, defectQuantity, category, comment } = validatedFields.data;

    // Обновляем задачу
    await db.update(productionTasks)
      .set({
        defectQuantity: sql`${productionTasks.defectQuantity} + ${defectQuantity}`,
        defectCategory: category,
        defectComment: comment || null,
        updatedAt: new Date(),
      })
      .where(eq(productionTasks.id, taskId));

    await logAction("Зарегистрирован брак", "production_task", taskId, {
        defectQuantity,
        category,
        comment
    });

    revalidatePath("/dashboard/production");
    return { success: true };
  } catch (error) {
    console.error("Error saving defect:", error);
    return { success: false, error: "Ошибка при сохранении брака" };
  }
}

/** Получить статистику по категориям брака (реальные данные) */
export async function getDefectsByCategory(
  period: 'day' | 'week' | 'month' = 'week'
) {
  try {
    const session = await getSession();
    if (!session?.betterAuthUser) {
      return { success: false, error: "Недостаточно прав" };
    }

    let dateFilter = sql`TRUE`;
    if (period === 'day') {
      dateFilter = sql`created_at >= NOW() - INTERVAL '1 day'`;
    } else if (period === 'week') {
      dateFilter = sql`created_at >= NOW() - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = sql`created_at >= NOW() - INTERVAL '30 days'`;
    }

    // Группируем по категории
    const stats = await db
      .select({
        category: productionTasks.defectCategory,
        count: sql<number>`SUM(defect_quantity)`,
      })
      .from(productionTasks)
      .where(sql`defect_quantity > 0 AND ${dateFilter}`)
      .groupBy(productionTasks.defectCategory);

    const total = stats.reduce((acc, s) => acc + Number(s.count), 0);

    const formattedStats = DEFECT_CATEGORIES.map((cat) => {
      const match = stats.find(s => s.category === cat.id);
      const count = match ? Number(match.count) : 0;
      return {
        category: cat.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: cat.color,
      };
    }).sort((a, b) => b.count - a.count);

    return { success: true, data: formattedStats, total };
  } catch (error) {
    console.error("Error fetching defect stats:", error);
    return { success: false, error: "Ошибка при получении статистики брака" };
  }
}
