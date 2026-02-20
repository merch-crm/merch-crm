"use server";

import { db } from "@/lib/db";
import { auditLogs, securityEvents, systemErrors, users, systemSettings } from "@/lib/schema";
import { getSession, encrypt } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { eq, desc, and, gte, sql, count, ilike, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { z } from "zod";

const SYSTEM_ENTITY_ID = "00000000-0000-0000-0000-000000000000";

// Audit Logs
export async function getAuditLogs(
    page = 1,
    limit = 20,
    search = "",
    userId?: string | null,
    entityType?: string | null,
    startDate?: string | null,
    endDate?: string | null
) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const offset = (page - 1) * limit;

        const conditions = [];
        if (search) conditions.push(ilike(auditLogs.action, `%${search}%`));
        if (userId) conditions.push(eq(auditLogs.userId, userId));
        if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
        if (startDate) conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(auditLogs.createdAt, new Date(endDate)));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const totalResult = await db.select({ count: count() }).from(auditLogs).where(where);
        const total = Number(totalResult[0]?.count || 0);

        const logs = await db.query.auditLogs.findMany({
            with: { user: true },
            where,
            orderBy: [desc(auditLogs.createdAt)],
            limit,
            offset
        });

        return {
            success: true,
            data: logs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    } catch (_error) {
        return { success: false, error: "Не удалось загрузить логи аудита" };
    }
}

export async function clearAuditLogs() {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);
        await db.transaction(async (tx) => {
            await tx.delete(auditLogs);
            await logAction("Логи аудита очищены", "system", currentUser.id, undefined, tx);
        });
        revalidatePath("/admin-panel/audit");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Не удалось очистить логи" };
    }
}

// Impersonation
export async function impersonateUser(userId: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await requireAdmin(session);
        const { userId: validUserId } = z.object({ userId: z.string().uuid("Некорректный ID пользователя") }).parse({ userId });

        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, validUserId),
            with: { role: true, department: true }
        });

        if (!targetUser) return { success: false, error: "Пользователь не найден" };

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newSessionData = {
            id: targetUser.id,
            email: targetUser.email,
            roleId: targetUser.roleId || "",
            roleName: targetUser.role?.name || "User",
            departmentName: targetUser.department?.name || "",
            name: targetUser.name || "",
            impersonatorId: session.impersonatorId || session.id,
            impersonatorName: session.impersonatorName || session.name,
            expires,
        };

        const encryptedSession = await encrypt(newSessionData);
        (await cookies()).set("session", encryptedSession, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        await logSecurityEvent({
            eventType: "admin_impersonation_start",
            userId: session.id,
            severity: "warning",
            entityType: "user",
            entityId: targetUser.id,
            details: { adminId: session.id!, targetUserId: targetUser.id }
        });

        revalidatePath("/");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Ошибка при смене пользователя" };
    }
}

export async function stopImpersonating() {
    const session = await getSession();
    if (!session || !session.impersonatorId) return { success: false, error: "Нет активной сессии" };

    try {
        const adminUser = await db.query.users.findFirst({
            where: eq(users.id, session.impersonatorId),
            with: { role: true, department: true }
        });

        if (!adminUser) return { success: false, error: "Администратор не найден" };

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const originalSessionData = {
            id: adminUser.id,
            email: adminUser.email,
            roleId: adminUser.roleId || "",
            roleName: adminUser.role?.name || "User",
            departmentName: adminUser.department?.name || "",
            name: adminUser.name || "",
            expires,
        };

        const encryptedSession = await encrypt(originalSessionData);
        (await cookies()).set("session", encryptedSession, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        await logSecurityEvent({
            eventType: "admin_impersonation_stop",
            userId: adminUser.id,
            severity: "info",
            entityType: "user",
            details: { adminId: adminUser.id }
        });

        revalidatePath("/");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Не удалось вернуться в режим администратора" };
    }
}

// Security & Monitoring Stats
export async function getMonitoringStats() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [activeUsers, activityStats, entityStats] = await Promise.all([
            db.query.users.findMany({
                where: sql`${users.lastActiveAt} > ${fiveMinutesAgo}`,
                with: { role: true, department: true },
                limit: 10
            }),
            db.execute(sql`
                SELECT EXTRACT(HOUR FROM ${auditLogs.createdAt})::int as hour, 
                       ${auditLogs.entityType} as type,
                       count(*)::int as count 
                FROM ${auditLogs} 
                WHERE ${auditLogs.createdAt} > ${twentyFourHoursAgo}
                GROUP BY 1, 2 ORDER BY 1, 2
            `),
            db.execute(sql`
                SELECT ${auditLogs.entityType} as type, count(*)::int as count 
                FROM ${auditLogs} 
                WHERE ${auditLogs.createdAt} > ${twentyFourHoursAgo}
                GROUP BY 1 ORDER BY 2 DESC
            `)
        ]);

        return {
            success: true,
            data: {
                activeUsers: activeUsers.map(u => ({
                    id: u.id, name: u.name, email: u.email, role: u.role?.name, lastActiveAt: u.lastActiveAt
                })),
                activityStats: activityStats.rows,
                entityStats: entityStats.rows
            }
        };
    } catch (_error) {
        return { success: false, error: "Ошибка получения данных мониторинга" };
    }
}

