// app/(main)/dashboard/production/actions/bento-dashboard-data-actions.ts
"use server";

import { db } from "@/lib/db";
import {
  productionTasks,
  orders,
  orderItems,
  applicationTypes,
  productionLines,
  clients,
} from "@/lib/schema";
import {
  eq,
  and,
  gte,
  lte,
  count,
  sql,
  isNotNull,
  desc,
  asc,
  inArray,
} from "drizzle-orm";
import { startOfDay, endOfDay, endOfMonth, addDays, format, startOfMonth } from "date-fns";
import { z } from "zod";
import { getSession } from "@/lib/session";
import type {
  StatsPeriod,
  DefectStats,
  DeadlineCalendarData,
  TopApplicationType,
  DailyOutputItem
} from "../types";
import { getPeriodRange } from "../utils/period-utils";

export interface DashboardActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const periodSchema = z.enum(["day", "week", "month"]);

// Add // audit-ignore: Intentional public action for non-authenticated users if needed, 
// but for Bento actions, they SHOULD be secured.

/** Сравнение метрики с предыдущим периодом */
function calcTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** 4. Статистика брака */
export async function getDefectStats(period: StatsPeriod = "week"): Promise<DashboardActionResult<DefectStats>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" }
    periodSchema.parse(period);;
    }

    const { start, end } = getPeriodRange(period);

    // Текущий период
    const stats = await db
      .select({
        category: productionTasks.defectCategory,
        count: count(),
        totalQuantity: sql<number>`SUM(${productionTasks.quantity})`,
        defectQuantity: sql<number>`SUM(${productionTasks.defectQuantity})`,
      })
      .from(productionTasks)
      .where(
        and(
          gte(productionTasks.completedAt, start),
          lte(productionTasks.completedAt, end),
          isNotNull(productionTasks.defectCategory)
        )
      )
      .groupBy(productionTasks.defectCategory);

    const totalDefects = stats.reduce((acc, s) => acc + Number(s.defectQuantity || 0), 0);
    const totalQty = stats.reduce((acc, s) => acc + Number(s.totalQuantity || 1), 0);
    const defectRate = totalQty > 0 ? Number(((totalDefects / totalQty) * 100).toFixed(1)) : 0;

    // Предыдущий период для тренда
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const [prevStats] = await db
      .select({ defectQty: sql<number>`SUM(${productionTasks.defectQuantity})` })
      .from(productionTasks)
      .where(and(
        gte(productionTasks.completedAt, prevStart),
        lte(productionTasks.completedAt, start),
        isNotNull(productionTasks.defectCategory)
      ));
    const prevDefects = Number(prevStats?.defectQty || 0);
    const trend = calcTrend(totalDefects, prevDefects);

    // Sparkline по дням
    const daily = await db
      .select({
        defects: sql<number>`SUM(${productionTasks.defectQuantity})`,
      })
      .from(productionTasks)
      .where(and(
        gte(productionTasks.completedAt, start),
        lte(productionTasks.completedAt, end)
      ))
      .groupBy(sql`DATE(${productionTasks.completedAt})`)
      .orderBy(asc(sql`DATE(${productionTasks.completedAt})`));

    const sparklineData = daily.map(d => Number(d.defects || 0));

    const byCategory = stats.map((s) => ({
      name: s.category || "Другое",
      count: Number(s.defectQuantity || 0),
      percentage: totalDefects > 0 ? Math.round((Number(s.defectQuantity) / totalDefects) * 100) : 0,
      color: "#ef4444",
    }));

    return {
      success: true,
      data: { totalDefects, defectRate, trend, byCategory, sparklineData },
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: { totalDefects: 0, defectRate: 0, trend: 0, byCategory: [], sparklineData: [] } };
  }
}

