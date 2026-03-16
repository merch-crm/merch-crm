"use server";

import { okVoid } from "@/lib/types";

import { db } from"@/lib/db";
import { presenceSettings } from"@/lib/schema";
import { getSession } from "@/lib/session";
import { requireAdmin } from"@/lib/admin";
import { logError } from"@/lib/error-logger";
import { logAction } from"@/lib/audit";
import { eq } from"drizzle-orm";
import { revalidatePath } from"next/cache";
import { UpdateSettingSchema, PresenceSettingsSchema } from"../validation";

// ============================================
// ACTIONS
// ============================================

export async function getPresenceSettings() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const settings = await db.query.presenceSettings.findMany({ limit: 500 });

        // Преобразуем в объект
        const result: Record<string, unknown> = {};
        for (const setting of settings) {
            result[setting.key] = setting.value;
        }

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path:"/staff/settings",
            method:"getPresenceSettings",
        });
        return { success: false, error:"Не удалось загрузить настройки" };
    }
}

export async function updatePresenceSetting(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = Object.fromEntries(formData);
        const validated = UpdateSettingSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { key, value } = validated.data;

        await db.update(presenceSettings)
            .set({
                value,
                updatedAt: new Date(),
                updatedById: session!.id,
            })
            .where(eq(presenceSettings.key, key));

        await logAction("Изменена настройка присутствия","presence_settings", key, { value });
        revalidatePath("/staff/settings");

        return okVoid();
    } catch (error) {
        await logError({
            error,
            path:"/staff/settings/update",
            method:"updatePresenceSetting",
        });
        return { success: false, error:"Не удалось сохранить настройку" };
    }
}

export async function updateAllPresenceSettings(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data: Record<string, unknown> = {};

        // Собираем все поля из formData
        for (const [key, value] of formData.entries()) {
            // Пытаемся распарсить JSON-значения
            try {
                data[key] = JSON.parse(value as string);
            } catch {
                data[key] = value;
            }
        }

        const validated = PresenceSettingsSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        // Обновляем все настройки в транзакции
        await db.transaction(async (tx) => {
            for (const [key, value] of Object.entries(validated.data)) {
                await tx.update(presenceSettings)
                    .set({
                        value: JSON.stringify(value),
                        updatedAt: new Date(),
                        updatedById: session!.id,
                    })
                    .where(eq(presenceSettings.key, key));
            }
        });

        await logAction("Обновлены настройки присутствия","presence_settings","all", validated.data);
        revalidatePath("/staff/settings");

        return okVoid();
    } catch (error) {
        await logError({
            error,
            path:"/staff/settings/update-all",
            method:"updateAllPresenceSettings",
        });
        return { success: false, error:"Не удалось сохранить настройки" };
    }
}
