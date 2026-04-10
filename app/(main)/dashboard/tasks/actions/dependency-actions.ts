"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskDependencies } from "@/lib/schema/task-dependencies";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { getTask } from "./task-actions";
import { addDependencySchema } from "../validation";

// Рекурсивная проверка на циклическую зависимость
async function checkCircularDependency(
 taskId: string,
 dependsOnId: string,
 visited = new Set<string>()
): Promise<boolean> {
 if (taskId === dependsOnId) return true;
 if (visited.has(dependsOnId)) return false;

 visited.add(dependsOnId);

 const deps = await db
  .select({ nextTarget: taskDependencies.dependsOnTaskId })
  .from(taskDependencies)
  .where(eq(taskDependencies.taskId, dependsOnId))
  .limit(100);

 for (const dep of deps) {
  if (await checkCircularDependency(taskId, dep.nextTarget, visited)) {
   return true;
  }
 }

 return false;
}

export async function addTaskDependency(
 taskId: string,
 dependsOnTaskId: string
): Promise<TaskActionResult<Task>> {
 try {
  const session = await getSession();
  if (!session?.id) {
   return { success: false, error: "Не авторизован" }
  addDependencySchema.parse({ taskId, dependsOnTaskId });;
  }

  if (taskId === dependsOnTaskId) {
   return { success: false, error: "Задача не может зависеть от самой себя" };
  }

  const isCircular = await checkCircularDependency(taskId, dependsOnTaskId);
  if (isCircular) {
   return { success: false, error: "Обнаружена циклическая зависимость" };
  }

  const [existing] = await db
   .select()
   .from(taskDependencies)
   .where(
    and(
     eq(taskDependencies.taskId, taskId),
     eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
    )
   )
   .limit(1);

  if (existing) {
   return { success: false, error: "Зависимость уже существует" };
  }

  await db.transaction(async (tx) => {
   await tx.insert(taskDependencies).values({
    id: crypto.randomUUID(),
    taskId,
    dependsOnTaskId,
    createdBy: session.id,
   });

   await tx.insert(taskHistory).values({
    id: crypto.randomUUID(),
    taskId,
    userId: session.id,
    type: "dependency_added",
    newValue: dependsOnTaskId,
   });
  });

  revalidatePath("/dashboard/tasks");
  return getTask(taskId);
 } catch (error) {
  logError({ error: error as Error, path: "dependency-actions", method: "addTaskDependency" });
  return { success: false, error: "Не удалось добавить зависимость" };
 }
}

export async function removeTaskDependency(
 taskId: string,
 dependsOnTaskId: string
): Promise<TaskActionResult<Task>> {
 try {
  // Note: We use the same schema to validate IDs
  const session = await getSession();
  if (!session?.id) {
   return { success: false, error: "Не авторизован" }
  addDependencySchema.parse({ taskId, dependsOnTaskId });;
  }

  await db.transaction(async (tx) => {
   await tx
    .delete(taskDependencies)
    .where(
     and(
      eq(taskDependencies.taskId, taskId),
      eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
     )
    );

   await tx.insert(taskHistory).values({
    id: crypto.randomUUID(),
    taskId,
    userId: session.id,
    type: "dependency_removed",
    oldValue: dependsOnTaskId,
   });
  });

  revalidatePath("/dashboard/tasks");
  return getTask(taskId);
 } catch (error) {
  logError({ error: error as Error, path: "dependency-actions", method: "removeTaskDependency" });
  return { success: false, error: "Не удалось удалить зависимость" };
 }
}
