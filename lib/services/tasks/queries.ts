/**
 * @fileoverview Оптимизированные запросы для задач
 */

import { db } from "@/lib/db";
import { tasks } from "@/lib/schema/tasks";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Получает список задач с оптимизированной загрузкой связей
 */
export async function getTasks(params: {
  page?: number;
  limit?: number;
  status?: string;
  departmentId?: string;
}) {
  const { page = 1, limit = 20, status, departmentId } = params;

  // ✅ Один запрос с relations вместо N+1
  const result = await db.query.tasks.findMany({
    where: and(
    status ? eq(tasks.status, status as "new" | "done" | "cancelled" | "completed" | "archived" | "in_progress" | "review") : undefined,
      departmentId ? eq(tasks.departmentId, departmentId) : undefined
    ),
    with: {
      assignees: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      department: {
        columns: {
          id: true,
          name: true,
          color: true,
        },
      },
      creator: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: [desc(tasks.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(
      and(
        status ? eq(tasks.status, status as "new" | "done" | "cancelled" | "completed" | "archived" | "in_progress" | "review") : undefined,
        departmentId ? eq(tasks.departmentId, departmentId) : undefined
      )
    );

  return {
    tasks: result,
    pagination: {
      page,
      limit,
      total: Number(countResult.count),
      totalPages: Math.ceil(Number(countResult.count) / limit),
    },
  };
}

/**
 * Получает задачу с полными связями
 */
export async function getTaskById(taskId: string) {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      assignees: {
          with: { user: true }
      },
      department: true,
      creator: true,
      checklists: {
        orderBy: (checklists, { asc }) => [asc(checklists.sortOrder)],
      },
      comments: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
      attachments: true,
      history: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: 20,
      },
    },
  });
}
