"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
const { tasks, taskHistory } = schema;
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";


import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { CreateTaskSchema, UpdateTaskSchema, TaskIdSchema, TaskContentSchema, ChecklistItemSchema } from "./validation";



type Transaction = NodePgDatabase<typeof schema> | Parameters<Parameters<NodePgDatabase<typeof schema>['transaction']>[0]>[0];

async function logTaskActivity(taskId: string, userId: string, type: string, oldValue?: string | null, newValue?: string | null, tx?: Transaction) {
    try {
        const d = tx || db;
        await d.insert(taskHistory).values({
            taskId,
            userId,
            type,
            oldValue: oldValue || null,
            newValue: newValue || null,
        });
    } catch (error) {
        console.error("Error logging task activity:", error);
    }
}

import { ActionResult } from "@/lib/types";

export async function getTasks(): Promise<ActionResult<(typeof tasks.$inferSelect)[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const allTasks = await db.query.tasks.findMany({
            with: {
                assignedToUser: true,
                assignedToDepartment: true,
                assignedToRole: true,
                creator: true,
                attachments: true,
                checklists: {
                    orderBy: (checklists, { asc }) => [asc(checklists.sortOrder)]
                },
                comments: {
                    with: {
                        user: true
                    },
                    orderBy: (comments, { desc }) => [desc(comments.createdAt)]
                },
                history: {
                    with: {
                        user: true
                    },
                    orderBy: (history, { desc }) => [desc(history.createdAt)]
                },
                order: {
                    with: {
                        client: true
                    }
                }
            },
            orderBy: [desc(tasks.createdAt)],
            limit: 200 // Safety limit
        });
        return { success: true, data: allTasks };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "getTasks"
        });
        return { success: false, error: "Не удалось загрузить задачи" };
    }
}

export async function createTask(formData: FormData): Promise<ActionResult<typeof tasks.$inferSelect>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = CreateTaskSchema.safeParse(Object.fromEntries(formData));

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        title,
        description,
        priority,
        type,
        orderId,
        assignedToUserId,
        assignedToRoleId,
        assignedToDepartmentId,
        dueDate
    } = validation.data;

    try {
        const [result] = await db.transaction(async (tx) => {
            const [newTask] = await tx.insert(tasks).values({
                title,
                description,
                priority,
                type,
                orderId,
                assignedToUserId,
                assignedToRoleId,
                assignedToDepartmentId,
                createdBy: session.id,
                dueDate,
                status: "new",
            }).returning();

            await logTaskActivity(newTask.id, session.id, "created", null, null, tx);
            return [newTask];
        });

        revalidatePath("/dashboard/tasks");
        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "createTask",
            details: { title, priority }
        });
        return { success: false, error: "Не удалось создать задачу" };
    }
}

