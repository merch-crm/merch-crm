"use server";

import { okVoid } from "@/lib/types";

import { db } from "@/lib/db";
import { meterPriceTiers } from "@/lib/schema/calculators";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import {
    createMeterPriceTierSchema,
    updateMeterPriceTierSchema,
    deleteMeterPriceTierSchema,
} from "./schemas";
import type { ApplicationType, MeterPriceTierData } from "../types";

// Путь для ревалидации
const REVALIDATE_PATH = "/dashboard/production/calculators";

// ============================================================================
// GET - Получение цен за метраж
// ============================================================================

export async function getMeterPricing(
    applicationType: ApplicationType,
    rollWidthMm?: number
): Promise<{ success: true; data: MeterPriceTierData[] } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const conditions = [
            eq(meterPriceTiers.applicationType, applicationType),
            eq(meterPriceTiers.isActive, true),
        ];

        if (rollWidthMm !== undefined) {
            conditions.push(eq(meterPriceTiers.rollWidthMm, rollWidthMm));
        }

        const result = await db
            .select()
            .from(meterPriceTiers)
            .where(and(...conditions))
            .orderBy(asc(meterPriceTiers.rollWidthMm), asc(meterPriceTiers.sortOrder));

        const data: MeterPriceTierData[] = result.map((row) => ({
            id: row.id,
            applicationType: row.applicationType as ApplicationType,
            rollWidthMm: row.rollWidthMm,
            fromMeters: Number(row.fromMeters),
            toMeters: row.toMeters ? Number(row.toMeters) : null,
            pricePerMeter: Number(row.pricePerMeter),
            sortOrder: row.sortOrder,
            isActive: row.isActive,
        }));

        return { success: true, data };
    } catch (error) {
        logError({ error, details: { context: "getMeterPricing", applicationType } });
        return { success: false, error: "Ошибка загрузки цен" };
    }
}

// Получение всех цен (включая неактивные) для настроек
export async function getAllMeterPricing(
    applicationType: ApplicationType
): Promise<{ success: true; data: MeterPriceTierData[] } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const result = await db
            .select()
            .from(meterPriceTiers)
            .where(eq(meterPriceTiers.applicationType, applicationType))
            .orderBy(asc(meterPriceTiers.rollWidthMm), asc(meterPriceTiers.sortOrder));

        const data: MeterPriceTierData[] = result.map((row) => ({
            id: row.id,
            applicationType: row.applicationType as ApplicationType,
            rollWidthMm: row.rollWidthMm,
            fromMeters: Number(row.fromMeters),
            toMeters: row.toMeters ? Number(row.toMeters) : null,
            pricePerMeter: Number(row.pricePerMeter),
            sortOrder: row.sortOrder,
            isActive: row.isActive,
        }));

        return { success: true, data };
    } catch (error) {
        logError({ error, details: { context: "getAllMeterPricing", applicationType } });
        return { success: false, error: "Ошибка загрузки цен" };
    }
}

// ============================================================================
// CREATE - Создание уровня цены
// ============================================================================

export async function createMeterPriceTier(
    input: unknown
): Promise<{ success: true; data: MeterPriceTierData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify pricing
        if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
            return { success: false, error: "У вас нет прав на изменение цен" };
        }

        const validated = createMeterPriceTierSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { applicationType, rollWidthMm, fromMeters, toMeters, pricePerMeter, sortOrder, isActive } = validated.data;

        const [result] = await db
            .insert(meterPriceTiers)
            .values({
                applicationType,
                rollWidthMm,
                fromMeters: String(fromMeters),
                toMeters: toMeters !== null && toMeters !== undefined ? String(toMeters) : null,
                pricePerMeter: String(pricePerMeter),
                sortOrder,
                isActive,
            })
            .returning();

        await logAction("Создан уровень цены", "meter_price_tier", result.id, {
            applicationType,
            rollWidthMm,
            fromMeters,
            toMeters,
            pricePerMeter
        });

        revalidatePath(REVALIDATE_PATH);

        return {
            success: true,
            data: {
                id: result.id,
                applicationType: result.applicationType as ApplicationType,
                rollWidthMm: result.rollWidthMm,
                fromMeters: Number(result.fromMeters),
                toMeters: result.toMeters ? Number(result.toMeters) : null,
                pricePerMeter: Number(result.pricePerMeter),
                sortOrder: result.sortOrder,
                isActive: result.isActive,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "createMeterPriceTier", input } });
        return { success: false, error: "Ошибка создания уровня цены" };
    }
}

