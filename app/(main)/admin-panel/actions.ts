"use server";

import { db } from "@/lib/db";
import { users, roles, auditLogs, departments, clients, orders, inventoryCategories, inventoryItems, storageLocations, tasks, systemSettings, securityEvents, systemErrors } from "@/lib/schema";
import { getSession, encrypt } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { cookies } from "next/headers";

import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";
import { PgTable } from "drizzle-orm/pg-core";
import { hashPassword, comparePassword } from "@/lib/password";
import { eq, asc, desc, sql, and, or, inArray, count, gte, ilike, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security-logger";
import os from "os";
import fs from "fs";
import path from "path";
import {
    CreateUserSchema,
    UpdateUserSchema,
    CreateRoleSchema,
    UpdateRoleSchema,
    CreateDepartmentSchema,
    UpdateDepartmentSchema
} from "./validation";
import { performDatabaseBackup } from "@/lib/backup";

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
    ]);
};

interface BackupFile {
    name: string;
    size: number;
    createdAt: string;
}

const SYSTEM_ENTITY_ID = "00000000-0000-0000-0000-000000000000";

export async function getCurrentUserAction() {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });

        return { success: true, data: currentUser };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/current-user",
            method: "getCurrentUserAction"
        });
        return { success: false, error: "Не удалось загрузить current пользователь" };
    }
}

export async function getUsers(page = 1, limit = 20, search = "") {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const offset = (page - 1) * limit;

        const whereClause = search
            ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
            : undefined;

        // Get total count
        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereClause);
        const total = Number(totalResult[0]?.count || 0);

        // Get paginated users
        const allUsers = await db.query.users.findMany({
            with: {
                role: true,
                department: true
            },
            where: (u, { or, ilike }) => {
                if (!search) return undefined;
                return or(
                    ilike(u.name, `%${search}%`),
                    ilike(u.email, `%${search}%`)
                );
            },
            orderBy: [asc(users.name)],
            limit,
            offset
        });

        const data = allUsers.map(user => ({
            ...user,
            department: user.department?.name || null,
            department_color: user.department?.color || null
        }));

        return {
            success: true,
            data: {
                users: data,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/users",
            method: "getUsers",
            details: { page, limit, search }
        });
        console.error("Error fetching users:");
        return { success: false, error: "Не удалось загрузить пользователи" };
    }
}

export async function getRoles() {
    try {
        const allRoles = await db.query.roles.findMany({
            with: {
                department: true
            }
        });

        // Custom sort order based on priority
        const deptPriority: Record<string, number> = {
            "Руководство": 1,
            "Отдел продаж": 2,
            "Производство": 3,
            "Дизайн": 4,
        };

        const rolePriority: Record<string, number> = {
            "Администратор": 1,
            "Управляющий": 2,
            "Отдел продаж": 3,
            "Склад": 4,
            "Печать": 5,
            "Вышивка": 6,
            "Дизайнер": 7,
        };

        const sortedRoles = allRoles.sort((a, b) => {
            // First, sort by department priority
            const deptA = a.department?.name || "";
            const deptB = b.department?.name || "";
            const deptPriorityA = deptPriority[deptA] || 999;
            const deptPriorityB = deptPriority[deptB] || 999;

            if (deptPriorityA !== deptPriorityB) {
                return deptPriorityA - deptPriorityB;
            }

            // Within the same department, sort by role priority
            const priorityA = rolePriority[a.name] || 999;
            const priorityB = rolePriority[b.name] || 999;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // If both have the same priority, sort alphabetically
            return a.name.localeCompare(b.name);
        });

        return { success: true, data: sortedRoles };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles",
            method: "getRoles"
        });
        console.error("Error fetching roles:");
        return { success: false, error: "Не удалось загрузить роли" };
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const rawData = Object.fromEntries(formData.entries());
        const validation = CreateUserSchema.safeParse(rawData);

        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        const { name, email, password, roleId, departmentId } = validation.data;

        const hashedPassword = await hashPassword(password);
        await db.insert(users).values({
            name,
            email,
            passwordHash: hashedPassword,
            roleId,
            departmentId: departmentId || null
        });

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка создания пользователя" };
    }
}

export async function updateUserRole(userId: string, roleId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        await db.update(users)
            .set({ roleId })
            .where(eq(users.id, userId));

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/users",
            method: "updateUserRole",
            details: { userId, roleId }
        });
        console.error("Error updating user role:");
        return { success: false, error: "Не удалось обновить пользователь роль" };
    }
}

