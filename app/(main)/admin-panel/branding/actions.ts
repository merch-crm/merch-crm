"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { saveLocalFile } from "@/lib/local-storage";
import sharp from "sharp";

export interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
    radiusOuter?: number;
    radiusInner?: number;
    // New fields
    loginSlogan?: string | null;
    loginBackgroundUrl?: string | null;
    dashboardWelcome?: string | null;
    socialTelegram?: string | null;
    socialWhatsapp?: string | null;
    socialWebsite?: string | null;
    notificationSound?: string | null;
    vibrationEnabled?: boolean;
    printLogoUrl?: string | null;
    emailLogoUrl?: string | null;
    emailPrimaryColor?: string;
    emailContrastColor?: string;
    emailFooter?: string | null;
    emailSignature?: string | null;
    soundConfig?: Record<string, { enabled: boolean; vibration: boolean; customUrl?: string | null }>;
    backgroundColor?: string | null;
    crmBackgroundUrl?: string | null;
    crmBackgroundBlur?: number;
    crmBackgroundBrightness?: number;
    currencySymbol?: string;
    dateFormat?: string;
    timezone?: string;
}

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
        vibrationEnabled: true,
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
            vibrationEnabled: val.vibrationEnabled !== undefined ? (val.vibrationEnabled as boolean) : true,
            soundConfig: (val.soundConfig as BrandingSettings['soundConfig']) || {}
        } as BrandingSettings;
    } catch (error) {
        console.error("Error fetching branding settings from DB:", error);
        return defaultBranding;
    }
}

export async function updateBrandingSettings(data: BrandingSettings) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        // Check if settings exist
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "branding")).limit(1);
        const existing = result[0];

        const saveData: Record<string, unknown> = { ...data };

        // Sync camelCase and snake_case properties for DB compatibility (legacy support)
        if (data.primaryColor) saveData['primary_color'] = data.primaryColor;
        if (data.logoUrl !== undefined) saveData['logo_url'] = data.logoUrl;
        if (data.faviconUrl !== undefined) saveData['favicon_url'] = data.faviconUrl;
        if (data.radiusOuter !== undefined) saveData['radius_outer'] = data.radiusOuter;
        if (data.radiusInner !== undefined) saveData['radius_inner'] = data.radiusInner;

        if (existing) {
            await db.update(systemSettings)
                .set({ value: saveData, updatedAt: new Date() })
                .where(eq(systemSettings.key, "branding"));
        } else {
            await db.insert(systemSettings).values({
                key: "branding",
                value: saveData,
            });
        }

        await logAction("Обновление настроек брендинга", "system", "branding", saveData);

        revalidatePath("/dashboard");
        revalidatePath("/admin-panel/branding");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating branding settings:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
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
        console.error("Error processing branding file:", error);
        return { error: "Не удалось process image" };
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
        console.error("Error exporting database:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to export database";
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
        console.error("Error fetching icon groups:", error);
        return serializeIconGroups(ICON_GROUPS);
    }
}

export async function updateIconGroups(groups: SerializedIconGroup[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const serialized = groups;
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "icon_groups")).limit(1);
        const existing = result[0];

        if (existing) {
            await db.update(systemSettings)
                .set({ value: serialized, updatedAt: new Date() })
                .where(eq(systemSettings.key, "icon_groups"));
        } else {
            await db.insert(systemSettings).values({
                key: "icon_groups",
                value: serialized,
            });
        }

        await logAction("Обновление категорий иконок", "system", "icon_groups", {});

        revalidatePath("/dashboard");
        revalidatePath("/admin-panel/branding");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating icon groups:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update icon groups";
        return { error: errorMessage };
    }
}