// ============================================================================
// UPDATE - Обновление уровня цены
// ============================================================================

export async function updateMeterPriceTier(
    input: unknown
): Promise<{ success: true; data: MeterPriceTierData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify pricing
        if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
            return { success: false, error: "У вас нет прав на изменение цен" };
        }

        const validated = updateMeterPriceTierSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { id, ...updates } = validated.data;

        const updateData: Record<string, unknown> = {};
        if (updates.applicationType !== undefined) updateData.applicationType = updates.applicationType;
        if (updates.rollWidthMm !== undefined) updateData.rollWidthMm = updates.rollWidthMm;
        if (updates.fromMeters !== undefined) updateData.fromMeters = String(updates.fromMeters);
        if (updates.toMeters !== undefined) updateData.toMeters = updates.toMeters !== null ? String(updates.toMeters) : null;
        if (updates.pricePerMeter !== undefined) updateData.pricePerMeter = String(updates.pricePerMeter);
        if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

        const [result] = await db
            .update(meterPriceTiers)
            .set(updateData)
            .where(eq(meterPriceTiers.id, id))
            .returning();

        if (!result) {
            return { success: false, error: "Уровень цены не найден" };
        }

        await logAction("Обновлен уровень цены", "meter_price_tier", id, updates);

        revalidatePath(REVALIDATE_PATH);

        return {
            success: true,
            data: {
                id: result.id,
                applicationType: result.applicationType as ApplicationType,
                rollWidthMm: result.rollWidthMm,
                fromMeters: Number(result.fromMeters),
                toMeters: result.toMeters ? Number(result.toMeters) : null,
                pricePerMeter: Number(result.pricePerMeter),
                sortOrder: result.sortOrder,
                isActive: result.isActive,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "updateMeterPriceTier", input } });
        return { success: false, error: "Ошибка обновления уровня цены" };
    }
}

// ============================================================================
// DELETE - Удаление уровня цены
// ============================================================================

export async function deleteMeterPriceTier(
    input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify pricing
        if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
            return { success: false, error: "У вас нет прав на удаление цен" };
        }

        const validated = deleteMeterPriceTierSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { id } = validated.data;

        await db.delete(meterPriceTiers).where(eq(meterPriceTiers.id, id));

        await logAction("Удален уровень цены", "meter_price_tier", id, { id });

        revalidatePath(REVALIDATE_PATH);

        return okVoid();
    } catch (error) {
        logError({ error, details: { context: "deleteMeterPriceTier", input } });
        return { success: false, error: "Ошибка удаления уровня цены" };
    }
}

// ============================================================================
// BULK UPDATE - Массовое обновление цен
// ============================================================================

export async function bulkUpdateMeterPricing(
    applicationType: ApplicationType,
    rollWidthMm: number,
    tiers: Array<{
        id?: string;
        fromMeters: number;
        toMeters: number | null;
        pricePerMeter: number;
        sortOrder: number;
    }>
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify pricing
        if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
            return { success: false, error: "У вас нет прав на изменение цен" };
        }

        await db.transaction(async (tx) => {
            // Удаляем старые записи для этого типа и ширины
            await tx
                .delete(meterPriceTiers)
                .where(
                    and(
                        eq(meterPriceTiers.applicationType, applicationType),
                        eq(meterPriceTiers.rollWidthMm, rollWidthMm)
                    )
                );

            // Вставляем новые
            if (tiers.length > 0) {
                await tx.insert(meterPriceTiers).values(
                    tiers.map((tier) => ({
                        applicationType,
                        rollWidthMm,
                        fromMeters: String(tier.fromMeters),
                        toMeters: tier.toMeters !== null && tier.toMeters !== undefined ? String(tier.toMeters) : null,
                        pricePerMeter: String(tier.pricePerMeter),
                        sortOrder: tier.sortOrder,
                        isActive: true,
                    }))
                );
            }
        });

        await logAction("Массовое обновление цен", "meter_price_tier", "bulk", {
            applicationType,
            rollWidthMm,
            count: tiers.length
        });

        revalidatePath(REVALIDATE_PATH);

        return okVoid();
    } catch (error) {
        logError({ error, details: { context: "bulkUpdateMeterPricing", applicationType, rollWidthMm } });
        return { success: false, error: "Ошибка сохранения цен" };
    }
}
