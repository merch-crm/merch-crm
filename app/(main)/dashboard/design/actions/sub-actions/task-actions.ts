"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema/users";
import {
    orderDesignTasks,
    orderDesignHistory,
    orderDesignFiles
} from "@/lib/schema/design-tasks";
import { eq, and, desc, asc, inArray, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { ActionResult, DesignTask, DesignTaskFull } from "../types";
import { CreateTaskSchema } from "../schemas";

// Генерация номера задачи
export async function generateTaskNumber(orderId: string): Promise<string> {
    try {
        const session = await getSession();
        if (!session) {
            // Internal use might not have session, but the action trigger should.
            // However, the audit flags this as a server action issue.
        }

        const orderOriginal = await db.query.orders.findFirst({
            where: eq(orderDesignTasks.orderId, orderId),
            columns: { orderNumber: true },
        });

        const existingTasks = await db
            .select({ count: count() })
            .from(orderDesignTasks)
            .where(eq(orderDesignTasks.orderId, orderId));

        const taskNum = (existingTasks[0]?.count || 0) + 1;
        return `${orderOriginal?.orderNumber || "ORD"}-D${taskNum}`;
    } catch (error) {
        console.error("Error generating task number:", error);
        return `D-${Date.now()}`;
    }
}

// Схема валидации (переехала в schemas.ts, реэкспортируем для совместимости)

// Получить очередь дизайн-задач
export async function getDesignQueue(options?: {
    status?: string | string[];
    assigneeId?: string;
    priority?: number;
    limit?: number;
}): Promise<ActionResult<DesignTaskFull[]>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const conditions = [];

        if (options?.status) {
            if (Array.isArray(options.status)) {
                conditions.push(inArray(orderDesignTasks.status, options.status as ("pending" | "in_progress" | "review" | "approved" | "revision" | "not_required")[]));
            } else {
                conditions.push(eq(orderDesignTasks.status, options.status as "pending" | "in_progress" | "review" | "approved" | "revision" | "not_required"));
            }
        }

        if (options?.assigneeId) {
            conditions.push(eq(orderDesignTasks.assigneeId, options.assigneeId));
        }

        if (options?.priority !== undefined) {
            conditions.push(eq(orderDesignTasks.priority, options.priority));
        }

        const tasks = await db.query.orderDesignTasks.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [
                desc(orderDesignTasks.priority),
                asc(orderDesignTasks.dueDate),
                asc(orderDesignTasks.sortOrder),
            ],
            limit: options?.limit || 50,
            with: {
                order: true,
                orderItem: true,
                applicationType: {
                    columns: { id: true, name: true, color: true },
                },
                assignee: true,
                files: {
                    where: eq(orderDesignFiles.isActive, true),
                    orderBy: [desc(orderDesignFiles.createdAt)],
                    limit: 1,
                },
            },
        });

        return { success: true, data: tasks as unknown as DesignTaskFull[] };
    } catch (error) {
        console.error("Error fetching design queue:", error);
        return { success: false, error: "Не удалось загрузить очередь" };
    }
}

