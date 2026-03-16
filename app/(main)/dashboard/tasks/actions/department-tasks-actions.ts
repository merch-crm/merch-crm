"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { z } from "zod";

export async function getDepartmentTasks(departmentId: string): Promise<TaskActionResult<Task[]>> {
  try {
    z.string().uuid().parse(departmentId);
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Не авторизован" };

    const deptTasks = await db.query.tasks.findMany({
      where: eq(tasks.departmentId, departmentId),
      with: {
        creator: true,
        department: true,
        assignees: { with: { user: true } },
      },
      orderBy: [desc(tasks.createdAt)],
      limit: 100,
    });

    return { success: true, data: deptTasks as unknown as Task[] };
  } catch (error) {
    logError({ error, method: "getDepartmentTasks" });
    return { success: false, error: "Ошибка при получении задач отдела" };
  }
}