export async function deleteUser(userId: string, password?: string) {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);

        if (userId === currentUser.id) {
            return { success: false, error: "Вы не можете удалить самого себя" };
        }

        const userToDelete = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (userToDelete?.isSystem) {
            if (!password) {
                return { success: false, error: "Для удаления системного пользователя требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        // Check for dependencies to avoid DB errors
        const [managedClients, createdOrders, userTasks] = await Promise.all([
            db.query.clients.findFirst({ where: eq(clients.managerId, userId) }),
            db.query.orders.findFirst({ where: eq(orders.createdBy, userId) }),
            db.query.tasks.findFirst({
                where: or(
                    eq(tasks.assignedToUserId, userId),
                    eq(tasks.createdBy, userId)
                )
            }),
        ]);

        if (managedClients || createdOrders || userTasks) {
            return {
                success: false,
                error: "Нельзя удалить сотрудника, у которого есть история действий (заказы, клиенты или задачи). Пожалуйста, сначала передайте его дела другому сотруднику."
            };
        }

        await db.delete(users).where(eq(users.id, userId));

        await logSecurityEvent({
            eventType: "record_delete",
            severity: "warning",
            entityType: "user",
            entityId: userId,
            details: { deletedBy: currentUser.id, isSystem: userToDelete?.isSystem }
        });

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/users",
            method: "deleteUser",
            details: { userId }
        });
        console.error("Error deleting user:", error);
        return { success: false, error: "Ошибка при удалении пользователя. Возможно, он связан с другими записями." };
    }
}

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

        // Build filtering conditions
        const conditions = [];

        if (search) {
            const searchPattern = `%${search}%`;
            // Find users matching search to filter by userId
            const matchingUsers = await db.query.users.findMany({
                where: ilike(users.name, searchPattern),
                columns: { id: true }
            });
            const matchingUserIds = matchingUsers.map(u => u.id);

            const searchConditions = [
                ilike(auditLogs.action, searchPattern),
                ilike(auditLogs.entityType, searchPattern),
            ];

            if (matchingUserIds.length > 0) {
                searchConditions.push(inArray(auditLogs.userId, matchingUserIds));
            }

            conditions.push(or(...searchConditions)!);
        }

        if (userId) {
            conditions.push(eq(auditLogs.userId, userId));
        }

        if (entityType) {
            conditions.push(eq(auditLogs.entityType, entityType));
        }

        if (startDate) {
            conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push(lte(auditLogs.createdAt, end));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // 1. Get Total Count for Pagination
        const totalRes = await db.select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(whereClause);
        const total = Number(totalRes[0]?.count || 0);

        // 2. Get Paginated Data
        const logs = await db.select()
            .from(auditLogs)
            .where(whereClause)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);

        // 3. Fetch users for mapping
        const logUserIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as string[];
        const relatedUsers = logUserIds.length > 0
            ? await db.query.users.findMany({ where: inArray(users.id, logUserIds) })
            : [];

        const userMap = new Map(relatedUsers.map((u) => [u.id, u] as const));

        const enrichedLogs = logs.map((log) => ({
            ...log,
            user: log.userId ? userMap.get(log.userId) : null
        }));

        return {
            success: true,
            data: {
                logs: enrichedLogs,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/audit",
            method: "getAuditLogs",
            details: { page, limit, search, userId, entityType, startDate, endDate }
        });
        console.error("Error fetching audit logs:");
        return { success: false, error: "Не удалось загрузить audit logs" };
    }
}

export async function updateRolePermissions(roleId: string, permissions: Record<string, unknown>) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await requireAdmin(session);

        await db.update(roles)
            .set({ permissions })
            .where(eq(roles.id, roleId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Изменение прав доступа роли`,
            entityType: "role",
            entityId: roleId,
            details: { permissions }
        });

        revalidatePath("/admin-panel/roles");
        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/roles/${roleId}/permissions`,
            method: "updateRolePermissions",
            details: { roleId }
        });
        console.error("Error updating role permissions:");
        return { success: false, error: "Не удалось обновить permissions" };
    }
}

export async function updateRole(roleId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (session.roleName !== "Администратор") {
        return { success: false, error: "Только администратор может редактировать роли" };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validation = UpdateRoleSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, departmentId, color } = validation.data;

    try {
        const role = await db.query.roles.findFirst({
            where: eq(roles.id, roleId)
        });

        if (role?.isSystem && name !== role.name) {
            return { success: false, error: "Нельзя переименовать системную роль, так как на её название завязаны проверки в коде" };
        }

        await db.update(roles)
            .set({
                name,
                departmentId: departmentId || null,
                color: color
            })
            .where(eq(roles.id, roleId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Редактирование роли: ${name}`,
            entityType: "role",
            entityId: roleId,
            details: { name, departmentId, color }
        });

        revalidatePath("/admin-panel/roles");
        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/roles/${roleId}`,
            method: "updateRole",
            details: { roleId, name }
        });
        console.error("Error updating role:");
        return { success: false, error: "Роль с таким названием уже существует" };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    // Verify current user is admin
    if (session.roleName !== "Администратор") {
        return { success: false, error: "Только администратор может редактировать сотрудников" };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validation = UpdateUserSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, email, roleId, departmentId } = validation.data;
    const password = formData.get("password") as string;

    try {
        const updateData: Partial<typeof users.$inferInsert> = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (roleId) updateData.roleId = roleId;
        updateData.departmentId = departmentId || null;

        if (password) {
            updateData.passwordHash = await hashPassword(password);
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/users/${userId}`,
            method: "updateUser",
            details: { userId, name, email, roleId }
        });
        console.error("Error updating user:");
        return { success: false, error: "Ошибка при обновлении данных пользователя. Возможно, такой email уже занят." };
    }
}

export async function createRole(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    // Verify current user is admin
    if (session.roleName !== "Администратор") {
        return { success: false, error: "Только администратор может создавать роли" };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validation = CreateRoleSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, departmentId } = validation.data;
    const color = formData.get("color") as string || null;

    const permissionsJson = formData.get("permissions") as string;
    let permissions: Record<string, unknown> = {};
    try {
        if (permissionsJson) {
            permissions = JSON.parse(permissionsJson);
        }
    } catch (e) {
        console.error("Error parsing permissions:", e);
    }

    try {
        const result = await db.insert(roles).values({
            name,
            permissions,
            isSystem: false,
            departmentId: departmentId || null,
            color: color
        }).returning();

        const newRole = result[0];

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Создание роли: ${name}`,
            entityType: "role",
            entityId: newRole.id,
            details: { name, departmentId }
        });

        revalidatePath("/admin-panel/roles");
        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles",
            method: "createRole",
            details: { name, departmentId }
        });
        console.error("Error creating role:");
        return { success: false, error: "Роль с таким названием уже существует" };
    }
}

