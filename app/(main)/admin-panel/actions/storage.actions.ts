"use server";

import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { revalidatePath } from "next/cache";
import fs from "fs";
import { z } from "zod";

export async function getStorageDetails(prefix?: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { listFiles, getStorageStats } = await import("@/lib/storage");
        const s3Stats = await getStorageStats();
        const s3Content = await listFiles(prefix);

        const stat = fs.statfsSync(process.cwd());
        const localStats = {
            total: Number(stat.bsize * stat.blocks),
            free: Number(stat.bsize * stat.bfree),
            used: Number(stat.bsize * (stat.blocks - stat.bfree)),
            path: process.cwd(),
        };

        return {
            success: true,
            data: {
                s3: {
                    ...s3Stats,
                    folders: s3Content.folders,
                    files: s3Content.files
                },
                local: localStats
            }
        };
    } catch (error) {
        await logError({ error, path: "/admin-panel/storage/details", method: "getStorageDetails" });
        return { success: false, error: "Ошибка при получении данных хранилища" };
    }
}

export async function deleteS3FileAction(key: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { key: validKey } = z.object({ key: z.string().min(1, "Ключ обязателен") }).parse({ key });

        const { deleteFile } = await import("@/lib/storage");
        const res = await deleteFile(validKey);
        if (res.success) {
            await logAction("Удален файл S3", "s3_storage", "system", { key });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при удалении файла" };
    }
}

export async function createS3FolderAction(path: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { path: validPath } = z.object({ path: z.string().min(1, "Путь обязателен") }).parse({ path });

        const { createFolder } = await import("@/lib/storage");
        const res = await createFolder(validPath);
        if (res.success) {
            await logAction("Создана папка S3", "s3_storage", "system", { path });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при создании папки" };
    }
}

export async function getLocalStorageDetails(prefix?: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { listLocalFiles, getLocalStorageStats } = await import("@/lib/local-storage");
        const stats = await getLocalStorageStats();
        const content = await listLocalFiles(prefix || "");

        return {
            success: true,
            data: {
                stats,
                folders: content.folders,
                files: content.files
            }
        };
    } catch {
        return { success: false, error: "Ошибка при получении данных локального хранилища" };
    }
}

export async function createLocalFolderAction(folderPath: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { folderPath: validPath } = z.object({ folderPath: z.string().min(1, "Путь обязателен") }).parse({ folderPath });

        const { createLocalFolder } = await import("@/lib/local-storage");
        const res = await createLocalFolder(validPath);
        if (res.success) {
            await logAction("Создана локальная папка", "local_storage", "system", { path: folderPath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при создании папки" };
    }
}

export async function deleteLocalFileAction(filePath: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { filePath: validPath } = z.object({ filePath: z.string().min(1, "Путь обязателен") }).parse({ filePath });

        const { deleteLocalFile } = await import("@/lib/local-storage");
        const res = await deleteLocalFile(validPath);
        if (res.success) {
            await logAction("Удален локальный файл", "local_storage", "system", { path: filePath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при удалении файла" };
    }
}

export async function renameS3FileAction(oldKey: string, newKey: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { oldKey: validOld, newKey: validNew } = z.object({ oldKey: z.string().min(1), newKey: z.string().min(1) }).parse({ oldKey, newKey });

        const { renameFile } = await import("@/lib/storage");
        const res = await renameFile(validOld, validNew);
        if (res.success) {
            await logAction("Переименован файл S3", "s3_storage", "system", { oldKey, newKey });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при переименовании" };
    }
}

export async function deleteMultipleS3FilesAction(keys: string[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { keys: validKeys } = z.object({ keys: z.array(z.string().min(1)).min(1, "Необходим хотя бы один ключ") }).parse({ keys });

        const { deleteMultipleFiles } = await import("@/lib/storage");
        const res = await deleteMultipleFiles(validKeys);
        if (res.success) {
            await logAction("Удалено несколько файлов S3", "s3_storage", "system", { count: keys.length });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при удалении файлов" };
    }
}

export async function renameLocalFileAction(oldPath: string, newPath: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { oldPath: validOld, newPath: validNew } = z.object({ oldPath: z.string().min(1), newPath: z.string().min(1) }).parse({ oldPath, newPath });

        const { renameLocalFile } = await import("@/lib/local-storage");
        const res = await renameLocalFile(validOld, validNew);
        if (res.success) {
            await logAction("Переименован локальный файл", "local_storage", "system", { oldPath, newPath });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при переименовании" };
    }
}

export async function deleteMultipleLocalFilesAction(filePaths: string[]) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { filePaths: validPaths } = z.object({ filePaths: z.array(z.string().min(1)).min(1, "Необходим хотя бы один путь") }).parse({ filePaths });

        const { deleteMultipleLocalFiles } = await import("@/lib/local-storage");
        const res = await deleteMultipleLocalFiles(validPaths);
        if (res.success) {
            await logAction("Удалено несколько локальных файлов", "local_storage", "system", { count: filePaths.length });
            revalidatePath("/admin-panel/storage");
        }
        return res;
    } catch {
        return { success: false, error: "Ошибка при удалении файлов" };
    }
}

export async function getS3FileUrlAction(key: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);
        const { getFileUrl } = await import("@/lib/storage");
        const url = await getFileUrl(key);
        return { success: true, data: url };
    } catch {
        return { success: false, error: "Ошибка при получении ссылки на файл" };
    }
}
