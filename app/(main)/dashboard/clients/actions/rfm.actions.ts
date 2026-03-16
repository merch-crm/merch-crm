"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { eq, and, desc, sql, count, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { RFMSegment, rfmSegmentLabels, rfmSegmentColors } from "./rfm.types";

// === ФУНКЦИИ ===

/**
 * Рассчитать RFM-скор для значения
 * @param value - значение метрики
 * @param thresholds - пороговые значения [низкий, средний, высокий, очень высокий]
 * @returns скор от 1 до 5
 */
function calculateScore(value: number, thresholds: number[]): number {
    if (value <= thresholds[0]) return 1;
    if (value <= thresholds[1]) return 2;
    if (value <= thresholds[2]) return 3;
    if (value <= thresholds[3]) return 4;
    return 5;
}

/**
 * Определить RFM-сегмент по скорам
 */
function determineSegment(r: number, f: number, m: number): RFMSegment {
    // Чемпионы: R=5, F>=4, M>=4
    if (r === 5 && f >= 4 && m >= 4) return "champions";

    // Лояльные: R>=4, F>=3, M>=3
    if (r >= 4 && f >= 3 && m >= 3) return "loyal";

    // Потенциальные: R>=4, F>=2, M>=2
    if (r >= 4 && f >= 2 && m >= 2) return "potential";

    // Новые: R=5, F=1
    if (r === 5 && f === 1) return "new";

    // Перспективные: R>=4, F=1
    if (r >= 4 && f === 1) return "promising";

    // Требуют внимания: R=3, F>=3, M>=3
    if (r === 3 && f >= 3 && m >= 3) return "need_attention";

    // Засыпающие: R=3, F<3
    if (r === 3 && f < 3) return "about_to_sleep";

    // В зоне риска: R<=2, F>=3, M>=3
    if (r <= 2 && f >= 3 && m >= 3) return "at_risk";

    // Спящие: R<=2, F>=2
    if (r <= 2 && f >= 2) return "hibernating";

    // Потерянные: R=1
    return "lost";
}

/**
 * Рассчитать RFM для одного клиента
 */
export async function calculateClientRFM(clientId: string): Promise<{
    success: boolean;
    data?: {
        recency: number;
        frequency: number;
        monetary: number;
        score: string;
        segment: RFMSegment;
    };
    error?: string;
}> {
    const validatedId = z.string().uuid().safeParse(clientId);
    if (!validatedId.success) return { success: false, error: "Invalid client ID" };

    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        // Получаем данные клиента
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
        });

        if (!client) {
            return { success: false, error: "Клиент не найден" };
        }

        // Пороги для Recency (меньше = лучше, инвертируем)
        const recencyThresholds = [30, 60, 90, 180]; // дни
        const recencyValue = Number(client.daysSinceLastOrder) || 365;
        const recencyScore = Math.max(1, 6 - calculateScore(recencyValue, recencyThresholds));

        // Пороги для Frequency
        const frequencyThresholds = [1, 3, 5, 10];
        const frequencyValue = Number(client.totalOrdersCount) || 0;
        const frequencyScore = calculateScore(frequencyValue, frequencyThresholds);

        // Пороги для Monetary
        const monetaryThresholds = [5000, 15000, 50000, 150000];
        const monetaryValue = Number(client.totalOrdersAmount) || 0;
        const monetaryScore = calculateScore(monetaryValue, monetaryThresholds);

        // Определяем сегмент
        const segment = determineSegment(recencyScore, frequencyScore, monetaryScore);
        const score = `${recencyScore}${frequencyScore}${monetaryScore}`;

        // Сохраняем в БД
        await db
            .update(clients)
            .set({
                rfmRecency: recencyScore,
                rfmFrequency: frequencyScore,
                rfmMonetary: monetaryScore,
                rfmScore: score,
                rfmSegment: segment,
                rfmCalculatedAt: new Date(),
            })
            .where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");

        return {
            success: true,
            data: {
                recency: recencyScore,
                frequency: frequencyScore,
                monetary: monetaryScore,
                score,
                segment,
            },
        };
    } catch (error) {
        logError({ error, details: { action: "calculateClientRFM", clientId } });
        return { success: false, error: "Не удалось рассчитать RFM" };
    }
}

/**
 * Рассчитать RFM для всех клиентов
 */
