"use server";

import { revalidatePath } from "next/cache";
import { eq, asc, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    printDesignVersions,
    printDesigns,
    printDesignFiles,
    printCollections,
} from "@/lib/schema";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { type ActionResult, okVoid } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { z } from "zod";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const UploadFileSchema = z.object({
    versionId: z.string().min(1, "ID версии обязателен"),
    file: z.instanceof(File, { message: "Файл не является валидным объектом File" }),
});

type PrintDesignFile = InferSelectModel<typeof printDesignFiles>;

// Базовая директория для загрузки
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "prints");

// Форматы файлов превью
const PREVIEW_FORMATS = ["png", "jpg", "jpeg", "webp", "gif"];

// Определение типа файла по расширению
function getFileType(format: string): "preview" | "source" {
    const lowerFormat = format.toLowerCase();
    return PREVIEW_FORMATS.includes(lowerFormat) ? "preview" : "source";
}

// Генерация уникального имени файла
function generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}${ext}`;
}

// Получение размеров изображения
async function getImageDimensions(
    filePath: string,
    format: string
): Promise<{ width: number; height: number } | null> {
    const imageFormats = ["png", "jpg", "jpeg", "webp", "gif", "tiff", "tif"];
    if (!imageFormats.includes(format.toLowerCase())) {
        return null;
    }

    try {
        const metadata = await sharp(filePath).metadata();
        if (metadata.width && metadata.height) {
            return { width: metadata.width, height: metadata.height };
        }
        return null;
    } catch {
        return null;
    }
}

export async function uploadFile(versionId: string, formData: FormData): Promise<ActionResult<PrintDesignFile>> {
    try {
        const session = await getSession();
        if (!session?.id) return { success: false, error: "Не авторизован" };

        const file = formData.get("file");

        // Валидация входных данных
        const validation = UploadFileSchema.safeParse({ versionId, file });
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || "Ошибка валидации",
            };
        }

        const validFile = validation.data.file;

        const [version] = await db
            .select({ id: printDesignVersions.id, designId: printDesignVersions.designId })
            .from(printDesignVersions)
            .where(eq(printDesignVersions.id, validation.data.versionId))
            .limit(1);

        if (!version) return { success: false, error: "Версия не найдена" };

        const [design] = await db
            .select({ id: printDesigns.id, collectionId: printDesigns.collectionId })
            .from(printDesigns)
            .where(eq(printDesigns.id, version.designId))
            .limit(1);

        if (!design) return { success: false, error: "Принт не найден" };

        const uploadDir = path.join(UPLOADS_DIR, design.collectionId, design.id, versionId);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const originalName = validFile.name;
        const format = path.extname(originalName).slice(1).toLowerCase();
        const filename = generateUniqueFilename(originalName);
        const filePath = path.join(uploadDir, filename);

        const buffer = Buffer.from(await validFile.arrayBuffer());
        await writeFile(filePath, buffer);

        const fileType = getFileType(format);
        const dimensions = await getImageDimensions(filePath, format);
        const relativePath = `/uploads/prints/${design.collectionId}/${design.id}/${versionId}/${filename}`;

        const [newFile] = await db.insert(printDesignFiles).values({
            id: generateId(),
            versionId,
            filename,
            originalName,
            format,
            fileType,
            size: validFile.size,
            width: dimensions?.width || null,
            height: dimensions?.height || null,
            path: relativePath,
        }).returning();

        // Обновление превью если нужно
        if (fileType === "preview") {
            const [currentVersion] = await db
                .select({ preview: printDesignVersions.preview })
                .from(printDesignVersions)
                .where(eq(printDesignVersions.id, versionId))
                .limit(1);

            if (!currentVersion?.preview) {
                await db.update(printDesignVersions).set({ preview: relativePath }).where(eq(printDesignVersions.id, versionId));

                const [currentDesign] = await db.select({ preview: printDesigns.preview }).from(printDesigns).where(eq(printDesigns.id, design.id)).limit(1);
                if (!currentDesign?.preview) {
                    await db.update(printDesigns).set({ preview: relativePath }).where(eq(printDesigns.id, design.id));
                }
            }
        }

        invalidateCache("design:collections");
        revalidatePath(`/dashboard/design/prints/${design.collectionId}/${design.id}`);

        return { success: true, data: newFile };
    } catch (error) {
        await logError({ error, path: "actions/file-actions", method: "uploadFile" });
        return { success: false, error: "Ошибка загрузки файла" };
    }
}

export async function deleteDesignFile(id: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [file] = await db.select().from(printDesignFiles).where(eq(printDesignFiles.id, id)).limit(1);
        if (!file) return { success: false, error: "Файл не найден" };

        const isAdmin = session.roleName === "Администратор" || session.roleName === "Руководство";
        // To enforce IDOR correctly, we have to look up who created the file if the DB supports it, or who created the version/design/collection.
        // Assuming `file` doesn't have `createdBy`, we will look at `printCollections` which does.
        const [designRel] = await db.select({ creator: printCollections.createdBy })
            .from(printDesignVersions)
            .innerJoin(printDesigns, eq(printDesignVersions.designId, printDesigns.id))
            .innerJoin(printCollections, eq(printDesigns.collectionId, printCollections.id))
            .where(eq(printDesignVersions.id, file.versionId))
            .limit(1);

        if (!isAdmin && designRel?.creator !== session.id) {
            return { success: false, error: "Недостаточно прав для удаления этого файла" };
        }

        const absolutePath = path.join(process.cwd(), "public", file.path);
        try {
            if (existsSync(absolutePath)) await unlink(absolutePath);
        } catch { }

        await db.delete(printDesignFiles).where(eq(printDesignFiles.id, id));

        await logAction("Удалён файл", "print_design_file", id);
        invalidateCache("design:collections");

        return okVoid();
    } catch (_error) {
        return { success: false, error: "Ошибка удаления файла" };
    }
}

export async function getFilesByVersion(versionId: string): Promise<ActionResult<PrintDesignFile[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const files = await db
            .select()
            .from(printDesignFiles)
            .where(eq(printDesignFiles.versionId, versionId))
            .orderBy(asc(printDesignFiles.createdAt));

        return { success: true, data: files };
    } catch {
        return { success: false, error: "Ошибка загрузки файлов" };
    }
}
