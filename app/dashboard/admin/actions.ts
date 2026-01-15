"use server";

import { db } from "@/lib/db";
import { users, roles, auditLogs, departments, clients, orders, inventoryCategories, inventoryItems, storageLocations, tasks, systemSettings } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { eq, asc, desc, isNull, sql, and, inArray, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import os from "os";
import fs from "fs";
import path from "path";

export interface BackupFile {
    name: string;
    size: number;
    createdAt: string;
}

export async function getUsers(page = 1, limit = 20, search = "") {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        const offset = (page - 1) * limit;

        const whereClause = search
            ? sql`lower(${users.name}) LIKE ${`%${search.toLowerCase()}%`} OR lower(${users.email}) LIKE ${`%${search.toLowerCase()}%`}`
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
            department: user.department?.name || null
        }));

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch {
        console.error("Error fetching users:");
        return { error: "Failed to fetch users" };
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

        return { data: sortedRoles };
    } catch {
        console.error("Error fetching roles:");
        return { error: "Failed to fetch roles" };
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может создавать сотрудников" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleId = formData.get("roleId") as string;
    const department = formData.get("department") as string;
    const departmentId = formData.get("departmentId") as string;

    // Safety sync: find departmentId by name if not provided
    let finalDeptId = departmentId || null;
    if (!finalDeptId && department) {
        const matchedDept = await db.query.departments.findFirst({
            where: eq(departments.name, department)
        });
        if (matchedDept) finalDeptId = matchedDept.id;
    }

    if (!name || !email || !password || !roleId) {
        return { error: "Заполните все обязательные поля" };
    }

    try {
        const hashedPassword = await hashPassword(password);
        await db.insert(users).values({
            name,
            email,
            passwordHash: hashedPassword,
            roleId,
            departmentId: finalDeptId
        });

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error creating user:");
        return { error: "Пользователь с таким email уже существует" };
    }
}

export async function updateUserRole(userId: string, roleId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может менять роли сотрудников" };
    }

    try {
        await db.update(users)
            .set({ roleId })
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error updating user role:");
        return { error: "Failed to update user role" };
    }
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может удалять сотрудников" };
    }

    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error deleting user:");
        return { error: "Failed to delete user" };
    }
}

export async function getAuditLogs(page = 1, limit = 20, search = "") {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может просматривать логи" };
    }

    try {
        const offset = (page - 1) * limit;

        // Build filtering conditions
        const conditions = [];
        if (search) {
            const searchLower = `%${search.toLowerCase()}%`;

            // Find users matching search to filter by userId
            const matchingUsers = await db.query.users.findMany({
                where: sql`lower(${users.name}) LIKE ${searchLower}`,
                columns: { id: true }
            });
            const matchingUserIds = matchingUsers.map(u => u.id);

            conditions.push(sql`
                (
                    lower(${auditLogs.action}) LIKE ${searchLower} OR 
                    lower(${auditLogs.entityType}) LIKE ${searchLower} OR
                    ${matchingUserIds.length > 0 ? inArray(auditLogs.userId, matchingUserIds) : sql`false`}
                )
            `);
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
        const userIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as string[];
        const relatedUsers = userIds.length > 0
            ? await db.query.users.findMany({ where: inArray(users.id, userIds) })
            : [];

        const userMap = new Map(relatedUsers.map((u) => [u.id, u] as const));

        const enrichedLogs = logs.map((log) => ({
            ...log,
            user: log.userId ? userMap.get(log.userId) : null
        }));

        return {
            data: enrichedLogs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch {
        console.error("Error fetching audit logs:");
        return { error: "Failed to fetch audit logs" };
    }
}

export async function updateRolePermissions(roleId: string, permissions: Record<string, unknown>) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Verify current user is admin to perform this action (double check)
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может менять права ролей" };
    }

    try {
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

        revalidatePath("/dashboard/admin/roles");
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error updating role permissions:");
    }
}

