import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema/system";
import { eq } from "drizzle-orm";
import { BrandingSettings } from "@/lib/types";
import { cache } from "react";

const globalForBranding = global as unknown as {
    cachedBranding: BrandingSettings | null;
    lastCacheUpdate: number;
};

const CACHE_TTL = 60 * 1000; // 1 minute

export const getBrandingSettings = cache(async (): Promise<BrandingSettings> => {
    const now = Date.now();
    if (globalForBranding.cachedBranding && (now - globalForBranding.lastCacheUpdate < CACHE_TTL)) {
        return globalForBranding.cachedBranding;
    }
    const defaultBranding: BrandingSettings = {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        color: "#5d00ff", // Алиас для совместимости
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
        console.log("[Branding] Fetching settings from DB via tunnel...");
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "branding")).limit(1);
        const settings = result[0];

        if (!settings) {
            console.log("[Branding] No branding found in DB, using defaults.");
            return defaultBranding;
        }

        console.log("[Branding] Found branding in DB, parsing...");
        const val = settings.value as Record<string, unknown>;
        const primaryColor = (val.primaryColor as string) || (val.primary_color as string) || "#5d00ff";
        
        const finalSettings = {
            ...defaultBranding,
            ...val,
            primaryColor: primaryColor,
            color: primaryColor, // Гарантируем наличие для клиента
            logoUrl: (val.logoUrl as string) || (val.logo_url as string) || null,
            radiusOuter: (val.radiusOuter as number) || (val.radius_outer as number) || 24,
            radiusInner: (val.radiusInner as number) || (val.radius_inner as number) || 14,
            isVibrationEnabled: val.isVibrationEnabled !== undefined ? (val.isVibrationEnabled as boolean) : (val.vibrationEnabled !== undefined ? (val.vibrationEnabled as boolean) : true),
            soundConfig: (val.soundConfig as BrandingSettings['soundConfig']) || {}
        } as BrandingSettings;

        globalForBranding.cachedBranding = finalSettings;
        globalForBranding.lastCacheUpdate = Date.now();
        console.log("[Branding] Successfully loaded branding.");
        return finalSettings;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("❌ [Branding] Database connection/query failed:", message);
        console.log("[Branding] Using defaultBranding as fallback...");
        return defaultBranding;
    }
});
