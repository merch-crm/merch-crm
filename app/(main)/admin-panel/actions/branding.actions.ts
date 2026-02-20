"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionResult, BrandingSettings } from "@/lib/types";
import { saveLocalFile } from "@/lib/local-storage";
import sharp from "sharp";
import { serializeIconGroups, ICON_GROUPS, SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";
import { BrandingSettingsSchema, IconGroupsSchema } from "../validation";

export async function getBrandingAction(): Promise<ActionResult<BrandingSettings>> {
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
        const setting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });

        if (!setting) return { success: true, data: defaultBranding };

        const val = setting.value as Record<string, unknown>;
        return {
            success: true,
            data: {
                ...defaultBranding,
                ...val,
                primaryColor: (val.primaryColor as string) || (val.primary_color as string) || "#5d00ff",
                logoUrl: (val.logoUrl as string) || (val.system_logo as string) || (val.logo_url as string) || null,
                faviconUrl: (val.faviconUrl as string) || (val.favicon_url as string) || null,
                radiusOuter: (val.radiusOuter as number) || (val.radius_outer as number) || 24,
                radiusInner: (val.radiusInner as number) || (val.radius_inner as number) || 14,
                isVibrationEnabled: val.isVibrationEnabled !== undefined ? (val.isVibrationEnabled as boolean) : (val.vibrationEnabled !== undefined ? (val.vibrationEnabled as boolean) : true),
                soundConfig: (val.soundConfig as BrandingSettings['soundConfig']) || {}
            } as BrandingSettings
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/branding",
            method: "getBrandingAction"
        });
        return { success: true, data: defaultBranding };
    }
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
    try {
        const res = await getBrandingAction();
        return res.success ? (res.data || {} as BrandingSettings) : {
            companyName: "MerchCRM",
            logoUrl: null,
            primaryColor: "#5d00ff",
            faviconUrl: null,
            backgroundColor: "#f2f2f2",
            currencySymbol: "₽"
        } as BrandingSettings;
    } catch {
        return {
            companyName: "MerchCRM",
            logoUrl: null,
            primaryColor: "#5d00ff",
            faviconUrl: null,
            backgroundColor: "#f2f2f2",
            currencySymbol: "₽"
        } as BrandingSettings;
    }
}

export async function updateBrandingSettings(data: BrandingSettings) {
    try {
        const res = await updateBrandingAction(data);
        if (res.success) return { success: true };
        return { error: res.error };
    } catch (err: unknown) {
        return { error: (err as Error).message };
    }
}

export async function updateBrandingAction(data: BrandingSettings): Promise<ActionResult> {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const validated = BrandingSettingsSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const validData = validated.data;
        const saveData: Record<string, unknown> = { ...data };

        // Sync for legacy support
        if (data.primaryColor) saveData['primary_color'] = data.primaryColor;
        if (data.logoUrl !== undefined) saveData['logo_url'] = data.logoUrl;
        if (data.faviconUrl !== undefined) saveData['favicon_url'] = data.faviconUrl;
        if (data.radiusOuter !== undefined) saveData['radius_outer'] = data.radiusOuter;
        if (data.radiusInner !== undefined) saveData['radius_inner'] = data.radiusInner;

        await db.insert(systemSettings) // audit-ignore: одиночный upsert, транзакция не требуется
            .values({ key: "branding", value: validData, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: validData, updatedAt: new Date() }
            });

        revalidatePath("/", "layout");
        revalidatePath("/admin-panel/branding");
        await logAction("Изменение внешнего вида системы", "system", "branding", saveData);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/admin-panel/branding", method: "updateBrandingAction" });
        return { success: false, error: "Не удалось обновить брендинг" };
    }
}

export async function uploadBrandingFile(formData: FormData): Promise<ActionResult<{ url: string }>> {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;
        const soundKey = formData.get("soundKey") as string | null;

        if (!file || !type) return { success: false, error: "Отсутствуют необходимые данные" };

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: Buffer;
        let fileName: string;

        if (type === "logo") {
            processedBuffer = await sharp(buffer).resize({ width: 500, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
            fileName = `branding/logo_brand_crm.webp`;
        } else if (type === "favicon") {
            processedBuffer = await sharp(buffer).resize(48, 48).png().toBuffer();
            fileName = `branding/favicon.png`;
        } else if (type === "background") {
            processedBuffer = await sharp(buffer).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
            fileName = `branding/bg_${Date.now()}.webp`;
        } else if (type === "print_logo") {
            processedBuffer = await sharp(buffer).resize({ width: 1000, withoutEnlargement: true }).png({ quality: 90 }).toBuffer();
            fileName = `branding/print_logo_${Date.now()}.png`;
        } else if (type === "crm_background") {
            processedBuffer = await sharp(buffer).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
            fileName = `branding/crm_bg_${Date.now()}.webp`;
        } else if (type === "email_logo") {
            processedBuffer = await sharp(buffer).resize({ width: 600, withoutEnlargement: true }).png({ quality: 90 }).toBuffer();
            fileName = `branding/email_logo_${Date.now()}.png`;
        } else if (type === "sound") {
            processedBuffer = buffer;
            const extension = file.name.split('.').pop() || 'mp3';
            fileName = soundKey ? `sounds/${soundKey}.${extension}` : `sounds/sound_${Date.now()}.${extension}`;
        } else {
            return { success: false, error: "Некорректный тип" };
        }

        const result = await saveLocalFile(fileName, processedBuffer);
        if (result.success) {
            return { success: true, data: { url: `/api/storage/local/${fileName}` } };
        }
        return { success: false, error: result.error || "Failed to save file" };
    } catch (error) {
        await logError({ error, path: "/admin-panel/branding", method: "uploadBrandingFile" });
        return { success: false, error: "Не удалось обработать файл" };
    }
}

export async function getIconGroups(): Promise<ActionResult<SerializedIconGroup[]>> {
    try {
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "icon_groups")).limit(1);
        const settings = result[0];
        if (!settings) return { success: true, data: serializeIconGroups(ICON_GROUPS) };
        return { success: true, data: settings.value as SerializedIconGroup[] };
    } catch (error) {
        await logError({ error, path: "/admin-panel/branding", method: "getIconGroups" });
        return { success: true, data: serializeIconGroups(ICON_GROUPS) };
    }
}

export async function updateIconGroups(groups: SerializedIconGroup[]): Promise<ActionResult> {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const validated = IconGroupsSchema.safeParse(groups);
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        const serialized = validated.data;
        await db.insert(systemSettings) // audit-ignore: одиночный upsert, транзакция не требуется
            .values({ key: "icon_groups", value: serialized, updatedAt: new Date() })
            .onConflictDoUpdate({ target: systemSettings.key, set: { value: serialized, updatedAt: new Date() } });

        revalidatePath("/dashboard");
        revalidatePath("/admin-panel/branding");
        await logAction("Обновление категорий иконок", "system", "icon_groups", {});
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/admin-panel/branding", method: "updateIconGroups" });
        return { success: false, error: "Ошибка при обновлении групп иконок" };
    }
}
