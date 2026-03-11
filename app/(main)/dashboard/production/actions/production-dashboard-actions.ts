"use server";

import { db } from "@/lib/db";
import {
    productionTasks,
    productionLines,
    productionStaff,
    equipment,
} from "@/lib/schema";
import { orderItems, orders } from "@/lib/schema";
import { eq, and, gte, lte, sql, count, sum } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, subDays, format } from "date-fns";
import { z } from "zod";

export interface ProductionStats {
    inQueue: number;
    inProgress: number;
    completedToday: number;
    completedWeek: number;
    overdue: number;
    paused: number;
    totalQuantityToday: number;
    activeStaff: number;
    totalStaff: number;
    activeLines: number;
    totalLines: number;
}

export interface ProductionTaskSummary {
    id: string;
    taskNumber: string;
    title: string;
    status: string;
    priority: string;
    progress: number;
    quantity: number;
    lineId: string | null;
    lineName?: string;
    assigneeId: string | null;
    assigneeName?: string;
    dueDate: string | null;
    createdAt: string;
}

export interface LineLoad {
    id: string;
    name: string;
    code: string;
    color: string | null;
    tasksCount: number;
    totalQuantity: number;
    inProgress: number;
}

export interface EquipmentStatus {
    id: string;
    name: string;
    status: string;
    category: string;
    nextMaintenanceDate: string | null;
    needsMaintenance: boolean;
}

export interface StaffOnShift {
    id: string;
    name: string;
    position: string | null;
    lineId: string | null;
    lineName?: string;
    activeTasks: number;
}

export async function getProductionStats(): Promise<{
    success: boolean;
    data?: ProductionStats;
    error?: string;
}> {
    try {
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
            data: {
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
            },
        };
    } catch (error) {
        console.error("Error getting production stats:", error);
        return { success: false, error: "Не удалось получить статистику" };
    }
}

export async function getTasksByLine(): Promise<{
    success: boolean;
    data?: LineLoad[];
    error?: string;
}> {
    try {
        const lines = await db
            .select({
                id: productionLines.id,
                name: productionLines.name,
                code: productionLines.code,
                color: productionLines.color,
            })
            .from(productionLines)
            .where(eq(productionLines.isActive, true));

        const data = await Promise.all(
            lines.map(async (line) => {
                const [tasksResult] = await db
                    .select({
                        count: count(),
                        quantity: sum(productionTasks.quantity),
                    })
                    .from(productionTasks)
                    .where(
                        and(
                            eq(productionTasks.lineId, line.id),
                            sql`${productionTasks.status} NOT IN ('completed', 'cancelled')`
                        )
                    );

                const [inProgressResult] = await db
                    .select({ count: count() })
                    .from(productionTasks)
                    .where(
                        and(
                            eq(productionTasks.lineId, line.id),
                            eq(productionTasks.status, "in_progress")
                        )
                    );

                return {
                    id: line.id,
                    name: line.name,
                    code: line.code,
                    color: line.color,
                    tasksCount: tasksResult?.count || 0,
                    totalQuantity: Number(tasksResult?.quantity || 0),
                    inProgress: inProgressResult?.count || 0,
                };
            })
        );

        return { success: true, data };
    } catch (error) {
        console.error("Error getting tasks by line:", error);
        return { success: false, error: "Не удалось получить данные" };
    }
}

export async function getUrgentProductionTasks(): Promise<{
    success: boolean;
    data?: ProductionTaskSummary[];
    error?: string;
}> {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const query = db
            .select({
                id: productionTasks.id,
                number: productionTasks.number,
                title: productionTasks.title,
                status: productionTasks.status,
                priority: productionTasks.priority,
                quantity: productionTasks.quantity,
                completedQuantity: productionTasks.completedQuantity,
                lineId: productionTasks.lineId,
                assigneeId: productionTasks.assigneeId,
                dueDate: productionTasks.dueDate,
                createdAt: productionTasks.createdAt,
            })
            .from(productionTasks)
            .where(
                and(
                    lte(productionTasks.dueDate, tomorrow),
                    sql`${productionTasks.status} NOT IN ('completed', 'cancelled')`
                )
            );

        const result = await query.orderBy(productionTasks.dueDate).limit(5);

        const data: ProductionTaskSummary[] = result.map((task) => {
            const qty = task.quantity || 1;
            const done = task.completedQuantity || 0;
            const progress = Math.round((done / qty) * 100);

            return {
                id: task.id,
                taskNumber: task.number,
                title: task.title,
                status: task.status,
                priority: task.priority,
                progress,
                quantity: task.quantity,
                lineId: task.lineId,
                assigneeId: task.assigneeId,
                dueDate: task.dueDate?.toISOString() || null,
                createdAt: task.createdAt.toISOString(),
            };
        });

        return { success: true, data };
    } catch (error) {
        console.error("Error getting urgent production tasks:", error);
        return { success: false, error: "Не удалось получить срочные задачи" };
    }
}

