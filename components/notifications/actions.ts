"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { NotificationType, NotificationPriority } from "@/lib/types";
import { logError } from "@/lib/error-logger";
import { z } from "zod";

const MarkAsReadSchema = z.object({
    notificationId: z.string().uuid(),
});

export async function getNotifications() {
    const session = await getSession();
    if (!session) return { notifications: [], unreadCount: 0 };

    try {
        const [userNotifications, unreadCountResult] = await Promise.all([
            db.query.notifications.findMany({
                where: eq(notifications.userId, session.id),
                orderBy: [desc(notifications.createdAt)],
                limit: 50, // Increased limit for detailed view
            }),
            db.select({ count: sql`count(*)` })
                .from(notifications)
                .where(and(
                    eq(notifications.userId, session.id),
                    eq(notifications.isRead, false)
                ))
        ]);

        const unreadCount = Number(unreadCountResult[0]?.count || 0);

        return {
            notifications: userNotifications.map(n => ({
                ...n,
                type: n.type as NotificationType,
                priority: n.priority as NotificationPriority,
                createdAt: n.createdAt,
                updatedAt: n.createdAt,
                channels: [],
                isArchived: false,
            })),
            unreadCount
        };
    } catch (error) {
        await logError({
            error,
            path: "/components/notifications",
            method: "getNotifications"
        });
        return { notifications: [], unreadCount: 0 };
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getSession();
    if (!session) return { error: "Не авторизован" };

    const validated = MarkAsReadSchema.safeParse({ notificationId });
    if (!validated.success) return { error: "Некорректный ID уведомления" };

    try {
        await db.transaction(async (tx) => {
            await tx.update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.id, notificationId),
                    eq(notifications.userId, session.id)
                ));
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/components/notifications",
            method: "markAsRead",
            details: { notificationId }
        });
        return { error: "Не удалось отметить как прочитанное" };
    }
}

export async function markAllAsRead() {
    const session = await getSession();
    if (!session) return { error: "Не авторизован" };

    try {
        await db.transaction(async (tx) => {
            await tx.update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, session.id));
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/components/notifications",
            method: "markAllAsRead"
        });
        return { error: "Не удалось отметить все уведомления" };
    }
}
