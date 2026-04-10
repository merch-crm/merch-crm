"use server";

import { db } from "@/lib/db";
import { clients, funnelStages, funnelStageLabels, funnelStageColors } from "@/lib/schema/clients/main";
import { loyaltyLevels } from "@/lib/schema/clients/loyalty";
import { eq, sql, and, count, isNull, isNotNull } from "drizzle-orm";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { type ActionResult, ok } from "@/lib/types";
import { rfmSegmentLabels, rfmSegmentColors } from "../rfm.types";
import { FunnelAnalyticsData, RevenueBySegmentData, LoyaltyDistributionData, RFMDistributionData } from "./types";

/**
 * Получить статистику по воронке продаж
 */
export async function getFunnelAnalytics(): Promise<ActionResult<FunnelAnalyticsData[]>> {
  return withAuth(async () => {
    const stagesData = await db
      .select({
        stage: clients.funnelStage,
        count: count(),
      })
      .from(clients)
      .where(and(eq(clients.isArchived, false), isNull(clients.lostAt)))
      .groupBy(clients.funnelStage);

    const total = stagesData.reduce((sum, s) => sum + Number(s.count), 0);

    const result: FunnelAnalyticsData[] = funnelStages.map((stage, index) => {
      const stageData = stagesData.find((s) => s.stage === stage);
      const stageCount = stageData ? Number(stageData.count) : 0;
      const prevStageCount = index > 0
        ? Number(stagesData.find((s) => s.stage === funnelStages[index - 1])?.count || 0)
        : null;

      return {
        stage,
        label: funnelStageLabels[stage as keyof typeof funnelStageLabels],
        count: stageCount,
        percentage: total > 0 ? Math.round((stageCount / total) * 100) : 0,
        conversionFromPrevious: prevStageCount && prevStageCount > 0
          ? Math.round((stageCount / prevStageCount) * 100)
          : null,
        color: funnelStageColors[stage as keyof typeof funnelStageColors],
      };
    });

    return ok(result);
  }, { 
    roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
    errorPath: "getFunnelAnalytics" 
  });
}

/**
 * Получить выручку по RFM-сегментам
 */
export async function getRevenueByRFMSegment(): Promise<ActionResult<RevenueBySegmentData[]>> {
  return withAuth(async () => {
    const segmentData = await db
      .select({
        segment: clients.rfmSegment,
        revenue: sql<number>`COALESCE(SUM(${clients.totalOrdersAmount}), 0)`,
        clientCount: count(),
        averageCheck: sql<number>`COALESCE(AVG(NULLIF(${clients.averageCheck}, 0)), 0)`,
      })
      .from(clients)
      .where(and(eq(clients.isArchived, false), isNotNull(clients.rfmSegment)))
      .groupBy(clients.rfmSegment);

    const totalRevenue = segmentData.reduce((sum, s) => sum + Number(s.revenue), 0);

    const result: RevenueBySegmentData[] = segmentData
      .map((row) => ({
        segment: row.segment || "unknown",
        label: rfmSegmentLabels[row.segment as keyof typeof rfmSegmentLabels] || row.segment || "Неизвестно",
        revenue: Number(row.revenue),
        percentage: totalRevenue > 0 ? Math.round((Number(row.revenue) / totalRevenue) * 100) : 0,
        clientCount: Number(row.clientCount),
        averageCheck: Math.round(Number(row.averageCheck)),
        color: rfmSegmentColors[row.segment as keyof typeof rfmSegmentColors] || "#94a3b8",
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return ok(result);
  }, { 
    roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
    errorPath: "getRevenueByRFMSegment" 
  });
}

/**
 * Получить распределение по уровням лояльности
 */
export async function getLoyaltyDistribution(): Promise<ActionResult<LoyaltyDistributionData[]>> {
  return withAuth(async () => {
    const loyaltyDataResult = await db
      .select({
        levelId: loyaltyLevels.id,
        levelName: loyaltyLevels.levelName,
        levelKey: loyaltyLevels.levelKey,
        color: loyaltyLevels.color,
        count: count(clients.id),
        totalRevenue: sql<number>`COALESCE(SUM(${clients.totalOrdersAmount}), 0)`,
        priority: loyaltyLevels.priority,
      })
      .from(loyaltyLevels)
      .leftJoin(clients, and(eq(clients.loyaltyLevelId, loyaltyLevels.id), eq(clients.isArchived, false)))
      .where(eq(loyaltyLevels.isActive, true))
      .groupBy(loyaltyLevels.id, loyaltyLevels.levelName, loyaltyLevels.levelKey, loyaltyLevels.color, loyaltyLevels.priority)
      .orderBy(loyaltyLevels.priority);

    const totalClients = loyaltyDataResult.reduce((sum, l) => sum + Number(l.count), 0);

    const result: LoyaltyDistributionData[] = loyaltyDataResult.map((row) => ({
      levelId: row.levelId,
      levelName: row.levelName,
      levelKey: row.levelKey,
      color: row.color || "#94a3b8",
      count: Number(row.count),
      percentage: totalClients > 0 ? Math.round((Number(row.count) / totalClients) * 100) : 0,
      totalRevenue: Number(row.totalRevenue),
    }));

    return ok(result);
  }, { 
    roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
    errorPath: "getLoyaltyDistribution" 
  });
}

/**
 * Получить распределение по RFM-сегментам
 */
export async function getRFMDistribution(): Promise<ActionResult<RFMDistributionData[]>> {
  return withAuth(async () => {
    const rfmData = await db
      .select({
        segment: clients.rfmSegment,
        count: count(),
        avgRevenue: sql<number>`COALESCE(AVG(${clients.totalOrdersAmount}::numeric), 0)`,
      })
      .from(clients)
      .where(and(eq(clients.isArchived, false), isNotNull(clients.rfmSegment)))
      .groupBy(clients.rfmSegment);

    const totalClients = rfmData.reduce((sum, r) => sum + Number(r.count), 0);

    const result: RFMDistributionData[] = rfmData
      .map((row) => ({
        segment: row.segment || "unknown",
        label: rfmSegmentLabels[row.segment as keyof typeof rfmSegmentLabels] || "Неизвестно",
        color: rfmSegmentColors[row.segment as keyof typeof rfmSegmentColors] || "#94a3b8",
        count: Number(row.count),
        percentage: totalClients > 0 ? Math.round((Number(row.count) / totalClients) * 100) : 0,
        avgRevenue: Math.round(Number(row.avgRevenue)),
      }))
      .sort((a, b) => b.count - a.count);

    return ok(result);
  }, { 
    roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
    errorPath: "getRFMDistribution" 
  });
}