export async function getEquipmentStatus(): Promise<{
    success: boolean;
    data?: EquipmentStatus[];
    error?: string;
}> {
    try {
        const now = new Date();

        const result = await db
            .select({
                id: equipment.id,
                name: equipment.name,
                status: equipment.status,
                category: equipment.category,
                // correct column name is nextMaintenanceAt
                nextMaintenanceAt: equipment.nextMaintenanceAt,
            })
            .from(equipment)
            .where(
                sql`${equipment.status} IN ('maintenance', 'repair') OR ${equipment.nextMaintenanceAt} <= ${now}`
            )
            .limit(5);

        const data: EquipmentStatus[] = result.map((eq) => ({
            id: eq.id,
            name: eq.name,
            status: eq.status,
            category: eq.category,
            nextMaintenanceDate: eq.nextMaintenanceAt?.toISOString() || null,
            needsMaintenance: !!(eq.nextMaintenanceAt && new Date(eq.nextMaintenanceAt) <= now),
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Error getting equipment status:", error);
        return { success: false, error: "Не удалось получить статус оборудования" };
    }
}

export async function getStaffOnShift(): Promise<{
    success: boolean;
    data?: StaffOnShift[];
    error?: string;
}> {
    try {
        // productionStaff.lineIds is a jsonb array, not a FK — we use it directly
        const staff = await db
            .select({
                id: productionStaff.id,
                name: productionStaff.name,
                position: productionStaff.position,
                lineIds: productionStaff.lineIds,
            })
            .from(productionStaff)
            .where(eq(productionStaff.isActive, true))
            .limit(10);

        const data = await Promise.all(
            staff.map(async (person) => {
                const [tasksResult] = await db
                    .select({ count: count() })
                    .from(productionTasks)
                    .where(
                        and(
                            eq(productionTasks.assigneeId, person.id),
                            eq(productionTasks.status, "in_progress")
                        )
                    );

                // Get primary line name from first lineId if available
                const primaryLineId = person.lineIds?.[0] || null;
                let lineName: string | undefined;
                if (primaryLineId) {
                    const [line] = await db
                        .select({ name: productionLines.name })
                        .from(productionLines)
                        .where(eq(productionLines.id, primaryLineId));
                    lineName = line?.name;
                }

                return {
                    id: person.id,
                    name: person.name,
                    position: person.position,
                    lineId: primaryLineId,
                    lineName,
                    activeTasks: tasksResult?.count || 0,
                };
            })
        );

        return { success: true, data };
    } catch (error) {
        console.error("Error getting staff on shift:", error);
        return { success: false, error: "Не удалось получить данные о сотрудниках" };
    }
}

export async function getDailyOutputData(days: number = 7): Promise<{
    success: boolean;
    data?: { date: string; completed: number; quantity: number }[];
    error?: string;
}> {
    try {
        const startDate = subDays(new Date(), days - 1);
        const dates: { date: string; completed: number; quantity: number }[] = [];

        // Generate all dates in range
        for (let i = 0; i < days; i++) {
            const date = subDays(new Date(), days - 1 - i);
            dates.push({
                date: format(date, "yyyy-MM-dd"),
                completed: 0,
                quantity: 0,
            });
        }

        // Get actual data
        const result = await db
            .select({
                date: sql<string>`DATE(${productionTasks.completedAt})`,
                completed: count(),
                quantity: sum(productionTasks.completedQuantity),
            })
            .from(productionTasks)
            .where(
                and(
                    gte(productionTasks.completedAt, startOfDay(startDate)),
                    eq(productionTasks.status, "completed")
                )
            )
            .groupBy(sql`DATE(${productionTasks.completedAt})`);

        // Merge with generated dates
        result.forEach((item) => {
            const index = dates.findIndex((d) => d.date === item.date);
            if (index !== -1) {
                dates[index].completed = Number(item.completed || 0);
                dates[index].quantity = Number(item.quantity || 0);
            }
        });

        return { success: true, data: dates };
    } catch (error) {
        console.error("Error getting daily output data:", error);
        return { success: false, error: "Не удалось получить данные выработки" };
    }
}

export interface ProductionBoardItem {
    id: string;
    description: string | null;
    quantity: number;
    order: {
        id: string;
        orderNumber: string | null;
        status: string;
        attachments: { id: string; fileUrl: string; fileName: string }[];
    } | null;
}

export async function getProductionBoardItems(applicationTypeId: string): Promise<{
    success: boolean;
    data?: ProductionBoardItem[];
    error?: string;
}> {
    try {
        const _validatedId = z.string().uuid().parse(applicationTypeId);
        const items = await db.query.orderItems.findMany({
            where: eq(orderItems.applicationTypeId, _validatedId),
            with: {
                order: {
                    columns: { id: true, orderNumber: true, status: true },
                    with: {
                        attachments: true
                    }
                }
            }
        });

        return { success: true, data: items as unknown as ProductionBoardItem[] };
    } catch (error) {
        console.error("Error fetching board items:", error);
        return { success: false, error: "Не удалось загрузить данные" };
    }
}

export async function getProductionTypeStats(applicationTypeId: string): Promise<{
    success: boolean;
    data?: {
        active: number;
        urgent: number;
        efficiency: number;
        completedToday: number;
    };
    error?: string;
}> {
    try {
        const _validatedId = z.string().uuid().parse(applicationTypeId);
        const todayStart = startOfDay(new Date());

        const [activeResult] = await db
            .select({ count: count() })
            .from(orderItems)
            .where(
                and(
                    eq(orderItems.applicationTypeId, applicationTypeId),
                    sql`${orderItems.stagePackagingStatus} != 'done'`
                )
            );

        const [urgentResult] = await db
            .select({ count: count() })
            .from(orderItems)
            .innerJoin(orders, eq(orderItems.orderId, orders.id))
            .where(
                and(
                    eq(orderItems.applicationTypeId, applicationTypeId),
                    eq(orders.priority, 'high')
                )
            );

        const [completedTodayResult] = await db
            .select({ count: count() })
            .from(orderItems)
            .where(
                and(
                    eq(orderItems.applicationTypeId, applicationTypeId),
                    eq(orderItems.stagePackagingStatus, 'done'),
                    gte(orderItems.updatedAt, todayStart)
                )
            );

        return {
            success: true,
            data: {
                active: activeResult?.count || 0,
                urgent: urgentResult?.count || 0,
                efficiency: 98, // Mock for now
                completedToday: completedTodayResult?.count || 0,
            }
        };
    } catch (error) {
        console.error("Error fetching type stats:", error);
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}
