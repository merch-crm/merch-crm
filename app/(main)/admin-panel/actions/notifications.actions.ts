"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NotificationSettingsSchema } from "../validation";

export interface NotificationSettings {
    system: {
        enabled: boolean;
        browserPush: boolean;
        [key: string]: boolean;
    };
    telegram: {
        enabled: boolean;
        botToken: string;
        chatId: string;
        notifyOnNewOrder: boolean;
        notifyOnLowStock: boolean;
        notifyOnSystemError: boolean;
        [key: string]: boolean | string;
    };
    events: {
        new_order: boolean;
        order_status_change: boolean;
        stock_low: boolean;
        task_assigned: boolean;
        [key: string]: boolean;
    };
}

export async function getNotificationSettingsAction() {
    try {
        const setting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "notifications")
        });

        const defaultSettings: NotificationSettings = {
            system: {
                enabled: true,
                browserPush: false
            },
            telegram: {
                enabled: false,
                botToken: "",
                chatId: "",
                notifyOnNewOrder: true,
                notifyOnLowStock: true,
                notifyOnSystemError: true
            },
            events: {
                new_order: true,
                order_status_change: true,
                stock_low: true,
                task_assigned: true,
                system_error: false,
                big_payment: false,
                client_update: false,
                security_alert: false
            }
        };

        if (!setting) return { success: true, data: defaultSettings };
        return { success: true, data: { ...defaultSettings, ...(setting.value as unknown as Partial<NotificationSettings>) } };
    } catch (error) {
        return { success: true, data: null, error: "Не удалось загрузить настройки уведомлений" };
    }
}

export async function updateNotificationSettingsAction(data: NotificationSettings) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const validated = NotificationSettingsSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const validData = validated.data;
        await db.insert(systemSettings)
            .values({ key: "notifications", value: validData, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: validData, updatedAt: new Date() }
            });

        revalidatePath("/admin-panel/notifications");
        await logAction("Изменение настроек уведомлений", "system", "notifications", data as unknown as Record<string, unknown>);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Не удалось обновить настройки уведомлений" };
    }
}