export async function deleteRole(roleId: string, password?: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    try {
        const currentUser = await requireAdmin(session);
        // Check if users are assigned to this role
        const assignedUsers = await db.query.users.findMany({
            where: eq(users.roleId, roleId),
            limit: 1
        });

        if (assignedUsers.length > 0) {
            return { success: false, error: "Нельзя удалить роль, которая назначена сотрудникам" };
        }

        const role = await db.query.roles.findFirst({
            where: eq(roles.id, roleId)
        });

        if (role?.isSystem) {
            if (!password) {
                return { success: false, error: "Для удаления системной роли требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        await db.delete(roles).where(eq(roles.id, roleId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            action: `Удаление роли: ${role?.name || roleId}`,
            entityType: "role",
            entityId: roleId,
            details: { name: role?.name, isSystem: role?.isSystem }
        });

        revalidatePath("/admin-panel/roles");
        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/roles/${roleId}`,
            method: "deleteRole",
            details: { roleId }
        });
        console.error("Error deleting role:");
        return { success: false, error: "Не удалось удалить роль" };
    }
}

export async function getDepartments() {
    try {
        // 1. Fetch all departments with current users
        const allDepts = await db.query.departments.findMany({
            with: { users: true }
        });

        // Custom sort order based on priority
        const deptPriority: Record<string, number> = {
            "Руководство": 1,
            "Отдел продаж": 2,
            "Производство": 3,
            "Дизайн": 4,
        };

        const sortedDepts = allDepts.sort((a, b) => {
            const priorityA = deptPriority[a.name] || 999;
            const priorityB = deptPriority[b.name] || 999;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return a.name.localeCompare(b.name);
        });

        const dataWithCounts = sortedDepts.map((dept) => ({
            ...dept,
            userCount: dept.users?.length || 0
        }));

        return { success: true, data: dataWithCounts };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments",
            method: "getDepartments"
        });
        console.error("Error fetching departments:");
        return { success: false, error: "Не удалось загрузить отделы" };
    }
}

export async function createDepartment(formData: FormData, roleIds?: string[]) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const rawData = Object.fromEntries(formData.entries());
    const validation = CreateDepartmentSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, description, color } = validation.data;

    try {
        const result = await db.insert(departments).values({
            name,
            description,
            color,
        }).returning();

        const newDept = result[0];

        // Link roles if provided
        if (roleIds && roleIds.length > 0) {
            for (const roleId of roleIds) {
                await db.update(roles)
                    .set({ departmentId: newDept.id })
                    .where(eq(roles.id, roleId));
            }
        }

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Создание отдела: ${name}`,
            entityType: "department",
            entityId: newDept.id,
            details: { name, description, linkedRoles: roleIds?.length || 0 }
        });

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments",
            method: "createDepartment",
            details: { name }
        });
        console.error("Error creating department:");
        return { success: false, error: "Отдел с таким названием уже существует" };
    }
}

export async function impersonateUser(userId: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await requireAdmin(session);
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
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
            impersonatorId: session.impersonatorId || session.id, // Keep the root impersonator if already impersonating (though UI won't allow)
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
            details: {
                adminId: session.id!,
                targetUserId: targetUser.id,
                targetUserName: targetUser.name
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error starting impersonation:", error);
        return { success: false, error: "Не удалось start impersonation" };
    }
}

export async function stopImpersonating() {
    const session = await getSession();
    if (!session || !session.impersonatorId) {
        return { success: false, error: "Вы не находитесь в режиме имперсонации" };
    }

    const originalAdminId = session.impersonatorId;

    const adminUser = await db.query.users.findFirst({
        where: eq(users.id, originalAdminId),
        with: { role: true, department: true }
    });

    if (!adminUser) return { success: false, error: "Оригинальный администратор не найден" };

    try {
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
            details: {
                adminId: adminUser.id,
                stoppedImpersonating: session.id
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error stopping impersonation:", error);
        return { success: false, error: "Не удалось return to admin mode" };
    }
}

export async function updateDepartment(deptId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const rawData = Object.fromEntries(formData.entries());
    const validation = UpdateDepartmentSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, description, color } = validation.data;

    try {
        await db.update(departments)
            .set({ name, description, color })
            .where(eq(departments.id, deptId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Редактирование отдела: ${name}`,
            entityType: "department",
            entityId: deptId,
            details: { name, description }
        });

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/departments/${deptId}`,
            method: "updateDepartment",
            details: { deptId, name }
        });
        console.error("Error updating department:");
        return { success: false, error: "Не удалось обновить отдел" };
    }
}

export async function deleteDepartment(deptId: string, password?: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        // Check if users are assigned to this department
        const assignedUsers = await db.query.users.findMany({
            where: eq(users.departmentId, deptId),
            limit: 1
        });

        if (assignedUsers.length > 0) {
            return { success: false, error: "Нельзя удалить отдел, в котором есть сотрудники" };
        }

        const dept = await db.query.departments.findFirst({
            where: eq(departments.id, deptId)
        });

        if (dept?.isSystem) {
            if (!password) {
                return { success: false, error: "Для удаления системного отдела требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        await db.delete(departments).where(eq(departments.id, deptId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Удаление отдела: ${dept?.name || deptId}`,
            entityType: "department",
            entityId: deptId,
            details: { name: dept?.name, isSystem: dept?.isSystem }
        });

        revalidatePath("/admin-panel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/departments/${deptId}`,
            method: "deleteDepartment",
            details: { deptId }
        });
        console.error("Error deleting department:");
        return { success: false, error: "Не удалось удалить отдел" };
    }
}
export async function getRolesByDepartment(departmentId: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const departmentRoles = await db.query.roles.findMany({
            where: eq(roles.departmentId, departmentId),
            orderBy: [asc(roles.name)]
        });
        return { success: true, data: departmentRoles };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments",
            method: "getRolesByDepartment",
            details: { departmentId }
        });
        console.error("Error fetching department roles:");
        return { success: false, error: "Не удалось загрузить отдел роли" };
    }
}

