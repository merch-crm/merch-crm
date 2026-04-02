"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskHistory } from "@/lib/schema/task-history";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { notifyTaskDelegated } from "../notifications";
import type { Task, TaskActionResult, DelegateTaskInput } from "@/lib/types/tasks";
import { delegateTaskSchema } from "../validation";

/**
 * Делегирование задачи другому пользователю
 */
export async function delegateTask(
  input: DelegateTaskInput
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    delegateTaskSchema.parse(input);;
    }

    const { taskId, newAssigneeIds, removeCurrentAssignees = true } = input;

    if (newAssigneeIds.length === 0) {
      return { success: false, error: "Выберите хотя бы одного исполнителя" };
    }

    // Получаем задачу
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return { success: false, error: "Задача не найдена" };
    }

    // Проверяем права (создатель или исполнитель)
    const currentAssigneesList = await db
      .select()
      .from(taskAssignees)
      .where(eq(taskAssignees.taskId, taskId))
      .limit(100);

    const isCreator = task.creatorId === session.id;
    const isAssignee = currentAssigneesList.some(
      (a) => a.userId === session.id
    );

    if (!isCreator && !isAssignee) {
      return { success: false, error: "Нет прав на делегирование" };
    }

    await db.transaction(async (tx) => {
      // Удаляем текущих исполнителей если нужно
      if (removeCurrentAssignees) {
        await tx
          .delete(taskAssignees)
          .where(eq(taskAssignees.taskId, taskId));
      }

      // Добавляем новых исполнителей
      for (const userId of newAssigneeIds) {
        // Проверяем, не добавлен ли уже
        if (!removeCurrentAssignees) {
          const existing = currentAssigneesList.find((a) => a.userId === userId);
          if (existing) continue;
        }

        await tx.insert(taskAssignees).values({
          id: crypto.randomUUID(),
          taskId,
          userId,
          createdAt: new Date(),
          assignedBy: session.id,
        });
      }

      // Обновляем поля делегирования в задаче (если нужно отслеживать кто делегировал)
      await tx
        .update(tasks)
        .set({
          delegatedByUserId: session.id,
          delegatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      // Записываем в историю
      await tx.insert(taskHistory).values({
        id: crypto.randomUUID(),
        taskId,
        userId: session.id,
        type: "delegated",
        newValue: newAssigneeIds.join(", "),
      });
    });

    // Уведомляем новых исполнителей
    await notifyTaskDelegated(
        taskId,
        task.title,
        newAssigneeIds,
        session.name || "Сотрудник"
    );

    // Получаем обновлённую задачу через общий getTask
    // (Импорт getTask из task-actions может вызвать циклическую зависимость, 
    // поэтому используем прямой запрос или переносим логику)
    const updatedTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        creator: true,
        department: true,
        assignees: {
          with: {
            user: true,
          },
        },
        watchers: {
          with: {
            user: true,
          },
        },
        checklists: true,
        comments: {
           with: {
              user: true
           }
        }
      },
    });

    revalidatePath("/dashboard/tasks");

    return { success: true, data: updatedTask as unknown as Task };
  } catch (error) {
    logError({ error, method: "delegateTask" });
    return { success: false, error: "Не удалось делегировать задачу" };
  }
}
