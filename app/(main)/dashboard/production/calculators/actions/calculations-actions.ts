"use server";

import { db } from "@/lib/db";
import {
    printCalculations,
    printCalculationGroups,
} from "@/lib/schema/calculators";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { saveCalculationSchema } from "./schemas";
import type {
    ApplicationType,
    CalculationResult,
    PrintGroupInput,
    ConsumptionItem,
} from "../types";
import { getMeterPricing } from "./meter-pricing-actions";
import { getConsumablesConfig } from "./consumables-actions";
import { getPlacements } from "./placements-actions";
import { performCalculation } from "./calculation-logic";

const REVALIDATE_PATH = "/dashboard/production/calculators";

// ============================================================================
// ГЕНЕРАЦИЯ НОМЕРА РАСЧЁТА
// ============================================================================

async function generateCalculationNumber(applicationType: ApplicationType): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = applicationType.toUpperCase();

    const [lastCalc] = await db
        .select({ calculationNumber: printCalculations.calculationNumber })
        .from(printCalculations)
        .where(
            and(
                eq(printCalculations.applicationType, applicationType),
                sql`DATE(${printCalculations.createdAt}) = CURRENT_DATE`
            )
        )
        .orderBy(desc(printCalculations.createdAt))
        .limit(1);

    let sequence = 1;
    if (lastCalc) {
        const match = lastCalc.calculationNumber.match(/-(\d{3})$/);
        if (match) {
            sequence = parseInt(match[1], 10) + 1;
        }
    }

    return `${prefix}-${dateStr}-${String(sequence).padStart(3, "0")}`;
}

// ============================================================================
// РАСЧЁТ РАСКЛАДКИ И СЕБЕСТОИМОСТИ
// ============================================================================

export async function calculateLayout(
    applicationType: ApplicationType,
    rollWidthMm: number,
    edgeMarginMm: number,
    printGapMm: number,
    groups: PrintGroupInput[]
): Promise<{ success: true; data: CalculationResult } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const [pricingRes, consumablesRes, placementsRes] = await Promise.all([
            getMeterPricing(applicationType, rollWidthMm),
            getConsumablesConfig(applicationType),
            getPlacements(applicationType, false),
        ]);

        if (!pricingRes.success || !consumablesRes.success) {
            return { success: false, error: "Ошибка загрузки конфигурации" };
        }

        const data = performCalculation({
            applicationType,
            rollWidthMm,
            edgeMarginMm,
            printGapMm,
            groups,
            pricing: pricingRes.data,
            consumables: consumablesRes.data,
            placements: placementsRes.success ? placementsRes.data : [],
        });

        return { success: true, data };
    } catch (error) {
        logError({ error, details: { context: "calculateLayout", applicationType } });
        return { success: false, error: "Ошибка расчёта" };
    }
}

// ============================================================================
// СОХРАНЕНИЕ РАСЧЁТА
// ============================================================================

export async function saveCalculation(
    input: unknown
): Promise<{ success: true; data: { id: string; calculationNumber: string } } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const validated = saveCalculationSchema.safeParse(input);
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        const { applicationType, rollWidthMm, edgeMarginMm, printGapMm, groups, orderId } = validated.data;

        const calcResult = await calculateLayout(applicationType as ApplicationType, rollWidthMm, edgeMarginMm, printGapMm, groups as PrintGroupInput[]);
        if (!calcResult.success) return { success: false, error: calcResult.error };

        const result = calcResult.data;
        const calculationNumber = await generateCalculationNumber(applicationType as ApplicationType);

        const saved = await db.transaction(async (tx) => {
            const [calculation] = await tx
                .insert(printCalculations)
                .values({
                    calculationNumber,
                    applicationType: applicationType as string,
                    rollWidthMm,
                    edgeMarginMm,
                    printGapMm,
                    totalPrints: result.totalPrints,
                    totalLengthM: String(result.totalLengthM),
                    totalAreaM2: String(result.totalAreaM2),
                    printsAreaM2: String(result.printsAreaM2),
                    efficiencyPercent: String(result.efficiencyPercent),
                    pricePerMeter: String(result.pricePerMeter),
                    printCost: String(result.printCost),
                    placementCost: String(result.placementCost),
                    materialsCost: String(result.materialsCost),
                    totalCost: String(result.totalCost),
                    avgCostPerPrint: String(result.avgCostPerPrint),
                    minCostPerPrint: String(result.minCostPerPrint),
                    maxCostPerPrint: String(result.maxCostPerPrint),
                    consumptionData: { items: result.consumption },
                    orderId: orderId || null,
                    createdBy: session.id,
                })
                .returning();

            if (result.sections.length > 0) {
                await tx.insert(printCalculationGroups).values(
                    result.sections.map((section) => ({
                        calculationId: calculation.id,
                        name: section.name,
                        widthMm: section.widthMm,
                        heightMm: section.heightMm,
                        quantity: section.quantity,
                        printsPerRow: section.printsPerRow,
                        rowsCount: section.rowsCount,
                        sectionLengthMm: section.sectionLengthMm,
                        sectionAreaM2: String(section.sectionAreaM2),
                        placementId: section.placementId,
                        placementCost: String(section.placementCost),
                        sectionCost: String(section.sectionCost),
                        costPerPrint: String(section.costPerPrint),
                        color: section.color,
                        sortOrder: section.sortOrder,
                    }))
                );
            }
            return calculation;
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true, data: { id: saved.id, calculationNumber: saved.calculationNumber } };
    } catch (error) {
        logError({ error, details: { context: "saveCalculation", input } });
        return { success: false, error: "Ошибка сохранения" };
    }
}

