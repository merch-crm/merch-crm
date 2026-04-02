"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema/clients/main";
import { users } from "@/lib/schema/users";
import { loyaltyLevels } from "@/lib/schema/clients/loyalty";
import { eq, sql, desc, and } from "drizzle-orm";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { type ActionResult, ok } from "@/lib/types";
import { ManagerPerformanceData, TopClientData, AcquisitionSourceData } from "./types";
import { acquisitionSourceLabels, acquisitionSourceIcons } from "./constants";

/**
 * Получить эффективность менеджеров
 */
export async function getManagerPerformance(): Promise<ActionResult<ManagerPerformanceData[]>> {
    return withAuth(async () => {
        const managersData = await db
            .select({
                managerId: clients.managerId,
                managerName: sql<string>`COALESCE(${users.name}, 'Не назначен')`,
                managerAvatar: users.avatar,
                clientCount: sql<number>`COUNT(*)`,
                activeClients: sql<number>`COUNT(*) FILTER (WHERE (${clients.daysSinceLastOrder} < 90 OR ${clients.daysSinceLastOrder} IS NULL) AND ${clients.lostAt} IS NULL)`,
                atRiskClients: sql<number>`COUNT(*) FILTER (WHERE ${clients.daysSinceLastOrder} >= 90 AND ${clients.lostAt} IS NULL)`,
                totalRevenue: sql<number>`COALESCE(SUM(${clients.totalOrdersAmount}), 0)`,
                averageCheck: sql<number>`COALESCE(AVG(NULLIF(${clients.averageCheck}, 0)), 0)`,
                regularClients: sql<number>`COUNT(*) FILTER (WHERE ${clients.funnelStage} = 'regular')`,
            })
            .from(clients)
            .leftJoin(users, eq(clients.managerId, users.id))
            .where(eq(clients.isArchived, false))
            .groupBy(clients.managerId, users.name, users.avatar)
            .orderBy(desc(sql`COUNT(*)`));

        const result: ManagerPerformanceData[] = managersData.map((row) => ({
            managerId: row.managerId,
            managerName: row.managerName,
            managerAvatar: row.managerAvatar,
            clientCount: Number(row.clientCount),
            activeClients: Number(row.activeClients),
            atRiskClients: Number(row.atRiskClients),
            totalRevenue: Number(row.totalRevenue),
            averageCheck: Math.round(Number(row.averageCheck)),
            conversionRate: Number(row.clientCount) > 0
                ? Math.round((Number(row.regularClients) / Number(row.clientCount)) * 100)
                : 0,
        }));

        return ok(result);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getManagerPerformance" 
    });
}

/**
 * Получить топ клиентов по выручке
 */
export async function getTopClients(
    limit: number = 10
): Promise<ActionResult<TopClientData[]>> {
    return withAuth(async () => {
        const topClients = await db
            .select({
                id: clients.id,
                lastName: clients.lastName,
                firstName: clients.firstName,
                company: clients.company,
                clientType: clients.clientType,
                totalOrdersAmount: clients.totalOrdersAmount,
                totalOrdersCount: clients.totalOrdersCount,
                averageCheck: clients.averageCheck,
                rfmSegment: clients.rfmSegment,
                lastOrderAt: clients.lastOrderAt,
                loyaltyLevelName: loyaltyLevels.levelName,
                loyaltyLevelColor: loyaltyLevels.color,
            })
            .from(clients)
            .leftJoin(loyaltyLevels, eq(clients.loyaltyLevelId, loyaltyLevels.id))
            .where(and(eq(clients.isArchived, false), sql`${clients.totalOrdersAmount} > 0`))
            .orderBy(desc(clients.totalOrdersAmount))
            .limit(limit);

        const result: TopClientData[] = topClients.map((row) => ({
            id: row.id,
            fullName: `${row.lastName} ${row.firstName}`.trim(),
            company: row.company,
            clientType: row.clientType as "b2c" | "b2b",
            totalOrdersAmount: Number(row.totalOrdersAmount) || 0,
            totalOrdersCount: Number(row.totalOrdersCount) || 0,
            averageCheck: Math.round(Number(row.averageCheck) || 0),
            loyaltyLevelName: row.loyaltyLevelName,
            loyaltyLevelColor: row.loyaltyLevelColor,
            rfmSegment: row.rfmSegment,
            lastOrderAt: row.lastOrderAt,
        }));

        return ok(result);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getTopClients" 
    });
}

/**
 * Получить статистику по источникам привлечения
 */
export async function getAcquisitionSourceStats(): Promise<ActionResult<AcquisitionSourceData[]>> {
    return withAuth(async () => {
        const sourcesData = await db
            .select({
                source: sql<string>`COALESCE(NULLIF(${clients.acquisitionSource}, ''), '')`,
                count: sql<number>`count(*)`,
                revenue: sql<number>`COALESCE(SUM(${clients.totalOrdersAmount}), 0)`,
                averageCheck: sql<number>`COALESCE(AVG(NULLIF(${clients.averageCheck}, 0)), 0)`,
            })
            .from(clients)
            .where(eq(clients.isArchived, false))
            .groupBy(sql`COALESCE(NULLIF(${clients.acquisitionSource}, ''), '')`)
            .orderBy(desc(sql`count(*)`));

        const totalAcrossSources = sourcesData.reduce((sum, s) => sum + Number(s.count), 0);

        const result: AcquisitionSourceData[] = sourcesData.map((row) => ({
            id: row.source || "unknown",
            source: row.source,
            label: acquisitionSourceLabels[row.source.toLowerCase()] || row.source || "Не указан",
            count: Number(row.count),
            percentage: totalAcrossSources > 0 ? Math.round((Number(row.count) / totalAcrossSources) * 100) : 0,
            revenue: Number(row.revenue),
            averageCheck: Math.round(Number(row.averageCheck)),
            icon: acquisitionSourceIcons[row.source.toLowerCase()] || "HelpCircle",
        }));

        return ok(result);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getAcquisitionSourceStats" 
    });
}
