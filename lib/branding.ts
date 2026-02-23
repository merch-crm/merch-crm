import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { BrandingSettings } from "@/lib/types";

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
        console.error("Error fetching branding settings:", error);
        return defaultBranding;
    }
}
