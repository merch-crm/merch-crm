"use server";

import { db } from "@/lib/db";
import { productionTasks, productionLogs, productionStaff } from "@/lib/schema/production";
import { orders, orderItems } from "@/lib/schema/orders";
import { eq, and, desc, asc, gte, lte, inArray, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

export interface ProductionTaskStats {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byLine: Record<string, number>;
    totalQuantity: number;
    completedQuantity: number;
    overdueCount: number;
    averageCompletionTime: number;
}

// Генерация номера задачи
async function generateTaskNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TASK-${year}-`;

    const lastTask = await db.query.productionTasks.findFirst({
        where: sql`number LIKE ${prefix + '%'}`,
        orderBy: [desc(productionTasks.createdAt)],
    });

    let nextNum = 1;
    if (lastTask) {
        const lastNum = parseInt(lastTask.number.replace(prefix, ""));
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `${prefix}${String(nextNum).padStart(5, "0")}`;
}

const CreateTaskSchema = z.object({
    orderId: z.string().uuid(),
    orderItemId: z.string().uuid().optional().nullable(),
    applicationTypeId: z.string().uuid().optional().nullable(),
    lineId: z.string().uuid().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
    title: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    quantity: z.number().int().min(1),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    dueDate: z.date().optional().nullable(),
    estimatedTime: z.number().int().min(0).optional().nullable(),
    designFiles: z.array(z.object({
        path: z.string(),
        name: z.string(),
        type: z.string(),
    })).optional(),
    notes: z.string().optional().nullable(),
});

// Получить задачи
export async function getProductionTasks(options?: {
    status?: string | string[];
    lineId?: string;
    assigneeId?: string;
    priority?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
}): Promise<ActionResult<ProductionTaskFull[]>> {
    try {
        const conditions = [];

        if (options?.status) {
            if (Array.isArray(options.status)) {
                conditions.push(inArray(productionTasks.status, options.status as NonNullable<typeof productionTasks.$inferInsert["status"]>[]));
            } else {
                conditions.push(eq(productionTasks.status, options.status as NonNullable<typeof productionTasks.$inferInsert["status"]>));
            }
        }

        if (options?.lineId) {
            conditions.push(eq(productionTasks.lineId, options.lineId));
        }

        if (options?.assigneeId) {
            conditions.push(eq(productionTasks.assigneeId, options.assigneeId));
        }

        if (options?.priority) {
            conditions.push(eq(productionTasks.priority, options.priority as NonNullable<typeof productionTasks.$inferInsert["priority"]>));
        }

        if (options?.dateFrom) {
            conditions.push(gte(productionTasks.dueDate, options.dateFrom));
        }

        if (options?.dateTo) {
            conditions.push(lte(productionTasks.dueDate, options.dateTo));
        }

        const result = await db.query.productionTasks.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [
                asc(productionTasks.sortOrder),
                desc(productionTasks.priority),
                asc(productionTasks.dueDate),
            ],
            limit: options?.limit || 100,
            with: {
                order: {
                    columns: { id: true, status: true },
                    extras: {
                        number: sql<string>`${orders.orderNumber}`.as("number"),
                    },
                },
                applicationType: {
                    columns: { id: true, name: true, color: true },
                },
                line: {
                    columns: { id: true, name: true, color: true },
                },
                assignee: {
                    columns: { id: true, name: true, avatarPath: true },
                },
            },
        });

        return { success: true, data: result as ProductionTaskFull[] };
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return { success: false, error: "Не удалось загрузить задачи" };
    }
}

// Получить задачу по ID
export async function getProductionTask(id: string): Promise<ActionResult<ProductionTaskFull>> {
    try {
        const result = await db.query.productionTasks.findFirst({
            where: eq(productionTasks.id, id),
            with: {
                order: true,
                orderItem: true,
                applicationType: true,
                line: true,
                assignee: true,
                createdByUser: {
                    columns: { id: true, name: true },
                },
                logs: {
                    orderBy: [desc(productionLogs.createdAt)],
                    limit: 50,
                    with: {
                        performedByUser: {
                            columns: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!result) {
            return { success: false, error: "Задача не найдена" };
        }

        return { success: true, data: result as unknown as ProductionTaskFull };
    } catch (error) {
        console.error("Error fetching task:", error);
        return { success: false, error: "Не удалось загрузить задачу" };
    }
}

// Создать задачу
export async function createProductionTask(
    data: z.infer<typeof CreateTaskSchema>
): Promise<ActionResult<ProductionTask>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = CreateTaskSchema.parse(data);
        const number = await generateTaskNumber();

        const [result] = await db
            .insert(productionTasks)
            .values({
                ...validated,
                number,
                createdBy: session.id,
            })
            .returning();

        // Логируем создание
        await db.insert(productionLogs).values({
            taskId: result.id,
            event: "created",
            details: { title: result.title },
            performedBy: session.id,
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/tasks");

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating task:", error);
        if (error instanceof Error) {
            console.error("Error stack:", error.stack);
        }
        return { success: false, error: "Не удалось создать задачу" };
    }
}

// Обновить статус задачи
export async function updateTaskStatus(
    id: string,
    status: "pending" | "in_progress" | "paused" | "completed" | "cancelled"
): Promise<ActionResult<ProductionTask>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const task = await db.query.productionTasks.findFirst({
            where: eq(productionTasks.id, id),
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        const updateData: Partial<typeof productionTasks.$inferInsert> = {
            status,
            updatedAt: new Date(),
        };

        // Дополнительная логика по статусам
        if (status === "in_progress" && !task.startDate) {
            updateData.startDate = new Date();
        }

        if (status === "completed") {
            updateData.completedAt = new Date();
            updateData.completedQuantity = task.quantity;

            // Рассчитываем фактическое время
            if (task.startDate) {
                const diff = new Date().getTime() - new Date(task.startDate).getTime();
                updateData.actualTime = Math.round(diff / 60000); // минуты
            }
        }

        const [result] = await db
            .update(productionTasks)
            .set(updateData)
            .where(eq(productionTasks.id, id))
            .returning();

        // Логируем изменение статуса
        const eventMap: Record<string, string> = {
            pending: "reset",
            in_progress: "started",
            paused: "paused",
            completed: "completed",
            cancelled: "cancelled",
        };

        await db.insert(productionLogs).values({
            taskId: id,
            event: eventMap[status] || "status_changed",
            details: { oldStatus: task.status, newStatus: status },
            performedBy: session.id,
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/tasks");
        revalidatePath(`/dashboard/production/tasks/${id}`);

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Не удалось обновить статус" };
    }
}

// Назначить исполнителя
export async function assignTask(
    id: string,
    assigneeId: string | null
): Promise<ActionResult<ProductionTask>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const [result] = await db
            .update(productionTasks)
            .set({
                assigneeId,
                updatedAt: new Date(),
            })
            .where(eq(productionTasks.id, id))
            .returning();

        // Получаем имя исполнителя для лога
        let assigneeName = "Не назначен";
        if (assigneeId) {
            const assignee = await db.query.productionStaff.findFirst({
                where: eq(productionStaff.id, assigneeId),
            });
            if (assignee) {
                assigneeName = assignee.name;
            }
        }

        await db.insert(productionLogs).values({
            taskId: id,
            event: "assigned",
            details: { assigneeId, assigneeName },
            performedBy: session.id,
        });

        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/production/tasks/${id}`);

        return { success: true, data: result };
    } catch (error) {
        console.error("Error assigning task:", error);
        return { success: false, error: "Не удалось назначить исполнителя" };
    }
}

