"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession, comparePassword, hashPassword } from "@/lib/auth";
import { eq, count, sum, desc, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { orders, tasks, auditLogs } from "@/lib/schema";
import { startOfMonth, endOfMonth } from "date-fns";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export async function logout() {
    (await cookies()).delete("session");
}

export async function getUserProfile() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });

        if (!user) return { error: "User not found" };

        console.log(`[getUserProfile] User: ${user.email}, ID: ${user.id}, Avatar: ${user.avatar}`);

        return { data: user };
    } catch (error) {
        console.error("Error fetching profile:", error);
        return { error: "Failed to fetch profile" };
    }
}

import { uploadFile } from "@/lib/storage";

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const departmentLegacy = formData.get("department") as string;
    const avatarFile = formData.get("avatar") as File;

    if (!name) return { error: "Имя обязательно" };

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = { name, phone, departmentLegacy };

        if (avatarFile && avatarFile.size > 0) {
            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const filename = `${session.id}-${Date.now()}.jpg`;
            const uploadDir = path.join(process.cwd(), "public/uploads/avatars");

            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // Path for the browser (public is the root for static files)
            updateData.avatar = `/uploads/avatars/${filename}`;
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.id));

        revalidatePath("/dashboard/profile");
        // Revalidate layout to update header avatar if safe
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating profile:", error);
        return { error: `Ошибка обновления профиля: ${(error as Error).message || String(error)}` };
    }
}

export async function updatePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Заполните все поля" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Пароли не совпадают" };
    }

    if (newPassword.length < 6) {
        return { error: "Новый пароль должен быть не менее 6 символов" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id)
        });

        if (!user) return { error: "Пользователь не найден" };

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) return { error: "Текущий пароль указан неверно" };

        const newHash = await hashPassword(newPassword);
        await db.update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, session.id));

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        return { error: "Failed to update password" };
    }
}

export async function getUserStatistics() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
        const userTasks = await db.select({
            count: count(),
            status: tasks.status
        })
            .from(tasks)
            .where(eq(tasks.assignedToUserId, session.id))
            .groupBy(tasks.status);

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
                tasksByStatus: userTasks,
                totalActivity: Number(activityCount[0]?.count || 0)
            }
        };
    } catch (error) {
        console.error("Error fetching user statistics:", error);
        return { error: "Failed to fetch statistics" };
    }
}

export async function getUserSchedule() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const userTasks = await db.query.tasks.findMany({
            where: eq(tasks.assignedToUserId, session.id),
            orderBy: [desc(tasks.dueDate)]
        });

        return { data: userTasks };
    } catch (error) {
        console.error("Error fetching user schedule:", error);
        return { error: "Failed to fetch schedule" };
    }
}
