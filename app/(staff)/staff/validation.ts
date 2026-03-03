'use server';

import { z } from 'zod';

// ============================================
// XIAOMI / CAMERAS
// ============================================

export const XiaomiLoginInputSchema = z.object({
    username: z.string().min(1, 'Введите логин'),
    password: z.string().min(1, 'Введите пароль'),
    region: z.enum(['cn', 'de', 'us', 'ru', 'sg', 'in'], { message: 'Выберите регион' }),
});

export const SyncXiaomiDevicesSchema = z.object({
    accountId: z.string().uuid('Некорректный ID аккаунта'),
});

export const UpdateCameraInputSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    localName: z.string().max(255).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    isEnabled: z.boolean().optional(),
    confidenceThreshold: z.string().regex(/^0\.\d{1,2}$/).optional(),
});

export const DeleteXiaomiAccountSchema = z.object({
    accountId: z.string().uuid('Некорректный ID аккаунта'),
});

// ============================================
// EMPLOYEES
// ============================================

export const AddEmployeeFaceInputSchema = z.object({
    userId: z.string().uuid('Некорректный ID сотрудника'),
    photoUrl: z.string().url('Некорректный URL фото'),
    faceEncoding: z.array(z.number()).min(1, 'Данные лица не переданы'),
    quality: z.number().min(0).max(1).optional(),
});

export const DeleteEmployeeFaceSchema = z.object({
    faceId: z.string().uuid('Некорректный ID лица'),
});

export const SetPrimaryFaceSchema = z.object({
    faceId: z.string().uuid('Некорректный ID лица'),
    userId: z.string().uuid('Некорректный ID сотрудника'),
});

// ============================================
// WORKSTATIONS
// ============================================

const DetectionZoneSchema = z.union([
    z.object({ type: z.literal('rect'), x: z.number(), y: z.number(), width: z.number(), height: z.number() }),
    z.object({ type: z.literal('polygon'), points: z.array(z.object({ x: z.number(), y: z.number() })) }),
    z.object({ type: z.literal('circle'), cx: z.number(), cy: z.number(), radius: z.number() }),
]).nullable().optional();

export const CreateWorkstationSchema = z.object({
    name: z.string().min(1, 'Название обязательно').max(255),
    description: z.string().max(1000).optional().nullable(),
    cameraId: z.string().uuid().optional().nullable(),
    assignedUserId: z.string().uuid().optional().nullable(),
    requiresAssignedUser: z.boolean().optional(),
    zone: DetectionZoneSchema,
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Некорректный формат цвета').optional().nullable(),
});

export const UpdateWorkstationSchema = CreateWorkstationSchema.partial().extend({
    id: z.string().uuid('Некорректный ID рабочего места').optional(),
});

export const DeleteWorkstationSchema = z.object({
    id: z.string().uuid('Некорректный ID рабочего места'),
});

// ============================================
// SETTINGS
// ============================================

export const UpdatePresenceSettingsSchema = z.record(
    z.string().min(1),
    z.union([z.string(), z.number(), z.boolean()])
).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'Хотя бы один параметр обязателен' }
);
