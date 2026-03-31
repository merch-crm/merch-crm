import { z } from "zod";
import { APPLICATION_TYPES } from "../types";

// ============================================================================
// БАЗОВЫЕ СХЕМЫ
// ============================================================================

export const applicationTypeSchema = z.enum(APPLICATION_TYPES as [string, ...string[]]);

export const uuidSchema = z.string().uuid("Некорректный UUID");

// ============================================================================
// METER PRICE TIERS - Цены за метраж
// ============================================================================

export const meterPriceTierSchema = z.object({
    applicationType: applicationTypeSchema,
    rollWidthMm: z.number().int().positive("Ширина должна быть положительной"),
    fromMeters: z.number().positive("Значение должно быть положительным"),
    toMeters: z.number().positive().nullable(),
    pricePerMeter: z.number().positive("Цена должна быть положительной"),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const createMeterPriceTierSchema = meterPriceTierSchema;

export const updateMeterPriceTierSchema = meterPriceTierSchema.partial().extend({
    id: uuidSchema,
});

export const deleteMeterPriceTierSchema = z.object({
    id: uuidSchema,
});

// ============================================================================
// PRINT PLACEMENTS - Нанесения
// ============================================================================

export const placementSchema = z.object({
    applicationType: applicationTypeSchema,
    name: z.string().min(1, "Название обязательно").max(100),
    slug: z.string().max(100).optional(),
    description: z.string().max(255).optional(),
    widthMm: z.number().int().min(0, "Ширина не может быть отрицательной"),
    heightMm: z.number().int().min(0, "Высота не может быть отрицательной"),
    workPrice: z.number().min(0, "Цена не может быть отрицательной"),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const createPlacementSchema = placementSchema;

export const updatePlacementSchema = placementSchema.partial().extend({
    id: uuidSchema,
});

export const deletePlacementSchema = z.object({
    id: uuidSchema,
});

// ============================================================================
// CONSUMABLES SETTINGS - Настройки расходников
// ============================================================================

export const consumablesConfigSchema = z.object({
    applicationType: applicationTypeSchema,
    inkWhitePerM2: z.number().min(0).nullable().optional(),
    inkCmykPerM2: z.number().min(0).nullable().optional(),
    powderPerM2: z.number().min(0).nullable().optional(),
    paperPerM2: z.number().min(0).nullable().optional(),
    fillPercent: z.number().int().min(1).max(100).default(80),
    wastePercent: z.number().int().min(0).max(50).default(10),
    config: z.record(z.string(), z.number()).optional(),
});

// ============================================================================
// CALCULATIONS - Расчёты
// ============================================================================

export const printGroupInputSchema = z.object({
    id: z.string(),
    name: z.string().max(100).optional(),
    widthMm: z.number().int().positive("Ширина должна быть положительной"),
    heightMm: z.number().int().positive("Высота должна быть положительной"),
    quantity: z.number().int().positive("Количество должно быть положительным"),
    placementId: z.string().uuid().nullable().optional(),
    color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Некорректный цвет"),
});

export const saveCalculationSchema = z.object({
    applicationType: applicationTypeSchema,
    rollWidthMm: z.number().int().positive(),
    edgeMarginMm: z.number().int().min(0),
    printGapMm: z.number().int().min(0),
    groups: z.array(printGroupInputSchema).min(1, "Добавьте хотя бы один принт"),
    orderId: z.string().uuid().optional(),
});

// ============================================================================
// ТИПЫ ИЗ СХЕМ
// ============================================================================

export type MeterPriceTierInput = z.infer<typeof meterPriceTierSchema>;
export type CreateMeterPriceTierInput = z.infer<typeof createMeterPriceTierSchema>;
export type UpdateMeterPriceTierInput = z.infer<typeof updateMeterPriceTierSchema>;

export type PlacementInput = z.infer<typeof placementSchema>;
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;

export type ConsumablesConfigInput = z.infer<typeof consumablesConfigSchema>;

export type PrintGroupInputData = z.infer<typeof printGroupInputSchema>;
export type SaveCalculationInput = z.infer<typeof saveCalculationSchema>;