export async function updateRole(roleId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может редактировать роли" };
    }

    const name = formData.get("name") as string;
    const departmentId = formData.get("departmentId") as string;

    if (!name) {
        return { error: "Название роли обязательно" };
    }

    try {
        await db.update(roles)
            .set({
                name,
                departmentId: departmentId || null
            })
            .where(eq(roles.id, roleId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Редактирование роли: ${name}`,
            entityType: "role",
            entityId: roleId,
            details: { name, departmentId }
        });

        revalidatePath("/dashboard/admin/roles");
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error updating role:");
        return { error: "Роль с таким названием уже существует" };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Verify current user is admin
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может редактировать сотрудников" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleId = formData.get("roleId") as string;
    const department = formData.get("department") as string;
    const departmentId = formData.get("departmentId") as string;
    const password = formData.get("password") as string;

    // Safety sync: find departmentId by name if not provided
    let finalDeptId = departmentId || null;
    if (!finalDeptId && department) {
        const matchedDept = await db.query.departments.findFirst({
            where: eq(departments.name, department)
        });
        if (matchedDept) finalDeptId = matchedDept.id;
    }

    if (!name || !email || !roleId) {
        return { error: "ФИО, Email и Роль обязательны для заполнения" };
    }

    try {
        const updateData: Partial<typeof users.$inferInsert> & { updatedAt?: Date } = {
            name,
            email,
            roleId,
            departmentId: finalDeptId,
        };

        if (password) {
            updateData.passwordHash = await hashPassword(password);
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error updating user:");
        return { error: "Ошибка при обновлении данных пользователя. Возможно, такой email уже занят." };
    }
}

export async function createRole(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Verify current user is admin
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может создавать роли" };
    }

    const name = formData.get("name") as string;
    const departmentId = formData.get("departmentId") as string;

    const permissionsJson = formData.get("permissions") as string;
    let permissions: Record<string, unknown> = {};
    try {
        if (permissionsJson) {
            permissions = JSON.parse(permissionsJson);
        }
    } catch (e) {
        console.error("Error parsing permissions:", e);
    }

    if (!name) {
        return { error: "Название роли обязательно" };
    }

    try {
        const result = await db.insert(roles).values({
            name,
            permissions,
            isSystem: false,
            departmentId: departmentId || null
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

        revalidatePath("/dashboard/admin/roles");
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error creating role:");
        return { error: "Роль с таким названием уже существует" };
    }
}

export async function deleteRole(roleId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может удалять роли" };
    }

    try {
        // Check if users are assigned to this role
        const assignedUsers = await db.query.users.findMany({
            where: eq(users.roleId, roleId),
            limit: 1
        });

        if (assignedUsers.length > 0) {
            return { error: "Нельзя удалить роль, которая назначена сотрудникам" };
        }

        const role = await db.query.roles.findFirst({
            where: eq(roles.id, roleId)
        });

        if (role?.name === "Администратор") {
            return { error: "Нельзя удалить системную роль" };
        }

        await db.delete(roles).where(eq(roles.id, roleId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Удаление роли: ${role?.name || roleId}`,
            entityType: "role",
            entityId: roleId,
            details: { name: role?.name }
        });

        revalidatePath("/dashboard/admin/roles");
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error deleting role:");
        return { error: "Failed to delete role" };
    }
}

export async function getDepartments() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // 1. Fetch all departments with current users
        const allDepts = await db.query.departments.findMany({
            with: { users: true }
        });

        // 2. Fetch users who have a department name but no departmentId (legacy/unsynced data)
        const unsyncedUsers = await db.query.users.findMany({
            where: isNull(users.departmentId)
        });

        if (unsyncedUsers.length > 0) {
            console.log(`Found ${unsyncedUsers.length} unsynced users. Attempting to link...`);
            const deptMap = new Map(allDepts.map((d) => [d.name.toLowerCase(), d.id]));

            for (const user of unsyncedUsers) {
                if (user.departmentLegacy) {
                    const deptId = deptMap.get(user.departmentLegacy.toLowerCase());
                    if (deptId) {
                        await db.update(users)
                            .set({ departmentId: deptId })
                            .where(eq(users.id, user.id));
                    }
                }
            }

            // Re-fetch to get accurate counts after sync
            return getDepartments();
        }

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

        return { data: dataWithCounts };
    } catch {
        console.error("Error fetching departments:");
        return { error: "Failed to fetch departments" };
    }
}

