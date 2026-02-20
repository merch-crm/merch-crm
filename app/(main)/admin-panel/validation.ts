import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    roleId: z.string().uuid("Выберите корректную роль"),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
});

export const UpdateUserSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа").optional(),
    email: z.string().email("Некорректный email").optional(),
    roleId: z.string().uuid("Выберите корректную роль").optional(),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

export const UpdateRoleSchema = z.object({
    name: z.string().min(2, "Название роли должно содержать минимум 2 символа").optional(),
    description: z.string().optional().or(z.literal("")),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
    color: z.string().optional().nullable(),
});

export const CreateRoleSchema = z.object({
    name: z.string().min(2, "Название роли должно содержать минимум 2 символа"),
    description: z.string().optional().or(z.literal("")),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
});

export const CreateDepartmentSchema = z.object({
    name: z.string().min(2, "Название отдела должно содержать минимум 2 символа"),
    description: z.string().optional().or(z.literal("")),
    color: z.string().optional(),
});

export const UpdateDepartmentSchema = z.object({
    name: z.string().min(2, "Название отдела должно содержать минимум 2 символа").optional(),
    description: z.string().optional().or(z.literal("")),
    color: z.string().optional(),
});

export const StorageQuotaSettingsSchema = z.object({
    maxS3Size: z.number().min(0, "Лимит S3 не может быть отрицательным"),
    maxLocalSize: z.number().min(0, "Лимит диска не может быть отрицательным"),
    warningThreshold: z.number().min(0).max(1, "Порог должен быть от 0 до 1"),
});

export const BrandingSettingsSchema = z.object({
    companyName: z.string().min(2, "Название компании должно быть не менее 2 символов"),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Некорректный HEX-код цвета").optional(),
    logoUrl: z.string().nullable().optional(),
    faviconUrl: z.string().nullable().optional(),
    radiusOuter: z.number().min(0).max(100).optional(),
    radiusInner: z.number().min(0).max(100).optional(),
    loginSlogan: z.string().nullable().optional(),
    dashboardWelcome: z.string().nullable().optional(),
    notificationSound: z.string().nullable().optional(),
    isVibrationEnabled: z.boolean().optional(),
    soundConfig: z.record(z.string(), z.any()).optional(),
    backgroundColor: z.string().nullable().optional(),
    crmBackgroundUrl: z.string().nullable().optional(),
    crmBackgroundBlur: z.number().min(0).max(50).optional(),
    crmBackgroundBrightness: z.number().min(0).max(200).optional(),
    currencySymbol: z.string().max(10).optional(),
    dateFormat: z.string().optional(),
    timezone: z.string().optional(),
}).passthrough();

export const IconGroupsSchema = z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    category: z.string(),
    icons: z.array(z.object({
        id: z.string(),
        name: z.string(),
        svgContent: z.string().optional(),
        lucideIcon: z.string().optional(),
    }))
}));

export const NotificationSettingsSchema = z.object({
    system: z.object({
        enabled: z.boolean(),
        browserPush: z.boolean()
    }).catchall(z.boolean()),
    telegram: z.object({
        enabled: z.boolean(),
        botToken: z.string(),
        chatId: z.string(),
        notifyOnNewOrder: z.boolean(),
        notifyOnLowStock: z.boolean(),
        notifyOnSystemError: z.boolean()
    }).catchall(z.union([z.boolean(), z.string()])),
    events: z.object({
        new_order: z.boolean(),
        order_status_change: z.boolean(),
        stock_low: z.boolean(),
        task_assigned: z.boolean()
    }).catchall(z.boolean())
});

export const UpdateSystemSettingSchema = z.object({
    key: z.string().min(1, "Ключ настройки обязателен"),
    value: z.unknown()
});