export async function calculateAllClientsRFM(): Promise<{
    success: boolean;
    data?: { updated: number };
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        // Получаем всех активных клиентов
        const allClients = await db
            .select({
                id: clients.id,
                daysSinceLastOrder: clients.daysSinceLastOrder,
                totalOrdersCount: clients.totalOrdersCount,
                totalOrdersAmount: clients.totalOrdersAmount,
            })
            .from(clients)
            .where(eq(clients.isArchived, false));

        let updated = 0;

        for (const client of allClients) {
            // Пороги
            const recencyThresholds = [30, 60, 90, 180];
            const frequencyThresholds = [1, 3, 5, 10];
            const monetaryThresholds = [5000, 15000, 50000, 150000];

            const recencyValue = Number(client.daysSinceLastOrder) || 365;
            const recencyScore = Math.max(1, 6 - calculateScore(recencyValue, recencyThresholds));

            const frequencyScore = calculateScore(Number(client.totalOrdersCount) || 0, frequencyThresholds);
            const monetaryScore = calculateScore(Number(client.totalOrdersAmount) || 0, monetaryThresholds);

            const segment = determineSegment(recencyScore, frequencyScore, monetaryScore);
            const score = `${recencyScore}${frequencyScore}${monetaryScore}`;

            await db
                .update(clients)
                .set({
                    rfmRecency: recencyScore,
                    rfmFrequency: frequencyScore,
                    rfmMonetary: monetaryScore,
                    rfmScore: score,
                    rfmSegment: segment,
                    rfmCalculatedAt: new Date(),
                })
                .where(eq(clients.id, client.id));

            updated++;
        }

        await logAction(
            "calculate_all_rfm",
            "client",
            "bulk",
            { updated }
        );

        revalidatePath("/dashboard/clients");

        return { success: true, data: { updated } };
    } catch (error) {
        logError({ error, details: { action: "calculateAllClientsRFM" } });
        return { success: false, error: "Не удалось рассчитать RFM" };
    }
}

/**
 * Получить статистику по RFM-сегментам
 */
export async function getRFMStats(): Promise<{
    success: boolean;
    data?: Array<{
        segment: string;
        label: string;
        color: string;
        count: number;
        percentage: number;
        averageCheck: number;
        totalAmount: number;
    }>;
    error?: string;
}> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const segmentData = await db
            .select({
                segment: clients.rfmSegment,
                count: count(),
                avgRevenue: sql<number>`AVG(COALESCE(${clients.totalOrdersAmount}, 0))`,
            })
            .from(clients)
            .where(and(eq(clients.isArchived, false), isNotNull(clients.rfmSegment)))
            .groupBy(clients.rfmSegment);

        const total = segmentData.reduce((sum, s) => sum + Number(s.count), 0);

        const result = segmentData.map((row) => ({
            segment: row.segment || "unknown",
            label: rfmSegmentLabels[row.segment || "unknown"] || "Неизвестно",
            color: rfmSegmentColors[row.segment || "unknown"] || "#6B7280",
            count: Number(row.count),
            percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
            averageCheck: Math.round(Number(row.avgRevenue)),
            totalAmount: Math.round(Number(row.avgRevenue) * Number(row.count)),
        }));

        return { success: true, data: result };
    } catch (error) {
        logError({ error, details: { action: "getRFMStats" } });
        return { success: false, error: "Не удалось загрузить статистику RFM" };
    }
}

/**
 * Получить клиентов по RFM-сегменту
 */
export async function getClientsByRFMSegment(
    segment: RFMSegment,
    limit: number = 50
): Promise<{
    success: boolean;
    data?: Array<{
        id: string;
        fullName: string;
        company: string | null;
        rfmScore: string | null;
        totalOrdersAmount: number | null;
        daysSinceLastOrder: number | null;
    }>;
    error?: string;
}> {
    const validated = z.object({
        segment: z.string().min(1),
        limit: z.number().int().min(1).max(500).optional()
    }).safeParse({ segment, limit });

    if (!validated.success) return { success: false, error: "Invalid input" };

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const clientsData = await db
            .select({
                id: clients.id,
                lastName: clients.lastName,
                firstName: clients.firstName,
                company: clients.company,
                rfmScore: clients.rfmScore,
                totalOrdersAmount: clients.totalOrdersAmount,
                daysSinceLastOrder: clients.daysSinceLastOrder,
            })
            .from(clients)
            .where(and(eq(clients.isArchived, false), eq(clients.rfmSegment, segment)))
            .orderBy(desc(clients.totalOrdersAmount))
            .limit(limit);

        const result = clientsData.map((c) => ({
            id: c.id,
            fullName: `${c.lastName} ${c.firstName}`.trim(),
            company: c.company,
            rfmScore: c.rfmScore,
            totalOrdersAmount: Number(c.totalOrdersAmount) || 0,
            daysSinceLastOrder: c.daysSinceLastOrder,
        }));

        return { success: true, data: result };
    } catch (error) {
        logError({ error, details: { action: "getClientsByRFMSegment", segment } });
        return { success: false, error: "Не удалось загрузить клиентов" };
    }
}