export async function createDepartment(formData: FormData, roleIds?: string[]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const color = formData.get("color") as string || "indigo";

    if (!name) return { error: "Название отдела обязательно" };

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

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error creating department:");
        return { error: "Отдел с таким названием уже существует" };
    }
}

export async function updateDepartment(deptId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const color = formData.get("color") as string;

    if (!name) return { error: "Название отдела обязательно" };

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

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error updating department:");
        return { error: "Failed to update department" };
    }
}

export async function deleteDepartment(deptId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Check if users are assigned to this department
        const assignedUsers = await db.query.users.findMany({
            where: eq(users.departmentId, deptId),
            limit: 1
        });

        if (assignedUsers.length > 0) {
            return { error: "Нельзя удалить отдел, в котором есть сотрудники" };
        }

        const dept = await db.query.departments.findFirst({
            where: eq(departments.id, deptId)
        });

        await db.delete(departments).where(eq(departments.id, deptId));

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Удаление отдела: ${dept?.name || deptId}`,
            entityType: "department",
            entityId: deptId,
            details: { name: dept?.name }
        });

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch {
        console.error("Error deleting department:");
        return { error: "Failed to delete department" };
    }
}
export async function getRolesByDepartment(departmentId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const departmentRoles = await db.query.roles.findMany({
            where: eq(roles.departmentId, departmentId),
            orderBy: [asc(roles.name)]
        });
        return { data: departmentRoles };
    } catch {
        console.error("Error fetching department roles:");
        return { error: "Failed to fetch department roles" };
    }
}

export async function updateRoleDepartment(roleId: string, departmentId: string | null) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может изменять отдел роли" };
    }

    try {
        await db.update(roles)
            .set({ departmentId })
            .where(eq(roles.id, roleId));

        const role = await db.query.roles.findFirst({
            where: eq(roles.id, roleId)
        });

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: departmentId
                ? `Добавление роли "${role?.name}" в отдел`
                : `Удаление роли "${role?.name}" из отдела`,
            entityType: "role",
            entityId: roleId,
            details: { departmentId, roleName: role?.name }
        });

        revalidatePath("/dashboard/admin/departments");
        revalidatePath("/dashboard/admin/roles");
        return { success: true };
    } catch {
        console.error("Error updating role department:");
        return { error: "Failed to update role department" };
    }
}

export async function getSystemStats() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        // 1. OS Stats
        const cpuLoad = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const uptime = os.uptime();

        // 2. Database Stats
        let dbSize = 0;
        try {
            // Drizzle returns raw rows; for pg_database_size we need to parse carefully
            const dbSizeResult = await db.execute(sql`SELECT pg_database_size(current_database())`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows = dbSizeResult.rows as any[];
            dbSize = parseInt(rows[0]?.pg_database_size || "0");
        } catch (e) {
            console.error("Failed to get db size:", e);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchCount = async (table: any) => {
            try {
                const res = await db.select({ value: count() }).from(table);
                return res[0].value;
            } catch (e) {
                console.error("Failed to count table:", e);
                return 0;
            }
        };

        const tableCounts = {
            users: await fetchCount(users),
            orders: await fetchCount(orders),
            clients: await fetchCount(clients),
            auditLogs: await fetchCount(auditLogs),
        };

        // 3. Storage Stats (S3)
        let storageStats = { size: 0, fileCount: 0 };
        try {
            const { getStorageStats } = await import("@/lib/storage");
            storageStats = await getStorageStats();
        } catch (e) {
            console.error("Failed to get storage stats:", e);
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

        // Auto-backup check
        try {
            const frequencySetting = await db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, "backup_frequency")
            });
            const lastBackupSetting = await db.query.systemSettings.findFirst({
                where: eq(systemSettings.key, "last_backup_at")
            });

            const frequency = (frequencySetting?.value as string) || "none";
            const lastBackupAt = lastBackupSetting?.value ? new Date(lastBackupSetting.value as string) : new Date(0);

            let shouldBackup = false;
            const now = new Date();
            const diffMs = now.getTime() - lastBackupAt.getTime();

            if (frequency === "daily" && diffMs > 24 * 60 * 60 * 1000) shouldBackup = true;
            if (frequency === "weekly" && diffMs > 7 * 24 * 60 * 60 * 1000) shouldBackup = true;
            if (frequency === "monthly" && diffMs > 30 * 24 * 60 * 60 * 1000) shouldBackup = true;

            if (shouldBackup) {
                console.log(`[Auto-Backup] Frequency: ${frequency}. Triggering backup...`);
                // Update timestamp immediately to prevent concurrent triggers
                await db.insert(systemSettings).values({
                    key: "last_backup_at",
                    value: now.toISOString(),
                    updatedAt: now
                }).onConflictDoUpdate({
                    target: systemSettings.key,
                    set: { value: now.toISOString(), updatedAt: now }
                });

                // Trigger actual backup (non-blocking for the stats request)
                createDatabaseBackup().catch(err => console.error("Auto-backup failed:", err));
            }
        } catch (e) {
            console.error("Error in auto-backup check:", e);
        }

        return {
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
    } catch {
        console.error("Error fetching system stats:");
        return { error: "Не удалось получить системные показатели" };
    }
}

export async function clearAuditLogs() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Только администратор может очищать логи" };
    }

    try {
        await db.delete(auditLogs);

        // Log this action as the last standing log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: "Логи аудита очищены",
            entityType: "system",
            entityId: session.id, // required field, using session.id as placeholder
            createdAt: new Date()
        });

        revalidatePath("/dashboard/admin/audit");
        return { success: true };
    } catch {
        console.error("Error clearing audit logs:");
        return { error: "Failed to clear audit logs" };
    }
}

export async function checkSystemHealth() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const health: any = {
        database: { status: "loading", latency: 0 },
        storage: { status: "loading" },
        env: { status: "loading", details: [] },
        fs: { status: "loading" },
        backup: { status: "loading" },
        jwt: { status: "loading" },
        timestamp: new Date().toISOString()
    };

    try {
        // 1. Database Ping & Latency
        const startDb = Date.now();
        await db.execute(sql`SELECT 1`);
        health.database.latency = Date.now() - startDb;
        health.database.status = "ok";

        // 2. Storage Check (S3)
        try {
            const { uploadFile, s3Client } = await import("@/lib/storage");
            const testKey = `health-check-${Date.now()}.txt`;
            await uploadFile(testKey, Buffer.from("health-check"), "text/plain");

            // Delete the test file immediately
            const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
            const bucket = process.env.S3_BUCKET || process.env.REG_STORAGE_BUCKET || "";
            await s3Client.send(new DeleteObjectCommand({
                Bucket: bucket,
                Key: testKey
            }));

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
        } catch (e) {
            health.backup.status = "error";
        }

        // 6. JWT Auth Check
        try {
            const { encrypt, decrypt } = await import("@/lib/auth");
            const testPayload = { ...session, test: true };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = await encrypt(testPayload as any);
            const decrypted = await decrypt(token);
            health.jwt.status = decrypted.id === session.id ? "ok" : "error";
        } catch (e) {
            console.error("JWT check failed:", e);
            health.jwt.status = "error";
        }

        return { data: health };
    } catch {
        console.error("Health check error:");
        return { error: "Ошибка при выполнении диагностики" };
    }
}

export async function createDatabaseBackup() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        const backupData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            data: {
                users: await db.select().from(users),
                roles: await db.select().from(roles),
                departments: await db.select().from(departments),
                clients: await db.select().from(clients),
                orders: await db.select().from(orders),
                inventoryCategories: await db.select().from(inventoryCategories),
                inventoryItems: await db.select().from(inventoryItems),
                storageLocations: await db.select().from(storageLocations),
                tasks: await db.select().from(tasks),
            }
        };

        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        const filePath = path.join(backupDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Создана резервная копия БД: ${fileName}`,
            entityType: "system",
            entityId: session.id,
            createdAt: new Date()
        });

        return { success: true, fileName };
    } catch {
        console.error("Backup creation error:");
        return { error: "Не удалось создать резервную копию" };
    }
}

