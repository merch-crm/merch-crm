"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, inArray, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    productionTasks,
    productionLogs,
    type ApplicationType,
    type ProductionLine,
    type ProductionStaff,
} from "@/lib/schema/production";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { generateId } from "@/lib/utils";

export type ProductionTask = InferSelectModel<typeof productionTasks>;
export type InventoryItem = InferSelectModel<typeof inventoryItems>;

/**
 * Расширенный тип производственной задачи со всеми связанными данными.
 * Используется для типизации результатов findMany/findFirst в Drizzle.
 */
export type ProductionTaskFull = ProductionTask & {
    applicationType: ApplicationType | null;
    line: ProductionLine | null;
    assignee: (ProductionStaff & {
        user: { id: string; name: string; avatar: string | null } | null;
    }) | null;
    orderItem: {
        order: { id: string; orderNumber: string | null } | null;
        inventory: InventoryItem | null;
    } | null;
    logs: (InferSelectModel<typeof productionLogs> & {
        performedByUser: { id: string; name: string; avatar: string | null } | null;
    })[];
};

// Схемы валидации
const TaskSchema = z.object({
    orderId: z.string().uuid("ID заказа обязателен"),
    orderItemId: z.string().uuid().optional().nullable(),
    applicationTypeId: z.string().uuid("Тип нанесения обязателен"),
    name: z.string().min(1, "Название обязательно").max(200),
    description: z.string().max(2000).optional().nullable(),
    quantity: z.number().int().positive("Количество должно быть положительным"),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    dueDate: z.string().optional().nullable(),
    lineId: z.string().uuid().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
});

// === ЗАДАЧИ ===

export async function getProductionTasks(options?: {
    status?: ProductionTask["status"][];
    priority?: ProductionTask["priority"][];
    lineId?: string;
    assigneeId?: string;
    limit?: number;
    offset?: number;
}) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const conditions = [];

        if (options?.status && options.status.length > 0) {
            conditions.push(inArray(productionTasks.status, options.status));
        }
        if (options?.priority && options.priority.length > 0) {
            conditions.push(inArray(productionTasks.priority, options.priority));
        }
        if (options?.lineId) {
            conditions.push(eq(productionTasks.lineId, options.lineId));
        }
        if (options?.assigneeId) {
            conditions.push(eq(productionTasks.assigneeId, options.assigneeId));
        }

        const tasks = await db.query.productionTasks.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                applicationType: true,
                line: true,
                assignee: {
                    with: {
                        user: {
                            columns: { id: true, name: true, avatar: true }
                        }
                    }
                },
                orderItem: {
                    with: {
                        order: {
                            columns: { id: true, orderNumber: true }
                        },
                        inventory: true
                    }
                }
            },
            orderBy: [desc(productionTasks.createdAt)],
            limit: options?.limit || 50,
            offset: options?.offset || 0,
        });

        return { success: true, data: tasks as ProductionTaskFull[] };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "getProductionTasks" });
        return { success: false, error: "Не удалось загрузить задачи" };
    }
}

export async function getProductionTaskById(id: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const task = await db.query.productionTasks.findFirst({
            where: eq(productionTasks.id, id),
            with: {
                applicationType: true,
                line: true,
                assignee: {
                    with: {
                        user: { columns: { id: true, name: true, avatar: true } }
                    }
                },
                orderItem: {
                    with: {
                        order: true,
                        inventory: true,
                    }
                },
                logs: {
                    with: {
                        performedByUser: { columns: { id: true, name: true, avatar: true } }
                    },
                    orderBy: [desc(productionLogs.createdAt)]
                }
            }
        });

        if (!task) return { success: false, error: "Задача не найдена" };

        return { success: true, data: task as ProductionTaskFull };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "getProductionTaskById", details: { id } });
        return { success: false, error: "Не удалось загрузить задачу" };
    }
}

// Aliases for compatibility
export const getProductionTask = getProductionTaskById;

