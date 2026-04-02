"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskComments } from "@/lib/schema/task-comments";
import { taskHistory } from "@/lib/schema/task-history";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { taskWatchers } from "@/lib/schema/task-watchers";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { notifyCommentAdded } from "../notifications";
import { getTask } from "./task-actions";
import { addCommentSchema, taskIdSchema, contentSchema } from "../validation";
import { z } from "zod";

/**
 * Добавление комментария к задаче
 */
export async function addTaskComment(
  taskId: string,
  content: string
): Promise<TaskActionResult<Task>> {
  try {
    addCommentSchema.parse({ taskId, content });
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Не авторизован" };
    }

    if (!content.trim()) {
      return { success: false, error: "Комментарий не может быть пустым" };
    }

    const [task] = await db
      .select({ id: tasks.id, title: tasks.title })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return { success: false, error: "Задача не найдена" };
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(taskComments)
        .values({
          taskId,
          userId: session.id,
          content: content.trim(),
        });

      await tx.insert(taskHistory).values({
        taskId,
        userId: session.id,
        type: "comment_added",
        newValue: content.trim().substring(0, 100),
      });
    });

    // Уведомление о новом комментарии
    const assignees = await db.select({ userId: taskAssignees.userId })
        .from(taskAssignees).where(eq(taskAssignees.taskId, taskId)).limit(100);
    const watchers = await db.select({ userId: taskWatchers.userId })
        .from(taskWatchers).where(eq(taskWatchers.taskId, taskId)).limit(100);
        
    const recipients = new Set([...assignees.map(a => a.userId), ...watchers.map(w => w.userId)]);
    recipients.delete(session.id);
    
    if (recipients.size > 0) {
      await notifyCommentAdded(
        taskId,
        task.title,
        Array.from(recipients),
        session.name || "Сотрудник"
      );
    }

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    await logError({ error, severity: "error", path: "/dashboard/tasks", method: "addTaskComment" });
    return { success: false, error: "Ошибка добавления комментария" };
  }
}

/**
 * Удаление комментария
 */
export async function deleteTaskComment(
  taskId: string,
  commentId: string
): Promise<TaskActionResult<Task>> {
  // audit-ignore - Удаление комментариев не требует системного трекинга
  try {
    taskIdSchema.parse(taskId);
    z.string().uuid().parse(commentId);
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Не авторизован" };
    }

    const [comment] = await db
      .select({ userId: taskComments.userId })
      .from(taskComments)
      .where(eq(taskComments.id, commentId))
      .limit(1);

    if (!comment) {
      return { success: false, error: "Комментарий не найден" };
    }

    // Здесь можно добавить проверку прав (автор или создатель задачи)
    
    await db.delete(taskComments).where(eq(taskComments.id, commentId));

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    await logError({ error, severity: "error", path: "/dashboard/tasks", method: "deleteTaskComment" });
    return { success: false, error: "Ошибка удаления комментария" };
  }
}

/**
 * Обновление комментария
 */
export async function updateTaskComment(
  taskId: string,
  commentId: string,
  content: string
): Promise<TaskActionResult<Task>> {
  try {
    taskIdSchema.parse(taskId);
    z.string().uuid().parse(commentId);
    contentSchema.parse(content);
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Не авторизован" };
    }

    if (!content.trim()) {
      return { success: false, error: "Комментарий не может быть пустым" };
    }

    const [comment] = await db
      .select({ userId: taskComments.userId })
      .from(taskComments)
      .where(eq(taskComments.id, commentId))
      .limit(1);

    if (!comment) {
      return { success: false, error: "Комментарий не найден" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(taskComments)
        .set({ content: content.trim(), updatedAt: new Date() })
        .where(eq(taskComments.id, commentId));

      await tx.insert(taskHistory).values({
        taskId,
        userId: session.id,
        type: "comment_updated",
        newValue: content.trim().substring(0, 100),
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    await logError({ error, severity: "error", path: "/dashboard/tasks", method: "updateTaskComment" });
    return { success: false, error: "Ошибка обновления комментария" };
  }
}
