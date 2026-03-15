// app/(main)/dashboard/production/actions/bento-dashboard-actions.ts
"use server";

import { db } from "@/lib/db";
import {
  productionTasks,
  orders,
  productionLines,
  inventoryItems,
  productionStaff,
} from "@/lib/schema";
import {
  eq,
  and,
  gte,
  lt,
  lte,
  count,
  inArray,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/session";
import {
  startOfDay,
  subDays,
} from "date-fns";
import type {
  StatsPeriod,
  ProductionBentoDashboardData,
  MaterialAlert,
} from "../types";
import {
  getDefectStats,
  getTopApplicationTypes,
  getDailyOutputData,
  getDeadlineCalendarData,
} from "./bento-dashboard-data-actions";
import { getProductionItems } from "../actions";
import { getPeriodRange } from "../utils/period-utils";
import {
  getHeatmapData,
  getStaffLoadData,
  getShiftEfficiency,
  getLineLoadData,
  getMaterialConsumptionData,
  getUrgentProductionTasks,
  getEquipmentStatus,
  getTrendForPeriod,
} from "./bento-dashboard-analytics-actions";

const periodSchema = z.enum(["day", "week", "month"]);

/** Получить все данные для дашборда за один запрос (параллельно) */
export async function getAllDashboardData(
  period: StatsPeriod = "week"
): Promise<{
  success: boolean;
  data?: ProductionBentoDashboardData;
  error?: string;
}> {
  try {
    periodSchema.parse(period);
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const [
      hero,
      conversion,
      materialAlerts,
      defects,
      heatmap,
      staffLoad,
      topTypes,
      dailyOutput,
      lineLoad,
      shiftEfficiency,
      deadlineCalendar,
      materialConsumption,
      urgentTasks,
      equipmentStatus,
      kanbanItems,
    ] = await Promise.all([
      getHeroStats(),
      getConversionStats(period),
      getMaterialAlerts(),
      getDefectStats(period),
      getHeatmapData(period),
      getStaffLoadData(),
      getTopApplicationTypes(period),
      getDailyOutputData(period),
      getLineLoadData(),
      getShiftEfficiency(),
      getDeadlineCalendarData(),
      getMaterialConsumptionData(period),
      getUrgentProductionTasks(),
      getEquipmentStatus(),
      getProductionItems(),
    ]);

    return {
      success: true,
      data: {
        hero: hero.success ? hero.data! : { activeOrders: 0, averageCompletionTime: "0м", trend: 0 },
        attention: {
          urgent: hero.success ? hero.data!.urgent : 0,
          overdue: hero.success ? hero.data!.overdue : 0,
        },
        conversion: conversion.success ? conversion.data! : { inQueue: 0, inProgress: 0, paused: 0, completedToday: 0, overdue: 0, activeLines: 0, activeStaff: 0 },
        heatmap: heatmap.success ? heatmap.data! : { cells: [], maxValue: 0, peakHour: 0, peakDay: 0 },
        staffLoad: staffLoad.success ? staffLoad.data! : { staff: [], averageLoad: 0, averageEfficiency: 0 },
        topApplicationTypes: topTypes.success ? topTypes.data! : [],
        defects: defects.success ? defects.data! : { totalDefects: 0, defectRate: 0, trend: 0, byCategory: [], sparklineData: [] },
        materialAlerts: materialAlerts.success ? materialAlerts.data! : [],
        materialConsumption: materialConsumption.success ? materialConsumption.data! : [],
        shiftEfficiency: shiftEfficiency.success ? shiftEfficiency.data! : { progress: 0, completedItems: 0, totalItems: 0, efficiency: 0, timeRemaining: "0м", status: "on_track" },
        deadlineCalendar: deadlineCalendar.success ? deadlineCalendar.data! : { deadlines: [], todaySummary: { count: 0, urgent: 0 } },
        dailyOutput: dailyOutput.success ? dailyOutput.data! : [],
        lineLoad: lineLoad.success ? lineLoad.data! : [],
        urgentTasks: urgentTasks.success ? urgentTasks.data! : [],
        equipmentStatus: equipmentStatus.success ? equipmentStatus.data! : [],
        kanbanItems: kanbanItems.success ? kanbanItems.data! : [],
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

/** 1. Основная статистика (Hero) */
export async function getHeroStats() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const [activeResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, ["new", "design", "production"]));

    const [urgentResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(
        inArray(orders.status, ["new", "design", "production"]),
        eq(orders.priority, "urgent")
      ));

    const [overdueResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(
        inArray(orders.status, ["new", "design", "production"]),
        lt(orders.deadline, new Date())
      ));

    const thirtyDaysAgo = subDays(new Date(), 30);
    const completedTasks = await db
      .select({ actualTime: productionTasks.actualTime })
      .from(productionTasks)
      .where(and(
        eq(productionTasks.status, "completed"),
        gte(productionTasks.completedAt, thirtyDaysAgo)
      ));

    const totalMinutes = completedTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);
    const avgMinutes = completedTasks.length > 0 ? Math.round(totalMinutes / completedTasks.length) : 0;

    // Тренд завершённых заказов за последние 30 vs предыдущие 30 дней
    const sixtyDaysAgo = subDays(new Date(), 60);
    const [prevPeriodResult] = await db
      .select({ count: count() })
      .from(productionTasks)
      .where(and(
        eq(productionTasks.status, "completed"),
        gte(productionTasks.completedAt, sixtyDaysAgo),
        lt(productionTasks.completedAt, thirtyDaysAgo)
      ));
    const currCompleted = completedTasks.length;
    const prevCompleted = Number(prevPeriodResult?.count || 0);
    const trend = prevCompleted === 0 ? 0 : Math.round(((currCompleted - prevCompleted) / prevCompleted) * 100);

    return {
      success: true,
      data: {
        activeOrders: Number(activeResult?.count || 0),
        averageCompletionTime: `${avgMinutes} мин`,
        trend,
        urgent: Number(urgentResult?.count || 0),
        overdue: Number(overdueResult?.count || 0),
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: { activeOrders: 0, averageCompletionTime: "0м", trend: 0, urgent: 0, overdue: 0 } };
  }
}

/** 2. Конверсия и общая эффективность */
export async function getConversionStats(period: StatsPeriod = "week") {
  try {
    periodSchema.parse(period);
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const { start, end } = getPeriodRange(period);

    const [completedTodayResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(
        eq(orders.status, "done"),
        gte(orders.updatedAt, startOfDay(new Date()))
      ));

    const [overdueResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(
        inArray(orders.status, ["new", "design", "production"]),
        lt(orders.deadline, new Date())
      ));

    const [activeLinesResult] = await db
      .select({ count: count() })
      .from(productionLines)
      .where(eq(productionLines.isActive, true));

    const [activeStaffResult] = await db
      .select({ count: count() })
      .from(productionStaff)
      .where(eq(productionStaff.isActive, true));

    const tasks = await db
      .select({ status: productionTasks.status, count: count() })
      .from(productionTasks)
      .where(and(
        gte(productionTasks.createdAt, start),
        lte(productionTasks.createdAt, end)
      ))
      .groupBy(productionTasks.status);

    const statusMap = new Map(tasks.map((t) => [t.status, Number(t.count)]));

    // Тренд за период
    const trendResult = await getTrendForPeriod(period);
    const trend = trendResult.success ? trendResult.data!.trend : 0;

    return {
      success: true,
      data: {
        inQueue: statusMap.get("pending") || 0,
        inProgress: statusMap.get("in_progress") || 0,
        paused: statusMap.get("paused") || 0,
        completedToday: (statusMap.get("completed") || 0) + Number(completedTodayResult?.count || 0),
        overdue: Number(overdueResult?.count || 0),
        activeLines: Number(activeLinesResult?.count) || 0,
        activeStaff: Number(activeStaffResult?.count) || 0,
        trend,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: { inQueue: 0, inProgress: 0, paused: 0, completedToday: 0, overdue: 0, activeLines: 0, activeStaff: 0 } };
  }
}

export interface DashboardActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 3. Алерт по материалам */
export async function getMaterialAlerts(): Promise<DashboardActionResult<MaterialAlert[]>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const materials = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        quantity: inventoryItems.quantity,
        lowStockThreshold: inventoryItems.lowStockThreshold,
        unit: inventoryItems.unit,
      })
      .from(inventoryItems)
      .where(sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold} * 1.5`)
      .limit(10);

    const alerts: MaterialAlert[] = materials.map((m) => ({
      id: m.id,
      name: m.name,
      currentStock: m.quantity,
      minThreshold: m.lowStockThreshold || 0,
      unit: m.unit || "шт.",
      urgency: m.quantity <= (m.lowStockThreshold || 0) ? "critical" : "warning",
    }));

    return { success: true, data: alerts };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}
