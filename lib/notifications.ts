import { db } from "./db";
import { notifications, inventoryItems } from "./schema";
import { eq, and, sql } from "drizzle-orm";

export async function createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
}) {
    try {
        await db.insert(notifications).values({
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: false,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { error: "Failed to create notification" };
    }
}

export async function notifyWarehouseManagers(data: {
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
}) {
    try {
        // Find all users with "Склад" or "Администратор" roles
        const staff = await db.query.users.findMany({
            with: {
                role: true
            }
        });

        const targetUsers = staff.filter(u =>
            u.role?.name === "Склад" || u.role?.name === "Администратор" || u.role?.name === "Руководство"
        );

        for (const user of targetUsers) {
            await createNotification({
                userId: user.id,
                title: data.title,
                message: data.message,
                type: data.type,
            });
        }
    } catch (error) {
        console.error("Failed to notify staff:", error);
    }
}

export async function checkItemStockAlerts(itemId: string) {
    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.id, itemId)
        });

        if (!item) return;

        const quantity = item.quantity;
        const low = item.lowStockThreshold ?? 5;
        const critical = item.criticalStockThreshold ?? 0;

        let alertType: "error" | "warning" | null = null;
        let title = "";
        let message = "";

        if (quantity < 0) {
            alertType = "error";
            title = "Отрицательный остаток!";
            message = `Товар "${item.name}" (SKU: ${item.sku}) ушел в минус: ${quantity} ${item.unit}. Срочно проверьте списания.`;
        } else if (quantity <= critical) {
            alertType = "error";
            title = "Критический остаток!";
            message = `Товар "${item.name}" (SKU: ${item.sku}) достиг критического уровня: ${quantity} ${item.unit}.`;
        } else if (quantity <= low) {
            alertType = "warning";
            title = "Низкий остаток";
            message = `Товар "${item.name}" (SKU: ${item.sku}) заканчивается: ${quantity} ${item.unit}.`;
        }

        if (alertType && title && message) {
            // Check if alert already exists for any target user
            const existing = await db.query.notifications.findFirst({
                where: and(
                    eq(notifications.title, title),
                    sql`${notifications.message} LIKE ${`%${item.name}%`}`,
                    eq(notifications.isRead, false)
                )
            });

            if (!existing) {
                await notifyWarehouseManagers({ title, message, type: alertType });
            }
        }
    } catch (error) {
        console.error("Error in checkItemStockAlerts:", error);
    }
}
