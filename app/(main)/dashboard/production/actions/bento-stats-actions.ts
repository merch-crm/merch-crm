"use server";

import { db } from "@/lib/db";
import {
 productionTasks,
 productionLines,
} from "@/lib/schema/production";
import { inventoryTransactions } from "@/lib/schema/warehouse/stock";
import {
 and,
 gte,
 lte,
 count,
 sql,
 isNotNull,
 asc,
 inArray,
 lt,
 eq,
} from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { z } from "zod";
import { getSession } from "@/lib/session";
import type {
 StatsPeriod,
 HeatmapData,
 ShiftEfficiencyData,
 DashboardActionResult,
} from "../types";
import { getPeriodRange } from "../utils/period-utils";

const periodSchema = z.enum(["day", "week", "month"]);

/** 5. Тепловая карта загрузки */
export async function getHeatmapData(period: StatsPeriod = "week"): Promise<DashboardActionResult<HeatmapData>> {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  periodSchema.parse(period);

  const { start } = getPeriodRange(period);

  const logs = await db
   .select({
    dayOfWeek: sql<number>`EXTRACT(DOW FROM ${productionTasks.startDate})`,
    hour: sql<number>`EXTRACT(HOUR FROM ${productionTasks.startDate})`,
    count: count(),
   })
   .from(productionTasks)
   .where(
    and(
     gte(productionTasks.startDate, start),
     isNotNull(productionTasks.startDate)
    )
   )
   .groupBy(
    sql`EXTRACT(DOW FROM ${productionTasks.startDate})`,
    sql`EXTRACT(HOUR FROM ${productionTasks.startDate})`
   );

  const cells = logs.map((l) => ({
   dayOfWeek: Number(l.dayOfWeek),
   hour: Number(l.hour),
   value: Math.min(Number(l.count) * 10, 100),
   tasksCount: Number(l.count),
  }));

  const peakCell = cells.length > 0 ? cells.reduce((a, b) => a.value > b.value ? a : b) : null;

  return {
   success: true,
   data: {
    cells,
    maxValue: peakCell ? peakCell.value : 0,
    peakHour: peakCell ? peakCell.hour : 14,
    peakDay: peakCell ? peakCell.dayOfWeek : 2,
    averageLoad: cells.length > 0 ? Math.round(cells.reduce((a, c) => a + c.value, 0) / cells.length) : 0,
   },
  };
 } catch (e) {
  console.error(e);
  return { success: false, data: { cells: [], maxValue: 0, peakHour: 0, peakDay: 0 } };
 }
}

/** 9. Эффективность смены */
export async function getShiftEfficiency(): Promise<DashboardActionResult<ShiftEfficiencyData>> {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const now = new Date();
  const shiftStart = startOfDay(now);
  const shiftEnd = endOfDay(now);

  const [plannedStats] = await db
   .select({
    plannedTasks: count(),
    plannedQuantity: sql<number>`COALESCE(SUM(${productionTasks.quantity}), 0)`.as("plannedQuantity"),
   })
   .from(productionTasks)
   .where(
    and(
     inArray(productionTasks.status, ["pending", "in_progress", "completed"]),
     gte(productionTasks.createdAt, shiftStart),
     lte(productionTasks.createdAt, shiftEnd)
    )
   );

  const [completedStats] = await db
   .select({
    completedTasks: count(),
    completedQuantity: sql<number>`COALESCE(SUM(${productionTasks.completedQuantity}), 0)`.as("completedQuantity"),
    actualTime: sql<number>`COALESCE(SUM(${productionTasks.actualTime}), 0)`.as("actualTime"),
    estimatedTime: sql<number>`COALESCE(SUM(${productionTasks.estimatedTime}), 0)`.as("estimatedTime"),
   })
   .from(productionTasks)
   .where(
    and(
     eq(productionTasks.status, "completed"),
     gte(productionTasks.completedAt, shiftStart),
     lte(productionTasks.completedAt, shiftEnd)
    )
   );

  const plannedQty = Math.max(Number(plannedStats?.plannedQuantity || 0), 1);
  const completedQty = Number(completedStats?.completedQuantity || 0);
  const progress = Math.min(Math.round((completedQty / plannedQty) * 100), 100);
  const estimatedTime = Number(completedStats?.estimatedTime || 0);
  const actualTime = Number(completedStats?.actualTime || 0);

  const elapsedMinutes = Math.round((now.getTime() - shiftStart.getTime()) / 60000);
  const ratePerMinute = elapsedMinutes > 0 ? completedQty / elapsedMinutes : 0;
  const remaining = plannedQty - completedQty;
  const remainingMinutes = ratePerMinute > 0 ? Math.round(remaining / ratePerMinute) : 0;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingSecs = remainingMinutes % 60;
  const timeRemaining = remainingHours > 0 ? `${remainingHours}ч ${remainingSecs}м` : `${remainingSecs}м`;

  return {
   success: true,
   data: {
    progress,
    completedItems: completedQty,
    totalItems: plannedQty,
    efficiency: estimatedTime > 0 && actualTime > 0 ? Math.min(Math.round((estimatedTime / actualTime) * 100), 100) : 0,
    timeRemaining,
    status: progress > 80 ? "on_track" : progress > 50 ? "behind" : "danger",
   },
  };
 } catch (e) {
  console.error(e);
  return { success: false, data: { progress: 0, completedItems: 0, totalItems: 0, efficiency: 0, timeRemaining: "0м", status: "on_track" } };
 }
}

