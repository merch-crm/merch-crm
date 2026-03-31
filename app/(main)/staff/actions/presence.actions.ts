"use server";

import { db } from "@/lib/db";
import { dailyWorkStats } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { eq, and, gte, lte } from "drizzle-orm";

// ============================================
// REPORTS (Остатки от модуля контроля присутствия)
// ============================================

export async function getCurrentPresenceStatus() {
    return { success: true, data: [] };
}

export async function getDailyReport(date: Date) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const stats = await db.query.dailyWorkStats.findMany({
            where: eq(dailyWorkStats.date, dayStart),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                    with: {
                        department: {
                            columns: { name: true },
                        },
                    },
                },
            },
        });

        const result = stats.map(s => ({
            userId: s.userId,
            userName: s.user?.name || "Неизвестно",
            userAvatar: s.user?.avatar || null,
            departmentName: s.user?.department?.name || null,
            firstSeenAt: s.firstSeenAt,
            lastSeenAt: s.lastSeenAt,
            workHours: s.workSeconds / 3600,
            idleHours: s.idleSeconds / 3600,
            productivity: s.productivity ? parseFloat(s.productivity) : 0,
            lateMinutes: s.lateArrivalMinutes || 0,
            earlyLeaveMinutes: s.earlyDepartureMinutes || 0,
        }));

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/staff/reports/daily",
            method: "getDailyReport",
        });
        return { success: false, error: "Не удалось загрузить отчёт" };
    }
}

export async function getWeeklyReport(startDate: Date) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const weekStart = new Date(startDate);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const stats = await db.query.dailyWorkStats.findMany({
            where: and(
                gte(dailyWorkStats.date, weekStart),
                lte(dailyWorkStats.date, weekEnd)
            ),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                    with: {
                        department: {
                            columns: { name: true },
                        },
                    },
                },
            },
        });

        // Группируем по пользователям
        const userStats = new Map<string, typeof stats>();

        for (const stat of stats) {
            const existing = userStats.get(stat.userId) || [];
            existing.push(stat);
            userStats.set(stat.userId, existing);
        }

        const result = Array.from(userStats.entries()).map(([userId, days]) => {
            const totalWorkSeconds = days.reduce((sum, d) => sum + d.workSeconds, 0);
            const totalIdleSeconds = days.reduce((sum, d) => sum + d.idleSeconds, 0);
            const avgProductivity = days.reduce((sum, d) =>
                sum + (d.productivity ? parseFloat(d.productivity) : 0), 0
            ) / days.length;

            const user = days[0]?.user;

            return {
                userId,
                userName: user?.name || "Неизвестно",
                userAvatar: user?.avatar || null,
                departmentName: user?.department?.name || null,
                daysWorked: days.length,
                totalWorkHours: totalWorkSeconds / 3600,
                totalIdleHours: totalIdleSeconds / 3600,
                avgWorkHours: totalWorkSeconds / 3600 / days.length,
                avgProductivity,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/staff/reports/weekly",
            method: "getWeeklyReport",
        });
        return { success: false, error: "Не удалось загрузить отчёт" };
    }
}

export async function getMonthlyReport(year: number, month: number) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const stats = await db.query.dailyWorkStats.findMany({
            where: and(
                gte(dailyWorkStats.date, monthStart),
                lte(dailyWorkStats.date, monthEnd)
            ),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                    with: {
                        department: {
                            columns: { name: true },
                        },
                    },
                },
            },
        });

        // Группируем по пользователям
        const userStats = new Map<string, typeof stats>();

        for (const stat of stats) {
            const existing = userStats.get(stat.userId) || [];
            existing.push(stat);
            userStats.set(stat.userId, existing);
        }

        const result = Array.from(userStats.entries()).map(([userId, days]) => {
            const totalWorkSeconds = days.reduce((sum, d) => sum + d.workSeconds, 0);
            const totalIdleSeconds = days.reduce((sum, d) => sum + d.idleSeconds, 0);
            const avgProductivity = days.reduce((sum, d) =>
                sum + (d.productivity ? parseFloat(d.productivity) : 0), 0
            ) / days.length;
            const totalLateMinutes = days.reduce((sum, d) => sum + (d.lateArrivalMinutes || 0), 0);

            const user = days[0]?.user;

            return {
                userId,
                userName: user?.name || "Неизвестно",
                userAvatar: user?.avatar || null,
                departmentName: user?.department?.name || null,
                daysWorked: days.length,
                totalWorkHours: totalWorkSeconds / 3600,
                totalIdleHours: totalIdleSeconds / 3600,
                avgWorkHours: totalWorkSeconds / 3600 / days.length,
                avgProductivity,
                totalLateMinutes,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/staff/reports/monthly",
            method: "getMonthlyReport",
        });
        return { success: false, error: "Не удалось загрузить отчёт" };
    }
}
