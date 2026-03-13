"use server";

import { db } from "@/lib/db";
import { productionTasks } from "@/lib/schema/production";
import { and, gte, lte, sql, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const StatsOptionsSchema = z.object({
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
}).optional();

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

export interface ProductionTaskStats {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byLine: Record<string, number>;
    totalQuantity: number;
    completedQuantity: number;
    overdueCount: number;
    averageCompletionTime: number;
}

// Статистика производства задач
export async function getTaskProductionStats(options?: z.infer<typeof StatsOptionsSchema>): Promise<ActionResult<ProductionTaskStats>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = StatsOptionsSchema.safeParse(options);
        const criteria = validated.success ? validated.data : {};

        const conditions = [];

        if (criteria?.dateFrom) {
            conditions.push(gte(productionTasks.createdAt, criteria.dateFrom));
        }
        if (criteria?.dateTo) {
            conditions.push(lte(productionTasks.createdAt, criteria.dateTo));
        }

        const tasks = await db
            .select()
            .from(productionTasks)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const stats: ProductionTaskStats = {
            total: tasks.length,
            byStatus: {},
            byPriority: {},
            byLine: {},
            totalQuantity: 0,
            completedQuantity: 0,
            overdueCount: 0,
            averageCompletionTime: 0,
        };

        let totalCompletionTime = 0;
        let completedWithTime = 0;
        const now = new Date();

        for (const task of tasks) {
            stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
            stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;

            if (task.lineId) {
                stats.byLine[task.lineId] = (stats.byLine[task.lineId] || 0) + 1;
            }

            stats.totalQuantity += task.quantity;
            stats.completedQuantity += task.completedQuantity || 0;

            if (task.dueDate && new Date(task.dueDate) < now && task.status !== "completed") {
                stats.overdueCount++;
            }

            if (task.actualTime) {
                totalCompletionTime += task.actualTime;
                completedWithTime++;
            }
        }

        if (completedWithTime > 0) {
            stats.averageCompletionTime = Math.round(totalCompletionTime / completedWithTime);
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

// Получить количество заказов по типам нанесения
export async function getProductionOrdersCounts(): Promise<ActionResult<Record<string, number>>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const result = await db
            .select({
                applicationTypeId: productionTasks.applicationTypeId,
                count: count(),
            })
            .from(productionTasks)
            .where(sql`${productionTasks.status} != 'completed'`)
            .groupBy(productionTasks.applicationTypeId);

        const counts: Record<string, number> = {};
        result.forEach((row) => {
            if (row.applicationTypeId) {
                counts[row.applicationTypeId] = Number(row.count);
            }
        });

        return { success: true, data: counts };
    } catch (error) {
        console.error("Error fetching order counts:", error);
        return { success: false, error: "Не удалось загрузить счётчики" };
    }
}
