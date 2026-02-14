"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { comparePassword, hashPassword } from "@/lib/password";
import { eq, count, sum, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { orders, tasks, auditLogs, clients } from "@/lib/schema";
import { startOfMonth, endOfMonth } from "date-fns";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { saveAvatarFile } from "@/lib/avatar-storage";
import { ActionResult } from "@/lib/types";

export async function logout() {
    (await cookies()).delete("session");
}

export async function getUserProfile() {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });

        if (!user) return { success: false, error: "User not found" };



        return { success: true, data: user };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserProfile"
        });
        console.error("Error fetching profile:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}



export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const avatarFile = formData.get("avatar") as File;

    const telegram = formData.get("telegram") as string;
    const instagram = formData.get("instagram") as string;
    const socialMax = formData.get("socialMax") as string;
    const birthday = formData.get("birthday") as string;

    if (!name) return { success: false, error: "Имя обязательно" };

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = { name, phone, telegram, instagram, socialMax, birthday: birthday || null };

        if (avatarFile && avatarFile.size > 0) {
            // Get current user to check for existing avatar
            const currentUser = await db.query.users.findFirst({
                where: eq(users.id, session.id),
                columns: { avatar: true }
            });

            const buffer = Buffer.from(await avatarFile.arrayBuffer());

            // Use utility function that handles both save and delete
            // Use the name from form or session for filename
            const displayName = name || session.name || "user";
            updateData.avatar = await saveAvatarFile(buffer, session.id, displayName, currentUser?.avatar || null);
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.id));

        await logAction("profile_update", "users", session.id, {
            changedFields: Object.keys(updateData).filter(k => k !== 'avatar')
        });

        revalidatePath("/dashboard/profile");
        // Revalidate layout to update header avatar if safe
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "updateProfile",
            details: { name, phone }
        });
        console.error("Error updating profile:", error);
        return { success: false, error: `Ошибка обновления профиля: ${(error as Error).message || String(error)}` };
    }
}

export async function updatePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: "Заполните все поля" };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: "Пароли не совпадают" };
    }

    if (newPassword.length < 6) {
        return { success: false, error: "Новый пароль должен быть не менее 6 символов" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id)
        });

        if (!user) return { success: false, error: "Пользователь не найден" };

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) return { success: false, error: "Текущий пароль указан неверно" };

        const newHash = await hashPassword(newPassword);
        await db.update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, session.id));

        await logAction("password_change", "users", session.id);

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "updatePassword"
        });
        console.error("Error updating password:", error);
        return { success: false, error: "Failed to update password" };
    }
}

export async function getUserStatistics() {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

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
            .where(eq(orders.createdBy, session.id));

        const monthlyOrders = await db.select({
            count: count()
        })
            .from(orders)
            .where(and(
                eq(orders.createdBy, session.id),
                gte(orders.createdAt, firstDayOfMonth),
                lte(orders.createdAt, lastDayOfMonth)
            ));

        // 2. Tasks stats
        const userTasksCount = await db.select({
            count: count(),
            status: tasks.status
        })
            .from(tasks)
            .where(eq(tasks.assignedToUserId, session.id))
            .groupBy(tasks.status);

        const totalTasks = userTasksCount.reduce((acc, curr) => acc + Number(curr.count), 0);
        const completedTasks = Number(userTasksCount.find(t => t.status === "done")?.count || 0);
        const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 3. Activity stats
        const activityCount = await db.select({
            count: count()
        })
            .from(auditLogs)
            .where(eq(auditLogs.userId, session.id));

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
        return { success: false, error: "Failed to fetch statistics" };
    }
}

export async function getUpcomingBirthdays() {
    try {
        const allUsers = await db.query.users.findMany({
            where: (users, { isNotNull }) => isNotNull(users.birthday),
            columns: { name: true, birthday: true, avatar: true }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            success: true, data: allUsers.filter(user => {
                if (!user.birthday) return false;
                const bday = new Date(user.birthday);
                return bday.getUTCMonth() === today.getUTCMonth() && bday.getUTCDate() === today.getUTCDate();
            })
        };
    } catch (error) {
        console.error("Error fetching birthdays:", error);
        return { success: false, error: "Failed to fetch birthdays", data: [] };
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
            .having(sql`max(${orders.createdAt}) < ${threeMonthsAgo} OR max(${orders.createdAt}) IS NULL`);

        return { success: true, data: lostClients.length };
    } catch (error) {
        console.error("Error fetching lost clients:", error);
        return { success: false, error: "Failed to fetch lost clients", data: 0 };
    }
}

export async function getUserSchedule() {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const userTasks = await db.query.tasks.findMany({
            where: eq(tasks.assignedToUserId, session.id),
            orderBy: [desc(tasks.dueDate)]
        });

        return { success: true, data: userTasks };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/profile",
            method: "getUserSchedule"
        });
        console.error("Error fetching user schedule:", error);
        return { success: false, error: "Failed to fetch schedule" };
    }
}



export async function getUserActivities() {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

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
        return { success: false, error: "Failed to fetch activities" };
    }
}
