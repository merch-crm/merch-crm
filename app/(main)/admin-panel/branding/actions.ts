"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { saveLocalFile } from "@/lib/local-storage";
import { logError } from "@/lib/error-logger";
import { BrandingSettingsSchema, IconGroupsSchema } from "./validation";
import sharp from "sharp";

import type { BrandingSettings } from "@/lib/types";

import { serializeIconGroups, ICON_GROUPS, SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";

export async function getBrandingSettings(): Promise<BrandingSettings> {
    const defaultBranding: BrandingSettings = {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        faviconUrl: null,
        radiusOuter: 24,
        radiusInner: 14,
        loginSlogan: "Ваша CRM для управления мерчем",
        dashboardWelcome: "Добро пожаловать в систему управления",
        notificationSound: "/sounds/notification.wav",
        isVibrationEnabled: true,
        soundConfig: {},
        backgroundColor: "#f2f2f2",
        crmBackgroundUrl: null,
        crmBackgroundBlur: 0,
        crmBackgroundBrightness: 100,
        emailPrimaryColor: "#5d00ff",
        emailContrastColor: "#ffffff",
        emailFooter: "С уважением, команда MerchCRM",
        emailSignature: "Управляйте вашим мерчем эффективно",
        currencySymbol: "₽",
        dateFormat: "DD.MM.YYYY",
        timezone: "Europe/Moscow"
    };

    try {
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "branding")).limit(1);
        const settings = result[0];

        if (!settings) return defaultBranding;

        const val = settings.value as Record<string, unknown>;
        return {
            ...defaultBranding,
            ...val,
            primaryColor: (val.primaryColor as string) || (val.primary_color as string) || "#5d00ff",
            logoUrl: (val.logoUrl as string) || (val.logo_url as string) || null,
            faviconUrl: (val.faviconUrl as string) || (val.favicon_url as string) || null,
            radiusOuter: (val.radiusOuter as number) || (val.radius_outer as number) || 24,
            radiusInner: (val.radiusInner as number) || (val.radius_inner as number) || 14,
            isVibrationEnabled: val.isVibrationEnabled !== undefined ? (val.isVibrationEnabled as boolean) : (val.vibrationEnabled !== undefined ? (val.vibrationEnabled as boolean) : true),
            soundConfig: (val.soundConfig as BrandingSettings['soundConfig']) || {}
        } as BrandingSettings;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "getBrandingSettings"
        });
        return defaultBranding;
    }
}

export async function updateBrandingSettings(data: BrandingSettings) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const validatedData = BrandingSettingsSchema.safeParse(data);
        if (!validatedData.success) {
            return { error: validatedData.error.issues[0].message };
        }

        const validData = validatedData.data;

        // Check if settings exist
        const saveData: Record<string, unknown> = { ...data };

        // Sync camelCase and snake_case properties for DB compatibility (legacy support)
        if (data.primaryColor) saveData['primary_color'] = data.primaryColor;
        if (data.logoUrl !== undefined) saveData['logo_url'] = data.logoUrl;
        if (data.faviconUrl !== undefined) saveData['favicon_url'] = data.faviconUrl;
        if (data.radiusOuter !== undefined) saveData['radius_outer'] = data.radiusOuter;
        if (data.radiusInner !== undefined) saveData['radius_inner'] = data.radiusInner;

        await db.transaction(async (tx) => {
            await tx.insert(systemSettings)
                .values({
                    key: "branding",
                    value: validData,
                    updatedAt: new Date()
                })
                .onConflictDoUpdate({
                    target: systemSettings.key,
                    set: { value: validData, updatedAt: new Date() }
                });

            await logAction("Обновление настроек брендинга", "system", "branding", saveData, tx);
        });

        revalidatePath("/dashboard");
        revalidatePath("/admin-panel/branding");

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "updateBrandingSettings",
            details: { data }
        });
        const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении настроек";
        return { error: errorMessage };
    }
}

