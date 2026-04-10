"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { taskChecklists } from "@/lib/schema/task-checklists";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { getTask } from "./task-actions";
import { addChecklistItemSchema, toggleChecklistItemSchema, deleteChecklistItemSchema } from "../validation";
import { z } from "zod";

/**
 * Добавление пункта чек-листа
 */
export async function addChecklistItem(
 taskId: string,
 content: string
): Promise<TaskActionResult<Task>> {
 try {
  addChecklistItemSchema.parse({ taskId, content });
  const session = await getSession();
  if (!session || !session.id) {
   return { success: false, error: "Не авторизован" };
  }

  if (!content.trim()) {
   return { success: false, error: "Текст не может быть пустым" };
  }

  // Получаем максимальный order
  const [maxOrder] = await db
   .select({ max: sql<number>`COALESCE(MAX(${taskChecklists.sortOrder}), 0)` })
   .from(taskChecklists)
   .where(eq(taskChecklists.taskId, taskId));

  await db.transaction(async (tx) => {
   await tx
    .insert(taskChecklists)
    .values({
     taskId,
     content: content.trim(),
     sortOrder: (maxOrder?.max || 0) + 1,
     isCompleted: false,
    });

   await tx.insert(taskHistory).values({
    taskId,
    userId: session.id,
    type: "checklist_added",
    newValue: content.trim(),
   });
  });

  revalidatePath("/dashboard/tasks");
  return getTask(taskId);
 } catch (error) {
  await logError({ error, severity: "error", path: "/dashboard/tasks", method: "addChecklistItem" });
  return { success: false, error: "Ошибка добавления" };
 }
}

/**
 * Переключение статуса пункта
 */
export async function toggleChecklistItem(
 itemId: string,
 isCompleted: boolean
): Promise<TaskActionResult<Task>> {
 try {
  toggleChecklistItemSchema.parse({ itemId, isCompleted });
  const session = await getSession();
  if (!session || !session.id) {
   return { success: false, error: "Не авторизован" };
  }

  const [item] = await db
   .select({ taskId: taskChecklists.taskId, content: taskChecklists.content })
   .from(taskChecklists)
   .where(eq(taskChecklists.id, itemId))
   .limit(1);

  if (!item) {
   return { success: false, error: "Пункт не найден" };
  }

  await db.transaction(async (tx) => {
   await tx
    .update(taskChecklists)
    .set({ isCompleted, updatedAt: new Date() })
    .where(eq(taskChecklists.id, itemId));

   await tx.insert(taskHistory).values({
    taskId: item.taskId,
    userId: session.id,
    type: isCompleted ? "checklist_completed" : "checklist_uncompleted",
    newValue: item.content,
   });
  });

  revalidatePath("/dashboard/tasks");
  return getTask(item.taskId);
 } catch (error) {
  await logError({ error, severity: "error", path: "/dashboard/tasks", method: "toggleChecklistItem" });
  return { success: false, error: "Ошибка обновления" };
 }
}

/**
 * Удаление пункта чек-листа
 */
export async function deleteChecklistItem(itemId: string): Promise<TaskActionResult<Task>> {
 try {
  deleteChecklistItemSchema.parse({ itemId });
  const session = await getSession();
  if (!session || !session.id) {
   return { success: false, error: "Не авторизован" };
  }

  const [item] = await db
   .select({ taskId: taskChecklists.taskId, content: taskChecklists.content })
   .from(taskChecklists)
   .where(eq(taskChecklists.id, itemId))
   .limit(1);

  if (!item) {
   return { success: false, error: "Пункт не найден" };
  }

  await db.transaction(async (tx) => {
   await tx.delete(taskChecklists).where(eq(taskChecklists.id, itemId));
   
   await tx.insert(taskHistory).values({
    taskId: item.taskId,
    userId: session.id,
    type: "checklist_removed",
    oldValue: item.content,
   });
  });

  revalidatePath("/dashboard/tasks");
  return getTask(item.taskId);
 } catch (error) {
  await logError({ error, severity: "error", path: "/dashboard/tasks", method: "deleteChecklistItem" });
  return { success: false, error: "Ошибка удаления" };
 }
}

/**
 * Обновление текста пункта
 */
export async function updateChecklistItem(
 itemId: string,
 content: string
): Promise<TaskActionResult<Task>> {
 try {
  addChecklistItemSchema.parse({ taskId: "00000000-0000-0000-0000-000000000000", content }); // content validation only
  z.string().uuid().parse(itemId);
  const session = await getSession();
  if (!session || !session.id) {
   return { success: false, error: "Не авторизован" };
  }

  const [item] = await db
   .select({ taskId: taskChecklists.taskId })
   .from(taskChecklists)
   .where(eq(taskChecklists.id, itemId))
   .limit(1);

  if (!item) {
   return { success: false, error: "Пункт не найден" };
  }

  await db
   .update(taskChecklists)
   .set({ content: content.trim(), updatedAt: new Date() })
   .where(eq(taskChecklists.id, itemId));

  revalidatePath("/dashboard/tasks");
  return getTask(item.taskId);
 } catch (error) {
  await logError({ error, severity: "error", path: "/dashboard/tasks", method: "updateChecklistItem" });
  return { success: false, error: "Ошибка обновления" };
 }
}
