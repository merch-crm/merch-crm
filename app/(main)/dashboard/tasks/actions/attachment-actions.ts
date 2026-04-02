"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskAttachments } from "@/lib/schema/task-attachments";
import { taskHistory } from "@/lib/schema/task-history";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { Task, TaskActionResult } from "@/lib/types/tasks";
import { getTask } from "./task-actions";
import { addAttachmentSchema, removeAttachmentSchema } from "../validation";

/**
 * Добавление вложения к задаче
 */
export async function addAttachment(
  taskId: string,
  data: {
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize?: number;
    contentType?: string;
  }
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    addAttachmentSchema.parse({ taskId, ...data });;
    }

    await db.transaction(async (tx) => {
      await tx.insert(taskAttachments).values({
        taskId,
        fileName: data.fileName,
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        contentType: data.contentType,
        createdBy: session.id,
      });

      await tx.insert(taskHistory).values({
        taskId,
        userId: session.id,
        type: "attachment_added",
        newValue: data.fileName,
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(taskId);
  } catch (error) {
    logError({ error, method: "addAttachment" });
    return { success: false, error: "Ошибка при загрузке файла" };
  }
}

/**
 * Удаление вложения
 */
export async function deleteAttachment(
  attachmentId: string
): Promise<TaskActionResult<Task>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    removeAttachmentSchema.parse({ attachmentId });;
    }

    const [attachment] = await db
      .select()
      .from(taskAttachments)
      .where(eq(taskAttachments.id, attachmentId))
      .limit(1);

    if (!attachment) {
      return { success: false, error: "Вложение не найдено" };
    }

    await db.transaction(async (tx) => {
      await tx.delete(taskAttachments).where(eq(taskAttachments.id, attachmentId));

      await tx.insert(taskHistory).values({
        taskId: attachment.taskId,
        userId: session.id,
        type: "attachment_removed",
        oldValue: attachment.fileName,
      });
    });

    revalidatePath("/dashboard/tasks");
    return getTask(attachment.taskId);
  } catch (error) {
    logError({ error, method: "deleteAttachment" });
    return { success: false, error: "Ошибка при удалении файла" };
  }
}
