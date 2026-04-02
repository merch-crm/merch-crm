"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskDependencies } from "@/lib/schema/task-dependencies";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { notifyDependencyResolved } from "./task-notification-service";

/**
 * Вызывается после завершения задачи
 * Проверяет, разблокировались ли зависимые задачи, и отправляет уведомления
 */
export async function checkAndNotifyUnblockedTasks(completedTaskId: string): Promise<void> {
  // Находим задачи, которые зависели от завершённой
  const dependentTasks = await db
    .select({
      taskId: taskDependencies.taskId,
    })
    .from(taskDependencies)
    .where(eq(taskDependencies.dependsOnTaskId, completedTaskId));

  for (const dep of dependentTasks) {
    // Проверяем, есть ли ещё невыполненные зависимости у этой задачи
    const allDeps = await db
      .select({ 
        dependsOnTaskId: taskDependencies.dependsOnTaskId,
        status: tasks.status 
      })
      .from(taskDependencies)
      .innerJoin(tasks, eq(taskDependencies.dependsOnTaskId, tasks.id))
      .where(eq(taskDependencies.taskId, dep.taskId));

    const remainingBlocking = allDeps.filter(
      (d) => !["done", "archived", "cancelled"].includes(d.status)
    );

    // Если нет невыполненных зависимостей — задача разблокирована
    if (remainingBlocking.length === 0) {
      const [unblockedTask] = await db
        .select({ id: tasks.id, title: tasks.title })
        .from(tasks)
        .where(eq(tasks.id, dep.taskId))
        .limit(1);

      if (unblockedTask) {
        const assignees = await db.select({ userId: taskAssignees.userId }).from(taskAssignees).where(eq(taskAssignees.taskId, unblockedTask.id)).limit(10);
        await notifyDependencyResolved(unblockedTask.id, unblockedTask.title, assignees.map(a => a.userId));
      }
    }
  }
}