export async function getBackupsList() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) return { data: [] };

        const files = fs.readdirSync(backupDir);
        const backups = files
            .filter((f: string) => f.endsWith(".json"))
            .map((f: string) => {
                const stats = fs.statSync(path.join(backupDir, f));
                return {
                    name: f,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString()
                };
            })
            .sort((a: BackupFile, b: BackupFile) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { data: backups as BackupFile[] };
    } catch {
        return { error: "Не удалось получить список копий" };
    }
}

export async function deleteBackupAction(fileName: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        const filePath = path.join(backupDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);

            await db.insert(auditLogs).values({
                userId: session.id,
                action: `Удалена резервная копия: ${fileName}`,
                entityType: "system",
                entityId: session.id,
                createdAt: new Date()
            });

            return { success: true };
        }
        return { error: "Файл не найден" };
    } catch {
        return { error: "Ошибка при удалении" };
    }
}

export async function getSystemSettings() {
    const session = await getSession();
    if (!session) return {
        error: "Unauthorized"
    };

    try {
        const settings = await db.select().from(systemSettings);
        const settingsMap: Record<string, string | number | boolean | null> = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value as string | number | boolean | null;
        });
        return { data: settingsMap };
    } catch {
        return {
            error: "Failed to fetch settings"
        };
    }
}

