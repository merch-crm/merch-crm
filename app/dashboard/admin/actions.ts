"use server";

import { db } from "@/lib/db";
import { users, roles, auditLogs, departments, clients, orders } from "@/lib/schema";
import { getSession, hashPassword } from "@/lib/auth";
import { eq, asc, desc, isNull, sql, and, inArray, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import os from "os";
import fs from "fs";
import path from "path";

export async function getUsers(page = 1, limit = 20, search = "") {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
            with: { role: true },
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

        return {
            data: allUsers,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Error fetching users:", error);
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
    } catch (error) {
        console.error("Error fetching roles:", error);
        return { error: "Failed to fetch roles" };
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
    } catch (error) {
        console.error("Error creating user:", error);
        return { error: "Пользователь с таким email уже существует" };
    }
}

export async function updateUserRole(userId: string, roleId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(users)
            .set({ roleId })
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { error: "Failed to update user role" };
    }
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath("/dashboard/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Failed to delete user" };
    }
}

export async function getAuditLogs(page = 1, limit = 20, search = "") {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
    } catch (error) {
        console.error("Error fetching audit logs:", error);
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
    } catch (error) {
        console.error("Error updating role permissions:", error);
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
    } catch (error) {
        console.error("Error updating role:", error);
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
    } catch (error) {
        console.error("Error updating user:", error);
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
    let permissions = {};
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
    } catch (error) {
        console.error("Error creating role:", error);
        return { error: "Роль с таким названием уже существует" };
    }
}

export async function deleteRole(roleId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
    } catch (error) {
        console.error("Error deleting role:", error);
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
    } catch (error) {
        console.error("Error fetching departments:", error);
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
    } catch (error) {
        console.error("Error creating department:", error);
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
    } catch (error) {
        console.error("Error updating department:", error);
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
    } catch (error) {
        console.error("Error deleting department:", error);
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
    } catch (error) {
        console.error("Error fetching department roles:", error);
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
    } catch (error) {
        console.error("Error updating role department:", error);
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
            const dbSizeResult: any = await db.execute(sql`SELECT pg_database_size(current_database())`);
            dbSize = parseInt(dbSizeResult[0]?.pg_database_size || "0");
        } catch (e) {
            console.error("Failed to get db size:", e);
        }

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

        return {
            data: {
                server: {
                    cpuLoad,
                    totalMem,
                    freeMem,
                    uptime,
                    platform: os.platform(),
                    arch: os.arch(),
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
        console.error("Error fetching system stats:", error);
        return { error: "Не удалось получить системные показатели" };
    }
}