/** 7. Топ типов нанесения */
export async function getTopApplicationTypes(period: StatsPeriod = "week"): Promise<DashboardActionResult<TopApplicationType[]>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" }
    periodSchema.parse(period);;
    }

    const { start } = getPeriodRange(period);

    const types = await db
      .select({
        id: applicationTypes.id,
        name: applicationTypes.name,
        color: applicationTypes.color,
        count: count(),
      })
      .from(productionTasks)
      .innerJoin(
        applicationTypes,
        eq(productionTasks.applicationTypeId, applicationTypes.id)
      )
      .where(gte(productionTasks.createdAt, start))
      .groupBy(applicationTypes.id, applicationTypes.name, applicationTypes.color)
      .orderBy(desc(count()))
      .limit(5);

    const total = types.reduce((acc, t) => acc + Number(t.count), 0);

    return {
      success: true,
      data: types.map((t) => ({
        id: t.id,
        name: t.name,
        count: Number(t.count),
        percentage: Math.round((Number(t.count) / (total || 1)) * 100),
        color: t.color || "#64748b",
      })),
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}

/** 8. Дневная производительность */
export async function getDailyOutputData(period: StatsPeriod = "week"): Promise<DashboardActionResult<DailyOutputItem[]>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" }
    periodSchema.parse(period);;
    }

    const { start, end } = getPeriodRange(period);

    // Capacity из активных линий (инлайн-запрос, чтобы избежать циклического импорта)
    const lineCapacities = await db
      .select({ capacity: productionLines.capacity })
      .from(productionLines)
      .where(eq(productionLines.isActive, true));
    const target = lineCapacities.reduce((acc, l) => acc + (l.capacity || 0), 0) || 100;

    const output = await db
      .select({
        date: sql<string>`DATE(${productionTasks.completedAt})`,
        completed: count(),
        defects: sql<number>`SUM(${productionTasks.defectQuantity})`,
      })
      .from(productionTasks)
      .where(
        and(
          eq(productionTasks.status, "completed"),
          gte(productionTasks.completedAt, start),
          lte(productionTasks.completedAt, end)
        )
      )
      .groupBy(sql`DATE(${productionTasks.completedAt})`)
      .orderBy(asc(sql`DATE(${productionTasks.completedAt})`));

    return {
      success: true,
      data: output.map((o) => ({
        date: o.date,
        completed: Number(o.completed),
        defects: Number(o.defects || 0),
        target,
      })),
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}

export async function getDeadlineCalendarData(
  monthOffset: number = 0
): Promise<DashboardActionResult<DeadlineCalendarData>> {
  try {
    z.number().parse(monthOffset);
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const baseDate = addDays(new Date(), monthOffset * 30);
    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);

    const ordersWithDeadlines = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        deadline: orders.deadline,
        priority: orders.priority,
        clientName: clients.name,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(productionTasks, eq(productionTasks.orderItemId, orderItems.id))
      .where(
        and(
          gte(orders.deadline, start),
          lte(orders.deadline, end),
          inArray(productionTasks.status, ["pending", "in_progress", "paused"])
        )
      )
      .groupBy(orders.id, orders.orderNumber, orders.deadline, orders.priority, clients.name);

    const deadlines = ordersWithDeadlines.map((o) => ({
      date: format(o.deadline!, "yyyy-MM-dd"),
      count: 1,
      ordersCount: 1,
      isUrgent: o.priority === "urgent" || o.priority === "high",
      priorities: {
        high: o.priority === "urgent" || o.priority === "high" ? 1 : 0,
        medium: o.priority === "normal" ? 1 : 0,
        low: o.priority === "low" ? 1 : 0,
      },
      orders: [{
        id: o.id,
        number: o.orderNumber,
        client: o.clientName || "Неизвестно",
        status: "in_progress" as const,
        priority: o.priority as "normal" | "low" | "high" | "urgent",
      }],
    }));

    const now = new Date();
    const [stats] = await db
      .select({
        count: count(),
        urgent: sql<number>`SUM(CASE WHEN ${orders.priority} IN ('urgent', 'high') THEN 1 ELSE 0 END)`,
      })
      .from(orders)
      .where(and(
        gte(orders.deadline, startOfDay(now)),
        lte(orders.deadline, endOfDay(now))
      ));

    return {
      success: true,
      data: {
        deadlines,
        todaySummary: {
          count: Number(stats?.count || 0),
          urgent: Number(stats?.urgent || 0),
        },
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: { deadlines: [], todaySummary: { count: 0, urgent: 0 } } };
  }
}
