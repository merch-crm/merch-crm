"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema";
import { sql, and, gte, count, eq } from "drizzle-orm";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { type ActionResult, ok, ERRORS } from "@/lib/types";
import { ClientAnalyticsOverview, ClientGrowthData, PeriodSchema } from "./types";
import { getDateRange } from "./constants";

/**
 * Получить общую сводку по клиентам
 */
export async function getClientAnalyticsOverview(
    period: string = "all"
): Promise<ActionResult<ClientAnalyticsOverview>> {
    return withAuth(async () => {
        const validatedPeriod = PeriodSchema.parse(period);
        const { start } = getDateRange(validatedPeriod);

        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const lastMonthStart = new Date(currentMonthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        const [stats] = await db
            .select({
                totalClients: count(),
                activeClients: sql<number>`COUNT(*) FILTER (WHERE (${clients.daysSinceLastOrder} < 90 OR ${clients.daysSinceLastOrder} IS NULL) AND ${clients.lostAt} IS NULL)`,
                atRiskClients: sql<number>`COUNT(*) FILTER (WHERE ${clients.daysSinceLastOrder} >= 90 AND ${clients.daysSinceLastOrder} < 180 AND ${clients.lostAt} IS NULL)`,
                lostClients: sql<number>`COUNT(*) FILTER (WHERE ${clients.lostAt} IS NOT NULL)`,
                newClientsThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${clients.createdAt} >= ${currentMonthStart.toISOString()}::timestamptz)`,
                newClientsLastMonth: sql<number>`COUNT(*) FILTER (WHERE ${clients.createdAt} >= ${lastMonthStart.toISOString()}::timestamptz AND ${clients.createdAt} < ${currentMonthStart.toISOString()}::timestamptz)`,
                totalRevenue: sql<number>`COALESCE(SUM(${clients.totalOrdersAmount}), 0)`,
                averageCheck: sql<number>`COALESCE(AVG(NULLIF(${clients.averageCheck}, 0)), 0)`,
                averageLTV: sql<number>`COALESCE(AVG(NULLIF(${clients.totalOrdersAmount}, 0)), 0)`,
                b2cCount: sql<number>`COUNT(*) FILTER (WHERE ${clients.clientType} = 'b2c')`,
                b2bCount: sql<number>`COUNT(*) FILTER (WHERE ${clients.clientType} = 'b2b')`,
            })
            .from(clients)
            .where(
                and(
                    eq(clients.isArchived, false),
                    period !== "all" ? gte(clients.createdAt, start) : undefined
                )
            );

        if (!stats) return ERRORS.NOT_FOUND("Статистика не найдена");

        const newClientsGrowth = stats.newClientsLastMonth > 0
            ? Math.round(((stats.newClientsThisMonth - stats.newClientsLastMonth) / stats.newClientsLastMonth) * 100)
            : stats.newClientsThisMonth > 0 ? 100 : 0;

        return ok({
            totalClients: Number(stats.totalClients),
            activeClients: Number(stats.activeClients),
            atRiskClients: Number(stats.atRiskClients),
            lostClients: Number(stats.lostClients),
            newClientsThisMonth: Number(stats.newClientsThisMonth),
            newClientsLastMonth: Number(stats.newClientsLastMonth),
            newClientsGrowth,
            totalRevenue: Number(stats.totalRevenue),
            averageCheck: Math.round(Number(stats.averageCheck)),
            averageLTV: Math.round(Number(stats.averageLTV)),
            b2cCount: Number(stats.b2cCount),
            b2bCount: Number(stats.b2bCount),
        });
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getClientAnalyticsOverview" 
    });
}

/**
 * Получить динамику роста клиентов по месяцам
 */
export async function getClientGrowthData(
    months: number = 12
): Promise<ActionResult<ClientGrowthData[]>> {
    return withAuth(async () => {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const monthlyData = await db
            .select({
                month: sql<string>`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`,
                newClients: count(),
                b2cNew: sql<number>`COUNT(*) FILTER (WHERE ${clients.clientType} = 'b2c')`,
                b2bNew: sql<number>`COUNT(*) FILTER (WHERE ${clients.clientType} = 'b2b')`,
            })
            .from(clients)
            .where(gte(clients.createdAt, startDate))
            .groupBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`);

        const [totalBeforeRow] = await db
            .select({
                totalBefore: count(),
            })
            .from(clients)
            .where(sql`${clients.createdAt} < ${startDate}`);

        let cumulative = Number(totalBeforeRow?.totalBefore || 0);
        const result: ClientGrowthData[] = monthlyData.map((row) => {
            cumulative += Number(row.newClients);
            const [year, month] = row.month.split("-");
            const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

            return {
                date: row.month,
                month: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
                newClients: Number(row.newClients),
                cumulativeClients: cumulative,
                b2cNew: Number(row.b2cNew),
                b2bNew: Number(row.b2bNew),
            };
        });

        return ok(result);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getClientGrowthData" 
    });
}
