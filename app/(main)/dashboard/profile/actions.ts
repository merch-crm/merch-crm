"use server";

import { db } from "@/lib/db";
import { users, orders, tasks, auditLogs, clients } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { comparePassword, hashPassword } from "@/lib/password";
import { eq, count, sum, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { startOfMonth, endOfMonth } from "date-fns";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { saveAvatarFile } from "@/lib/avatar-storage";
import { z } from "zod";

const ProfileSchema = z.object({
    name: z.string().min(1, "Имя обязательно"),
    phone: z.string().optional().nullable(),
    telegram: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    socialMax: z.string().optional().nullable(),
    birthday: z.string().optional().nullable(),
});

const PasswordSchema = z.object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(6, "Новый пароль должен быть не менее 6 символов"),
    confirmPassword: z.string().min(1, "Подтвердите новый пароль"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"]
});


export async function logout() {
    try {
        (await cookies()).delete("session");
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

export async function getUserProfile() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });

        if (!user) return { success: false, error: "пользователь not found" };



        return { success: true, data: user };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserProfile"
        });
        console.error("Error fetching profile:", error);
        return { success: false, error: "Не удалось загрузить profile" };
    }
}



export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const rawData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        telegram: formData.get("telegram"),
        instagram: formData.get("instagram"),
        socialMax: formData.get("socialMax"),
        birthday: formData.get("birthday"),
    };

    const validated = ProfileSchema.safeParse(rawData);
    if (!validated.success) {
        return { success: false, error: "Некорректные данные: " + validated.error.issues[0].message };
    }

    const { name, phone, telegram, instagram, socialMax, birthday } = validated.data;
    const avatarFile = formData.get("avatar") as File | null;

    try {
        const updateData: Partial<typeof users.$inferInsert> = {
            name,
            phone: phone || null,
            telegram: telegram || null,
            instagram: instagram || null,
            socialMax: socialMax || null,
            birthday: birthday || null,
            updatedAt: new Date()
        };

        if (avatarFile && avatarFile.size > 0) {
            const currentUser = await db.query.users.findFirst({
                where: eq(users.id, session.id),
                columns: { avatar: true }
            });

            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const displayName = name || session.name || "user";
            updateData.avatar = await saveAvatarFile(buffer, session.id, displayName, currentUser?.avatar || null);
        }

        await db.transaction(async (tx) => {
            await tx.update(users)
                .set(updateData)
                .where(eq(users.id, session.id));

            await logAction("profile_update", "users", session.id, {
                changedFields: Object.keys(updateData).filter(k => k !== 'avatar')
            }, tx);
        });

        revalidatePath("/dashboard/profile");
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "updateProfile",
            details: { name, phone }
        });
        return { success: false, error: "Не удалось обновить профиль" };
    }
}

export async function updatePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const rawData = Object.fromEntries(formData);
    const validated = PasswordSchema.safeParse(rawData);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const { currentPassword, newPassword } = validated.data;

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id)
        });

        if (!user) return { success: false, error: "Пользователь не найден" };

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) return { success: false, error: "Текущий пароль указан неверно" };

        const newHash = await hashPassword(newPassword);
        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ passwordHash: newHash })
                .where(eq(users.id, session.id));

            await logAction("password_change", "users", session.id, undefined, tx);
        });

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "updatePassword"
        });
        return { success: false, error: "Не удалось обновить пароль" };
    }
}

export async function getUserStatistics() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const now = new Date();
        const firstDayOfMonth = startOfMonth(now);
        const lastDayOfMonth = endOfMonth(now);

        // 1. Orders stats
        const userOrders = await db.select({
            count: count(),
            totalRevenue: sum(orders.totalAmount)
        })
            .from(orders)
            .where(eq(orders.createdBy, session.id))
            .limit(1);

        const monthlyOrders = await db.select({
            count: count()
        })
            .from(orders)
            .where(and(
                eq(orders.createdBy, session.id),
                gte(orders.createdAt, firstDayOfMonth),
                lte(orders.createdAt, lastDayOfMonth)
            ))
            .limit(1);

        // 2. Tasks stats
        const userTasksCount = await db.select({
            count: count(),
            status: tasks.status
        })
            .from(tasks)
            .where(eq(tasks.assignedToUserId, session.id))
            .groupBy(tasks.status)
            .limit(20);

        const totalTasks = userTasksCount.reduce((acc, curr) => acc + Number(curr.count), 0);
        const completedTasks = Number(userTasksCount.find(t => t.status === "done")?.count || 0);
        const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 3. Activity stats
        const activityCount = await db.select({
            count: count()
        })
            .from(auditLogs)
            .where(eq(auditLogs.userId, session.id))
            .limit(1);

        return {
            data: {
                totalOrders: Number(userOrders[0]?.count || 0),
                totalRevenue: Number(userOrders[0]?.totalRevenue || 0),
                monthlyOrders: Number(monthlyOrders[0]?.count || 0),
                tasksByStatus: userTasksCount.map(t => ({ status: t.status, count: Number(t.count) })),
                totalActivity: Number(activityCount[0]?.count || 0),
                efficiency
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserStatistics"
        });
        console.error("Error fetching user statistics:", error);
        return { success: false, error: "Не удалось загрузить статистика" };
    }
}

export async function getUpcomingBirthdays() {
    try {
        const allUsers = await db.query.users.findMany({
            where: (users, { isNotNull, eq }) => and(isNotNull(users.birthday), eq(users.isSystem, false)),
            columns: { name: true, birthday: true, avatar: true },
            limit: 50
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            success: true, data: allUsers.filter(user => {
                if (!user.birthday) return false;
                const bday = new Date(user.birthday);
                // Compare UTC date of birthday (from 'YYYY-MM-DD') with local today date
                return bday.getUTCMonth() === today.getMonth() && bday.getUTCDate() === today.getDate();
            })
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUpcomingBirthdays"
        });
        return { success: false, error: "Не удалось загрузить дни рождения", data: [] };
    }
}

export async function getLostClientsCount() {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const lostClients = await db.select({ count: count() })
            .from(clients)
            .leftJoin(orders, eq(clients.id, orders.clientId))
            .where(and(
                eq(clients.isArchived, false)
            ))
            .groupBy(clients.id)
            .having(sql`max(${orders.createdAt}) < ${threeMonthsAgo} OR max(${orders.createdAt}) IS NULL`)
            .limit(100);

        return { success: true, data: lostClients.length };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getLostClientsCount"
        });
        return { success: false, error: "Не удалось загрузить количество потерянных клиентов", data: 0 };
    }
}

export async function getUserSchedule() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const userTasks = await db.query.tasks.findMany({
            where: eq(tasks.assignedToUserId, session.id),
            orderBy: [desc(tasks.dueDate)],
            limit: 100
        });

        return { success: true, data: userTasks };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserSchedule"
        });
        console.error("Error fetching user schedule:", error);
        return { success: false, error: "Не удалось загрузить schedule" };
    }
}



export async function getUserActivities() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const logs = await db.select()
            .from(auditLogs)
            .where(eq(auditLogs.userId, session.id))
            .orderBy(desc(auditLogs.createdAt))
            .limit(50);

        return { success: true, data: logs };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserActivities"
        });
        console.error("Error fetching user activities:", error);
        return { success: false, error: "Не удалось загрузить activities" };
    }
}
