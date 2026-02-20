"use server";

import { db } from "@/lib/db";
import { roles, users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { comparePassword } from "@/lib/password";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateRoleSchema, UpdateRoleSchema } from "../validation";

// Role Actions
export async function getRoles() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const allRoles = await db.query.roles.findMany({
            with: {
                department: true
            },
            orderBy: [asc(roles.name)],
            limit: 500 // audit-ignore: административный список, нужны все записи
        });
        return { success: true, data: allRoles };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles",
            method: "getRoles"
        });
        return { success: false, error: "Не удалось загрузить список ролей" };
    }
}

export async function createRole(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = CreateRoleSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const [newRole] = await db.insert(roles).values({
            ...validated.data,
            permissions: {},
            departmentId: validated.data.departmentId || null
        }).returning();

        await logAction("Создание роли", "role", newRole.id, { name: newRole.name });
        revalidatePath("/admin-panel/roles");
        return { success: true, data: newRole };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles/create",
            method: "createRole"
        });
        return { success: false, error: "Не удалось создать роль" };
    }
}

export async function updateRole(roleId: string, formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = UpdateRoleSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const updateData: Record<string, unknown> = { ...validated.data };
        if (updateData.departmentId === "") updateData.departmentId = null;

        const [updatedRole] = await db.update(roles)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(roles.id, roleId))
            .returning();

        await logAction("Обновление роли", "role", roleId, updateData);
        revalidatePath("/admin-panel/roles");
        return { success: true, data: updatedRole };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles/update",
            method: "updateRole"
        });
        return { success: false, error: "Не удалось обновить роль" };
    }
}

export async function deleteRole(roleId: string, password?: string) {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);

        if (password) {
            const isMatch = await comparePassword(password, currentUser.passwordHash);
            if (!isMatch) return { success: false, error: "Неверный пароль администратора" };
        }

        // Check if role is assigned to any users
        const usersWithRole = await db.query.users.findFirst({
            where: eq(users.roleId, roleId)
        });

        if (usersWithRole) {
            return { success: false, error: "Нельзя удалить роль, которая назначена пользователям" };
        }

        await db.delete(roles).where(eq(roles.id, roleId));
        await logAction("Удаление роли", "role", roleId);
        revalidatePath("/admin-panel/roles");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles/delete",
            method: "deleteRole"
        });
        return { success: false, error: "Не удалось удалить роль" };
    }
}

export async function updateRolePermissions(roleId: string, permissions: Record<string, unknown>) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const [updatedRole] = await db.update(roles)
            .set({
                permissions,
                updatedAt: new Date()
            })
            .where(eq(roles.id, roleId))
            .returning();

        await logAction("Обновление прав роли", "role", roleId, { permissions });
        revalidatePath("/admin-panel/roles");
        return { success: true, data: updatedRole };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/roles/permissions",
            method: "updateRolePermissions"
        });
        return { success: false, error: "Не удалось обновить права доступа" };
    }
}

export async function updateRoleDepartment(roleId: string, departmentId: string | null) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        await db.update(roles)
            .set({ departmentId, updatedAt: new Date() })
            .where(eq(roles.id, roleId));

        revalidatePath("/admin-panel/roles");
        return { success: true };
    } catch (_error) {
        return { success: false, error: "Не удалось обновить отдел роли" };
    }
}