export async function createProductionTask(data: z.infer<typeof TaskSchema>) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = TaskSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        const taskId = generateId();
        const taskNumber = `PROD-${Date.now().toString().slice(-6)}`;
        
        const [task] = await db.insert(productionTasks).values({
            id: taskId,
            number: taskNumber,
            title: validated.data.name,
            orderId: validated.data.orderId, 
            orderItemId: validated.data.orderItemId,
            applicationTypeId: validated.data.applicationTypeId,
            lineId: validated.data.lineId,
            assigneeId: validated.data.assigneeId,
            description: validated.data.description,
            quantity: validated.data.quantity,
            priority: validated.data.priority,
            dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
            createdBy: session.id,
        }).returning();

        await db.insert(productionLogs).values({
            taskId: task.id,
            event: "created",
            performedBy: session.id,
            details: { message: "Задача создана" },
        });

        await logAction("Создана производственная задача", "production_task", task.id, { title: task.title });
        revalidatePath("/dashboard/production/tasks");

        return { success: true, data: task as ProductionTask };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "createProductionTask" });
        return { success: false, error: "Не удалось создать задачу" };
    }
}

export async function updateProductionTaskStatus(taskId: string, status: ProductionTask["status"], comment?: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [task] = await db.select().from(productionTasks).where(eq(productionTasks.id, taskId)).limit(1);
        if (!task) return { success: false, error: "Задача не найдена" };

        if (task.status === status) return { success: true, data: task as ProductionTask };

        const updateData: Partial<ProductionTask> = { status, updatedAt: new Date() };
        if (status === "completed") {
            updateData.completedAt = new Date();
            updateData.completedQuantity = task.quantity;
        }

        const [updatedTask] = await db.update(productionTasks).set(updateData).where(eq(productionTasks.id, taskId)).returning();

        await db.insert(productionLogs).values({
            taskId,
            event: "status_updated",
            performedBy: session.id,
            details: { status, comment: comment || null },
        });

        await logAction("Обновлён статус задачи", "production_task", taskId, { status, comment });
        revalidatePath("/dashboard/production/tasks");
        revalidatePath(`/dashboard/production/tasks/${taskId}`);

        return { success: true, data: updatedTask as ProductionTask };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "updateProductionTaskStatus", details: { taskId, status } });
        return { success: false, error: "Не удалось обновить статус" };
    }
}

export const updateTaskStatus = updateProductionTaskStatus;

export async function updateProductionTaskProgress(taskId: string, completedQuantity: number) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [task] = await db.select().from(productionTasks).where(eq(productionTasks.id, taskId)).limit(1);
        if (!task) return { success: false, error: "Задача не найдена" };

        const newStatus: ProductionTask["status"] = completedQuantity >= task.quantity ? 'completed' : task.status;

        const [updatedTask] = await db.update(productionTasks)
            .set({ 
                completedQuantity, 
                updatedAt: new Date(),
                status: newStatus
            })
            .where(eq(productionTasks.id, taskId))
            .returning();

        await db.insert(productionLogs).values({
            taskId,
            event: "progress_updated",
            performedBy: session.id,
            details: { completedQuantity },
        });

        await logAction("Обновлён прогресс задачи", "production_task", taskId, { completedQuantity });

        revalidatePath(`/dashboard/production/tasks/${taskId}`);
        return { success: true, data: updatedTask as ProductionTask };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "updateProductionTaskProgress", details: { taskId, completedQuantity } });
        return { success: false, error: "Не удалось обновить прогресс" };
    }
}

export const updateTaskProgress = updateProductionTaskProgress;

export async function updateProductionTaskAssignee(taskId: string, assigneeId: string | null) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.update(productionTasks)
            .set({ assigneeId, updatedAt: new Date() })
            .where(eq(productionTasks.id, taskId));

        await db.insert(productionLogs).values({
            taskId,
            event: "assignee_updated",
            performedBy: session.id,
            details: { assigneeId },
        });

        await logAction("Обновлён исполнитель задачи", "production_task", taskId, { assigneeId });

        revalidatePath(`/dashboard/production/tasks/${taskId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "updateProductionTaskAssignee", details: { taskId } });
        return { success: false, error: "Не удалось обновить исполнителя" };
    }
}

export const assignTask = updateProductionTaskAssignee;
export const updateTaskAssignee = updateProductionTaskAssignee;

export async function deleteProductionTask(id: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        // RBAC: Только Администратор или Руководство могут удалять задачи
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "Недостаточно прав для удаления задачи" };
        }

        await db.delete(productionTasks).where(eq(productionTasks.id, id));
        await logAction("Удалена производственная задача", "production_task", id);
        revalidatePath("/dashboard/production/tasks");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/production/actions/task-actions", method: "deleteProductionTask", details: { id } });
        return { success: false, error: "Не удалось удалить задачу" };
    }
}