export async function updateSystemSetting(key: string, value: string | number | boolean | null) {
    const session = await getSession();
    if (!session) return {
        error: "Unauthorized"
    };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return {
            error: "Доступ запрещен"
        };
    }

    try {
        await db.insert(systemSettings).values({
            key,
            value,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value, updatedAt: new Date() }
        });

        revalidatePath("/dashboard/admin/settings");
        return { success: true };
    } catch {
        console.error("Update setting error:");
        return {
            error: "Ошибка при обновлении настроек"
        };
    }
}
export async function clearRamAction() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        if (global.gc) {
            global.gc();
            return { success: true, message: "Сборщик мусора запущен успешно" };
        } else {
            return {
                error: "Сборщик мусора недоступен. Запустите Node.js с флагом --expose-gc",
                details: "Однако, некоторые внутренние буферы могут быть очищены при обращении к этой функции."
            };
        }
    } catch {
        return { error: "Ошибка при очистке памяти" };
    }
}

export async function restartServerAction() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        // Record the restart event in audit logs
        await db.insert(auditLogs).values({
            userId: session.id,
            action: "SERVER_RESTART",
            entityType: "SYSTEM",
            entityId: "00000000-0000-0000-0000-000000000000",
            details: { info: "Пользователь инициировал перезапуск сервера через панель управления" },
            createdAt: new Date()
        });

        // Use setTimeout to allow the response to reach the client and logs to be saved
        setTimeout(() => {
            console.log("Server restart initiated by admin...");
            process.exit(0); // Exit with success. Supervisor (pm2/docker) should restart it.
        }, 1000);

        return { success: true, message: "Перезапуск инициирован. Система будет недоступна 10-30 секунд." };
    } catch {
        return { error: "Ошибка при инициализации перезапуска" };
    }
}

export async function trackActivity() {
    const session = await getSession();
    if (!session) return;

    await db.update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, session.id));
}

export async function getMonitoringStats() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (currentUser?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен" };
    }

    try {
        // 1. Get active sessions (users active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeUsers = await db.query.users.findMany({
            where: sql`${users.lastActiveAt} > ${fiveMinutesAgo}`,
            with: {
                role: true,
                department: true
            },
            limit: 10
        });

        // 2. Get activity stats (audit logs per hour for last 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activityStats = await db.select({
            hour: sql<number>`EXTRACT(HOUR FROM ${auditLogs.createdAt})`,
            count: sql<number>`count(*)`
        })
            .from(auditLogs)
            .where(sql`${auditLogs.createdAt} > ${twentyFourHoursAgo}`)
            .groupBy(sql`EXTRACT(HOUR FROM ${auditLogs.createdAt})`)
            .orderBy(sql`EXTRACT(HOUR FROM ${auditLogs.createdAt})`);

        return {
            activeUsers: activeUsers.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                role: u.role?.name,
                department: u.department?.name,
                lastActiveAt: u.lastActiveAt
            })),
            activityStats: activityStats.map(s => ({
                hour: parseInt(String(s.hour), 10),
                count: parseInt(String(s.count), 10)
            }))
        };
    } catch {
        console.error("Monitoring stats error:");
        return { error: "Ошибка получения данных мониторинга" };
    }
}
