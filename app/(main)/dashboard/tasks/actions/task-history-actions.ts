"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { TaskHistoryEntry, TaskActionResult } from "@/lib/types/tasks";
import { taskIdSchema } from "../validation";

/**
 * Получение истории задачи
 */
export async function getTaskHistory(
 taskId: string
): Promise<TaskActionResult<TaskHistoryEntry[]>> {
 try {
  const session = await getSession();
  if (!session?.id) {
   return { success: false, error: "Не авторизован" }
  taskIdSchema.parse(taskId);;
  }

  const history = await db.query.taskHistory.findMany({
   where: eq(taskHistory.taskId, taskId),
   with: {
    user: {
     columns: { id: true, name: true, image: true },
    },
   },
   orderBy: [desc(taskHistory.createdAt)],
   limit: 100,
  });

  return { success: true, data: history as unknown as TaskHistoryEntry[] };
 } catch (error) {
  logError({ error, method: "getTaskHistory" });
  return { success: false, error: "Не удалось загрузить историю" };
 }
}