// ============================================================================
// ПОЛУЧЕНИЕ СПИСКА РАСЧЁТОВ
// ============================================================================

export async function getCalculations(applicationType?: ApplicationType, limit = 20, offset = 0) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const conditions = applicationType ? [eq(printCalculations.applicationType, applicationType)] : [];

        const [results, countResult] = await Promise.all([
            db.select({
                id: printCalculations.id,
                calculationNumber: printCalculations.calculationNumber,
                applicationType: printCalculations.applicationType,
                totalPrints: printCalculations.totalPrints,
                totalLengthM: printCalculations.totalLengthM,
                totalCost: printCalculations.totalCost,
                createdAt: printCalculations.createdAt,
            })
            .from(printCalculations)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(printCalculations.createdAt))
            .limit(limit)
            .offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(printCalculations).where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
            success: true,
            data: (results || []).map((row) => ({
                id: row.id,
                calculationNumber: row.calculationNumber,
                applicationType: row.applicationType as ApplicationType,
                totalPrints: row.totalPrints,
                totalLengthM: Number(row.totalLengthM),
                totalCost: Number(row.totalCost),
                createdAt: row.createdAt,
            })),
            total: Number(countResult[0].count),
        };
    } catch (error) {
        logError({ error, details: { context: "getCalculations", applicationType } });
        return { success: false, error: "Ошибка загрузки" };
    }
}

// ============================================================================
// ПОЛУЧЕНИЕ РАСЧЁТА ПО ID
// ============================================================================

export async function getCalculationById(id: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const [calculation] = await db.select().from(printCalculations).where(eq(printCalculations.id, id)).limit(1);
        if (!calculation) return { success: false, error: "Расчёт не найден" };

        const groups = await db.select().from(printCalculationGroups).where(eq(printCalculationGroups.calculationId, id)).orderBy(printCalculationGroups.sortOrder).limit(500);

        const consumptionData = calculation.consumptionData as { items: ConsumptionItem[] } | null;

        return {
            success: true,
            data: {
                calculation: {
                    ...calculation,
                    applicationType: calculation.applicationType as ApplicationType,
                    result: {
                        sections: groups.map(g => ({
                            groupId: g.id,
                            name: g.name || "",
                            widthMm: g.widthMm,
                            heightMm: g.heightMm,
                            quantity: g.quantity,
                            printsPerRow: g.printsPerRow,
                            rowsCount: g.rowsCount,
                            sectionLengthMm: g.sectionLengthMm,
                            sectionAreaM2: Number(g.sectionAreaM2),
                            placementId: g.placementId,
                            placementCost: Number(g.placementCost),
                            printCost: Number(g.sectionCost) - Number(g.placementCost),
                            workCost: Number(g.placementCost),
                            sectionCost: Number(g.sectionCost),
                            costPerPrint: Number(g.costPerPrint),
                            color: g.color,
                            sortOrder: g.sortOrder,
                        })),
                        totalPrints: calculation.totalPrints,
                        totalLengthM: Number(calculation.totalLengthM),
                        totalAreaM2: Number(calculation.totalAreaM2),
                        printsAreaM2: Number(calculation.printsAreaM2),
                        efficiencyPercent: Number(calculation.efficiencyPercent),
                        pricePerMeter: Number(calculation.pricePerMeter),
                        printCost: Number(calculation.printCost),
                        placementCost: Number(calculation.placementCost),
                        materialsCost: Number(calculation.materialsCost),
                        totalCost: Number(calculation.totalCost),
                        avgCostPerPrint: Number(calculation.avgCostPerPrint),
                        minCostPerPrint: Number(calculation.minCostPerPrint),
                        maxCostPerPrint: Number(calculation.maxCostPerPrint),
                        consumption: consumptionData?.items || [],
                    },
                },
                groups: groups.map(g => ({ ...g, name: g.name || "" })),
            },
        };
    } catch (error) {
        logError({ error, details: { context: "getCalculationById", id } });
        return { success: false, error: "Ошибка загрузки" };
    }
}
