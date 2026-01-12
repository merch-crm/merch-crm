"use server";

import { db } from "@/lib/db";
import { users, roles, auditLogs, departments } from "@/lib/schema";
import { getSession, hashPassword } from "@/lib/auth";
import { eq, asc, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const allUsers = await db.query.users.findMany({
            with: { role: true },
            orderBy: [asc(users.name)]
        });
        return { data: allUsers };
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

        const sortedRoles = allRoles.sort((a: any, b: any) => {
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
            department,
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

export async function getAuditLogs() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

        // Fetch users to map names
        const allUsers = await db.query.users.findMany();
        const userMap = new Map(allUsers.map((u: any) => [u.id, u]));

        const enrichedLogs = logs.map((log: any) => ({
            ...log,
            user: log.userId ? userMap.get(log.userId) : null
        }));

        return { data: enrichedLogs };
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return { error: "Failed to fetch audit logs" };
    }
}

export async function updateRolePermissions(roleId: string, permissions: any) {
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
        const updateData: any = {
            name,
            email,
            roleId,
            department,
            departmentId: finalDeptId,
            updatedAt: new Date()
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

        if (role?.isSystem) {
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
            const deptMap = new Map(allDepts.map((d: any) => [d.name.toLowerCase(), d.id]));

            for (const user of unsyncedUsers) {
                if (user.department) {
                    const deptId = deptMap.get(user.department.toLowerCase());
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

        const sortedDepts = allDepts.sort((a: any, b: any) => {
            const priorityA = deptPriority[a.name] || 999;
            const priorityB = deptPriority[b.name] || 999;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return a.name.localeCompare(b.name);
        });

        const dataWithCounts = sortedDepts.map((dept: any) => ({
            ...dept,
            userCount: dept.users?.length || 0
        }));

        return { data: dataWithCounts };
    } catch (error) {
        console.error("Error fetching departments:", error);
        return { error: "Failed to fetch departments" };
    }
}

export async function createDepartment(formData: FormData) {
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

        // Audit Log
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Создание отдела: ${name}`,
            entityType: "department",
            entityId: newDept.id,
            details: { name, description }
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
