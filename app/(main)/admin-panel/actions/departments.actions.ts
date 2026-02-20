"use server";

import { db } from "@/lib/db";
import { departments, roles, users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { comparePassword } from "@/lib/password";
import { eq, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateDepartmentSchema, UpdateDepartmentSchema } from "../validation";

// Department Actions
export async function getDepartments() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const allDepts = await db.query.departments.findMany({
            orderBy: [asc(departments.name)],
            limit: 500 // audit-ignore: административный список, нужны все записи
        });
        return { success: true, data: allDepts };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments",
            method: "getDepartments"
        });
        return { success: false, error: "Не удалось загрузить отделы" };
    }
}

export async function createDepartment(formData: FormData, roleIds?: string[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = CreateDepartmentSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const newDept = await db.transaction(async (tx) => {
            const [dept] = await tx.insert(departments).values({
                ...validated.data,
                updatedAt: new Date()
            }).returning();

            if (roleIds && roleIds.length > 0) {
                await tx.update(roles)
                    .set({ departmentId: dept.id })
                    .where(inArray(roles.id, roleIds));
            }

            return dept;
        });

        await logAction("Создание отдела", "department", newDept.id, { name: newDept.name });
        revalidatePath("/admin-panel/departments");
        return { success: true, data: newDept };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments/create",
            method: "createDepartment"
        });
        return { success: false, error: "Не удалось создать отдел" };
    }
}

export async function updateDepartment(deptId: string, formData: FormData, roleIds?: string[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = UpdateDepartmentSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const updatedDept = await db.transaction(async (tx) => {
            const [dept] = await tx.update(departments)
                .set({
                    ...validated.data,
                    updatedAt: new Date()
                })
                .where(eq(departments.id, deptId))
                .returning();

            if (roleIds) {
                await tx.update(roles)
                    .set({ departmentId: deptId })
                    .where(inArray(roles.id, roleIds));
            }

            return dept;
        });

        await logAction("Обновление отдела", "department", deptId, validated.data);
        revalidatePath("/admin-panel/departments");
        return { success: true, data: updatedDept };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments/update",
            method: "updateDepartment"
        });
        return { success: false, error: "Не удалось обновить отдел" };
    }
}

export async function deleteDepartment(deptId: string, password?: string) {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);

        if (password) {
            const isMatch = await comparePassword(password, currentUser.passwordHash);
            if (!isMatch) return { success: false, error: "Неверный пароль администратора" };
        }

        // check if users belong to this department
        const usersInDept = await db.query.users.findFirst({
            where: eq(users.departmentId, deptId)
        });

        if (usersInDept) {
            return { success: false, error: "Нельзя удалить отдел, в котором есть пользователи" };
        }

        await db.delete(departments).where(eq(departments.id, deptId));
        await logAction("Удаление отдела", "department", deptId);
        revalidatePath("/admin-panel/departments");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/departments/delete",
            method: "deleteDepartment"
        });
        return { success: false, error: "Не удалось удалить отдел" };
    }
}

export async function getRolesByDepartment(departmentId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const rolesInDept = await db.query.roles.findMany({
            where: eq(roles.departmentId, departmentId),
            orderBy: [asc(roles.name)],
            limit: 500 // audit-ignore: административный список, нужны все записи
        });
        return { success: true, data: rolesInDept };
    } catch {
        return { success: false, error: "Не удалось загрузить роли отдела" };
    }
}
