"use server";

import { db } from"@/lib/db";
import { users, accounts } from"@/lib/schema";
import { getSession, auth } from"@/lib/auth";
import { requireAdmin } from"@/lib/admin";
import { logError } from"@/lib/error-logger";
import { logAction } from"@/lib/audit";
import { comparePassword } from"@/lib/password";
import { eq, asc, sql, or, ilike, and } from"drizzle-orm";
import { revalidatePath } from"next/cache";
import {
    CreateUserSchema,
    UpdateUserSchema
} from"../validation";

// User Actions
export async function getCurrentUserAction() {
    try {
        const session = await getSession();
        if (!session) return { success: false, error:"Не авторизован" };

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
            path:"/admin-panel/current-user",
            method:"getCurrentUserAction"
        });
        return { success: false, error:"Не удалось загрузить текущего пользователя" };
    }
}

export async function getUsers(page = 1, limit = 20, search ="") {
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
            .where(whereClause)
            .limit(1);
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

        return {
            success: true,
            data: { users: allUsers, total },
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        await logError({
            error,
            path:"/admin-panel/users",
            method:"getUsers"
        });
        return { success: false, error:"Не удалось загрузить список пользователей" };
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = CreateUserSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { email, password, name, roleId, departmentId } = validated.data;

        // Используем Admin Plugin для создания пользователя
        const newUser = await auth.api.createUser({
            headers: await import("next/headers").then(h => h.headers()),
            body: {
                email,
                password,
                name,
                // @ts-expect-error - roleId and departmentId are custom fields handled by adapter
                roleId: roleId || undefined,
                departmentId: departmentId || undefined,
            }
        });

        if (!newUser) {
            return { success: false, error: "Не удалось создать пользователя через Admin API" };
        }

        await logAction("Создание пользователя", "user", newUser.user.id, { email: newUser.user.email });
        revalidatePath("/admin-panel/users");
        return { success: true, data: newUser.user };
    } catch (error) {
        await logError({
            error,
            path:"/admin-panel/users/create",
            method:"createUser"
        });
        return { success: false, error:"Не удалось создать пользователя" };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const data = Object.fromEntries(formData);

        const validated = UpdateUserSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const updateData: Record<string, unknown> = { ...validated.data };
        if (updateData.departmentId ==="") updateData.departmentId = null;

        const [updatedUser] = await db.update(users)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        await logAction("Обновление пользователя","user", userId, updateData);
        revalidatePath("/admin-panel/users");
        return { success: true, data: updatedUser };
    } catch (error) {
        await logError({
            error,
            path:"/admin-panel/users/update",
            method:"updateUser"
        });
        return { success: false, error:"DEBUG:" + (error instanceof Error ? error.message :"Неизвестная ошибка") };
    }
}

export async function deleteUser(userId: string, password?: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        if (session?.id === userId) {
            return { success: false, error:"Нельзя удалить самого себя" };
        }

        const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
        if (targetUser?.isSystem || password) {
            if (!password) return { success: false, error: "Для этого действия требуется пароль" };
            
            // Получаем хеш пароля администратора из таблицы accounts
            const adminAccount = await db.query.accounts.findFirst({
                where: and(
                    eq(accounts.userId, session!.id),
                    eq(accounts.providerId, "credential")
                )
            });

            if (!adminAccount || !adminAccount.password) {
                return { success: false, error: "У администратора не установлен пароль в Better Auth" };
            }

            const isMatch = await comparePassword(password, adminAccount.password);
            if (!isMatch) return { success: false, error: "Неверный пароль администратора" };
        }

        await db.delete(users).where(eq(users.id, userId));
        await logAction("Удаление пользователя","user", userId);
        revalidatePath("/admin-panel/users");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path:"/admin-panel/users/delete",
            method:"deleteUser"
        });
        return { success: false, error:"Не удалось удалить пользователя" };
    }
}
