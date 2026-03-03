import { z } from "zod";

// ============================================
// XIAOMI ACCOUNT
// ============================================

export const XiaomiLoginSchema = z.object({
    username: z.string().min(1, "Введите логин или email"),
    password: z.string().min(1, "Введите пароль"),
    region: z.enum(["cn", "de", "us", "ru", "sg", "in"], {
        errorMap: () => ({ message: "Выберите регион" })
    }),
});

export const XiaomiVerifySchema = z.object({
    code: z.string().min(4, "Введите код подтверждения").max(8),
    sessionId: z.string().min(1),
});

// ============================================
// CAMERAS
// ============================================

export const CreateCameraSchema = z.object({
    xiaomiAccountId: z.string().uuid("Выберите аккаунт Xiaomi"),
    deviceId: z.string().min(1, "ID устройства обязателен"),
    name: z.string().min(1, "Название камеры обязательно"),
    localName: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    isEnabled: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),
    confidenceThreshold: z.string().regex(/^0\.\d{1,2}$/, "Порог от 0.00 до 0.99").default("0.60"),
});

export const UpdateCameraSchema = z.object({
    localName: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    isEnabled: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
    confidenceThreshold: z.string().regex(/^0\.\d{1,2}$/, "Порог от 0.00 до 0.99").optional(),
});

// ============================================
// EMPLOYEE FACES
// ============================================

export const CreateFaceSchema = z.object({
    userId: z.string().uuid("Выберите сотрудника"),
    faceEncoding: z.array(z.number()).min(128, "Некорректные данные лица"),
    photoUrl: z.string().url("Некорректный URL фото").optional().nullable(),
    isPrimary: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
});

export const UpdateFaceSchema = z.object({
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
    isPrimary: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

// ============================================
// PRESENCE DETECTION (от Python-сервиса)
// ============================================

export const PresenceDetectSchema = z.object({
    cameraId: z.string().uuid("Некорректный ID камеры"),
    eventType: z.enum(["detected", "lost", "recognized", "unknown"]),
    userId: z.string().uuid().optional().nullable(),
    confidence: z.number().min(0).max(1).optional(),
    faceEncoding: z.array(z.number()).optional().nullable(),
    snapshotUrl: z.string().url().optional().nullable(),
    timestamp: z.string().datetime().optional(),
});

// ============================================
// SETTINGS
// ============================================

export const UpdateSettingSchema = z.object({
    key: z.string().min(1, "Ключ настройки обязателен"),
    value: z.unknown(),
});

export const PresenceSettingsSchema = z.object({
    work_start_time: z.string().regex(/^\d{2}:\d{2}$/, "Формат HH:MM"),
    work_end_time: z.string().regex(/^\d{2}:\d{2}$/, "Формат HH:MM"),
    idle_threshold_seconds: z.coerce.number().int().min(5).max(300),
    late_threshold_minutes: z.coerce.number().int().min(0).max(120),
    recognition_confidence: z.coerce.number().min(0.3).max(0.99),
    go2rtc_url: z.string().url("Некорректный URL"),
    telegram_alerts_enabled: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    auto_clock_out_hours: z.coerce.number().int().min(1).max(24),
});

// ============================================
// REPORTS
// ============================================

export const ReportFilterSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    userId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
});