/** 12. Расход материалов */
export async function getMaterialConsumptionData(period: StatsPeriod = "week") {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  periodSchema.parse(period);

  const { start, end } = getPeriodRange(period);

  const consumption = await db
   .select({
    date: sql<string>`DATE(${inventoryTransactions.createdAt})`,
    amount: sql<number>`ABS(SUM(${inventoryTransactions.changeAmount}))`,
   })
   .from(inventoryTransactions)
   .where(
    and(
     eq(inventoryTransactions.type, "out"),
     gte(inventoryTransactions.createdAt, start),
     lte(inventoryTransactions.createdAt, end)
    )
   )
   .groupBy(sql`DATE(${inventoryTransactions.createdAt})`)
   .orderBy(asc(sql`DATE(${inventoryTransactions.createdAt})`));

  return {
   success: true,
   data: consumption.map((c) => ({
    date: c.date,
    amount: Number(c.amount),
    prediction: Math.round(Number(c.amount) * 1.1),
   })),
  };
 } catch (e) {
  console.error(e);
  return { success: false, data: [] };
 }
}

/** Сравнение с предыдущим периодом */
export async function getTrendForPeriod(period: StatsPeriod = "week"): Promise<DashboardActionResult<{ trend: number; current: number; previous: number }>> {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  periodSchema.parse(period);

  const { start, end } = getPeriodRange(period);

  const periodMs = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - periodMs);
  const prevEnd = start;

  const [currentCount] = await db
   .select({ count: count() })
   .from(productionTasks)
   .where(and(
    eq(productionTasks.status, "completed"),
    gte(productionTasks.completedAt, start),
    lte(productionTasks.completedAt, end)
   ));

  const [prevCount] = await db
   .select({ count: count() })
   .from(productionTasks)
   .where(and(
    eq(productionTasks.status, "completed"),
    gte(productionTasks.completedAt, prevStart),
    lte(productionTasks.completedAt, prevEnd)
   ));

  const curr = Number(currentCount?.count || 0);
  const prev = Number(prevCount?.count || 0);
  const trend = prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

  return { success: true, data: { trend, current: curr, previous: prev } };
 } catch (e) {
  console.error(e);
  return { success: false, data: { trend: 0, current: 0, previous: 0 } };
 }
}

/** Sparkline данных брака (по дням) */
export async function getDefectSparkline(period: StatsPeriod = "week"): Promise<DashboardActionResult<number[]>> {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  periodSchema.parse(period);

  const { start, end } = getPeriodRange(period);

  const daily = await db
   .select({
    date: sql<string>`DATE(${productionTasks.completedAt})`,
    defects: sql<number>`SUM(${productionTasks.defectQuantity})`,
   })
   .from(productionTasks)
   .where(and(
    gte(productionTasks.completedAt, start),
    lte(productionTasks.completedAt, end),
    lt(productionTasks.defectQuantity, sql`999999`)
   ))
   .groupBy(sql`DATE(${productionTasks.completedAt})`)
   .orderBy(asc(sql`DATE(${productionTasks.completedAt})`));

  return {
   success: true,
   data: daily.map(d => Number(d.defects || 0)),
  };
 } catch (e) {
  console.error(e);
  return { success: false, data: [] };
 }
}

/** Линейный план на основе capacity */
export async function getDailyTargetFromCapacity(): Promise<DashboardActionResult<number>> {
 try {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const lines = await db
   .select({ capacity: productionLines.capacity })
   .from(productionLines)
   .where(eq(productionLines.isActive, true));

  const total = lines.reduce((acc, l) => acc + (l.capacity || 0), 0);
  return { success: true, data: total };
 } catch (e) {
  console.error(e);
  return { success: false, data: 100 };
 }
}
