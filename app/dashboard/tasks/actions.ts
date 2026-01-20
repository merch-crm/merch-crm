"use server";

import { db } from "@/lib/db";
import { tasks, taskAttachments, taskComments, taskChecklists, taskHistory } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";


import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";

async function logTaskActivity(taskId: string, userId: string, type: string, oldValue?: string | null, newValue?: string | null) {
    try {
        await db.insert(taskHistory).values({
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

export async function getTasks() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

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
        });
        return { data: allTasks };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "getTasks"
        });
        console.error("Error fetching tasks:", error);
        return { error: "Failed to fetch tasks" };
    }
}

export async function createTask(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = (formData.get("priority") as (typeof tasks.$inferInsert)["priority"]) || "normal";
    const type = (formData.get("type") as (typeof tasks.$inferInsert)["type"]) || "other";
    const orderId = formData.get("orderId") as string;
    const assignedToUserId = formData.get("assignedToUserId") as string;
    const assignedToRoleId = formData.get("assignedToRoleId") as string;
    const assignedToDepartmentId = formData.get("assignedToDepartmentId") as string;
    const dueDateStr = formData.get("dueDate") as string;

    if (!title) return { error: "Заголовок обязателен" };

    try {
        const result = await db.insert(tasks).values({
            title,
            description,
            priority,
            type,
            orderId: orderId || null,
            assignedToUserId: assignedToUserId || null,
            assignedToRoleId: assignedToRoleId || null,
            assignedToDepartmentId: assignedToDepartmentId || null,
            createdBy: session.id,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            status: "new",
        }).returning();

        revalidatePath("/dashboard/tasks");
        return { data: result[0], success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/tasks",
            method: "createTask",
            details: { title, priority }
        });
        console.error("Error creating task:", error);
        return { error: "Failed to create task" };
    }
}

export async function updateTask(taskId: string, data: Partial<typeof tasks.$inferInsert>) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const oldTask = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId)
        });

        const result = await db.update(tasks)
            .set(data)
            .where(eq(tasks.id, taskId))
            .returning();

        if (data.status && oldTask && oldTask.status !== data.status) {
            await logTaskActivity(taskId, session.id, "status_change", oldTask.status, data.status);
        }

        revalidatePath("/dashboard/tasks");
        return { data: result[0], success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        await logError({ error, path: "/dashboard/tasks", method: "updateTask", details: { taskId, data } });
        return { error: "Failed to update task" };
    }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const newStatus = currentStatus === "done" ? "new" : "done";

    try {
        await db.update(tasks)
            .set({ status: newStatus as (typeof tasks.$inferInsert)["status"] })
            .where(eq(tasks.id, taskId));

        await logTaskActivity(taskId, session.id, "status_toggle", currentStatus, newStatus);

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error toggling task status:", error);
        return { error: "Failed to update status" };
    }
}

export async function deleteTask(taskId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.delete(tasks).where(eq(tasks.id, taskId));
        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/tasks/${taskId}`,
            method: "deleteTask",
            details: { taskId }
        });
        console.error("Error deleting task:", error);
        return { error: "Failed to delete task" };
    }
}

export async function uploadTaskFile(taskId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { uploadFile } = await import("@/lib/s3");
        const { key, url } = await uploadFile(buffer, file.name, file.type);

        const { taskAttachments } = await import("@/lib/schema");
        await db.insert(taskAttachments).values({
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
            taskId
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
        return { error: "Failed to upload file" };
    }
}

export async function addTaskComment(taskId: string, content: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const { taskComments } = await import("@/lib/schema");
        await db.insert(taskComments).values({
            taskId,
            userId: session.id,
            content,
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error adding task comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function addTaskChecklistItem(taskId: string, content: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.insert(taskChecklists).values({
            taskId,
            content,
            isCompleted: false,
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error adding checklist item:", error);
        return { error: "Failed to add item" };
    }
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.update(taskChecklists)
            .set({ isCompleted })
            .where(eq(taskChecklists.id, itemId));

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error toggling checklist item:", error);
        return { error: "Failed to update item" };
    }
}

export async function deleteChecklistItem(itemId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const { taskChecklists } = await import("@/lib/schema");
        await db.delete(taskChecklists).where(eq(taskChecklists.id, itemId));

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error deleting checklist item:", error);
        return { error: "Failed to delete item" };
    }
}