export async function updateTask(taskId: string, data: Partial<typeof tasks.$inferInsert>): Promise<ActionResult<typeof tasks.$inferSelect>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = TaskIdSchema.safeParse({ taskId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    const validatedData = UpdateTaskSchema.safeParse(data);
    if (!validatedData.success) return { success: false, error: validatedData.error.issues[0].message };

    try {
        const oldTask = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId)
        });

        const result = await db.transaction(async (tx) => {
            const [updatedTask] = await tx.update(tasks)
                .set({ ...validatedData.data, updatedAt: new Date() })
                .where(eq(tasks.id, taskId))
                .returning();

            if (validatedData.data.status && oldTask && oldTask.status !== validatedData.data.status) {
                await logTaskActivity(taskId, session.id, "status_change", oldTask.status, validatedData.data.status, tx);
            }
            return updatedTask;
        });

        revalidatePath("/dashboard/tasks");
        return { success: true, data: result };
    } catch (error) {
        await logError({ error, path: "/dashboard/tasks", method: "updateTask", details: { taskId, data } });
        return { success: false, error: "Не удалось обновить задачу" };
    }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = TaskIdSchema.safeParse({ taskId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    const newStatus = currentStatus === "done" ? "new" : "done";

    try {
        await db.transaction(async (tx) => {
            await tx.update(tasks)
                .set({ status: newStatus as (typeof tasks.$inferInsert)["status"], updatedAt: new Date() })
                .where(eq(tasks.id, taskId));

            await logTaskActivity(taskId, session.id, "status_toggle", currentStatus, newStatus, tx);
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "toggleTaskStatus",
            details: { taskId, currentStatus }
        });
        return { success: false, error: "Не удалось обновить статус задачи" };
    }
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = TaskIdSchema.safeParse({ taskId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    try {
        await db.transaction(async (tx) => {
            await tx.delete(tasks).where(eq(tasks.id, taskId));
            await logAction("Удалена задача", "task", taskId, undefined, tx);
        });
        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/tasks/${taskId}`,
            method: "deleteTask",
            details: { taskId }
        });
        return { success: false, error: "Не удалось удалить задачу" };
    }
}

export async function uploadTaskFile(taskId: string, formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Файл не предоставлен" };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { uploadFile } = await import("@/lib/s3");
        // Enable compression for task files
        const { key, url } = await uploadFile(buffer, file.name, file.type, { compress: true });

        const { taskAttachments } = await import("@/lib/schema");
        await db.transaction(async (tx) => {
            await tx.insert(taskAttachments).values({
                taskId,
                fileName: file.name,
                fileKey: key,
                fileUrl: url,
                fileSize: file.size,
                contentType: file.type,
                createdBy: session.id,
            });

            await logAction("Загружен файл задачи", "s3_storage", taskId, {
                fileName: file.name,
                fileKey: key,
                taskId,
                updatedAt: new Date()
            }, tx);
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/tasks/${taskId}`,
            method: "uploadTaskFile",
            details: { taskId, fileName: file.name }
        });
        console.error("Error uploading task file:", error);
        return { success: false, error: "Не удалось upload file" };
    }
}

export async function addTaskComment(taskId: string, content: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = TaskIdSchema.safeParse({ taskId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    const validatedContent = TaskContentSchema.safeParse({ content });
    if (!validatedContent.success) return { success: false, error: validatedContent.error.issues[0].message };

    try {
        const { taskComments } = await import("@/lib/schema");
        await db.transaction(async (tx) => {
            await tx.insert(taskComments).values({
                taskId,
                userId: session.id,
                content: validatedContent.data.content,
            });

            await logTaskActivity(taskId, session.id, "comment_added", null, "New comment", tx);
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "addTaskComment",
            details: { taskId }
        });
        return { success: false, error: "Не удалось добавить комментарий" };
    }
}

export async function addTaskChecklistItem(taskId: string, content: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = TaskIdSchema.safeParse({ taskId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    const validatedContent = TaskContentSchema.safeParse({ content });
    if (!validatedContent.success) return { success: false, error: validatedContent.error.issues[0].message };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.transaction(async (tx) => {
            await tx.insert(taskChecklists).values({
                taskId,
                content: validatedContent.data.content,
                isCompleted: false,
            });

            await logTaskActivity(taskId, session.id, "checklist_item_added", null, validatedContent.data.content, tx);
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "addTaskChecklistItem",
            details: { taskId }
        });
        return { success: false, error: "Не удалось добавить пункт чеклиста" };
    }
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = ChecklistItemSchema.safeParse({ itemId });
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.update(taskChecklists)
            .set({ isCompleted })
            .where(eq(taskChecklists.id, itemId));

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "toggleChecklistItem",
            details: { itemId, isCompleted }
        });
        return { success: false, error: "Не удалось обновить пункт чеклиста" };
    }
}

export async function deleteChecklistItem(itemId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = ChecklistItemSchema.safeParse({ itemId });
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.delete(taskChecklists).where(eq(taskChecklists.id, itemId));

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "deleteChecklistItem",
            details: { itemId }
        });
        return { success: false, error: "Не удалось удалить пункт чеклиста" };
    }
}
