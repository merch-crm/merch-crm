import { z } from "zod";

export const BrandingSettingsSchema = z.object({
    companyName: z.string().min(1, "Название компании обязательно"),
    logoUrl: z.string().nullable().optional(),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Некорректный формат цвета"),
    faviconUrl: z.string().nullable().optional(),
    radiusOuter: z.number().min(0).max(100),
    radiusInner: z.number().min(0).max(100),
    loginSlogan: z.string().optional(),
    dashboardWelcome: z.string().optional(),
    notificationSound: z.string().optional(),
    isVibrationEnabled: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    crmBackgroundUrl: z.string().nullable().optional(),
    crmBackgroundBlur: z.number().optional(),
    crmBackgroundBrightness: z.number().optional(),
    emailPrimaryColor: z.string().optional(),
    emailContrastColor: z.string().optional(),
    emailFooter: z.string().optional(),
    emailSignature: z.string().optional(),
    currencySymbol: z.string().optional(),
    dateFormat: z.string().optional(),
    timezone: z.string().optional(),
    soundConfig: z.record(z.string(), z.object({
        enabled: z.boolean(),
        vibration: z.boolean(),
        customUrl: z.string().nullable().optional()
    })).optional(),
}).passthrough();

export const IconGroupSchema = z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    icons: z.array(z.object({
        name: z.string(),
        label: z.string(),
        svgContent: z.string(),
    })),
});

export const IconGroupsSchema = z.array(IconGroupSchema);
