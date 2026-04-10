"use server";

import { db } from "@/lib/db";
import { auditLogs, securityEvents, systemErrors, systemSettings } from "@/lib/schema/system";
import { users } from "@/lib/schema/users";
import { auth } from "@/lib/auth";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logSecurityEvent } from "@/lib/security-logger";
import { logAction } from "@/lib/audit";
import { eq, desc, and, gte, sql, count, ilike, lte, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ActionResult, ok, okVoid, ERRORS } from "@/lib/types";
import { z } from "zod";

type AuditLog = InferSelectModel<typeof auditLogs>;
type SecurityEvent = InferSelectModel<typeof securityEvents>;
type SystemError = InferSelectModel<typeof systemErrors>;
type UserSub = { id: string; name: string; email: string; avatar?: string | null; image?: string | null };

export type AuditLogWithUser = AuditLog & { user?: UserSub | null };
export type SecurityEventWithUser = SecurityEvent & { user?: UserSub | null };


// Audit Logs
export async function getAuditLogs(
  page = 1,
  limit = 20,
  search = "",
  userId?: string | null,
  entityType?: string | null,
  startDate?: string | null,
  endDate?: string | null
): Promise<ActionResult<{
  logs: AuditLogWithUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}>> {
  return withAuth(async () => {
    const offset = (page - 1) * limit;

    // Security risk fix: prevent DB DoS via extremely long search strings
    const safeSearch = search.slice(0, 100);

    const conditions = [];
    if (safeSearch) conditions.push(ilike(auditLogs.action, `%${safeSearch}%`));
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

    return ok({
      logs: logs as unknown as AuditLogWithUser[],
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getAuditLogs" });
}

export async function clearAuditLogs(): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    await db.transaction(async (tx) => {
      await tx.delete(auditLogs);
      await logAction("Логи аудита очищены", "system", session.id, undefined, tx);
    });
    revalidatePath("/admin-panel/audit");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "clearAuditLogs" });
}

// Impersonation
export async function impersonateUser(userId: string): Promise<ActionResult<void>> {
  const validated = z.object({ userId: z.string().uuid("Некорректный ID пользователя") }).safeParse({ userId });
  if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

  return withAuth(async (session) => {
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!targetUser) return ERRORS.NOT_FOUND("Пользователь");

    const defaultHeaders = await headers();
    await auth.api.impersonateUser({
      headers: defaultHeaders,
      body: { userId }
    });

    await logSecurityEvent({
      eventType: "admin_impersonation_start",
      userId: session.id,
      severity: "warning",
      entityType: "user",
      entityId: targetUser.id,
      details: { adminId: session.id, targetUserId: targetUser.id }
    });

    revalidatePath("/");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "impersonateUser" });
}

export async function stopImpersonating(): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    const defaultHeaders = await headers();
    await auth.api.stopImpersonating({
      headers: defaultHeaders,
    });

    await logSecurityEvent({
      eventType: "admin_impersonation_stop",
      userId: session.id,
      severity: "info",
      entityType: "user",
      details: { adminId: session.id }
    });

    revalidatePath("/");
    return okVoid();
  }, { errorPath: "stopImpersonating" });
}

