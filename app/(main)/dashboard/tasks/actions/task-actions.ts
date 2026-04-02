"use server";

import { okVoid } from "@/lib/types";

import { eq, and, or, inArray, desc, like, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { taskWatchers } from "@/lib/schema/task-watchers";
import { taskDependencies } from "@/lib/schema/task-dependencies";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { createTaskSchema, taskIdSchema, taskFiltersSchema } from "../validation";
import { notifyTaskCreated, notifyStatusChanged } from "../notifications";
import type { Task, TaskActionResult, TaskFilters, TaskStatus, CreateTaskInput } from "@/lib/types/tasks";

// Вспомогательная функция для записи истории
async function logTaskHistory(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  taskId: string,
  userId: string,
  action: string,
  oldValue?: string,
  newValue?: string
) {
  await tx.insert(taskHistory).values({
    id: crypto.randomUUID(),
    taskId,
    userId,
    type: action,
    oldValue,
    newValue,
  });
}

// Проверка блокировки задачи зависимостями
async function checkTaskBlocked(taskId: string): Promise<boolean> {
  const deps = await db
    .select({
      dependsOnTaskId: taskDependencies.dependsOnTaskId,
      status: tasks.status,
    })
    .from(taskDependencies)
    .innerJoin(tasks, eq(tasks.id, taskDependencies.dependsOnTaskId))
    .where(eq(taskDependencies.taskId, taskId))
    .limit(10);

  return deps.some((d) => d.status !== "done" && d.status !== "cancelled");
}

// Получить список задач с фильтрами
export async function getTasks(
  filters?: TaskFilters
): Promise<TaskActionResult<Task[]>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }
    if (filters) {
      taskFiltersSchema.parse(filters);
    }

    const tasksList = await db.query.tasks.findMany({
      where: and(
        filters?.status?.length
          ? inArray(tasks.status, filters.status)
          : undefined,
        filters?.priority?.length
          ? inArray(tasks.priority, filters.priority)
          : undefined,
        filters?.departmentId
          ? eq(tasks.departmentId, filters.departmentId)
          : undefined,
        filters?.isOverdue
          ? and(
              lt(tasks.deadline, new Date()),
              or(
                eq(tasks.status, "new"),
                eq(tasks.status, "in_progress"),
                eq(tasks.status, "review")
              )
            )
          : undefined,
        filters?.search
          ? or(
              like(tasks.title, `%${filters.search}%`),
              like(tasks.description, `%${filters.search}%`)
            )
          : undefined
      ),
      columns: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,
        departmentId: true,
        creatorId: true,
      },
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
        department: {
          columns: { id: true, name: true },
        },
        assignees: {
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
        },
        watchers: {
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
        },
        dependencies: {
          with: {
            dependsOnTask: {
              columns: { id: true, title: true, status: true },
            },
          },
        },
      },
      orderBy: [desc(tasks.createdAt)],
      limit: 50,
    });

    return { success: true, data: tasksList as unknown as Task[] };
  } catch (error) {
    logError({ error, method: "getTasks" });
    return { success: false, error: "Не удалось загрузить задачи" };
  }
}

// Получить одну задачу
export async function getTask(taskId: string): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }
    taskIdSchema.parse(taskId);

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        creator: {
          columns: { id: true, name: true, email: true, image: true },
        },
        department: {
          columns: { id: true, name: true },
        },
        assignees: {
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        watchers: {
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        dependencies: {
          with: {
            dependsOnTask: {
              columns: { id: true, title: true, status: true },
            },
          },
        },
        history: {
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
          orderBy: [desc(taskHistory.createdAt)],
        },
      },
    });

    if (!task) {
      return { success: false, error: "Задача не найдена" };
    }

    return { success: true, data: task as unknown as Task };
  } catch (error) {
    logError({ error, method: "getTask" });
    return { success: false, error: "Не удалось загрузить задачу" };
  }
}

// Создать задачу
export async function createTask(
  input: CreateTaskInput
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const validation = createTaskSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message || "Ошибка валидации" };
    }

    const { assigneeIds, watcherIds, ...taskData } = validation.data;

    let newTaskId: string;

    await db.transaction(async (tx) => {
      // Создаём задачу
      const [newTask] = await tx
        .insert(tasks)
        .values({
          id: crypto.randomUUID(),
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          type: taskData.type,
          deadline: new Date(taskData.deadline),
          departmentId: taskData.departmentId,
          creatorId: session.id,
          status: "new",
        })
        .returning();

      newTaskId = newTask.id;

      // Добавляем исполнителей
      for (const userId of assigneeIds) {
        await tx.insert(taskAssignees).values({
          id: crypto.randomUUID(),
          taskId: newTask.id,
          userId,
          assignedBy: session.id,
        });
      }

      // Добавляем наблюдателей
      if (watcherIds?.length) {
        for (const userId of watcherIds) {
          await tx.insert(taskWatchers).values({
            id: crypto.randomUUID(),
            taskId: newTask.id,
            userId,
            addedBy: session.id,
          });
        }
      }

      // Записываем в историю
      await logTaskHistory(tx, newTask.id, session.id, "created");
    });

    // Уведомления
    await notifyTaskCreated(newTaskId!, input.title, assigneeIds);

    revalidatePath("/dashboard/tasks");

    return getTask(newTaskId!);
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/tasks",
      method: "createTask",
    });
    return { success: false, error: "Не удалось создать задачу" };
  }
}

