"use server";

import { db } from "@/lib/db";
import {
    productionTasks,
    productionLogs,
    productionStaff,
    productionLines,
    inventoryTransactions,
    inventoryItems,
} from "@/lib/schema";
import { and, eq, gte, lte, sql, desc, count, sum } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";

// СХЕМЫ ВАЛИДАЦИИ

const dateRangeSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
});

const exportParamsSchema = dateRangeSchema.extend({
    type: z.enum(["overview", "defects", "staff", "materials"]),
});

// ТИПЫ

interface ProductionMetrics {
    totalCompleted: number;
    totalInProgress: number;
    totalDefects: number;
    defectRate: number;
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
    trend: number;
}

interface DailyOutput {
    date: string;
    completed: number;
    defects: number;
    target: number;
}

// === ОСНОВНЫЕ ДАННЫЕ ОТЧЁТА ===

/**
 * Получение агрегированных метрик производства за период
 */
export async function getProductionReportData(params: z.infer<typeof dateRangeSchema>) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const { startDate, endDate } = dateRangeSchema.parse(params);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Получение количества выполненных задач
        const [completedCount] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, start),
                    lte(productionTasks.completedAt, end)
                )
            );

        // Получение задач в работе (текущий срез)
        const [inProgressCount] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(eq(productionTasks.status, "in_progress"));

        // Получение количества брака из логов
        const [defectCount] = await db
            .select({ count: count() })
            .from(productionLogs)
            .where(
                and(
                    eq(productionLogs.event, "defect_reported"),
                    gte(productionLogs.createdAt, start),
                    lte(productionLogs.createdAt, end)
                )
            );

        const totalCompleted = completedCount?.count || 0;
        const totalInProgress = inProgressCount?.count || 0;
        const totalDefects = defectCount?.count || 0;
        const defectRate = totalCompleted > 0 ? (totalDefects / totalCompleted) * 100 : 0;

        // Расчёт процента выполнения в срок
        const [onTimeCount] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, start),
                    lte(productionTasks.completedAt, end),
                    sql`${productionTasks.completedAt} <= ${productionTasks.dueDate}`
                )
            );

        const onTimeDeliveryRate =
            totalCompleted > 0 ? ((onTimeCount?.count || 0) / totalCompleted) * 100 : 100;

        // Расчёт тренда (сравнение с предыдущим аналогичным периодом)
        const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const prevStart = new Date(start.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const prevEnd = new Date(start.getTime() - 1);

        const [prevCompletedCount] = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, prevStart),
                    lte(productionTasks.completedAt, prevEnd)
                )
            );

        const prevCompleted = prevCompletedCount?.count || 0;
        const trend = prevCompleted > 0 ? ((totalCompleted - prevCompleted) / prevCompleted) * 100 : 0;

        // Ежедневная выработка
        const dailyOutputData = await db
            .select({
                date: sql<string>`DATE(${productionTasks.completedAt})`,
                completed: count(),
            })
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.status, "completed"),
                    gte(productionTasks.completedAt, start),
                    lte(productionTasks.completedAt, end)
                )
            )
            .groupBy(sql`DATE(${productionTasks.completedAt})`)
            .orderBy(sql`DATE(${productionTasks.completedAt})`);

        // Ежедневный брак
        const dailyDefectsData = await db
            .select({
                date: sql<string>`DATE(${productionLogs.createdAt})`,
                defects: count(),
            })
            .from(productionLogs)
            .where(
                and(
                    eq(productionLogs.event, "defect_reported"),
                    gte(productionLogs.createdAt, start),
                    lte(productionLogs.createdAt, end)
                )
            )
            .groupBy(sql`DATE(${productionLogs.createdAt})`);

        // Получение плановой мощности линий
        const [capacityResult] = await db
            .select({
                totalCapacity: sum(productionLines.capacity),
            })
            .from(productionLines)
            .where(eq(productionLines.isActive, true));

        const dailyTarget = Number(capacityResult?.totalCapacity) || 100;

        // Слияние данных для графика
        const defectsMap = new Map(
            dailyDefectsData.map((d) => [d.date, d.defects])
        );

        const dailyOutput: DailyOutput[] = dailyOutputData.map((d) => ({
            date: d.date,
            completed: d.completed,
            defects: defectsMap.get(d.date) || 0,
            target: dailyTarget,
        }));

        const metrics: ProductionMetrics = {
            totalCompleted,
            totalInProgress,
            totalDefects,
            defectRate,
            averageCompletionTime: 0, // Расчитывается из логов (TODO)
            onTimeDeliveryRate,
            trend,
        };

        return {
            success: true,
            data: {
                metrics,
                dailyOutput,
            },
        };
    } catch (error) {
        console.error("[getProductionReportData]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка загрузки данных отчёта" 
        };
    }
}

