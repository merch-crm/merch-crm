"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { withAuth } from "@/lib/action-helpers";
import { ActionResult, ok, ERRORS } from "@/lib/types";
import type { Task } from "@/lib/types/tasks";
import { userIdSchema } from "./schemas";

export async function getUserTasks(userId: string): Promise<ActionResult<Task[]>> {
  const validated = userIdSchema.safeParse(userId);
  if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

  return withAuth(async () => {
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

    return ok(userTasks as unknown as Task[]);
  }, { errorPath: "getUserTasks" });
}

export async function getAssignedUserTasks(userId: string): Promise<ActionResult<Task[]>> {
  const validated = userIdSchema.safeParse(userId);
  if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

  return withAuth(async () => {
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

    return ok(assigned.map(a => a.task) as unknown as Task[]);
  }, { errorPath: "getAssignedUserTasks" });
}
