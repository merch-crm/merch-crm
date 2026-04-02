"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { roles, users } from "@/lib/schema/users";
import { logError } from "@/lib/error-logger";
import { notifyTaskCreated } from "../notifications";
import type { TaskType, TaskPriority } from "@/lib/types/tasks";
import { createAutoTaskSchema } from "../validation";

interface AutoTaskInput {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  departmentId?: string;
  roleSlug?: string;
  sourceType: string;
  sourceId: string;
}

export async function createAutoTask(input: AutoTaskInput) {
  try {
    createAutoTaskSchema.parse(input);
    const [existing] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.autoCreatedSourceId, input.sourceId),
          eq(tasks.autoCreatedSourceType, input.sourceType),
          eq(tasks.status, "new")
        )
      )
      .limit(1);

    if (existing) return { success: true, alreadyExists: true };

    const [systemUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, "system@merchcrm.ru"))
      .limit(1);

    const creatorId = systemUser?.id || "00000000-0000-0000-0000-000000000000";

    let assigneeIds: string[] = [];
    if (input.roleSlug) {
      const usersByRole = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(roles.slug, input.roleSlug))
        .limit(100);
      
      assigneeIds = usersByRole.map(u => u.id);
    }

    const newTaskId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(tasks).values({
        id: newTaskId,
        title: input.title,
        description: input.description,
        type: input.type,
        priority: input.priority,
        status: "new",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        departmentId: input.departmentId,
        creatorId,
        isAutoCreated: true,
        autoCreatedReason: input.description.substring(0, 255),
        autoCreatedSourceType: input.sourceType,
        autoCreatedSourceId: input.sourceId,
      });

      if (assigneeIds.length > 0) {
        for (const userId of assigneeIds) {
          await tx.insert(taskAssignees).values({
            id: crypto.randomUUID(),
            taskId: newTaskId,
            userId,
            assignedBy: creatorId,
          });
        }
      }
    });

    if (assigneeIds.length > 0) {
      await notifyTaskCreated(newTaskId, input.title, assigneeIds);
    }

    return { success: true, taskId: newTaskId };
  } catch (error) {
    logError({ error, method: "createAutoTask" });
    return { success: false, error: "Ошибка при создании автозадачи" };
  }
}
