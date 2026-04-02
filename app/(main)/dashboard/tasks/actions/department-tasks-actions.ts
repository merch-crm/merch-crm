"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { withAuth } from "@/lib/action-helpers";
import { ActionResult, ok, ERRORS } from "@/lib/types";
import type { Task } from "@/lib/types/tasks";
import { z } from "zod";

export async function getDepartmentTasks(departmentId: string): Promise<ActionResult<Task[]>> {
  const validated = z.string().uuid().safeParse(departmentId);
  if (!validated.success) return ERRORS.VALIDATION("Некорректный ID отдела");

  return withAuth(async () => {
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

    return ok(deptTasks as unknown as Task[]);
  }, { errorPath: "getDepartmentTasks" });
}