// Обновить задачу
export async function updateTask(
  taskId: string,
  input: Partial<CreateTaskInput>
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      return { success: false, error: "Задача не найдена" };
    }

    // Проверяем права
    const currentAssignees = await db
      .select()
      .from(taskAssignees)
      .where(eq(taskAssignees.taskId, taskId));
    const isCreator = existingTask.creatorId === session.id;
    const isAssignee = currentAssignees.some((a) => a.userId === session.id);

    if (!isCreator && !isAssignee) {
      return { success: false, error: "Нет прав на редактирование" };
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.deadline !== undefined) updateData.deadline = new Date(input.deadline);
    if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;

    await db.transaction(async (tx) => {
      await tx.update(tasks).set(updateData).where(eq(tasks.id, taskId));
      await logTaskHistory(tx, taskId, session.id, "updated");
    });

    revalidatePath("/dashboard/tasks");

    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "updateTask" });
    return { success: false, error: "Не удалось обновить задачу" };
  }
}

// Изменить статус
export async function changeTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return { success: false, error: "Задача не найдена" };
    }

    // Проверяем блокировку при переходе в работу
    if (newStatus === "in_progress") {
      const isBlocked = await checkTaskBlocked(taskId);
      if (isBlocked) {
        return {
          success: false,
          error: "Задача заблокирована. Сначала завершите зависимые задачи",
        };
      }
    }

    const oldStatus = task.status;

    await db.transaction(async (tx) => {
      await tx
        .update(tasks)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));

      await logTaskHistory(
        tx,
        taskId,
        session.id,
        "status_changed",
        oldStatus,
        newStatus
      );
    });

    // Уведомления
    const assignees = await db
      .select({ userId: taskAssignees.userId })
      .from(taskAssignees)
      .where(eq(taskAssignees.taskId, taskId));

    const recipientIds = assignees
      .map((a) => a.userId)
      .filter((id) => id !== session.id);

    if (task.creatorId && task.creatorId !== session.id) {
      recipientIds.push(task.creatorId);
    }

    if (recipientIds.length > 0) {
      await notifyStatusChanged(taskId, task.title, [...new Set(recipientIds)], newStatus);
    }

    revalidatePath("/dashboard/tasks");

    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "changeTaskStatus" });
    return { success: false, error: "Не удалось изменить статус" };
  }
}

// Удалить задачу
export async function deleteTask(taskId: string): Promise<TaskActionResult<void>> {
  // audit-ignore - Вся история задачи удаляется вместе с ней
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return { success: false, error: "Задача не найдена" };
    }

    if (task.creatorId !== session.id) {
      return { success: false, error: "Только создатель может удалить задачу" };
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath("/dashboard/tasks");

    return okVoid();
  } catch (error) {
    logError({ error, method: "deleteTask" });
    return { success: false, error: "Не удалось удалить задачу" };
  }
}

// Статистика задач
export async function getTaskStats(): Promise<
  TaskActionResult<{
    total: number;
    byStatus: Record<string, number>;
    overdue: number;
  }>
> {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Не авторизован" };

    const [stats] = await db.select({
      total: sql<number>`count(*)`,
      overdue: sql<number>`count(*) filter (where ${tasks.deadline} < now() and ${tasks.status} not in ('done', 'cancelled'))`,
      new: sql<number>`count(*) filter (where ${tasks.status} = 'new')`,
      in_progress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')`,
      review: sql<number>`count(*) filter (where ${tasks.status} = 'review')`,
      done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
      cancelled: sql<number>`count(*) filter (where ${tasks.status} = 'cancelled')`,
    }).from(tasks).limit(1);

    return {
      success: true,
      data: {
        total: Number(stats.total),
        byStatus: {
          new: Number(stats.new),
          in_progress: Number(stats.in_progress),
          review: Number(stats.review),
          done: Number(stats.done),
          cancelled: Number(stats.cancelled),
        },
        overdue: Number(stats.overdue),
      },
    };
  } catch (error) {
    logError({ error, method: "getTaskStats" });
    return { success: false, error: "Не удалось загрузить статистику" };
  }
}