export async function uploadBrandingFile(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const file = formData.get("file") as File;
        const type = formData.get("type") as "logo" | "favicon" | "background" | "sound" | "print_logo" | "crm_background" | "email_logo";
        const soundKey = formData.get("soundKey") as string | null;

        if (!file || !type) {
            return { error: "Отсутствуют необходимые данные" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: Buffer;
        let fileName: string;

        if (type === "logo") {
            processedBuffer = await sharp(buffer)
                .resize({ width: 500, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            fileName = `branding/logo_brand_crm.webp`;
        } else if (type === "favicon") {
            processedBuffer = await sharp(buffer)
                .resize(48, 48)
                .png()
                .toBuffer();
            fileName = `branding/favicon.png`;
        } else if (type === "background") {
            processedBuffer = await sharp(buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .webp({ quality: 70 })
                .toBuffer();
            fileName = `branding/bg_${Date.now()}.webp`;
        } else if (type === "print_logo") {
            processedBuffer = await sharp(buffer)
                .resize({ width: 1000, withoutEnlargement: true })
                .png({ quality: 90 })
                .toBuffer();
            fileName = `branding/print_logo_${Date.now()}.png`;
        } else if (type === "crm_background") {
            processedBuffer = await sharp(buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .webp({ quality: 70 })
                .toBuffer();
            fileName = `branding/crm_bg_${Date.now()}.webp`;
        } else if (type === "email_logo") {
            processedBuffer = await sharp(buffer)
                .resize({ width: 600, withoutEnlargement: true })
                .png({ quality: 90 })
                .toBuffer();
            fileName = `branding/email_logo_${Date.now()}.png`;
        } else if (type === "sound") {
            processedBuffer = buffer;
            const extension = file.name.split('.').pop() || 'mp3';
            if (soundKey) {
                fileName = `sounds/${soundKey}.${extension}`;
            } else {
                fileName = `sounds/sound_${Date.now()}.${extension}`;
            }
        } else {
            return { error: "Некорректный тип" };
        }

        const result = await saveLocalFile(fileName, processedBuffer);

        if (result.success) {
            return {
                success: true,
                url: `/api/storage/local/${fileName}`
            };
        } else {
            return { error: result.error || "Failed to save file" };
        }
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "uploadBrandingFile"
        });
        return { error: "Не удалось обработать файл" };
    }
}

export async function exportDatabaseBackup() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = {
            users: await db.query.users.findMany(),
            roles: await db.query.roles.findMany(),
            departments: await db.query.departments.findMany(),
            clients: await db.query.clients.findMany(),
            orders: await db.query.orders.findMany(),
            orderItems: await db.query.orderItems.findMany(),
            inventoryItems: await db.query.inventoryItems.findMany(),
            inventoryCategories: await db.query.inventoryCategories.findMany(),
            storageLocations: await db.query.storageLocations.findMany(),
            payments: await db.query.payments.findMany(),
            expenses: await db.query.expenses.findMany(),
            promocodes: await db.query.promocodes.findMany(),
            wikiPages: await db.query.wikiPages.findMany(),
            wikiFolders: await db.query.wikiFolders.findMany(),
            tasks: await db.query.tasks.findMany(),
            auditLogs: await db.query.auditLogs.findMany(),
            timestamp: new Date().toISOString(),
        };

        return { success: true, data };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "exportDatabaseBackup"
        });
        const errorMessage = error instanceof Error ? error.message : "Ошибка при экспорте базы данных";
        return { error: errorMessage };
    }
}

export async function getIconGroups(): Promise<SerializedIconGroup[]> {
    try {
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "icon_groups")).limit(1);
        const settings = result[0];

        if (!settings) {
            return serializeIconGroups(ICON_GROUPS);
        }

        const val = settings.value as unknown as SerializedIconGroup[];
        return val;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "getIconGroups"
        });
        return serializeIconGroups(ICON_GROUPS);
    }
}

export async function updateIconGroups(groups: SerializedIconGroup[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const validated = IconGroupsSchema.safeParse(groups);
        if (!validated.success) {
            return { error: validated.error.issues[0].message };
        }
        const serialized = validated.data;
        await db.transaction(async (tx) => {
            await tx.insert(systemSettings)
                .values({
                    key: "icon_groups",
                    value: serialized,
                    updatedAt: new Date()
                })
                .onConflictDoUpdate({
                    target: systemSettings.key,
                    set: { value: serialized, updatedAt: new Date() }
                });

            await logAction("Обновление категорий иконок", "system", "icon_groups", {}, tx);
        });

        revalidatePath("/dashboard");
        revalidatePath("/admin-panel/branding");

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "updateIconGroups",
            details: { groupsCount: groups.length }
        });
        const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении групп иконок";
        return { error: errorMessage };
    }
}