export async function getMonitoringStats(): Promise<ActionResult<{
  activeUsers: { id: string; name: string; email: string; role: string | undefined; lastActiveAt: Date | null }[];
  activityStats: { hour: number; type: string; count: number }[];
  entityStats: { type: string; count: number }[];
}>> {
  return withAuth(async () => {
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

    return ok({
      activeUsers: activeUsers.map(u => ({
        id: u.id, 
        name: u.name, 
        email: u.email, 
        role: u.role?.name, 
        lastActiveAt: u.lastActiveAt
      })),
      activityStats: activityStats.rows as unknown as { hour: number; type: string; count: number }[],
      entityStats: entityStats.rows as unknown as { type: string; count: number }[]
    });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getMonitoringStats" });
}

export async function getSecurityStats(): Promise<ActionResult<{
  failedLogins: SecurityEvent[];
  sensitiveActions: AuditLog[];
  systemErrors: SystemError[];
  maintenanceMode: boolean;
}>> {
  return withAuth(async () => {
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

    return ok({
      failedLogins: failedLogins as SecurityEvent[],
      sensitiveActions: sensitiveActions as unknown as AuditLog[],
      systemErrors: errors as SystemError[],
      maintenanceMode: maintenanceSetting?.value === true
    });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getSecurityStats" });
}

export async function toggleMaintenanceMode(enabled: boolean): Promise<ActionResult<void>> {
  const validated = z.boolean().safeParse(enabled);
  if (!validated.success) return ERRORS.VALIDATION("Некорректное значение");

  return withAuth(async (session) => {
    await db.insert(systemSettings)
      .values({ key: 'maintenance_mode', value: enabled, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [systemSettings.key],
        set: { value: enabled, updatedAt: new Date() }
      });

    await logSecurityEvent({
      eventType: "maintenance_mode_toggle",
      userId: session.id,
      severity: "critical",
      entityType: "system_settings",
      details: { enabled, toggledBy: session.name }
    });
    revalidatePath("/");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "toggleMaintenanceMode" });
}

export async function getSecurityEvents(
  page = 1,
  limit = 20,
  eventType?: string | null,
  severity?: string | null,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<ActionResult<{
  events: SecurityEventWithUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>> {
  return withAuth(async () => {
    const offset = (page - 1) * limit;
    const safeEventType = eventType?.slice(0, 100);

    const conditions = [];
    if (safeEventType) conditions.push(eq(securityEvents.eventType, safeEventType as SecurityEvent["eventType"]));
    if (severity) conditions.push(eq(securityEvents.severity, severity as SecurityEvent["severity"]));
    if (startDate) conditions.push(gte(securityEvents.createdAt, startDate));
    if (endDate) conditions.push(sql`${securityEvents.createdAt} <= ${endDate}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(securityEvents).where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const events = await db.query.securityEvents.findMany({
      where: whereClause,
      with: {
        user: {
          columns: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: [desc(securityEvents.createdAt)],
      limit,
      offset
    });

    return ok({
      events: events as unknown as SecurityEventWithUser[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getSecurityEvents" });
}

export async function getSecurityEventsSummary(): Promise<ActionResult<{
  summary: {
    loginAttempts: number;
    successfulLogins: number;
    permissionChanges: number;
    criticalEvents: number;
  };
  recentCritical: SecurityEvent[];
}>> {
  return withAuth(async () => {
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
      loginAttempts: eventCounts.filter(e => e.eventType?.startsWith("login_")).reduce((sum, e) => sum + Number(e.count), 0),
      successfulLogins: eventCounts.filter(e => e.eventType === "login_success").reduce((sum, e) => sum + Number(e.count), 0),
      permissionChanges: eventCounts.filter(e => e.eventType?.includes("permission") || e.eventType?.includes("role")).reduce((sum, e) => sum + Number(e.count), 0),
      criticalEvents: eventCounts.filter(e => e.severity === "critical").reduce((sum, e) => sum + Number(e.count), 0)
    };

    const recentCritical = await db.query.securityEvents.findMany({
      where: and(eq(securityEvents.severity, "critical"), gte(securityEvents.createdAt, last24h)),
      with: { user: { columns: { name: true, email: true } } },
      orderBy: [desc(securityEvents.createdAt)],
      limit: 5
    });

    return ok({ summary: totals, recentCritical: recentCritical as unknown as SecurityEvent[] });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getSecurityEventsSummary" });
}

export async function trackActivity(): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    await db.update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, session.id));

    return okVoid();
  }, { errorPath: "trackActivity" });
}

export async function clearSecurityErrors(): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await db.delete(systemErrors);
    revalidatePath("/admin-panel/security");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "clearSecurityErrors" });
}

export async function clearFailedLogins(): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await db.delete(securityEvents).where(eq(securityEvents.eventType, "login_failed"));
    revalidatePath("/admin-panel/security");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "clearFailedLogins" });
}
