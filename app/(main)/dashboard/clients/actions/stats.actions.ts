"use server";

import { db } from "@/lib/db";
import { clients, orders } from "@/lib/schema";
import { eq, sql, desc, and, gte, lte, isNull, gt, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ActionResult, ok } from "@/lib/types";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { z } from "zod";

// === Типы ===

interface ClientStatsData {
    totalOrdersCount: number;
    totalOrdersAmount: number;
    averageCheck: number;
    lastOrderAt: Date | null;
    firstOrderAt: Date | null;
    daysSinceLastOrder: number | null;
}

interface ClientsAtRisk {
    id: string;
    name: string;
    lastName: string;
    firstName: string;
    company: string | null;
    phone: string;
    lastOrderAt: Date | null;
    daysSinceLastOrder: number | null;
    totalOrdersAmount: number;
    managerId: string | null;
    managerName?: string;
}

interface StatsOverview {
    totalClients: number;
    activeClients: number; // заказ за последние 90 дней
    atRiskClients: number; // 90+ дней без заказа
    newClients: number; // зарегистрированы за последний месяц
    avgOrdersPerClient: number;
    avgRevenuePerClient: number;
    topClientsByRevenue: {
        id: string;
        name: string;
        totalOrdersAmount: number;
    }[];
}

// === Server Actions ===

/**
 * Пересчитать статистику для одного клиента
 */
