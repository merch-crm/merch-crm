"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import type { Task } from "@/lib/types/tasks";
import { z } from "zod";
import { getSession } from "@/lib/session";



/**
 * Получить задачи для конкретного департамента
 */
export async function getDepartmentTasks(departmentId: string): Promise<Task[]> {
  try {
    const session = await getSession();
    if (!session?.id) return [];

    z.string().uuid().parse(departmentId);
    const data = await db.query.tasks.findMany({
      where: and(
        eq(tasks.departmentId, departmentId),
        ne(tasks.status, "archived")
      ),
      with: {
        assignees: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        watchers: {
           with: {
            user: {
              columns: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        checklists: true,
        comments: {
            limit: 1
        },
        dependencies: {
            limit: 1
        }
      },
      orderBy: [desc(tasks.createdAt)],
      limit: 20
    });

    // Трансформируем в тип Task
    if (!data) return [];
    return data.map(item => ({
      ...item,
      assignees: item.assignees.map((a: { user: unknown }) => a.user),
      watchers: item.watchers.map((w: { user: unknown }) => w.user),
      checklists: item.checklists.map((c: { completedAt?: Date | null; completedByUserId?: string | null; [key: string]: unknown }) => ({
          ...c,
          completedAt: c.completedAt || undefined,
          completedByUserId: c.completedByUserId || undefined
      })),
      deadline: item.deadline || undefined,
      completedAt: item.completedAt || undefined,
      checklistProgress: 0,
      dependencies: [],
      dependentTasks: [],
      comments: []
    })) as unknown as Task[];
  } catch (error) {
    console.error(`[Tasks] Failed to fetch tasks for department: ${departmentId}`, error);
    return [];
  }
}