export async function getSecurityStats() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [failedLogins, sensitiveActions, errors, maintenanceSetting] = await Promise.all([
            db.query.securityEvents.findMany({
                where: and(eq(securityEvents.eventType, 'login_failed'), gte(securityEvents.createdAt, last24h)),
                orderBy: [desc(securityEvents.createdAt)],
                limit: 20
            }),
            db.query.auditLogs.findMany({
                where: and(sql`${auditLogs.action} IN ('password_change', 'email_change', 'profile_update')`, gte(auditLogs.createdAt, last24h)),
                with: { user: true },
                orderBy: [desc(auditLogs.createdAt)],
                limit: 50
            }),
            db.query.systemErrors.findMany({
                where: gte(systemErrors.createdAt, last24h),
                orderBy: [desc(systemErrors.createdAt)],
                limit: 100
            }),
            db.query.systemSettings.findFirst({ where: eq(systemSettings.key, 'maintenance_mode') })
        ]);

        return {
            success: true,
            data: {
                failedLogins,
                sensitiveActions,
                systemErrors: errors,
                maintenanceMode: maintenanceSetting?.value === true
            }
        };
    } catch (_error) {
        return { success: false, error: "Ошибка получения данных безопасности" };
    }
}

export async function toggleMaintenanceMode(enabled: boolean) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { enabled: validEnabled } = z.object({ enabled: z.boolean() }).parse({ enabled });

        await db.insert(systemSettings)
            .values({ key: 'maintenance_mode', value: validEnabled, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: [systemSettings.key],
                set: { value: validEnabled, updatedAt: new Date() }
            });

        await logSecurityEvent({
            eventType: "maintenance_mode_toggle",
            userId: session.id,
            severity: "critical",
            entityType: "system_settings",
            details: { enabled, toggledBy: session.name }
        });
        revalidatePath("/");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Ошибка переключения режима" };
    }
}

export async function getSecurityEvents(
    page = 1,
    limit = 20,
    eventType?: string | null,
    severity?: string | null,
    startDate?: Date | null,
    endDate?: Date | null
) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const offset = (page - 1) * limit;

        const conditions = [];
        if (eventType) conditions.push(eq(securityEvents.eventType, eventType as typeof securityEvents.$inferSelect.eventType));
        if (severity) conditions.push(eq(securityEvents.severity, severity as typeof securityEvents.$inferSelect.severity));
        if (startDate) conditions.push(gte(securityEvents.createdAt, startDate));
        if (endDate) conditions.push(sql`${securityEvents.createdAt} <= ${endDate}`);

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const totalResult = await db.select({ count: count() }).from(securityEvents).where(whereClause);
        const total = Number(totalResult[0]?.count || 0);

        const events = await db.query.securityEvents.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: { id: true, name: true, email: true }
                }
            },
            orderBy: [desc(securityEvents.createdAt)],
            limit,
            offset
        });

        return {
            success: true,
            data: {
                events,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    } catch (error) {
        await logError({ error, path: "/admin-panel/security/events", method: "getSecurityEvents" });
        return { success: false, error: "Ошибка получения событий безопасности" };
    }
}

export async function getSecurityEventsSummary() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const eventCounts = await db
            .select({
                eventType: securityEvents.eventType,
                severity: securityEvents.severity,
                count: count()
            })
            .from(securityEvents)
            .where(gte(securityEvents.createdAt, last24h))
            .groupBy(securityEvents.eventType, securityEvents.severity);

        const totals = {
            loginAttempts: eventCounts.filter(e => e.eventType.startsWith("login_")).reduce((sum, e) => sum + Number(e.count), 0),
            successfulLogins: eventCounts.filter(e => e.eventType === "login_success").reduce((sum, e) => sum + Number(e.count), 0),
            permissionChanges: eventCounts.filter(e => e.eventType.includes("permission") || e.eventType.includes("role")).reduce((sum, e) => sum + Number(e.count), 0),
            criticalEvents: eventCounts.filter(e => e.severity === "critical").reduce((sum, e) => sum + Number(e.count), 0)
        };

        const recentCritical = await db.query.securityEvents.findMany({
            where: and(eq(securityEvents.severity, "critical"), gte(securityEvents.createdAt, last24h)),
            with: { user: { columns: { name: true, email: true } } },
            orderBy: [desc(securityEvents.createdAt)],
            limit: 5
        });

        return {
            success: true,
            data: { summary: totals, recentCritical }
        };
    } catch (_error) {
        return { success: false, error: "Ошибка получения сводки безопасности" };
    }
}

export async function trackActivity() {
    try {
        const session = await getSession();
        if (!session?.id) return { success: false };

        await db.update(users)
            .set({ lastActiveAt: new Date() })
            .where(eq(users.id, session.id));

        return { success: true };
    } catch (_error) {
        return { success: false };
    }
}

export async function clearSecurityErrors() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        await db.delete(systemErrors);
        revalidatePath("/admin-panel/security");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Не удалось очистить ошибки системы" };
    }
}

export async function clearFailedLogins() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        await db.delete(securityEvents).where(eq(securityEvents.eventType, "login_failed"));
        revalidatePath("/admin-panel/security");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Не удалось очистить историю входов" };
    }
}