// === АНАЛИТИКА БРАКА ===

/**
 * Получение статистики брака по типам
 */
export async function getDefectAnalytics(params: z.infer<typeof dateRangeSchema>) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const { startDate, endDate } = dateRangeSchema.parse(params);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Группировка брака по типам из JSON-поля details
        const defectsByType = await db
            .select({
                type: sql<string>`COALESCE(${productionLogs.details}->>'defectType', 'Прочее')`,
                count: count(),
            })
            .from(productionLogs)
            .where(
                and(
                    eq(productionLogs.event, "defect_reported"),
                    gte(productionLogs.createdAt, start),
                    lte(productionLogs.createdAt, end)
                )
            )
            .groupBy(sql`${productionLogs.details}->>'defectType'`)
            .orderBy(desc(count()));

        const total = defectsByType.reduce((sum, d) => sum + d.count, 0);

        const colors = [
            "#ef4444", // rose
            "#f97316", // orange
            "#eab308", // yellow
            "#22c55e", // green
            "#3b82f6", // blue
            "#8b5cf6", // violet
        ];

        const byType = defectsByType.map((d, i) => ({
            type: d.type || "Прочее",
            count: d.count,
            percentage: total > 0 ? (d.count / total) * 100 : 0,
            color: colors[i % colors.length],
        }));

        return {
            success: true,
            data: {
                total,
                byType,
            },
        };
    } catch (error) {
        console.error("[getDefectAnalytics]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка загрузки аналитики брака" 
        };
    }
}

// === ЭФФЕКТИВНОСТЬ ПЕРСОНАЛА ===

/**
 * Получение топ-сотрудников с показателями выработки и брака
 */
export async function getStaffPerformance(
    params: z.infer<typeof dateRangeSchema> & { limit?: number }
) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const { startDate, endDate, limit = 10 } = params;
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Расчёт показателей через вложенные запросы
        const staffPerformance = await db
            .select({
                id: productionStaff.id,
                name: productionStaff.name,
                avatar: productionStaff.avatarPath,
                completedTasks: sql<number>`
                    (SELECT COUNT(*) FROM ${productionTasks} 
                     WHERE ${productionTasks.assigneeId} = ${productionStaff.id}
                     AND ${productionTasks.status} = 'completed'
                     AND ${productionTasks.completedAt} >= ${start}
                     AND ${productionTasks.completedAt} <= ${end})
                `,
                totalTasks: sql<number>`
                    (SELECT COUNT(*) FROM ${productionTasks} 
                     WHERE ${productionTasks.assigneeId} = ${productionStaff.id}
                     AND ${productionTasks.createdAt} >= ${start}
                     AND ${productionTasks.createdAt} <= ${end})
                `,
                defects: sql<number>`
                    (SELECT COUNT(*) FROM ${productionLogs} 
                     WHERE ${productionLogs.performedBy} = ${productionStaff.userId}
                     AND ${productionLogs.event} = 'defect_reported'
                     AND ${productionLogs.createdAt} >= ${start}
                     AND ${productionLogs.createdAt} <= ${end})
                `,
            })
            .from(productionStaff)
            .where(eq(productionStaff.isActive, true))
            .orderBy(desc(sql`completedTasks`))
            .limit(limit);

        const result = staffPerformance.map((staff) => ({
            id: staff.id,
            name: staff.name,
            avatar: staff.avatar,
            completedTasks: Number(staff.completedTasks) || 0,
            efficiency:
                Number(staff.totalTasks) > 0
                    ? (Number(staff.completedTasks) / Number(staff.totalTasks)) * 100
                    : 0,
            defectRate:
                Number(staff.completedTasks) > 0
                    ? (Number(staff.defects) / Number(staff.completedTasks)) * 100
                    : 0,
        }));

        return { success: true, data: result };
    } catch (error) {
        console.error("[getStaffPerformance]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка загрузки данных сотрудников" 
        };
    }
}

