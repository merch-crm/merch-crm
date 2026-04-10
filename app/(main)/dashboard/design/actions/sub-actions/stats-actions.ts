"use server";

import { db } from "@/lib/db";
import {
  orderDesignTasks
} from "@/lib/schema/design-tasks";
import { eq, and, inArray, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { ActionResult, DesignQueueStats } from "../types";
import { GetStatsSchema } from "../schemas";

export async function getDesignQueueStats(): Promise<ActionResult<DesignQueueStats>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Необходима авторизация" };
    }

    GetStatsSchema.parse({});

    // Получаем общее количество и по статусам
    const statusCounts = await db
      .select({
        status: orderDesignTasks.status,
        count: count(),
      })
      .from(orderDesignTasks)
      .groupBy(orderDesignTasks.status);

    // Получаем просроченные
    const overdueCount = await db
      .select({ count: count() })
      .from(orderDesignTasks)
      .where(and(
        sql`${orderDesignTasks.dueDate} < ${new Date()}`,
        inArray(orderDesignTasks.status, ["pending", "in_progress", "review", "revision"])
      ));

    // Мои задачи
    const myTasksCount = await db
      .select({ count: count() })
      .from(orderDesignTasks)
      .where(eq(orderDesignTasks.assigneeId, session.id));

    // Выполнено сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedTodayCount = await db
      .select({ count: count() })
      .from(orderDesignTasks)
      .where(and(
        eq(orderDesignTasks.status, "approved"),
        sql`${orderDesignTasks.completedAt} >= ${today}`
      ));

    const stats: DesignQueueStats = {
      total: (statusCounts || []).reduce((acc, curr) => acc + Number(curr.count), 0),
      byStatus: (statusCounts || []).reduce((acc, curr) => {
        acc[curr.status!] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
      pending: Number(statusCounts.find(c => c.status === "pending")?.count || 0),
      inProgress: Number(statusCounts.find(c => c.status === "in_progress")?.count || 0),
      review: Number(statusCounts.find(c => c.status === "review")?.count || 0),
      overdue: Number(overdueCount[0]?.count || 0),
      completedToday: Number(completedTodayCount[0]?.count || 0),
      myTasks: Number(myTasksCount[0]?.count || 0),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Не удалось загрузить статистику" };
  }
}
