"use server";

import { ActionResult, okVoid, ok, ERRORS, type ClientSummary } from "@/lib/types";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { z } from "zod";
export interface FunnelClient {
    id: string;
    lastName: string;
    firstName: string;
    company: string | null;
    phone: string | null;
    funnelStage: string | null;
    managerId: string | null;
    totalOrdersAmount: number | string | null;
    lastOrderAt: Date | string | null;
}

/**
 * Получить список клиентов для воронки (не в архиве, не потеряны)
 */
export async function getClientsForFunnel(): Promise<ActionResult<ClientSummary[]>> {
    return withAuth(async () => {
        const data = await db
            .select({
                id: clients.id,
                lastName: clients.lastName,
                firstName: clients.firstName,
                displayName: sql<string>`concat_ws(' ', ${clients.lastName}, ${clients.firstName})`,
                company: clients.company,
                phone: clients.phone,
                email: clients.email,
                clientType: clients.clientType,
                type: clients.clientType,
                funnelStage: clients.funnelStage,
                managerId: clients.managerId,
                totalOrders: sql<number>`0`, // Placeholder or calculate
                totalSpent: sql<number>`coalesce(${clients.totalOrdersAmount}, 0)::float`,
                isVip: sql<boolean>`false`,
                lastOrderAt: clients.lastOrderAt,
                createdAt: clients.createdAt,
            })
            .from(clients)
            .where(
                and(
                    eq(clients.isArchived, false),
                    isNull(clients.lostAt)
                )
            );

        return ok(data);
    }, { errorPath: "getClientsForFunnel" });
}

/**
 * Получить статистику по этапам воронки
 */
export async function getFunnelStats(): Promise<ActionResult<Record<string, { count: number; amount: number }>>> {
    return withAuth(async () => {
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

        return ok(result);
    }, { errorPath: "getFunnelStats" });
}

export async function updateClientFunnelStage(clientId: string, stage: string): Promise<ActionResult> {
    const validated = z.object({
        clientId: z.string().uuid(),
        stage: z.string().min(1)
    }).safeParse({ clientId, stage });

    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    return withAuth(async () => {
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
        return okVoid();
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "updateClientFunnelStage"
    });
}

/**
 * Отметить клиента как потерянного
 */
export async function markClientAsLost(clientId: string, reason: string, comment?: string): Promise<ActionResult> {
    const validated = z.object({
        clientId: z.string().uuid(),
        reason: z.string().min(1),
        comment: z.string().optional()
    }).safeParse({ clientId, reason, comment });

    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    return withAuth(async () => {
        await db
            .update(clients)
            .set({
                lostAt: new Date(),
                lostReason: reason,
                comments: comment ? sql`${clients.comments} || '\n--- Причина отказа: ' || ${comment}` : clients.comments,
                isArchived: true,
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
        return okVoid();
    }, {
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "markClientAsLost"
    });
}
