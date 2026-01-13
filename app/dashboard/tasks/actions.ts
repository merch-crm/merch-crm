"use server";

import { db } from "@/lib/db";
import { tasks, users, roles } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTasks() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const allTasks = await db.query.tasks.findMany({
            with: {
                assignedToUser: true,
                assignedToRole: true,
                creator: true,
                attachments: true,
            },
            orderBy: [desc(tasks.createdAt)],
        });
        return { data: allTasks };
    } catch (error) {
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
    const assignedToUserId = formData.get("assignedToUserId") as string;
    const assignedToRoleId = formData.get("assignedToRoleId") as string;
    const dueDateStr = formData.get("dueDate") as string;

    if (!title) return { error: "Заголовок обязателен" };

    try {
        const result = await db.insert(tasks).values({
            title,
            description,
            priority,
            assignedToUserId: assignedToUserId || null,
            assignedToRoleId: assignedToRoleId || null,
            createdBy: session.id,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            status: "new",
        }).returning();

        revalidatePath("/dashboard/tasks");
        return { data: result[0], success: true };
    } catch (error) {
        console.error("Error creating task:", error);
        return { error: "Failed to create task" };
    }
}

export async function updateTask(taskId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as (typeof tasks.$inferInsert)["priority"];
    const status = formData.get("status") as (typeof tasks.$inferInsert)["status"];
    const assignedToUserId = formData.get("assignedToUserId") as string;
    const assignedToRoleId = formData.get("assignedToRoleId") as string;
    const dueDateStr = formData.get("dueDate") as string;

    try {
        await db.update(tasks)
            .set({
                title,
                description,
                priority,
                status,
                assignedToUserId: assignedToUserId || null,
                assignedToRoleId: assignedToRoleId || null,
                dueDate: dueDateStr ? new Date(dueDateStr) : null,
            })
            .where(eq(tasks.id, taskId));

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
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

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error uploading task file:", error);
        return { error: "Failed to upload file" };
    }
}