// === ОТЧЁТ ПО МАТЕРИАЛАМ ===

/**
 * Анализ расхода материалов со склада на производство
 */
export async function getMaterialConsumptionReport(
    params: z.infer<typeof dateRangeSchema>
) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const { startDate, endDate } = dateRangeSchema.parse(params);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Получение агрегированного расхода и стоимости
        const consumption = await db
            .select({
                id: inventoryItems.id,
                name: inventoryItems.name,
                unit: inventoryItems.unit,
                consumed: sql<number>`ABS(SUM(${inventoryTransactions.changeAmount}))`,
                cost: sql<number>`ABS(SUM(${inventoryTransactions.changeAmount} * ${inventoryItems.costPrice}))`,
            })
            .from(inventoryTransactions)
            .innerJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
            .where(
                and(
                    eq(inventoryTransactions.type, "out"),
                    gte(inventoryTransactions.createdAt, start),
                    lte(inventoryTransactions.createdAt, end)
                )
            )
            .groupBy(inventoryItems.id, inventoryItems.name, inventoryItems.unit)
            .orderBy(desc(sql`cost`))
            .limit(20);

        // Расчёт тренда расхода материалов
        const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const prevStart = new Date(start.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const prevEnd = new Date(start.getTime() - 1);

        const prevConsumption = await db
            .select({
                id: inventoryItems.id,
                consumed: sql<number>`ABS(SUM(${inventoryTransactions.changeAmount}))`,
            })
            .from(inventoryTransactions)
            .innerJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
            .where(
                and(
                    eq(inventoryTransactions.type, "out"),
                    gte(inventoryTransactions.createdAt, prevStart),
                    lte(inventoryTransactions.createdAt, prevEnd)
                )
            )
            .groupBy(inventoryItems.id);

        const prevMap = new Map(prevConsumption.map((p) => [p.id, Number(p.consumed)]));

        const result = consumption.map((item) => {
            const prev = prevMap.get(item.id) || 0;
            const current = Number(item.consumed) || 0;
            const trend = prev > 0 ? ((current - prev) / prev) * 100 : 0;

            return {
                id: item.id,
                name: item.name,
                unit: item.unit,
                consumed: current,
                cost: Number(item.cost) || 0,
                trend,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("[getMaterialConsumptionReport]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка загрузки данных о материалах" 
        };
    }
}

// === ФУНКЦИИ ЭКСПОРТА ===

export async function exportReportToPDF(params: z.infer<typeof exportParamsSchema>) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admins can export reports
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на экспорт отчётов" };
        }
        const validated = exportParamsSchema.parse(params);

        await logAction("Экспорт отчета в PDF", "report", "all", {
            type: validated.type,
            startDate: validated.startDate,
            endDate: validated.endDate
        });

        // Заглушка для генерации PDF через API-роут
        return {
            success: true,
            data: {
                url: `/api/reports/pdf?type=${validated.type}&start=${validated.startDate}&end=${validated.endDate}`,
            },
        };
    } catch (error) {
        console.error("[exportReportToPDF]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка генерации PDF" 
        };
    }
}

export async function exportReportToExcel(params: z.infer<typeof exportParamsSchema>) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admins can export reports
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на экспорт отчётов" };
        }
        const validated = exportParamsSchema.parse(params);

        await logAction("Экспорт отчета в Excel", "report", "all", {
            type: validated.type,
            startDate: validated.startDate,
            endDate: validated.endDate
        });

        // Заглушка для генерации Excel через API-роут
        return {
            success: true,
            data: {
                url: `/api/reports/excel?type=${validated.type}&start=${validated.startDate}&end=${validated.endDate}`,
            },
        };
    } catch (error) {
        console.error("[exportReportToExcel]", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Ошибка генерации Excel" 
        };
    }
}
