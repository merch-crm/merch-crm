"use server";

import { db } from "@/lib/db";
import { orderDesignTasks, printDesigns, printCollections, applicationTypes } from "@/lib/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek } from "date-fns";
import { z } from "zod";

export interface DesignStats {
    inQueue: number;
    inProgress: number;
    inReview: number;
    completedToday: number;
    completedWeek: number;
    overdue: number;
    avgCompletionTime: number; // в минутах
    totalDesigns: number;
    totalCollections: number;
}

export interface DesignTask {
    id: string;
    taskNumber: string;
    title: string;
    status: string;
    priority: number | null;
    assigneeId: string | null;
    assigneeName?: string;
    dueDate: string | null;
    createdAt: string;
    orderNumber?: string;
}

export interface PopularDesign {
    id: string;
    name: string;
    previewPath: string | null;
    usageCount: number;
    collectionName: string;
}

export interface ApplicationTypeStats {
    id: string;
    name: string;
    color: string | null;
    tasksCount: number;
    percentage: number;
}

export async function getDesignStats(): Promise<{
    success: boolean;
    data?: DesignStats;
    error?: string;
}> {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });

        // Queue stats
        const [inQueueResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(eq(orderDesignTasks.status, "pending"));

        const [inProgressResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(eq(orderDesignTasks.status, "in_progress"));

        const [inReviewResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(eq(orderDesignTasks.status, "review"));

        // Completed today
        const [completedTodayResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(
                and(
                    eq(orderDesignTasks.status, "approved"),
                    gte(orderDesignTasks.completedAt, todayStart),
                    lte(orderDesignTasks.completedAt, todayEnd)
                )
            );

        // Completed this week
        const [completedWeekResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(
                and(
                    eq(orderDesignTasks.status, "approved"),
                    gte(orderDesignTasks.completedAt, weekStart)
                )
            );

        // Overdue
        const [overdueResult] = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(
                and(
                    lte(orderDesignTasks.dueDate, now),
                    sql`${orderDesignTasks.status} NOT IN ('approved', 'not_required')`
                )
            );

        // Average completion time (last 100 approved tasks)
        const [avgTimeResult] = await db
            .select({
                avgMinutes: sql<number>`AVG(EXTRACT(EPOCH FROM (${orderDesignTasks.completedAt} - ${orderDesignTasks.createdAt})) / 60)::int`
            })
            .from(orderDesignTasks)
            .where(
                and(
                    eq(orderDesignTasks.status, "approved"),
                    sql`${orderDesignTasks.completedAt} IS NOT NULL`
                )
            );

        // Total designs and collections
        const [totalDesignsResult] = await db
            .select({ count: count() })
            .from(printDesigns);

        const [totalCollectionsResult] = await db
            .select({ count: count() })
            .from(printCollections);

        return {
            success: true,
            data: {
                inQueue: inQueueResult?.count || 0,
                inProgress: inProgressResult?.count || 0,
                inReview: inReviewResult?.count || 0,
                completedToday: completedTodayResult?.count || 0,
                completedWeek: completedWeekResult?.count || 0,
                overdue: overdueResult?.count || 0,
                avgCompletionTime: avgTimeResult?.avgMinutes || 0,
                totalDesigns: totalDesignsResult?.count || 0,
                totalCollections: totalCollectionsResult?.count || 0,
            },
        };
    } catch (error) {
        console.error("Error getting design stats:", error);
        return { success: false, error: "Не удалось получить статистику" };
    }
}

export async function getMyDesignTasks(userId?: string): Promise<{
    success: boolean;
    data?: DesignTask[];
    error?: string;
}> {
    try {
        const validated = z.string().uuid().optional().safeParse(userId);
        if (!validated.success) return { success: false, error: "Invalid user ID" };
        const cleanUserId = validated.data;

        const whereClause = cleanUserId
            ? and(
                eq(orderDesignTasks.assigneeId, cleanUserId),
                sql`${orderDesignTasks.status} NOT IN ('approved', 'not_required')`
            )
            : sql`${orderDesignTasks.status} NOT IN ('approved', 'not_required')`;

        const result = await db
            .select({
                id: orderDesignTasks.id,
                taskNumber: orderDesignTasks.number,
                title: orderDesignTasks.title,
                status: orderDesignTasks.status,
                priority: orderDesignTasks.priority,
                assigneeId: orderDesignTasks.assigneeId,
                dueDate: orderDesignTasks.dueDate,
                createdAt: orderDesignTasks.createdAt,
            })
            .from(orderDesignTasks)
            .where(whereClause)
            .orderBy(desc(orderDesignTasks.createdAt))
            .limit(10);

        const data = result.map((task) => ({
            id: task.id,
            taskNumber: task.taskNumber,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate?.toISOString() || null,
            createdAt: task.createdAt.toISOString(),
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting my design tasks:", error);
        return { success: false, error: "Не удалось получить задачи" };
    }
}

export async function getUrgentDesignTasks(): Promise<{
    success: boolean;
    data?: DesignTask[];
    error?: string;
}> {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const result = await db
            .select({
                id: orderDesignTasks.id,
                taskNumber: orderDesignTasks.number,
                title: orderDesignTasks.title,
                status: orderDesignTasks.status,
                priority: orderDesignTasks.priority,
                assigneeId: orderDesignTasks.assigneeId,
                dueDate: orderDesignTasks.dueDate,
                createdAt: orderDesignTasks.createdAt,
            })
            .from(orderDesignTasks)
            .where(
                and(
                    lte(orderDesignTasks.dueDate, tomorrow),
                    sql`${orderDesignTasks.status} NOT IN ('approved', 'not_required')`
                )
            )
            .orderBy(orderDesignTasks.dueDate)
            .limit(5);

        const data = result.map((task) => ({
            id: task.id,
            taskNumber: task.taskNumber,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate?.toISOString() || null,
            createdAt: task.createdAt.toISOString(),
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting urgent design tasks:", error);
        return { success: false, error: "Не удалось получить срочные задачи" };
    }
}

export async function getRecentCompletedTasks(): Promise<{
    success: boolean;
    data?: DesignTask[];
    error?: string;
}> {
    try {
        const result = await db
            .select({
                id: orderDesignTasks.id,
                taskNumber: orderDesignTasks.number,
                title: orderDesignTasks.title,
                status: orderDesignTasks.status,
                priority: orderDesignTasks.priority,
                assigneeId: orderDesignTasks.assigneeId,
                dueDate: orderDesignTasks.dueDate,
                createdAt: orderDesignTasks.createdAt,
            })
            .from(orderDesignTasks)
            .where(eq(orderDesignTasks.status, "approved"))
            .orderBy(desc(orderDesignTasks.completedAt))
            .limit(5);

        const data = result.map((task) => ({
            id: task.id,
            taskNumber: task.taskNumber,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate?.toISOString() || null,
            createdAt: task.createdAt.toISOString(),
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting recent completed tasks:", error);
        return { success: false, error: "Не удалось получить завершённые задачи" };
    }
}

export async function getPopularDesigns(): Promise<{
    success: boolean;
    data?: PopularDesign[];
    error?: string;
}> {
    try {
        // For now, return latest designs (TODO: add usage tracking)
        const result = await db
            .select({
                id: printDesigns.id,
                name: printDesigns.name,
                previewPath: printDesigns.preview,
                collectionId: printDesigns.collectionId,
            })
            .from(printDesigns)
            .where(eq(printDesigns.isActive, true))
            .orderBy(desc(printDesigns.createdAt))
            .limit(6);

        const data = await Promise.all(
            result.map(async (design) => {
                const [collection] = await db
                    .select({ name: printCollections.name })
                    .from(printCollections)
                    .where(eq(printCollections.id, design.collectionId));

                const [usageResult] = await db
                    .select({ count: count() })
                    .from(orderDesignTasks)
                    .where(eq(orderDesignTasks.sourceDesignId, design.id));

                return {
                    id: design.id,
                    name: design.name,
                    previewPath: design.previewPath,
                    usageCount: usageResult?.count || 0,
                    collectionName: collection?.name || "Без коллекции",
                };
            })
        );

        return { success: true, data };
    } catch (error) {
        console.error("Error getting popular designs:", error);
        return { success: false, error: "Не удалось получить популярные дизайны" };
    }
}

export async function getApplicationTypesStats(): Promise<{
    success: boolean;
    data?: ApplicationTypeStats[];
    error?: string;
}> {
    try {
        const result = await db
            .select({
                id: applicationTypes.id,
                name: applicationTypes.name,
                color: applicationTypes.color,
            })
            .from(applicationTypes)
            .where(eq(applicationTypes.isActive, true));

        // Get tasks count per type
        const data = await Promise.all(
            (result ?? []).map(async (type) => {
                const [countResult] = await db
                    .select({ count: count() })
                    .from(orderDesignTasks)
                    .where(eq(orderDesignTasks.applicationTypeId, type.id));

                return {
                    id: type.id,
                    name: type.name,
                    color: type.color,
                    tasksCount: countResult?.count || 0,
                    percentage: 0, // Will calculate after
                };
            })
        );

        const total = data.reduce((acc, item) => acc + item.tasksCount, 0);
        const dataWithPercentage = (data || []).map((item) => ({
            ...item,
            percentage: total > 0 ? Math.round((item.tasksCount / total) * 100) : 0,
        }));

        return { success: true, data: dataWithPercentage };
    } catch (error) {
        console.error("Error getting application types stats:", error);
        return { success: false, error: "Не удалось получить статистику по типам" };
    }
}
