"use server";

import { db } from "@/lib/db";
import { editorExports } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";

const SaveExportSchema = z.object({
    projectId: z.string().uuid(),
    filename: z.string().min(1),
    format: z.string(),
    width: z.number().positive(),
    height: z.number().positive(),
    blob: z.instanceof(Blob),
    hasWatermark: z.boolean().optional(),
    quality: z.number().min(0).max(100).optional(),
});

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

type EditorExport = typeof editorExports.$inferSelect;

// Сохранить экспорт
export async function saveEditorExport(rawData: z.infer<typeof SaveExportSchema>): Promise<ActionResult<EditorExport>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validatedProps = SaveExportSchema.safeParse(rawData);
        if (!validatedProps.success) {
            return { success: false, error: "Неверные данные: " + validatedProps.error.message };
        }
        const data = validatedProps.data;

        // Создаём директорию
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const dir = join(process.cwd(), "public", "uploads", "exports", String(year), month);
        await mkdir(dir, { recursive: true });

        // Сохраняем файл
        const buffer = Buffer.from(await data.blob.arrayBuffer());
        const uniqueFilename = `${Date.now()}_${data.filename}`;
        const filePath = join(dir, uniqueFilename);
        await writeFile(filePath, buffer);

        const publicPath = `/uploads/exports/${year}/${month}/${uniqueFilename}`;

        // Сохраняем в БД
        const results = await db
            .insert(editorExports)
            .values({
                projectId: data.projectId,
                filename: data.filename,
                format: data.format,
                width: data.width,
                height: data.height,
                size: buffer.length,
                path: publicPath,
                hasWatermark: data.hasWatermark || false,
                quality: data.quality,
                createdBy: session.id,
            })
            .returning();

        const result = results[0] as EditorExport;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error saving export:", error);
        return { success: false, error: "Не удалось сохранить экспорт" };
    }
}

// Получить экспорты проекта
export async function getProjectExports(projectId: string): Promise<ActionResult<EditorExport[]>> {
    const validatedId = z.string().uuid().safeParse(projectId);
    if (!validatedId.success) return { success: false, error: "Неверный ID проекта" };

    try {
        const result = await db.query.editorExports.findMany({
            where: eq(editorExports.projectId, validatedId.data),
            orderBy: [desc(editorExports.createdAt)],
            limit: 100,
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching exports:", error);
        return { success: false, error: "Не удалось загрузить экспорты" };
    }
}
