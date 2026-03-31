"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks, taskAssignees, taskHistory } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { notifyTaskAssigned } from "../notifications";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { getTask } from "./task-actions";
import { addAssigneeSchema, removeAssigneeSchema } from "../validation";

export async function addTaskAssignee(
  taskId: string,
  userId: string
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    addAssigneeSchema.parse({ taskId, userId });;
    }

    const [existing] = await db
      .select()
      .from(taskAssignees)
      .where(
        and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId))
      )
      .limit(1);

    if (existing) {
      return { success: false, error: "Пользователь уже назначен" };
    }

    await db.transaction(async (tx) => {
      await tx.insert(taskAssignees).values({
        id: crypto.randomUUID(),
        taskId,
        userId,
        assignedBy: session.id,
      });

      await tx.insert(taskHistory).values({
        id: crypto.randomUUID(),
        taskId,
        userId: session.id,
        type: "assignee_added",
        newValue: userId,
      });
    });

    const [task] = await db
      .select({ title: tasks.title })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task) {
      await notifyTaskAssigned(taskId, task.title, [userId]);
    }

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "addTaskAssignee" });
    return { success: false, error: "Не удалось добавить исполнителя" };
  }
}

export async function removeTaskAssignee(
  taskId: string,
  userId: string
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    removeAssigneeSchema.parse({ taskId, userId });;
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(taskAssignees)
        .where(
          and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId))
        );

      await tx.insert(taskHistory).values({
        id: crypto.randomUUID(),
        taskId,
        userId: session.id,
        type: "assignee_removed",
        oldValue: userId,
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "removeTaskAssignee" });
    return { success: false, error: "Не удалось удалить исполнителя" };
  }
}
