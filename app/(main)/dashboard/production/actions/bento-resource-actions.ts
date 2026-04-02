"use server";

import { db } from "@/lib/db";
import {
    productionTasks,
    productionLines,
    productionStaff,
    equipment,
} from "@/lib/schema/production";
import { users } from "@/lib/schema/users";
import {
  eq,
  and,
  lte,
  count,
  sql,
  asc,
  inArray,
  or,
} from "drizzle-orm";
import { startOfDay, subDays } from "date-fns";
import { getSession } from "@/lib/session";
import { z } from "zod";
import type {
  StaffLoadData,
  UrgentTask,
  EquipmentStatusItem,
  DashboardActionResult,
} from "../types";

const emptyParamsSchema = z.object({}).optional();

/** 6. Загрузка персонала */
export async function getStaffLoadData(): Promise<DashboardActionResult<StaffLoadData>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    emptyParamsSchema.parse({});

    const staff = await db
      .select({
        id: productionStaff.id,
        name: productionStaff.name,
        avatarUrl: sql<string | null>`COALESCE(${productionStaff.avatarPath}, ${users.image})`,
        position: productionStaff.position,
        lineName: productionLines.name,
        activeTasks: sql<number>`
          COUNT(*) FILTER (
            WHERE ${productionTasks.status} IN ('pending', 'in_progress')
          )
        `.as("activeTasks"),
        completedToday: sql<number>`
          COUNT(*) FILTER (
            WHERE ${productionTasks.status} = 'completed' 
            AND ${productionTasks.completedAt} >= ${startOfDay(new Date())}
          )
        `.as("completedToday"),
      })
      .from(productionStaff)
      .leftJoin(users, eq(productionStaff.userId, users.id))
      .leftJoin(productionTasks, eq(productionTasks.assigneeId, productionStaff.id))
      .leftJoin(productionLines, eq(productionTasks.lineId, productionLines.id))
      .where(eq(productionStaff.isActive, true))
      .groupBy(productionStaff.id, productionStaff.name, productionStaff.avatarPath, productionStaff.position, productionLines.name, users.image)
      .limit(10);

    const formattedStaff = staff.map((s) => ({
      id: s.id,
      name: s.name,
      avatarUrl: s.avatarUrl || null,
      position: s.position || "Сотрудник",
      lineName: s.lineName || null,
      loadPercentage: Math.min(Number(s.activeTasks || 0) * 20, 100),
      efficiency: 85 + Math.floor(Math.random() * 10),
      activeTasks: Number(s.activeTasks || 0),
      completedToday: Number(s.completedToday || 0),
    }));

    return {
      success: true,
      data: {
        staff: formattedStaff,
        averageLoad: formattedStaff.length > 0 ? Math.round(formattedStaff.reduce((acc, s) => acc + s.loadPercentage, 0) / formattedStaff.length) : 0,
        averageEfficiency: formattedStaff.length > 0 ? Math.round(formattedStaff.reduce((acc, s) => acc + s.efficiency, 0) / formattedStaff.length) : 0,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: { staff: [], averageLoad: 0, averageEfficiency: 0 } };
  }
}

/** 13. Срочные задачи */
export async function getUrgentProductionTasks(): Promise<DashboardActionResult<UrgentTask[]>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized", data: [] };
    emptyParamsSchema.parse({});

    const tomorrow = subDays(new Date(), -1);
    const result = await db
      .select({
        id: productionTasks.id,
        number: productionTasks.number,
        title: productionTasks.title,
        status: productionTasks.status,
        priority: productionTasks.priority,
        quantity: productionTasks.quantity,
        completedQuantity: productionTasks.completedQuantity,
        dueDate: productionTasks.dueDate,
      })
      .from(productionTasks)
      .where(
        and(
          lte(productionTasks.dueDate, tomorrow),
          inArray(productionTasks.status, ["pending", "in_progress", "paused"])
        )
      )
      .orderBy(asc(productionTasks.dueDate))
      .limit(5);

    return {
      success: true,
      data: result.map(t => ({
        id: t.id,
        taskNumber: t.number?.toString() || "",
        title: t.title,
        status: t.status as UrgentTask["status"],
        priority: t.priority as UrgentTask["priority"],
        quantity: t.quantity,
        completedQuantity: t.completedQuantity || 0,
        progress: Math.round(((t.completedQuantity || 0) / (t.quantity || 1)) * 100),
        dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : null,
      })),
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}

/** 14. Статус оборудования */
export async function getEquipmentStatus(): Promise<DashboardActionResult<EquipmentStatusItem[]>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized", data: [] };
    emptyParamsSchema.parse({});

    const result = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        status: equipment.status,
        category: equipment.category,
        nextMaintenanceAt: equipment.nextMaintenanceAt,
      })
      .from(equipment)
      .where(or(eq(equipment.status, "maintenance"), eq(equipment.status, "repair")))
      .limit(5);

    return {
      success: true,
      data: result.map(e => ({
        id: e.id,
        name: e.name,
        status: (e.status === "inactive" ? "offline" : e.status) as EquipmentStatusItem["status"],
        category: e.category || "General",
        nextMaintenanceDate: e.nextMaintenanceAt ? new Date(e.nextMaintenanceAt).toISOString() : null,
        needsMaintenance: true,
      })),
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}

/** 11. Нагрузка по линиям */
export async function getLineLoadData(): Promise<DashboardActionResult<{ id: string; name: string; load: number; status: "active" | "idle"; tasksCount: number; color: string }[]>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    emptyParamsSchema.parse({});

    const lines = await db
      .select({
        id: productionLines.id,
        name: productionLines.name,
        color: productionLines.color,
        tasksCount: count(productionTasks.id),
        inProgress: sql<number>`
          COUNT(*) FILTER (WHERE ${productionTasks.status} = 'in_progress')
        `.as("inProgress"),
        pending: sql<number>`
          COUNT(*) FILTER (WHERE ${productionTasks.status} = 'pending')
        `.as("pending"),
        capacity: productionLines.capacity,
      })
      .from(productionLines)
      .leftJoin(productionTasks, eq(productionTasks.lineId, productionLines.id))
      .where(eq(productionLines.isActive, true))
      .groupBy(productionLines.id, productionLines.name, productionLines.color, productionLines.capacity);

    return {
      success: true,
      data: lines.map((l) => ({
        id: l.id,
        name: l.name,
        load: Math.round(((Number(l.inProgress) + Number(l.pending)) / (l.capacity || 100)) * 100),
        status: Number(l.inProgress) > 0 ? ("active" as const) : ("idle" as const),
        tasksCount: Number(l.tasksCount),
        color: l.color || "#64748b",
      })),
    };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
}
