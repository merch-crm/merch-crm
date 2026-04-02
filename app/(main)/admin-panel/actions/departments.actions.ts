"use server";

import { db } from "@/lib/db";
import { departments, roles, users, accounts } from "@/lib/schema/users";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { comparePassword } from "@/lib/password";
import { eq, asc, inArray, and, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateDepartmentSchema, UpdateDepartmentSchema } from "../validation";
import { ActionResult, ok, okVoid, err, ERRORS } from "@/lib/types";

type Department = InferSelectModel<typeof departments>;
type Role = InferSelectModel<typeof roles>;

export async function getDepartments(): Promise<ActionResult<Department[]>> {
    return withAuth(async () => {
        const allDepts = await db.query.departments.findMany({
            orderBy: [asc(departments.name)],
            limit: 500
        });
        return ok(allDepts);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getDepartments" });
}

export async function createDepartment(formData: FormData, roleIds?: string[]): Promise<ActionResult<Department>> {
    return withAuth(async () => {
        const data = Object.fromEntries(formData);
        const validated = CreateDepartmentSchema.safeParse(data);
        
        if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

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
        return ok(newDept);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createDepartment" });
}

export async function updateDepartment(deptId: string, formData: FormData, roleIds?: string[]): Promise<ActionResult<Department>> {
    return withAuth(async () => {
        const data = Object.fromEntries(formData);
        const validated = UpdateDepartmentSchema.safeParse(data);
        
        if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

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

        if (!updatedDept) return ERRORS.NOT_FOUND("Отдел");

        await logAction("Обновление отдела", "department", deptId, validated.data);
        revalidatePath("/admin-panel/departments");
        return ok(updatedDept);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateDepartment" });
}

export async function deleteDepartment(deptId: string, password?: string): Promise<ActionResult<void>> {
    return withAuth(async (session) => {
        if (password) {
            const adminAccount = await db.query.accounts.findFirst({
                where: and(
                    eq(accounts.userId, session.id),
                    eq(accounts.providerId, "credential")
                )
            });

            if (!adminAccount || !adminAccount.password) {
                return err("Пароль администратора не найден");
            }

            const isMatch = await comparePassword(password, adminAccount.password);
            if (!isMatch) return err("Неверный пароль администратора");
        }

        const usersInDept = await db.query.users.findFirst({
            where: eq(users.departmentId, deptId)
        });

        if (usersInDept) return err("Нельзя удалить отдел, в котором есть пользователи");

        await db.delete(departments).where(eq(departments.id, deptId));
        await logAction("Удаление отдела", "department", deptId);
        revalidatePath("/admin-panel/departments");
        return okVoid();
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteDepartment" });
}

export async function getRolesByDepartment(departmentId: string): Promise<ActionResult<Role[]>> {
    return withAuth(async () => {
        const rolesInDept = await db.query.roles.findMany({
            where: eq(roles.departmentId, departmentId),
            orderBy: [asc(roles.name)],
            limit: 500
        });
        return ok(rolesInDept);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getRolesByDepartment" });
}