// Обновить выполненное количество
export async function updateTaskProgress(
    id: string,
    completedQuantity: number
): Promise<ActionResult<ProductionTask>> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        const task = await db.query.productionTasks.findFirst({
            where: eq(productionTasks.id, id),
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        if (completedQuantity > task.quantity) {
            return { success: false, error: "Выполненное количество не может превышать общее" };
        }

        const updateData: Partial<typeof productionTasks.$inferInsert> = {
            completedQuantity,
            updatedAt: new Date(),
        };

        // Автоматически завершаем если всё выполнено
        if (completedQuantity === task.quantity) {
            updateData.status = "completed";
            updateData.completedAt = new Date();
        }

        const [result] = await db
            .update(productionTasks)
            .set(updateData)
            .where(eq(productionTasks.id, id))
            .returning();

        await db.insert(productionLogs).values({
            taskId: id,
            event: "quantity_updated",
            details: {
                oldQuantity: task.completedQuantity,
                newQuantity: completedQuantity,
                total: task.quantity,
            },
            performedBy: session.id,
        });

        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/production/tasks/${id}`);

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating progress:", error);
        return { success: false, error: "Не удалось обновить прогресс" };
    }
}

// Обновить порядок задач (drag-and-drop)
export async function updateTasksOrder(
    items: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(productionTasks)
                    .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                    .where(eq(productionTasks.id, item.id));
            }
        });

        revalidatePath("/dashboard/production");

        return { success: true };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: "Не удалось обновить порядок" };
    }
}

// Удалить задачу
export async function deleteProductionTask(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session?.id) {
            return { success: false, error: "Необходима авторизация" };
        }

        await db.transaction(async (tx) => {
            await tx.delete(productionLogs).where(eq(productionLogs.taskId, id));
            await tx.delete(productionTasks).where(eq(productionTasks.id, id));
        });

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/tasks");

        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        return { success: false, error: "Не удалось удалить задачу" };
    }
}

// Статистика производства задач
export async function getTaskProductionStats(options?: {
    dateFrom?: Date;
    dateTo?: Date;
}): Promise<ActionResult<ProductionTaskStats>> {
    try {
        const conditions = [];

        if (options?.dateFrom) {
            conditions.push(gte(productionTasks.createdAt, options.dateFrom));
        }
        if (options?.dateTo) {
            conditions.push(lte(productionTasks.createdAt, options.dateTo));
        }

        const tasks = await db
            .select()
            .from(productionTasks)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const stats: ProductionTaskStats = {
            total: tasks.length,
            byStatus: {},
            byPriority: {},
            byLine: {},
            totalQuantity: 0,
            completedQuantity: 0,
            overdueCount: 0,
            averageCompletionTime: 0,
        };

        let totalCompletionTime = 0;
        let completedWithTime = 0;
        const now = new Date();

        for (const task of tasks) {
            stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
            stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;

            if (task.lineId) {
                stats.byLine[task.lineId] = (stats.byLine[task.lineId] || 0) + 1;
            }

            stats.totalQuantity += task.quantity;
            stats.completedQuantity += task.completedQuantity || 0;

            if (task.dueDate && new Date(task.dueDate) < now && task.status !== "completed") {
                stats.overdueCount++;
            }

            if (task.actualTime) {
                totalCompletionTime += task.actualTime;
                completedWithTime++;
            }
        }

        if (completedWithTime > 0) {
            stats.averageCompletionTime = Math.round(totalCompletionTime / completedWithTime);
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

// Получить количество заказов по типам нанесения
export async function getProductionOrdersCounts(): Promise<ActionResult<Record<string, number>>> {
    try {
        const result = await db
            .select({
                applicationTypeId: productionTasks.applicationTypeId,
                count: count(),
            })
            .from(productionTasks)
            .where(sql`${productionTasks.status} != 'completed'`)
            .groupBy(productionTasks.applicationTypeId);

        const counts: Record<string, number> = {};
        result.forEach((row) => {
            if (row.applicationTypeId) {
                counts[row.applicationTypeId] = Number(row.count);
            }
        });

        return { success: true, data: counts };
    } catch (error) {
        console.error("Error fetching order counts:", error);
        return { success: false, error: "Не удалось загрузить счётчики" };
    }
}

// Типы
export type ProductionTask = typeof productionTasks.$inferSelect;
export type ProductionTaskFull = ProductionTask & {
    order?: { id: string; number: string; status: string } | null;
    applicationType?: { id: string; name: string; color: string | null } | null;
    line?: { id: string; name: string; code: string; color: string | null } | null;
    assignee?: { id: string; name: string; avatarPath: string | null } | null;
    logs?: (typeof productionLogs.$inferSelect & {
        performedByUser?: { id: string; name: string } | null;
    })[];
    orderItem?: typeof orderItems.$inferSelect | null;
    createdByUser?: { id: string; name: string } | null;
};

// ProductionStats is imported from production-dashboard-actions