export async function updateRoleDepartment(roleId: string, departmentId: string | null) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    try {
        const currentUser = await requireAdmin(session);
        await db.update(roles)
            .set({ departmentId })
            .where(eq(roles.id, roleId));

        const role = await db.query.roles.findFirst({
            where: eq(roles.id, roleId)
        });

        // Audit Log
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            action: departmentId
                ? `Добавление роли «${role?.name}» в отдел`
                : `Удаление роли «${role?.name}» из отдела`,
            entityType: "role",
            entityId: roleId,
            details: { departmentId, roleName: role?.name }
        });

        revalidatePath("/admin-panel/departments");
        revalidatePath("/admin-panel/roles");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/admin-panel/roles/${roleId}/department`,
            method: "updateRoleDepartment",
            details: { roleId, departmentId }
        });
        console.error("Error updating role department:");
        return { success: false, error: "Не удалось обновить роль отдел" };
    }
}

export async function getSystemStats() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        // 1. OS Stats
        const cpuLoad = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const uptime = os.uptime();

        // 2. Database Stats
        let dbSize = 0;
        try {
            // Drizzle returns raw rows; for pg_database_size we need to parse carefully
            const dbSizeResult = await withTimeout(db.execute(sql`SELECT pg_database_size(current_database())`), 2000);

            const rows = dbSizeResult.rows as { pg_database_size: string }[];
            dbSize = parseInt(rows[0]?.pg_database_size || "0");
        } catch (e) {
            console.error("Failed to get db size:", e);
        }

        const fetchCount = async (table: PgTable) => {
            try {
                const res = await withTimeout(db.select({ value: count() }).from(table), 2000);
                return res[0].value;
            } catch (e) {
                console.error("Failed to count table:", e);
                return 0;
            }
        };

        const [usersCount, ordersCount, clientsCount, auditLogsCount, inventoryItemsCount] = await Promise.all([
            fetchCount(users),
            fetchCount(orders),
            fetchCount(clients),
            fetchCount(auditLogs),
            fetchCount(inventoryItems),
        ]);

        const tableCounts = {
            users: usersCount,
            orders: ordersCount,
            clients: clientsCount,
            auditLogs: auditLogsCount,
            inventoryItems: inventoryItemsCount,
        };

        // 3. Storage Stats (S3)
        let storageStats = { size: 0, fileCount: 0 };
        try {
            const { getStorageStats } = await import("@/lib/storage");
            // Set a very short timeout for storage stats as it can be very slow
            storageStats = await withTimeout(getStorageStats(), 1000);
        } catch (e) {
            console.error("Failed to get storage stats (timeout):", e);
        }


        // Disk usage check (available space on host/container volume)
        let diskStats = { total: 0, free: 0 };
        try {
            // fs.statfsSync is available in Node 18+
            const stat = fs.statfsSync(process.cwd());
            diskStats = {
                total: Number(stat.bsize * stat.blocks),
                free: Number(stat.bsize * stat.bfree)
            };
        } catch (e) {
            console.error("Error fetching disk stats:", e);
        }

        // Auto-backup info (actual backups handled by /api/cron/backup)
        let lastBackupAt: string | null = null;
        try {
            const lastBackupSetting = await db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, "last_backup_at")
            });
            lastBackupAt = lastBackupSetting?.value ? (lastBackupSetting.value as string) : null;
        } catch (e) {
            console.error("Error fetching last_backup_at:", e);
        }

        return {
            success: true,
            data: {
                server: {
                    // Normalize loadavg by the number of cores for better UI representation
                    cpuLoad: cpuLoad.map(l => (l / os.cpus().length) * 10),
                    totalMem,
                    freeMem,
                    uptime,
                    platform: os.platform(),
                    arch: os.arch(),
                    disk: diskStats
                },
                database: {
                    size: dbSize,
                    tableCounts
                },
                storage: {
                    size: storageStats.size,
                    fileCount: storageStats.fileCount
                }
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/stats",
            method: "getSystemStats"
        });
        console.error("Error fetching system stats:");
        return { success: false, error: "Не удалось получить системные показатели" };
    }
}

export async function clearAuditLogs() {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);
        await db.delete(auditLogs);

        // Log this action as the last standing log
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            action: "Логи аудита очищены",
            entityType: "system",
            entityId: currentUser.id, // required field, using currentUser.id as placeholder
            createdAt: new Date()
        });

        revalidatePath("/admin-panel/audit");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/audit",
            method: "clearAuditLogs"
        });
        console.error("Error clearing audit logs:");
        return { success: false, error: "Не удалось clear audit logs" };
    }
}

export async function checkSystemHealth() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };


    interface HealthStatus {
        database: { status: string; latency: number };
        storage: { status: string };
        api: { status: string; latency: number };
        overall: string;
        env: { status: string; details: string[] };
        fs: { status: string; message: string };
        backup: { status: string; lastBackup: string | null };
        jwt: { status: string; message: string };
        timestamp: Date;
    }

    const health: HealthStatus = {
        database: { status: "loading", latency: 0 },
        storage: { status: "loading" },
        api: { status: "loading", latency: 0 },
        overall: "loading",
        env: { status: "loading", details: [] },
        fs: { status: "loading", message: "" },
        backup: { status: "loading", lastBackup: null },
        jwt: { status: "loading", message: "" },
        timestamp: new Date()
    };

    try {
        // 1. Database Ping & Latency
        const startDb = Date.now();
        await withTimeout(db.execute(sql`SELECT 1`), 2000);
        health.database.latency = Date.now() - startDb;
        health.database.status = "ok";

        // 2. Storage Check (S3)
        try {
            const { uploadFile, s3Client } = await import("@/lib/storage");
            const testKey = `health-check-${Date.now()}.txt`;
            await withTimeout(uploadFile(testKey, Buffer.from("health-check"), "text/plain"), 5000);

            // Delete the test file immediately
            const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
            const bucket = process.env.S3_BUCKET || process.env.REG_STORAGE_BUCKET || "";
            await withTimeout(s3Client.send(new DeleteObjectCommand({
                Bucket: bucket,
                Key: testKey
            })), 5000);

            health.storage.status = "ok";
        } catch (e) {
            console.error("Storage health check failed:", e);
            health.storage.status = "error";
        }

        // 3. Environment Check
        const criticalVars = ["DATABASE_URL", "JWT_SECRET_KEY", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_ENDPOINT", "S3_BUCKET"];
        const missing = criticalVars.filter(v => !process.env[v]);
        health.env.status = missing.length === 0 ? "ok" : "warning";
        health.env.details = missing;

        // 4. File System Check
        try {
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const testFile = path.join(uploadDir, ".write-test");
            fs.writeFileSync(testFile, "test");
            fs.unlinkSync(testFile);
            health.fs.status = "ok";
        } catch (e) {
            console.error("FS check failed:", e);
            health.fs.status = "error";
        }

        // 5. Backup Integrity Check
        try {
            const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
            if (fs.existsSync(backupDir)) {
                const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json"));
                if (files.length > 0) {
                    const latest = files.sort().reverse()[0];
                    const stats = fs.statSync(path.join(backupDir, latest));
                    health.backup.status = stats.size > 1024 ? "ok" : "warning"; // At least 1KB
                } else {
                    health.backup.status = "none";
                }
            } else {
                health.backup.status = "none";
            }
        } catch {
            health.backup.status = "error";
        }

        // 6. JWT Auth Check
        try {
            const { encrypt, decrypt } = await import("@/lib/auth");
            const testPayload = { ...session, test: true };

            const token = await encrypt(testPayload);
            const decrypted = await decrypt(token);
            health.jwt.status = decrypted.id === session.id ? "ok" : "error";
        } catch (e) {
            console.error("JWT check failed:", e);
            health.jwt.status = "error";
        }

        return { success: true, data: health };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/health",
            method: "checkSystemHealth"
        });
        console.error("Health check error:");
        return { success: false, error: "Ошибка при выполнении диагностики" };
    }
}

export async function createDatabaseBackup() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const result = await performDatabaseBackup(session.id, "manual");
        if (result.success) {
            return { success: true, fileName: result.fileName };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backup",
            method: "createDatabaseBackup"
        });
        console.error("Backup creation error:", error);
        return { success: false, error: "Не удалось создать резервную копию" };
    }
}

export async function getBackupsList() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) return { success: true, data: [] };

        const files = await fs.promises.readdir(backupDir);
        const backupPromises = files
            .filter((f: string) => f.endsWith(".json"))
            .map(async (f: string) => {
                const stats = await fs.promises.stat(path.join(backupDir, f));
                return {
                    name: f,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString()
                };
            });

        const backups = (await Promise.all(backupPromises))
            .sort((a: BackupFile, b: BackupFile) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { success: true, data: backups as BackupFile[] };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backups",
            method: "getBackupsList"
        });
        return { success: false, error: "Не удалось получить список копий" };
    }
}

export async function deleteBackupAction(fileName: string) {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        const filePath = path.join(backupDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);

            await db.insert(auditLogs).values({
                userId: currentUser.id,
                action: `Удалена резервная копия: ${fileName}`,
                entityType: "system",
                entityId: currentUser.id,
                createdAt: new Date()
            });

            return { success: true };
        }
        return { success: false, error: "Файл не найден" };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backup/delete",
            method: "deleteBackupAction",
            details: { fileName }
        });
        return { success: false, error: "Ошибка при удалении" };
    }
}

export async function getSystemSettings() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const settings = await db.select().from(systemSettings);
        const settingsMap: Record<string, string | number | boolean | null> = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value as string | number | boolean | null;
        });
        return { success: true, data: settingsMap };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/settings",
            method: "getSystemSettings"
        });
        return { success: false, error: "Не удалось загрузить settings" };
    }
}

export async function updateSystemSetting(key: string, value: string | number | boolean | null) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        await db.insert(systemSettings).values({
            key,
            value,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value, updatedAt: new Date() }
        });

        revalidatePath("/admin-panel/settings");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/settings",
            method: "updateSystemSetting",
            details: { key }
        });
        console.error("Error updating system setting:", error);
        return { success: false, error: "Не удалось обновить setting" };
    }
}

export async function getBrandingAction() {
    try {
        const setting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });

        const defaultBranding = {
            companyName: "MerchCRM",
            logoUrl: null,
            primary_color: "#5d00ff",
            faviconUrl: null,
            radius_outer: 24,
            radius_inner: 14,
            currencySymbol: "₽"
        };

        if (!setting) return { success: true, data: defaultBranding };

        // Handle both camelCase and snake_case for compatibility
        const val = setting.value as Record<string, unknown>;
        return {
            success: true,
            data: {
                ...defaultBranding,
                ...val,
                primary_color: (val.primary_color as string) || (val.primaryColor as string) || "#5d00ff",
                system_logo: (val.system_logo as string) || (val.logoUrl as string) || (val.logo_url as string) || null,
                faviconUrl: (val.faviconUrl as string) || (val.favicon_url as string) || null
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "getBrandingAction"
        });
        console.error("Error fetching branding:", error);
        return { success: true, data: { primary_color: "#5d00ff" } };
    }
}

export async function updateBrandingAction(data: Record<string, unknown>) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        // Ensure primary_color is saved
        const saveData = { ...data };
        if (saveData.primaryColor && !saveData.primary_color) {
            saveData.primary_color = saveData.primaryColor;
        }

        await db.insert(systemSettings)
            .values({ key: "branding", value: saveData })
            .onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: saveData, updatedAt: new Date() }
            });

        revalidatePath("/", "layout");
        await logAction("Изменение внешнего вида системы", "system", "branding", saveData);
        return { success: true };
    } catch (error) {
        console.error("Error updating branding:", error);
        return { success: false, error: "Не удалось обновить branding" };
    }
}
export async function clearRamAction() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        if (global.gc) {
            global.gc();
            return { success: true, message: "Сборщик мусора запущен успешно" };
        } else {
            return {
                success: false,
                error: "Сборщик мусора недоступен. Запустите Node.js с флагом --expose-gc",
                details: "Однако, некоторые внутренние буферы могут быть очищены при обращении к этой функции."
            };
        }
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/ram",
            method: "clearRamAction"
        });
        return { success: false, error: "Ошибка при очистке памяти" };
    }
}

export async function restartServerAction() {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);
        // Record the restart event in audit logs
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            action: "SERVER_RESTART",
            entityType: "SYSTEM",
            entityId: SYSTEM_ENTITY_ID,
            details: { info: "Пользователь инициировал перезапуск сервера через панель управления" },
            createdAt: new Date()
        });

        // Use setTimeout to allow the response to reach the client and logs to be saved
        setTimeout(() => {
            console.log("Server restart initiated by admin...");
            process.exit(0); // Exit with success. Supervisor (pm2/docker) should restart it.
        }, 1000);

        return { success: true, message: "Перезапуск инициирован. Система будет недоступна 10-30 секунд." };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/restart",
            method: "restartServerAction"
        });
        return { success: false, error: "Ошибка при инициализации перезапуска" };
    }
}

export async function trackActivity(): Promise<void> {
    const session = await getSession();
    if (!session) return;

    try {
        await db.update(users)
            .set({ lastActiveAt: new Date() })
            .where(eq(users.id, session.id));
    } catch (error) {
        console.error("Failed to track activity:", error);
        // Do not throw, as this is a background task
    }
}

export interface MonitoringStats {
    activeUsers: Array<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role?: string;
        department?: string;
        lastActiveAt: Date | null;
    }>;
    activityStats: Array<{
        hour: number;
        type: string;
        count: number;
    }>;
    entityStats: Array<{
        type: string;
        count: number;
    }>;
}

export interface SecurityStats {
    failedLogins: Array<{
        id: string;
        email: string;
        reason: string;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
    }>;
    sensitiveActions: Array<{
        id: string;
        user: string;
        action: string;
        details: unknown;
        createdAt: Date;
    }>;
    systemErrors: Array<{
        id: string;
        message: string;
        path: string | null;
        method: string | null;
        severity: string;
        ipAddress: string | null;
        createdAt: Date;
    }>;
    maintenanceMode: boolean;
}

export async function getMonitoringStats(): Promise<ActionResult<MonitoringStats>> {
    const session = await getSession();
    try {
        await requireAdmin(session);
        // 2. Get activity stats (audit logs per hour and type for last 24h)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [activeUsers, activityStatsResult, entityStatsResult] = await Promise.all([
            // active sessions
            db.query.users.findMany({
                where: sql`${users.lastActiveAt} > ${fiveMinutesAgo}`,
                with: {
                    role: true,
                    department: true
                },
                limit: 10
            }),
            // activity breakdown
            db.execute(sql`
                SELECT 
                    EXTRACT(HOUR FROM ${auditLogs.createdAt})::int as hour, 
                    ${auditLogs.entityType} as type,
                    count(*)::int as count 
                FROM ${auditLogs} 
                WHERE ${auditLogs.createdAt} > ${twentyFourHoursAgo}
                GROUP BY 1, 2 
                ORDER BY 1, 2
            `),
            // entity stats
            db.execute(sql`
                SELECT 
                    ${auditLogs.entityType} as type, 
                    count(*)::int as count 
                FROM ${auditLogs} 
                WHERE ${auditLogs.createdAt} > ${twentyFourHoursAgo}
                GROUP BY 1 
                ORDER BY 2 DESC
            `)
        ]);

        return {
            success: true,
            data: {
                activeUsers: activeUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    avatar: u.avatar,
                    role: u.role?.name,
                    department: u.department?.name,
                    lastActiveAt: u.lastActiveAt
                })),
                activityStats: (activityStatsResult.rows as unknown as Array<{ hour: number; type: string; count: number }> || []).map((s) => ({
                    hour: Number(s.hour),
                    type: s.type || 'system',
                    count: Number(s.count)
                })),
                entityStats: (entityStatsResult.rows as unknown as Array<{ type: string; count: number }> || []).map((s) => ({
                    type: s.type || 'system',
                    count: Number(s.count)
                }))
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/monitoring",
            method: "getMonitoringStats"
        });
        console.error("Monitoring stats error:");
        return { success: false, error: "Ошибка получения данных мониторинга" };
    }
}

export async function getSecurityStats(): Promise<ActionResult<SecurityStats>> {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [failedLogins, sensitiveActions, errors, maintenanceSetting] = await Promise.all([
            // 1. Failed Logins
            db.query.securityEvents.findMany({
                where: and(
                    eq(securityEvents.eventType, 'login_failed'),
                    gte(securityEvents.createdAt, last24h)
                ),
                orderBy: [desc(securityEvents.createdAt)],
                limit: 20
            }),
            // 2. Sensitive Actions
            db.query.auditLogs.findMany({
                where: and(
                    sql`${auditLogs.action} IN ('password_change', 'email_change', 'profile_update')`,
                    gte(auditLogs.createdAt, last24h)
                ),
                with: {
                    user: true
                },
                orderBy: [desc(auditLogs.createdAt)],
                limit: 50
            }),
            // 3. System Errors
            db.query.systemErrors.findMany({
                where: gte(systemErrors.createdAt, last24h),
                orderBy: [desc(systemErrors.createdAt)],
                limit: 100
            }),
            // 4. Maintenance Mode Status
            db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, 'maintenance_mode')
            })
        ]);

        return {
            success: true,
            data: {
                failedLogins: failedLogins.map(l => ({
                    id: l.id,
                    email: (l.details as Record<string, unknown>)?.email as string || 'Unknown',
                    reason: (l.details as Record<string, unknown>)?.reason as string || 'Unknown',
                    ipAddress: l.ipAddress,
                    userAgent: l.userAgent,
                    createdAt: l.createdAt
                })),
                sensitiveActions: sensitiveActions.map(l => ({
                    id: l.id,
                    user: l.user?.name || 'Unknown',
                    action: l.action,
                    details: l.details,
                    createdAt: l.createdAt
                })),
                systemErrors: errors.map(e => ({
                    id: e.id,
                    message: e.message,
                    path: e.path,
                    method: e.method,
                    severity: e.severity,
                    ipAddress: e.ipAddress,
                    createdAt: e.createdAt
                })),
                maintenanceMode: maintenanceSetting?.value === true
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/security/stats",
            method: "getSecurityStats"
        });
        console.error("Security stats error:", error);
        return { success: false, error: "Ошибка получения данных безопасности" };
    }
}

export async function clearSecurityErrors() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        await db.delete(systemErrors);
        // Also clear system_error events from security_events for consistency
        await db.delete(securityEvents).where(eq(securityEvents.eventType, 'system_error'));

        await logAction("Очистка системных ошибок", "system", "system");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/security/clear-errors",
            method: "clearSecurityErrors"
        });
        console.error(error);
        return { success: false, error: "Не удалось clear errors" };
    }
}

export async function clearFailedLogins() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        await db.delete(securityEvents).where(eq(securityEvents.eventType, 'login_failed'));
        revalidatePath('/admin-panel/monitoring');
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/security/clear-logins",
            method: "clearFailedLogins"
        });
        console.error("Clear failed logins error:", error);
        return { success: false, error: "Ошибка при очистке попыток входа" };
    }
}

export async function toggleMaintenanceMode(enabled: boolean) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        await db.insert(systemSettings)
            .values({ key: 'maintenance_mode', value: enabled, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: [systemSettings.key],
                set: { value: enabled, updatedAt: new Date() }
            });

        // Log maintenance mode toggle
        await logSecurityEvent({
            eventType: "maintenance_mode_toggle",
            userId: session.id,
            severity: "critical",
            entityType: "system_settings",
            details: {
                enabled,
                toggledBy: session.name
            }
        });
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/maintenance",
            method: "toggleMaintenanceMode",
            details: { enabled }
        });
        console.error("Maintenance mode error:", error);
        return { success: false, error: "Ошибка переключения режима" };
    }
}

/**
 * Get security events with filtering and pagination
 */
export async function getSecurityEvents({
    page = 1,
    limit = 50,
    eventType,
    severity,
    userId,
    startDate,
    endDate
}: {
    page?: number;
    limit?: number;
    eventType?: string;
    severity?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
} = {}) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const offset = (page - 1) * limit;

        // Build where conditions
        const conditions = [];

        if (eventType) {
            conditions.push(eq(securityEvents.eventType, eventType as "login_success" | "login_failed" | "logout" | "password_change" | "email_change" | "profile_update" | "role_change" | "permission_change" | "data_export" | "record_delete" | "settings_change" | "maintenance_mode_toggle" | "system_error"));
        }

        if (severity) {
            conditions.push(eq(securityEvents.severity, severity));
        }

        if (userId) {
            conditions.push(eq(securityEvents.userId, userId));
        }

        if (startDate) {
            conditions.push(gte(securityEvents.createdAt, startDate));
        }

        if (endDate) {
            conditions.push(sql`${securityEvents.createdAt} <= ${endDate}`);
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const totalResult = await db
            .select({ count: count() })
            .from(securityEvents)
            .where(whereClause);
        const total = Number(totalResult[0]?.count || 0);

        // Get events
        const events = await db.query.securityEvents.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [desc(securityEvents.createdAt)],
            limit,
            offset
        });

        return {
            success: true,
            data: {
                events: events.map(e => ({
                    id: e.id,
                    eventType: e.eventType,
                    severity: e.severity,
                    ipAddress: e.ipAddress,
                    userAgent: e.userAgent,
                    entityType: e.entityType,
                    entityId: e.entityId,
                    details: e.details,
                    createdAt: e.createdAt,
                    user: e.user ? {
                        id: e.user.id,
                        name: e.user.name,
                        email: e.user.email
                    } : null
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/security/events",
            method: "getSecurityEvents",
            details: { page, limit, eventType, severity }
        });
        console.error("Security events error:", error);
        return { success: false, error: "Ошибка получения событий безопасности" };
    }
}

/**
 * Get security events summary for dashboard
 */
export async function getSecurityEventsSummary() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Get event counts by type
        const eventCounts = await db
            .select({
                eventType: securityEvents.eventType,
                severity: securityEvents.severity,
                count: count()
            })
            .from(securityEvents)
            .where(gte(securityEvents.createdAt, last24h))
            .groupBy(securityEvents.eventType, securityEvents.severity);

        // Calculate totals
        const loginAttempts = eventCounts
            .filter(e => e.eventType === 'login_success' || e.eventType === 'login_failed')
            .reduce((sum, e) => sum + Number(e.count), 0);

        const successfulLogins = eventCounts
            .filter(e => e.eventType === 'login_success')
            .reduce((sum, e) => sum + Number(e.count), 0);

        const permissionChanges = eventCounts
            .filter(e => e.eventType === 'role_change' || e.eventType === 'permission_change')
            .reduce((sum, e) => sum + Number(e.count), 0);

        const dataExports = eventCounts
            .filter(e => e.eventType === 'data_export')
            .reduce((sum, e) => sum + Number(e.count), 0);

        const criticalEvents = eventCounts
            .filter(e => e.severity === 'critical')
            .reduce((sum, e) => sum + Number(e.count), 0);

        // Get recent critical events
        const recentCritical = await db.query.securityEvents.findMany({
            where: and(
                eq(securityEvents.severity, 'critical'),
                gte(securityEvents.createdAt, last24h)
            ),
            with: {
                user: {
                    columns: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [desc(securityEvents.createdAt)],
            limit: 5
        });

        return {
            success: true,
            data: {
                summary: {
                    loginAttempts,
                    successfulLogins,
                    failedLogins: loginAttempts - successfulLogins,
                    permissionChanges,
                    dataExports,
                    criticalEvents
                },
                recentCritical: recentCritical.map(e => ({
                    id: e.id,
                    eventType: e.eventType,
                    userName: e.user?.name || 'Unknown',
                    details: e.details,
                    createdAt: e.createdAt
                }))
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/security/summary",
            method: "getSecurityEventsSummary"
        });
        console.error("Security events summary error:", error);
        return { success: false, error: "Ошибка получения сводки безопасности" };
    }
}

// Storage Management Actions
export async function getStorageDetails(prefix?: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { listFiles, getStorageStats } = await import("@/lib/storage");
        const s3Stats = await getStorageStats();
        const s3Content = await listFiles(prefix);

        const stat = fs.statfsSync(process.cwd());
        const localStats = {
            total: Number(stat.bsize * stat.blocks),
            free: Number(stat.bsize * stat.bfree),
            used: Number(stat.bsize * (stat.blocks - stat.bfree)),
            path: process.cwd(),
        };

        return {
            success: true,
            data: {
                s3: {
                    ...s3Stats,
                    folders: s3Content.folders,
                    files: s3Content.files
                },
                local: localStats
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/details",
            method: "getStorageDetails",
            details: { prefix }
        });
        console.error("Storage details error:", error);
        return { success: false, error: "Ошибка при получении данных хранилища" };
    }
}

export async function deleteS3FileAction(key: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { deleteFile } = await import("@/lib/storage");
        const res = await deleteFile(key);
        if (res.success) {
            await logAction("Удален файл S3", "s3_storage", "system", { key });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/delete",
            method: "deleteS3FileAction",
            details: { key }
        });
        console.error("Delete file error:", error);
        return { success: false, error: "Ошибка при удалении файла" };
    }
}
export async function createS3FolderAction(path: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { createFolder } = await import("@/lib/storage");
        const res = await createFolder(path);
        if (res.success) {
            await logAction("Создана папка S3", "s3_storage", "system", { path });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/folder",
            method: "createS3FolderAction",
            details: { path }
        });
        console.error("Create folder error:", error);
        return { success: false, error: "Ошибка при создании папки" };
    }
}

// Local Storage Management Actions
export async function getLocalStorageDetails(prefix?: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { listLocalFiles, getLocalStorageStats } = await import("@/lib/local-storage");
        const stats = await getLocalStorageStats();
        const content = await listLocalFiles(prefix || "");

        return {
            stats,
            folders: content.folders,
            files: content.files
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/local",
            method: "getLocalStorageDetails",
            details: { prefix }
        });
        console.error("Local storage details error:", error);
        return { success: false, error: "Ошибка при получении данных локального хранилища" };
    }
}

export async function createLocalFolderAction(folderPath: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { createLocalFolder } = await import("@/lib/local-storage");
        const res = await createLocalFolder(folderPath);
        if (res.success) {
            await logAction("Создана локальная папка", "local_storage", "system", { path: folderPath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/local/folder",
            method: "createLocalFolderAction",
            details: { folderPath }
        });
        console.error("Create local folder error:", error);
        return { success: false, error: "Ошибка при создании папки" };
    }
}

export async function deleteLocalFileAction(filePath: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { deleteLocalFile } = await import("@/lib/local-storage");
        const res = await deleteLocalFile(filePath);
        if (res.success) {
            await logAction("Удален локальный файл", "local_storage", "system", { path: filePath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/local/delete",
            method: "deleteLocalFileAction",
            details: { filePath }
        });
        console.error("Delete local file error:", error);
        return { success: false, error: "Ошибка при удалении файла" };
    }
}

export async function renameS3FileAction(oldKey: string, newKey: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { renameFile } = await import("@/lib/storage");
        const res = await renameFile(oldKey, newKey);
        if (res.success) {
            await logAction("Переименован файл S3", "s3_storage", "system", { oldKey, newKey });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/rename",
            method: "renameS3FileAction",
            details: { oldKey, newKey }
        });
        console.error("Rename file error:", error);
        return { success: false, error: "Ошибка при переименовании" };
    }
}

export async function deleteMultipleS3FilesAction(keys: string[]) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { deleteMultipleFiles } = await import("@/lib/storage");
        const res = await deleteMultipleFiles(keys);
        if (res.success) {
            await logAction("Удалено несколько файлов S3", "s3_storage", "system", { count: keys.length, keys });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/bulk-delete",
            method: "deleteMultipleS3FilesAction",
            details: { count: keys.length }
        });
        console.error("Delete multiple files error:", error);
        return { success: false, error: "Ошибка при удалении файлов" };
    }
}

export async function renameLocalFileAction(oldPath: string, newPath: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { renameLocalFile } = await import("@/lib/local-storage");
        const res = await renameLocalFile(oldPath, newPath);
        if (res.success) {
            await logAction("Переименован локальный файл", "local_storage", "system", { oldPath, newPath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/local/rename",
            method: "renameLocalFileAction",
            details: { oldPath, newPath }
        });
        console.error("Rename local file error:", error);
        return { success: false, error: "Ошибка при переименовании" };
    }
}

export async function deleteMultipleLocalFilesAction(filePaths: string[]) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { deleteMultipleLocalFiles } = await import("@/lib/local-storage");
        const res = await deleteMultipleLocalFiles(filePaths);
        if (res.success) {
            await logAction("Удалено несколько локальных файлов", "local_storage", "system", { count: filePaths.length, paths: filePaths });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/local/bulk-delete",
            method: "deleteMultipleLocalFilesAction",
            details: { count: filePaths.length }
        });
        console.error("Delete multiple local files error:", error);
        return { success: false, error: "Ошибка при удалении файлов" };
    }
}

export async function getS3FileUrlAction(key: string) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { success: false, error: "Доступ запрещен" };

    try {
        const { getFileUrl } = await import("@/lib/storage");
        const url = await getFileUrl(key);
        return { success: true, data: url };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/storage/url",
            method: "getS3FileUrlAction",
            details: { key }
        });
        console.error("Get file URL error:", error);
        return { success: false, error: "Ошибка при получении ссылки на файл" };
    }
}


export interface NotificationSettings {
    system: {
        enabled: boolean;
        browserPush: boolean;
        [key: string]: boolean;
    };
    telegram: {
        enabled: boolean;
        botToken: string;
        chatId: string;
        notifyOnNewOrder: boolean;
        notifyOnLowStock: boolean;
        notifyOnSystemError: boolean;
        [key: string]: boolean | string;
    };
    events: {
        new_order: boolean;
        order_status_change: boolean;
        stock_low: boolean;
        task_assigned: boolean;
        [key: string]: boolean;
    };
}

export async function getNotificationSettingsAction() {
    try {
        const setting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "notifications")
        });

        const defaultSettings: NotificationSettings = {
            system: {
                enabled: true,
                browserPush: false
            },
            telegram: {
                enabled: false,
                botToken: "",
                chatId: "",
                notifyOnNewOrder: true,
                notifyOnLowStock: true,
                notifyOnSystemError: true
            },
            events: {
                new_order: true,
                order_status_change: true,
                stock_low: true,
                task_assigned: true,
                system_error: false,
                big_payment: false,
                client_update: false,
                security_alert: false
            }
        };

        if (!setting) return { success: true, data: defaultSettings };
        return { success: true, data: { ...defaultSettings, ...(setting.value as unknown as Partial<NotificationSettings>) } };
    } catch (error) {
        console.error("Error fetching notification settings:", error);
        return { success: true, data: null, error: "Не удалось загрузить settings" };
    }
}

export async function updateNotificationSettingsAction(data: NotificationSettings) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        await db.insert(systemSettings)
            .values({ key: "notifications", value: data, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: data, updatedAt: new Date() }
            });

        revalidatePath("/admin-panel/notifications");
        await logAction("Изменение настроек уведомлений", "system", "notifications", data as unknown as Record<string, unknown>);
        return { success: true };
    } catch (error) {
        console.error("Error updating notification settings:", error);
        return { success: false, error: "Не удалось обновить settings" };
    }
}
