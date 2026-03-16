"use server";

import { db } from "@/lib/db";
import { roles, users, accounts } from "@/lib/schema";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { comparePassword } from "@/lib/password";
import { eq, asc, and, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateRoleSchema, UpdateRoleSchema } from "../validation";
import { ActionResult, ok, okVoid, err, ERRORS } from "@/lib/types";

type Role = InferSelectModel<typeof roles>;

// Role Actions
export async function getRoles(): Promise<ActionResult<(Role & { department: { name: string } | null })[]>> {
    return withAuth(async () => {
        const allRoles = await db.query.roles.findMany({
            with: {
                department: {
                    columns: { name: true }
                }
            },
            orderBy: [asc(roles.name)],
            limit: 500
        });
        return ok(allRoles);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getRoles" });
}

export async function createRole(formData: FormData): Promise<ActionResult<Role>> {
    return withAuth(async () => {
        const data = Object.fromEntries(formData);
        const validated = CreateRoleSchema.safeParse(data);
        
        if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

        const [newRole] = await db.insert(roles).values({
            ...validated.data,
            permissions: {},
            departmentId: validated.data.departmentId || null
        }).returning();

        await logAction("Создание роли", "role", newRole.id, { name: newRole.name });
        revalidatePath("/admin-panel/roles");
        return ok(newRole);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createRole" });
}

export async function updateRole(roleId: string, formData: FormData): Promise<ActionResult<Role>> {
    return withAuth(async () => {
        const data = Object.fromEntries(formData);
        const validated = UpdateRoleSchema.safeParse(data);
        
        if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

        const updateData: Record<string, unknown> = { ...validated.data };
        if (updateData.departmentId === "") updateData.departmentId = null;

        const [updatedRole] = await db.update(roles)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(roles.id, roleId))
            .returning();

        if (!updatedRole) return ERRORS.NOT_FOUND("Роль");

        await logAction("Обновление роли", "role", roleId, updateData);
        revalidatePath("/admin-panel/roles");
        return ok(updatedRole);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateRole" });
}

export async function deleteRole(roleId: string, password?: string): Promise<ActionResult<void>> {
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

        const usersWithRole = await db.query.users.findFirst({
            where: eq(users.roleId, roleId)
        });

        if (usersWithRole) return err("Нельзя удалить роль, которая назначена пользователям");

        await db.delete(roles).where(eq(roles.id, roleId));
        await logAction("Удаление роли", "role", roleId);
        revalidatePath("/admin-panel/roles");
        return okVoid();
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteRole" });
}

export async function updateRolePermissions(roleId: string, permissions: Record<string, unknown>): Promise<ActionResult<Role>> {
    return withAuth(async () => {
        const [updatedRole] = await db.update(roles)
            .set({
                permissions,
                updatedAt: new Date()
            })
            .where(eq(roles.id, roleId))
            .returning();

        if (!updatedRole) return ERRORS.NOT_FOUND("Роль");

        await logAction("Обновление прав роли", "role", roleId, { permissions });
        revalidatePath("/admin-panel/roles");
        return ok(updatedRole);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateRolePermissions" });
}

export async function updateRoleDepartment(roleId: string, departmentId: string | null): Promise<ActionResult<void>> {
    return withAuth(async () => {
        await db.update(roles)
            .set({ departmentId, updatedAt: new Date() })
            .where(eq(roles.id, roleId));

        await logAction("Изменение отдела роли", "role", roleId, { departmentId });
        revalidatePath("/admin-panel/roles");
        return okVoid();
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateRoleDepartment" });
}
