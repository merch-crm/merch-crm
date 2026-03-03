"use server";

import { db } from "@/lib/db";
import { presenceLogs, workSessions, dailyWorkStats, employeeFaces, cameras, users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { PresenceDetectSchema } from "../validation";
import { revalidatePath } from "next/cache";

// ============================================
// PRESENCE DETECTION (вызывается Python-сервисом)
// ============================================

export async function recordPresenceEvent(data: unknown) {
    try {
        const validated = PresenceDetectSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const {
            cameraId,
            eventType,
            userId,
            confidence,
            faceEncoding,
            snapshotUrl,
            timestamp,
        } = validated.data;

        // Проверяем камеру
        const camera = await db.query.cameras.findFirst({
            where: and(
                eq(cameras.id, cameraId),
                eq(cameras.isEnabled, true)
            ),
        });

        if (!camera) {
            return { success: false, error: "Камера не найдена или отключена" };
        }

        const eventTime = timestamp ? new Date(timestamp) : new Date();
        const today = new Date(eventTime);
        today.setHours(0, 0, 0, 0);

        // Записываем лог
        const [log] = await db.insert(presenceLogs).values({
            userId: userId || null,
            cameraId,
            eventType,
            confidence: confidence?.toString() || null,
            faceEncoding: faceEncoding || null,
            snapshotUrl: snapshotUrl || null,
            timestamp: eventTime,
        }).returning();

        // Если распознан пользователь — обновляем статистику
        if (userId && (eventType === "detected" || eventType === "recognized")) {
            await updateDailyStats(userId, eventTime, today);
        }

        return { success: true, data: { logId: log.id } };
    } catch (error) {
        await logError({
            error,
            path: "/api/presence/detect",
            method: "recordPresenceEvent",
        });
        return { success: false, error: "Ошибка записи события" };
    }
}

async function updateDailyStats(userId: string, eventTime: Date, today: Date) {
    // Получаем или создаём запись статистики за день
    let stats = await db.query.dailyWorkStats.findFirst({
        where: and(
            eq(dailyWorkStats.userId, userId),
            eq(dailyWorkStats.date, today)
        ),
    });

    if (!stats) {
        // Создаём новую запись
        const [newStats] = await db.insert(dailyWorkStats).values({
            userId,
            date: today,
            firstSeenAt: eventTime,
            lastSeenAt: eventTime,
        }).returning();
        stats = newStats;
    } else {
        // Обновляем lastSeenAt
        await db.update(dailyWorkStats)
            .set({
                lastSeenAt: eventTime,
                updatedAt: new Date(),
            })
            .where(eq(dailyWorkStats.id, stats.id));
    }
}

// ============================================
// CURRENT STATUS
// ============================================

export async function getCurrentPresenceStatus() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Получаем последние события за сегодня с группировкой по пользователям
        const latestLogs = await db
            .select({
                userId: presenceLogs.userId,
                eventType: presenceLogs.eventType,
                timestamp: presenceLogs.timestamp,
                cameraId: presenceLogs.cameraId,
            })
            .from(presenceLogs)
            .where(and(
                gte(presenceLogs.timestamp, today),
                sql`${presenceLogs.userId} IS NOT NULL`
            ))
            .orderBy(desc(presenceLogs.timestamp));

        // Группируем по userId, берём последнее событие
        const userLastEvents = new Map<string, typeof latestLogs[0]>();
        for (const log of latestLogs) {
            if (log.userId && !userLastEvents.has(log.userId)) {
                userLastEvents.set(log.userId, log);
            }
        }

        // Получаем данные пользователей и дневную статистику
        const userIds = Array.from(userLastEvents.keys());

        if (userIds.length === 0) {
            return { success: true, data: [] };
        }

        const usersData = await db.query.users.findMany({
            where: sql`${users.id} IN ${userIds}`,
            columns: {
                id: true,
                name: true,
                avatar: true,
            },
            with: {
                department: {
                    columns: {
                        name: true,
                    },
                },
            },
        });

        const statsData = await db.query.dailyWorkStats.findMany({
            where: and(
                sql`${dailyWorkStats.userId} IN ${userIds}`,
                eq(dailyWorkStats.date, today)
            ),
        });

        const statsMap = new Map(statsData.map(s => [s.userId, s]));

        // Получаем названия камер
        const cameraIds = Array.from(new Set(
            Array.from(userLastEvents.values())
                .map(e => e.cameraId)
                .filter(Boolean)
        )) as string[];

        const camerasData = cameraIds.length > 0
            ? await db.query.cameras.findMany({
                where: sql`${cameras.id} IN ${cameraIds}`,
                columns: { id: true, localName: true, name: true },
            })
            : [];

        const cameraMap = new Map(camerasData.map(c => [c.id, c.localName || c.name]));

        // Формируем результат
        const result = usersData.map(user => {
            const lastEvent = userLastEvents.get(user.id);
            const stats = statsMap.get(user.id);
            const now = Date.now();
            const lastEventTime = lastEvent?.timestamp.getTime() || 0;
            const idleThreshold = 60 * 1000; // 60 секунд

            let status: "working" | "idle" | "away" | "offline" = "offline";

            if (lastEvent) {
                if (lastEvent.eventType === "lost") {
                    status = "away";
                } else if (now - lastEventTime < idleThreshold) {
                    status = "working";
                } else {
                    status = "idle";
                }
            }

            return {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                departmentName: user.department?.name || null,
                status,
                lastSeenAt: lastEvent?.timestamp || null,
                cameraName: lastEvent?.cameraId ? cameraMap.get(lastEvent.cameraId) || null : null,
                todayWorkSeconds: stats?.workSeconds || 0,
                todayIdleSeconds: stats?.idleSeconds || 0,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/staff/presence/status",
            method: "getCurrentPresenceStatus",
        });
        return { success: false, error: "Не удалось загрузить статус присутствия" };
    }
}

// ============================================
// REPORTS
// ============================================

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
