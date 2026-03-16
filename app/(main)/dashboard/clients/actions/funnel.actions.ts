"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { z } from "zod";

/**
 * Получить список клиентов для воронки (не в архиве, не потеряны)
 */
export async function getClientsForFunnel() {
    const session = await getSession();
    if (!session) return [];

    try {
        const data = await db
            .select({
                id: clients.id,
                lastName: clients.lastName,
                firstName: clients.firstName,
                company: clients.company,
                phone: clients.phone,
                funnelStage: clients.funnelStage,
                managerId: clients.managerId,
                totalOrdersAmount: clients.totalOrdersAmount,
                lastOrderAt: clients.lastOrderAt,
            })
            .from(clients)
            .where(
                and(
                    eq(clients.isArchived, false),
                    isNull(clients.lostAt)
                )
            );

        return data;
    } catch (error) {
        await logError({
            error,
            details: { context: "getClientsForFunnel" }
        });
        return [];
    }
}

/**
 * Получить статистику по этапам воронки
 */
export async function getFunnelStats() {
    const session = await getSession();
    if (!session) return {};

    try {
        const stats = await db
            .select({
                stage: clients.funnelStage,
                count: sql<number>`count(*)::int`,
                amount: sql<number>`sum(coalesce(${clients.totalOrdersAmount}, 0))::decimal(12,2)`
            })
            .from(clients)
            .where(
                and(
                    eq(clients.isArchived, false),
                    isNull(clients.lostAt)
                )
            )
            .groupBy(clients.funnelStage);

        const result: Record<string, { count: number; amount: number }> = {};
        stats.forEach(s => {
            const stage = s.stage || "lead";
            result[stage] = {
                count: s.count,
                amount: Number(s.amount) || 0
            };
        });

        return result;
    } catch (error) {
        await logError({
            error,
            details: { context: "getFunnelStats" }
        });
        return {};
    }
}

/**
 * Обновить этап воронки клиента
 */
export async function updateClientFunnelStage(clientId: string, stage: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) throw new Error("Unauthorized");

    const validated = z.object({
        clientId: z.string().uuid(),
        stage: z.string().min(1)
    }).safeParse({ clientId, stage });

    if (!validated.success) {
        throw new Error("Invalid input data");
    }

    try {
        await db
            .update(clients)
            .set({
                funnelStage: stage,
                funnelStageChangedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(clients.id, clientId));

        await logAction(
            "update_funnel_stage",
            "client",
            clientId,
            { stage }
        );

        revalidatePath("/dashboard/clients/funnel");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            details: { context: "updateClientFunnelStage", clientId, stage }
        });
        throw error;
    }
}

/**
 * Отметить клиента как потерянного
 */
export async function markClientAsLost(clientId: string, reason: string, comment?: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const validated = z.object({
        clientId: z.string().uuid(),
        reason: z.string().min(1),
        comment: z.string().optional()
    }).safeParse({ clientId, reason, comment });

    if (!validated.success) {
        throw new Error("Invalid input data");
    }

    try {
        await db
            .update(clients)
            .set({
                lostAt: new Date(),
                lostReason: reason,
                comments: comment ? sql`${clients.comments} || '\n--- Причина отказа: ' || ${comment}` : clients.comments,
                isArchived: true, // Потерянных обычно в архив
                updatedAt: new Date(),
            })
            .where(eq(clients.id, clientId));

        await logAction(
            "mark_as_lost",
            "client",
            clientId,
            { reason, comment }
        );

        revalidatePath("/dashboard/clients/funnel");
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            details: { context: "markClientAsLost", clientId, reason }
        });
        throw error;
    }
}
