"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskWatchers } from "@/lib/schema/task-watchers";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { getTask } from "./task-actions";
import { addWatcherSchema, removeWatcherSchema } from "../validation";

export async function addTaskWatcher(
  taskId: string,
  userId: string
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    addWatcherSchema.parse({ taskId, userId });;
    }

    const [existing] = await db
      .select()
      .from(taskWatchers)
      .where(and(eq(taskWatchers.taskId, taskId), eq(taskWatchers.userId, userId)))
      .limit(1);

    if (existing) {
      return { success: false, error: "Пользователь уже в наблюдателях" };
    }

    await db.transaction(async (tx) => {
      await tx.insert(taskWatchers).values({
        id: crypto.randomUUID(),
        taskId,
        userId,
        addedBy: session.id,
      });

      await tx.insert(taskHistory).values({
        id: crypto.randomUUID(),
        taskId,
        userId: session.id,
        type: "watcher_added",
        newValue: userId,
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "addTaskWatcher" });
    return { success: false, error: "Не удалось добавить наблюдателя" };
  }
}

export async function removeTaskWatcher(
  taskId: string,
  userId: string
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    removeWatcherSchema.parse({ taskId, userId });;
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(taskWatchers)
        .where(
          and(eq(taskWatchers.taskId, taskId), eq(taskWatchers.userId, userId))
        );

      await tx.insert(taskHistory).values({
        id: crypto.randomUUID(),
        taskId,
        userId: session.id,
        type: "watcher_removed",
        oldValue: userId,
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "removeTaskWatcher" });
    return { success: false, error: "Не удалось удалить наблюдателя" };
  }
}