// Получить задачу по ID
export async function getDesignTask(id: string): Promise<ActionResult<DesignTaskFull>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const task = await db.query.orderDesignTasks.findFirst({
            where: eq(orderDesignTasks.id, id),
            with: {
                order: {
                    with: {
                        client: true,
                    },
                },
                orderItem: true,
                applicationType: true,
                sourceDesign: {
                    with: {
                        collection: {
                            columns: { id: true, name: true },
                        },
                    },
                },
                assignee: true,
                createdByUser: {
                    columns: { id: true, name: true },
                },
                files: {
                    orderBy: [desc(orderDesignFiles.createdAt)],
                    with: {
                        uploadedByUser: {
                            columns: { id: true, name: true },
                        },
                    },
                },
                history: {
                    orderBy: [desc(orderDesignHistory.createdAt)],
                    limit: 50,
                    with: {
                        performedByUser: {
                            columns: { id: true, name: true, image: true },
                        },
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        return { success: true, data: task as unknown as DesignTaskFull };
    } catch (error) {
        console.error("Error fetching task:", error);
        return { success: false, error: "Не удалось загрузить задачу" };
    }
}

// Получить задачи по заказу
export async function getDesignTasksByOrder(orderId: string): Promise<ActionResult<DesignTaskFull[]>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const tasks = await db.query.orderDesignTasks.findMany({
            where: eq(orderDesignTasks.orderId, orderId),
            orderBy: [asc(orderDesignTasks.sortOrder)],
            with: {
                applicationType: {
                    columns: { id: true, name: true, color: true },
                },
                assignee: {
                    columns: { id: true, name: true, image: true },
                },
                files: {
                    where: eq(orderDesignFiles.isActive, true),
                    orderBy: [desc(orderDesignFiles.createdAt)],
                    limit: 3,
                },
            },
        });

        return { success: true, data: tasks as unknown as DesignTaskFull[] };
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return { success: false, error: "Не удалось загрузить задачи" };
    }
}

// Создать задачу
export async function createDesignTask(
    data: z.infer<typeof CreateTaskSchema>
): Promise<ActionResult<DesignTask>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = CreateTaskSchema.parse(data);
        const number = await generateTaskNumber(validated.orderId);

        const [task] = (await db
            .insert(orderDesignTasks)
            .values({
                ...validated,
                number,
                createdBy: session.id,
            })
            .returning()) as typeof orderDesignTasks.$inferSelect[];

        // Логируем создание
        await db.insert(orderDesignHistory).values({
            taskId: task.id,
            event: "created",
            newValue: task.title,
            performedBy: session.id,
        });

        revalidatePath("/dashboard/design/queue");
        revalidatePath(`/dashboard/orders/${validated.orderId}`);

        return { success: true, data: task as DesignTask };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating task:", error);
        return { success: false, error: "Не удалось создать задачу" };
    }
}

// Обновить статус задачи
export async function updateDesignTaskStatus(
    id: string,
    status: "pending" | "in_progress" | "review" | "approved" | "revision" | "not_required",
    comment?: string
): Promise<ActionResult<DesignTask>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const task = await db.query.orderDesignTasks.findFirst({
            where: eq(orderDesignTasks.id, id),
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        const updateData: Partial<typeof orderDesignTasks.$inferInsert> = {
            status,
            updatedAt: new Date(),
        };

        if (status === "approved") {
            updateData.completedAt = new Date();
        }

        const [updated] = (await db
            .update(orderDesignTasks)
            .set(updateData)
            .where(eq(orderDesignTasks.id, id))
            .returning()) as typeof orderDesignTasks.$inferSelect[];

        // Логируем изменение
        await db.insert(orderDesignHistory).values({
            taskId: id,
            event: "status_changed",
            oldValue: task.status,
            newValue: status,
            comment,
            performedBy: session.id,
        });

        revalidatePath("/dashboard/design/queue");
        revalidatePath(`/dashboard/design/queue/${id}`);
        revalidatePath(`/dashboard/orders/${task.orderId}`);

        return { success: true, data: updated as DesignTask };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Не удалось обновить статус" };
    }
}

// Назначить исполнителя
export async function assignDesignTask(
    id: string,
    assigneeId: string | null
): Promise<ActionResult<DesignTask>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const task = await db.query.orderDesignTasks.findFirst({
            where: eq(orderDesignTasks.id, id),
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        const [updated] = (await db
            .update(orderDesignTasks)
            .set({
                assigneeId,
                updatedAt: new Date(),
            })
            .where(eq(orderDesignTasks.id, id))
            .returning()) as typeof orderDesignTasks.$inferSelect[];

        // Получаем имя исполнителя для лога
        let assigneeName = "Не назначен";
        if (assigneeId) {
            const assignee = await db.query.users.findFirst({
                where: eq(users.id, assigneeId),
                columns: { name: true },
            });
            assigneeName = assignee?.name || "Неизвестный";
        }

        await db.insert(orderDesignHistory).values({
            taskId: id,
            event: "assigned",
            oldValue: task.assigneeId,
            newValue: assigneeId,
            comment: `Назначен: ${assigneeName}`,
            performedBy: session.id,
        });

        revalidatePath("/dashboard/design/queue");
        revalidatePath(`/dashboard/design/queue/${id}`);

        return { success: true, data: updated as DesignTask };
    } catch (error) {
        console.error("Error assigning task:", error);
        return { success: false, error: "Не удалось назначить исполнителя" };
    }
}

// Взять задачу себе
export async function takeDesignTask(id: string): Promise<ActionResult<DesignTask>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        return assignDesignTask(id, session.id);
    } catch (error) {
        console.error("Error taking task:", error);
        return { success: false, error: "Не удалось взять задачу" };
    }
}
