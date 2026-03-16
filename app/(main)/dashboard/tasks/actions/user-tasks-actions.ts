"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, taskAssignees } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { userIdSchema } from "./schemas";

export async function getUserTasks(userId: string): Promise<TaskActionResult<Task[]>> {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Не авторизован" };
    userIdSchema.parse(userId);

    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.creatorId, userId),
      with: {
        creator: true,
        department: true,
        assignees: { with: { user: true } },
      },
      orderBy: [desc(tasks.createdAt)],
      limit: 100,
    });

    return { success: true, data: userTasks as unknown as Task[] };
  } catch (error) {
    logError({ error, method: "getUserTasks" });
    return { success: false, error: "Ошибка при получении задач пользователя" };
  }
}

export async function getAssignedUserTasks(userId: string): Promise<TaskActionResult<Task[]>> {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Не авторизован" };
    userIdSchema.parse(userId);

    const assigned = await db.query.taskAssignees.findMany({
      where: eq(taskAssignees.userId, userId),
      with: {
        task: {
          with: {
            creator: true,
            department: true,
            assignees: { with: { user: true } },
          }
        }
      },
      limit: 100,
    });

    return { success: true, data: assigned.map(a => a.task) as unknown as Task[] };
  } catch (error) {
    logError({ error, method: "getAssignedUserTasks" });
    return { success: false, error: "Ошибка при получении назначенных задач" };
  }
}
