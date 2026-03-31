"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import {
    productionTasks,
    productionLines,
    productionStaff,
} from "@/lib/schema";
import { eq, and, gte, lte, sql, count, sum } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek } from "date-fns";
import { getSession } from "@/lib/session";
import { ProductionStats } from "../types";

const ProductionStatsSchema = z.object({
    inQueue: z.number(),
    inProgress: z.number(),
    completedToday: z.number(),
    completedWeek: z.number(),
    overdue: z.number(),
    paused: z.number(),
    totalQuantityToday: z.number(),
    activeStaff: z.number(),
    totalStaff: z.number(),
    activeLines: z.number(),
    totalLines: z.number(),
});

export async function getProductionStats(): Promise<{
    success: boolean;
    data?: ProductionStats;
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });

        const [inQueueResult] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(eq(productionTasks.status, "pending"));

        const [inProgressResult] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(eq(productionTasks.status, "in_progress"));

        const [pausedResult] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(eq(productionTasks.status, "paused"));

        const [completedTodayResult] = await db
            .select({ count: count(), quantity: sum(productionTasks.completedQuantity) })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, todayStart),
                    lte(productionTasks.completedAt, todayEnd)
                )
            );

        const [completedWeekResult] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, weekStart)
                )
            );

        const [overdueResult] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(
                and(
                    lte(productionTasks.dueDate, now),
                    sql`${productionTasks.status} NOT IN ('completed', 'cancelled')`
                )
            );

        const [activeStaffResult] = await db
            .select({ count: count() })
            .from(productionStaff)
            .where(eq(productionStaff.isActive, true));

        const [totalStaffResult] = await db
            .select({ count: count() })
            .from(productionStaff);

        const [activeLinesResult] = await db
            .select({ count: count() })
            .from(productionLines)
            .where(eq(productionLines.isActive, true));

        const [totalLinesResult] = await db
            .select({ count: count() })
            .from(productionLines);

        return {
            success: true,
            data: ProductionStatsSchema.parse({
                inQueue: inQueueResult?.count || 0,
                inProgress: inProgressResult?.count || 0,
                paused: pausedResult?.count || 0,
                completedToday: completedTodayResult?.count || 0,
                completedWeek: completedWeekResult?.count || 0,
                overdue: overdueResult?.count || 0,
                totalQuantityToday: Number(completedTodayResult?.quantity || 0),
                activeStaff: activeStaffResult?.count || 0,
                totalStaff: totalStaffResult?.count || 0,
                activeLines: activeLinesResult?.count || 0,
                totalLines: totalLinesResult?.count || 0,
            }),
        };
    } catch (error) {
        console.error("Error getting production stats:", error);
        return { success: false, error: "Не удалось получить статистику" };
    }
}
