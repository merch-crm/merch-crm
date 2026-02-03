"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    try {
        const userNotifications = await db.query.notifications.findMany({
            where: eq(notifications.userId, session.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 20,
        });

        return userNotifications.map(n => ({
            ...n,
            createdAt: n.createdAt.toISOString()
        }));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { error: error instanceof Error ? error.message : "Failed to mark as read" };
    }
}

export async function markAllAsRead() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, session.id));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { error: error instanceof Error ? error.message : "Failed to mark all as read" };
    }
}