export async function recalculateClientStats(clientId: string): Promise<ActionResult<ClientStatsData>> {
    return withAuth(async () => {
        const validatedId = z.string().uuid().safeParse(clientId);
        if (!validatedId.success) return { success: false, error: "Invalid client ID", code: "VALIDATION_ERROR" };

        // Используем SQL функцию если она существует, иначе считаем вручную
        const [stats] = await db.select({
            totalCount: sql<number>`COUNT(*)`.as("total_count"),
            totalAmount: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`.as("total_amount"),
            avgAmount: sql<string>`COALESCE(AVG(${orders.totalAmount}), 0)`.as("avg_amount"),
            lastOrder: sql<Date>`MAX(${orders.createdAt})`.as("last_order"),
            firstOrder: sql<Date>`MIN(${orders.createdAt})`.as("first_order"),
        })
            .from(orders)
            .where(and(
                eq(orders.clientId, clientId),
                sql`${orders.status} != 'cancelled'`
            ))
            .limit(1);

        const totalOrdersCount = Number(stats?.totalCount || 0);
        const totalOrdersAmount = Number(stats?.totalAmount || 0);
        const averageCheck = Number(stats?.avgAmount || 0);
        const lastOrderAt = stats?.lastOrder || null;
        const firstOrderAt = stats?.firstOrder || null;

        // Вычисляем дни с последнего заказа
        let daysSinceLastOrder: number | null = null;
        if (lastOrderAt) {
            const diffMs = Date.now() - new Date(lastOrderAt).getTime();
            daysSinceLastOrder = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }

        // Обновляем клиента
        await db.update(clients)
            .set({
                totalOrdersCount,
                totalOrdersAmount: String(totalOrdersAmount),
                averageCheck: String(averageCheck),
                lastOrderAt,
                firstOrderAt,
                daysSinceLastOrder,
                updatedAt: new Date(),
            })
            .where(eq(clients.id, clientId));

        return ok({
            totalOrdersCount,
            totalOrdersAmount,
            averageCheck,
            lastOrderAt,
            firstOrderAt,
            daysSinceLastOrder,
        });
    }, { errorPath: "recalculateClientStats" });
}

/**
 * Массовый пересчёт статистики всех клиентов
 */
export async function recalculateAllClientsStats(): Promise<ActionResult<{ processed: number }>> {
    return withAuth(async () => {
        // Получаем всех клиентов
        const allClients = await db.query.clients.findMany({
            columns: { id: true },
            limit: 10000,
        });

        // Пересчитываем каждого
        for (const client of allClients) {
            await recalculateClientStats(client.id);
        }

        await logAction(
            "Массовый пересчёт статистики клиентов",
            "settings",
            "bulk",
            { processed: allClients.length }
        );

        revalidatePath("/dashboard/clients");
        return ok({ processed: allClients.length });
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "recalculateAllClientsStats" 
    });
}

/**
 * Обновить daysSinceLastOrder для всех клиентов (вызывать по cron)
 */
export async function updateDaysSinceLastOrder(): Promise<ActionResult<{ updated: number }>> {
    return withAuth(async () => {
        // Атомарное обновление через SQL
        const result = await db.execute(sql`
            UPDATE clients 
            SET 
                days_since_last_order = CASE 
                    WHEN last_order_at IS NOT NULL 
                    THEN EXTRACT(DAY FROM NOW() - last_order_at)::INTEGER 
                    ELSE NULL 
                END,
                updated_at = NOW()
            WHERE last_order_at IS NOT NULL
        `);

        return ok({ updated: Number(result.rowCount || 0) });
    }, { errorPath: "updateDaysSinceLastOrder" });
}

/**
 * Получить клиентов "в зоне риска" (90+ дней без заказа)
 */
export async function getClientsAtRisk(options: {
    daysThreshold?: number;
    limit?: number;
    managerId?: string;
}): Promise<ActionResult<ClientsAtRisk[]>> {
    return withAuth(async () => {
        const { daysThreshold = 90, limit = 50, managerId } = options;

        const validated = z.object({
            daysThreshold: z.number().int().optional(),
            limit: z.number().int().optional(),
            managerId: z.string().optional()
        }).safeParse(options);

        if (!validated.success) return { success: false, error: "Invalid options", code: "VALIDATION_ERROR" };

        const conditions = [
            eq(clients.isArchived, false),
            gte(clients.daysSinceLastOrder, daysThreshold),
        ];

        if (managerId && managerId !== "all") {
            if (managerId === "none") {
                conditions.push(isNull(clients.managerId));
            } else {
                conditions.push(eq(clients.managerId, managerId));
            }
        }

        const result = await db.query.clients.findMany({
            where: and(...conditions),
            with: {
                manager: {
                    columns: { name: true },
                },
            },
            orderBy: [desc(clients.daysSinceLastOrder)],
            limit,
        });

        const atRiskClients: ClientsAtRisk[] = result.map(c => ({
            id: c.id,
            name: c.name || `${c.lastName} ${c.firstName}`,
            lastName: c.lastName,
            firstName: c.firstName,
            company: c.company,
            phone: c.phone,
            lastOrderAt: c.lastOrderAt,
            daysSinceLastOrder: c.daysSinceLastOrder,
            totalOrdersAmount: Number(c.totalOrdersAmount || 0),
            managerId: c.managerId,
            managerName: c.manager?.name,
        }));

        return ok(atRiskClients);
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "getClientsAtRisk" 
    });
}

/**
 * Получить общую статистику по клиентам
 */
export async function getClientsStatsOverview(): Promise<ActionResult<StatsOverview>> {
    return withAuth(async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        // Общее количество клиентов
        const [totalResult] = await db.select({
            count: sql<number>`COUNT(*)`,
        })
            .from(clients)
            .where(eq(clients.isArchived, false))
            .limit(1);

        // Активные клиенты (заказ за последние 90 дней)
        const [activeResult] = await db.select({
            count: sql<number>`COUNT(*)`,
        })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gte(clients.lastOrderAt, ninetyDaysAgo)
            ))
            .limit(1);

        // Клиенты в зоне риска (90+ дней без заказа)
        const [atRiskResult] = await db.select({
            count: sql<number>`COUNT(*)`,
        })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gte(clients.daysSinceLastOrder, 90)
            ))
            .limit(1);

        // Новые клиенты за месяц
        const [newResult] = await db.select({
            count: sql<number>`COUNT(*)`,
        })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gte(clients.createdAt, thirtyDaysAgo)
            ))
            .limit(1);

        // Средние показатели
        const [avgResult] = await db.select({
            avgOrders: sql<string>`AVG(${clients.totalOrdersCount})`,
            avgRevenue: sql<string>`AVG(${clients.totalOrdersAmount})`,
        })
            .from(clients)
            .where(eq(clients.isArchived, false))
            .limit(1);

        // Топ клиентов по выручке
        const topClients = await db.query.clients.findMany({
            where: and(
                eq(clients.isArchived, false),
                gt(clients.totalOrdersAmount, "0")
            ),
            columns: {
                id: true,
                name: true,
                lastName: true,
                firstName: true,
                totalOrdersAmount: true,
            },
            orderBy: [desc(clients.totalOrdersAmount)],
            limit: 10,
        });

        return ok({
            totalClients: Number(totalResult?.count || 0),
            activeClients: Number(activeResult?.count || 0),
            atRiskClients: Number(atRiskResult?.count || 0),
            newClients: Number(newResult?.count || 0),
            avgOrdersPerClient: Number(avgResult?.avgOrders || 0),
            avgRevenuePerClient: Number(avgResult?.avgRevenue || 0),
            topClientsByRevenue: topClients.map(c => ({
                id: c.id,
                name: c.name || `${c.lastName} ${c.firstName}`,
                totalOrdersAmount: Number(c.totalOrdersAmount || 0),
            })),
        });
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "getClientsStatsOverview" 
    });
}

/**
 * Получить распределение клиентов по количеству заказов
 */
export async function getOrdersDistribution(): Promise<ActionResult<{
    range: string;
    count: number;
    percentage: number;
}[]>> {
    return withAuth(async () => {
        const [total] = await db.select({
            count: sql<number>`COUNT(*)`,
        })
            .from(clients)
            .where(eq(clients.isArchived, false))
            .limit(1);

        const totalCount = Number(total?.count || 0);
        if (totalCount === 0) {
            return ok([]);
        }

        // Получаем распределение
        const [noOrders] = await db.select({ count: sql<number>`COUNT(*)` })
            .from(clients)
            .where(and(eq(clients.isArchived, false), eq(clients.totalOrdersCount, 0)));

        const [oneToThree] = await db.select({ count: sql<number>`COUNT(*)` })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gte(clients.totalOrdersCount, 1),
                lte(clients.totalOrdersCount, 3)
            ));

        const [fourToTen] = await db.select({ count: sql<number>`COUNT(*)` })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gte(clients.totalOrdersCount, 4),
                lte(clients.totalOrdersCount, 10)
            ));

        const [moreThanTen] = await db.select({ count: sql<number>`COUNT(*)` })
            .from(clients)
            .where(and(
                eq(clients.isArchived, false),
                gt(clients.totalOrdersCount, 10)
            ));

        const distribution = [
            { range: "0 заказов", count: Number(noOrders?.count || 0) },
            { range: "1-3 заказа", count: Number(oneToThree?.count || 0) },
            { range: "4-10 заказов", count: Number(fourToTen?.count || 0) },
            { range: "10+ заказов", count: Number(moreThanTen?.count || 0) },
        ].map(d => ({
            ...d,
            percentage: Math.round((d.count / totalCount) * 100),
        }));

        return ok(distribution);
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "getOrdersDistribution" 
    });
}

/**
 * Получить статистику по активности клиентов
 */
export async function getActivityStats(): Promise<ActionResult<{
    active: number;
    attention: number;
    atRisk: number;
    inactive: number;
    total: number;
}>> {
    return withAuth(async () => {
        const [stats] = await db
            .select({
                total: count(),
                active: sql<number>`COUNT(*) FILTER (WHERE 
          ${clients.daysSinceLastOrder} < 60 
          OR (${clients.daysSinceLastOrder} IS NULL AND ${clients.createdAt} > NOW() - INTERVAL '60 days')
        )`,
                attention: sql<number>`COUNT(*) FILTER (WHERE 
          ${clients.daysSinceLastOrder} >= 60 AND ${clients.daysSinceLastOrder} < 90
        )`,
                atRisk: sql<number>`COUNT(*) FILTER (WHERE 
          ${clients.daysSinceLastOrder} >= 90 AND ${clients.daysSinceLastOrder} < 180
        )`,
                inactive: sql<number>`COUNT(*) FILTER (WHERE 
          ${clients.daysSinceLastOrder} >= 180 
          OR (${clients.daysSinceLastOrder} IS NULL AND ${clients.createdAt} <= NOW() - INTERVAL '60 days')
        )`,
            })
            .from(clients)
            .where(and(eq(clients.isArchived, false), isNull(clients.lostAt)));

        return ok({
            active: Number(stats?.active || 0),
            attention: Number(stats?.attention || 0),
            atRisk: Number(stats?.atRisk || 0),
            inactive: Number(stats?.inactive || 0),
            total: Number(stats?.total || 0),
        });
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "getActivityStats" 
    });
}
