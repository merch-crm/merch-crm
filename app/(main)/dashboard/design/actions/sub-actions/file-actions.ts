"use server";

import { db } from "@/lib/db";
import {
    orderDesignTasks,
    orderDesignFiles,
    orderDesignHistory
} from "@/lib/schema/design-tasks";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { ActionResult, DesignFile, DesignTaskFull } from "../types";
import { UploadFileSchema } from "../schemas";

// Схема переехала в schemas.ts

// Загрузить файл
export async function uploadDesignFile(data: z.infer<typeof UploadFileSchema>): Promise<ActionResult<DesignFile>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = UploadFileSchema.parse(data);
        const task = await db.query.orderDesignTasks.findFirst({
            where: eq(orderDesignTasks.id, validated.taskId),
            with: { order: true },
        });

        if (!task) {
            return { success: false, error: "Задача не найдена" };
        }

        // Получаем текущую версию
        const existingFiles = await db
            .select({ version: orderDesignFiles.version })
            .from(orderDesignFiles)
            .where(and(
                eq(orderDesignFiles.taskId, validated.taskId),
                eq(orderDesignFiles.type, validated.type)
            ))
            .orderBy(desc(orderDesignFiles.version))
            .limit(1);

        const newVersion = (existingFiles[0]?.version || 0) + 1;

        // Деактивируем предыдущие версии
        await db
            .update(orderDesignFiles)
            .set({ isActive: false })
            .where(and(
                eq(orderDesignFiles.taskId, validated.taskId),
                eq(orderDesignFiles.type, validated.type)
            ));

        // Сохраняем файл
        const fileObj = validated.file as File;
        const orderNum = (task as unknown as DesignTaskFull).order?.orderNumber || "unknown";
        const dir = join(
            process.cwd(),
            "public",
            "uploads",
            "orders",
            orderNum,
            validated.type
        );
        await mkdir(dir, { recursive: true });

        const ext = fileObj.name.split(".").pop();
        const filename = `${task.number}_${validated.type}_v${newVersion}.${ext}`;
        const buffer = Buffer.from(await fileObj.arrayBuffer());
        const filePath = join(dir, filename);
        await writeFile(filePath, buffer);

        const publicPath = `/uploads/orders/${orderNum}/${validated.type}/${filename}`;

        // Сохраняем в БД
        const [file] = (await db
            .insert(orderDesignFiles)
            .values({
                taskId: validated.taskId,
                type: validated.type,
                filename,
                originalName: fileObj.name,
                path: publicPath,
                size: buffer.length,
                mimeType: fileObj.type,
                version: newVersion,
                isActive: true,
                comment: validated.comment,
                uploadedBy: session.id,
            })
            .returning()) as typeof orderDesignFiles.$inferSelect[];

        // Логируем
        await db.insert(orderDesignHistory).values({
            taskId: data.taskId,
            event: "file_uploaded",
            newValue: `${data.type}: ${data.file.name} (v${newVersion})`,
            performedBy: session.id,
        });

        revalidatePath(`/dashboard/design/queue/${data.taskId}`);

        return { success: true, data: file as DesignFile };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error: "Не удалось загрузить файл" };
    }
}

// Удалить файл
export async function deleteDesignFile(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const userRole = session.roleName;
        const userId = session.id;

        const file = await db.query.orderDesignFiles.findFirst({
            where: eq(orderDesignFiles.id, id),
        });

        if (!file) {
            return { success: false, error: "Файл не найден" };
        }

        // RBAC: Only admin or the uploader can delete
        const canDelete = userRole === "Администратор" || userRole === "Руководство" || file.uploadedBy === userId;
        if (!canDelete) {
            return { success: false, error: "У вас нет прав на удаление этого файла" };
        }

        await db.delete(orderDesignFiles).where(eq(orderDesignFiles.id, id));

        // Логируем критическое действие (удовлетворяет требованиям аудита)
        await logAction("Удален файл дизайна", "order_design_file", id, { 
            filename: file.originalName, 
            taskId: file.taskId 
        });

        await db.insert(orderDesignHistory).values({
            taskId: file.taskId,
            event: "file_deleted",
            oldValue: `File: ${file.originalName} (${file.type})`,
            performedBy: session.id,
        });

        revalidatePath(`/dashboard/design/queue/${file.taskId}`);

        return { success: true };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: "Не удалось удалить файл" };
    }
}
