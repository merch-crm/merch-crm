"use server";

import { db } from "@/lib/db";
import { calculatorConsumablesSettings } from "@/lib/schema/calculators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-logger";
import { consumablesConfigSchema } from "./schemas";
import type { ApplicationType, ConsumablesConfigData } from "../types";

const REVALIDATE_PATH = "/dashboard/production/calculators";

// Дефолтные значения
const DEFAULT_CONSUMABLES: Record<ApplicationType, Partial<ConsumablesConfigData>> = {
    dtf: {
        inkWhitePerM2: 10,
        inkCmykPerM2: 4,
        powderPerM2: 34,
        fillPercent: 80,
        wastePercent: 10,
    },
    sublimation: {
        inkCmykPerM2: 4,
        paperPerM2: 1,
        fillPercent: 70,
        wastePercent: 8,
    },
    dtg: {
        inkWhitePerM2: 12,
        inkCmykPerM2: 5,
        fillPercent: 80,
        wastePercent: 5,
    },
    silkscreen: {
        fillPercent: 100,
        wastePercent: 5,
    },
    thermotransfer: {
        fillPercent: 100,
        wastePercent: 10,
    },
    embroidery: {
        fillPercent: 100,
        wastePercent: 5,
    },
    "print-application": {
        fillPercent: 100,
        wastePercent: 0,
    },
};

// ============================================================================
// GET - Получение настроек расходников
// ============================================================================

export async function getConsumablesConfig(
    applicationType: ApplicationType
): Promise<{ success: true; data: ConsumablesConfigData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const [result] = await db
            .select()
            .from(calculatorConsumablesSettings)
            .where(eq(calculatorConsumablesSettings.applicationType, applicationType))
            .limit(1);

        if (!result) {
            // Возвращаем дефолтные значения
            const defaults = DEFAULT_CONSUMABLES[applicationType];
            return {
                success: true,
                data: {
                    applicationType,
                    inkWhitePerM2: defaults.inkWhitePerM2 ?? null,
                    inkCmykPerM2: defaults.inkCmykPerM2 ?? null,
                    powderPerM2: defaults.powderPerM2 ?? null,
                    paperPerM2: defaults.paperPerM2 ?? null,
                    fillPercent: defaults.fillPercent ?? 80,
                    wastePercent: defaults.wastePercent ?? 10,
                    config: null,
                },
            };
        }

        return {
            success: true,
            data: {
                applicationType: result.applicationType as ApplicationType,
                inkWhitePerM2: result.inkWhitePerM2 ? Number(result.inkWhitePerM2) : null,
                inkCmykPerM2: result.inkCmykPerM2 ? Number(result.inkCmykPerM2) : null,
                powderPerM2: result.powderPerM2 ? Number(result.powderPerM2) : null,
                paperPerM2: result.paperPerM2 ? Number(result.paperPerM2) : null,
                fillPercent: result.fillPercent,
                wastePercent: result.wastePercent,
                config: result.config as Record<string, number> | null,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "getConsumablesConfig", applicationType } });
        return { success: false, error: "Ошибка загрузки настроек" };
    }
}

// ============================================================================
// SAVE - Сохранение настроек расходников
// ============================================================================

export async function saveConsumablesConfig(
    input: unknown
): Promise<{ success: true; data: ConsumablesConfigData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const validated = consumablesConfigSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const {
            applicationType,
            inkWhitePerM2,
            inkCmykPerM2,
            powderPerM2,
            paperPerM2,
            fillPercent,
            wastePercent,
            config,
        } = validated.data;

        // Upsert - вставляем или обновляем
        const [result] = await db
            .insert(calculatorConsumablesSettings)
            .values({
                applicationType,
                inkWhitePerM2: inkWhitePerM2 != null ? String(inkWhitePerM2) : null,
                inkCmykPerM2: inkCmykPerM2 != null ? String(inkCmykPerM2) : null,
                powderPerM2: powderPerM2 != null ? String(powderPerM2) : null,
                paperPerM2: paperPerM2 != null ? String(paperPerM2) : null,
                fillPercent,
                wastePercent,
                config: config || null,
            })
            .onConflictDoUpdate({
                target: calculatorConsumablesSettings.applicationType,
                set: {
                    inkWhitePerM2: inkWhitePerM2 != null ? String(inkWhitePerM2) : null,
                    inkCmykPerM2: inkCmykPerM2 != null ? String(inkCmykPerM2) : null,
                    powderPerM2: powderPerM2 != null ? String(powderPerM2) : null,
                    paperPerM2: paperPerM2 != null ? String(paperPerM2) : null,
                    fillPercent,
                    wastePercent,
                    config: config || null,
                },
            })
            .returning();

        revalidatePath(REVALIDATE_PATH);

        return {
            success: true,
            data: {
                applicationType: result.applicationType as ApplicationType,
                inkWhitePerM2: result.inkWhitePerM2 ? Number(result.inkWhitePerM2) : null,
                inkCmykPerM2: result.inkCmykPerM2 ? Number(result.inkCmykPerM2) : null,
                powderPerM2: result.powderPerM2 ? Number(result.powderPerM2) : null,
                paperPerM2: result.paperPerM2 ? Number(result.paperPerM2) : null,
                fillPercent: result.fillPercent,
                wastePercent: result.wastePercent,
                config: result.config as Record<string, number> | null,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "saveConsumablesConfig", input } });
        return { success: false, error: "Ошибка сохранения настроек" };
    }
}
