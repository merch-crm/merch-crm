"use server";

import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import fs from "fs";
import { z } from "zod";
import { ActionResult, ok, okVoid, err } from "@/lib/types";

export async function getStorageDetails(prefix?: string): Promise<ActionResult<{
    s3: {
        size: number;
        fileCount: number;
        folders: string[];
        files: unknown[];
    };
    local: {
        total: number;
        free: number;
        used: number;
        path: string;
    };
}>> {
    return withAuth(async () => {
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

        return ok({
            s3: {
                ...s3Stats,
                folders: s3Content.folders,
                files: s3Content.files
            },
            local: localStats
        });
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getStorageDetails" });
}

export async function deleteS3FileAction(key: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { key: validKey } = z.object({ key: z.string().min(1, "Ключ обязателен") }).parse({ key });

        const { deleteFile } = await import("@/lib/storage");
        const res = await deleteFile(validKey);
        if (res.success) {
            await logAction("Удален файл S3", "s3_storage", "system", { key });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка удаления");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteS3FileAction" });
}

export async function createS3FolderAction(path: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { path: validPath } = z.object({ path: z.string().min(1, "Путь обязателен") }).parse({ path });

        const { createFolder } = await import("@/lib/storage");
        const res = await createFolder(validPath);
        if (res.success) {
            await logAction("Создана папка S3", "s3_storage", "system", { path });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка создания папки");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createS3FolderAction" });
}

export async function getLocalStorageDetails(prefix?: string): Promise<ActionResult<{
    stats: { size: number; fileCount: number; folderCount: number };
    folders: string[];
    files: unknown[];
}>> {
    return withAuth(async () => {
        const { listLocalFiles, getLocalStorageStats } = await import("@/lib/local-storage");
        const stats = await getLocalStorageStats();
        const content = await listLocalFiles(prefix || "");

        return ok({
            stats,
            folders: content.folders,
            files: content.files
        });
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getLocalStorageDetails" });
}

export async function createLocalFolderAction(folderPath: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { folderPath: validPath } = z.object({ folderPath: z.string().min(1, "Путь обязателен") }).parse({ folderPath });

        const { createLocalFolder } = await import("@/lib/local-storage");
        const res = await createLocalFolder(validPath);
        if (res.success) {
            await logAction("Создана локальная папка", "local_storage", "system", { path: folderPath });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка создания папки");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createLocalFolderAction" });
}

export async function deleteLocalFileAction(filePath: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { filePath: validPath } = z.object({ filePath: z.string().min(1, "Путь обязателен") }).parse({ filePath });

        const { deleteLocalFile } = await import("@/lib/local-storage");
        const res = await deleteLocalFile(validPath);
        if (res.success) {
            await logAction("Удален локальный файл", "local_storage", "system", { path: filePath });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка удаления");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteLocalFileAction" });
}

export async function renameS3FileAction(oldKey: string, newKey: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { oldKey: validOld, newKey: validNew } = z.object({ oldKey: z.string().min(1), newKey: z.string().min(1) }).parse({ oldKey, newKey });

        const { renameFile } = await import("@/lib/storage");
        const res = await renameFile(validOld, validNew);
        if (res.success) {
            await logAction("Переименован файл S3", "s3_storage", "system", { oldKey, newKey });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка переименования");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "renameS3FileAction" });
}

export async function deleteMultipleS3FilesAction(keys: string[]): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { keys: validKeys } = z.object({ keys: z.array(z.string().min(1)).min(1, "Необходим хотя бы один ключ") }).parse({ keys });

        const { deleteMultipleFiles } = await import("@/lib/storage");
        const res = await deleteMultipleFiles(validKeys);
        if (res.success) {
            await logAction("Удалено несколько файлов S3", "s3_storage", "system", { count: keys.length });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка удаления");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteMultipleS3FilesAction" });
}

export async function renameLocalFileAction(oldPath: string, newPath: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { oldPath: validOld, newPath: validNew } = z.object({ oldPath: z.string().min(1), newPath: z.string().min(1) }).parse({ oldPath, newPath });

        const { renameLocalFile } = await import("@/lib/local-storage");
        const res = await renameLocalFile(validOld, validNew);
        if (res.success) {
            await logAction("Переименован локальный файл", "local_storage", "system", { oldPath, newPath });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(typeof res.error === "string" ? res.error : "Ошибка переименования");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "renameLocalFileAction" });
}

export async function deleteMultipleLocalFilesAction(filePaths: string[]): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const { filePaths: validPaths } = z.object({ filePaths: z.array(z.string().min(1)).min(1, "Необходим хотя бы один путь") }).parse({ filePaths });

        const { deleteMultipleLocalFiles } = await import("@/lib/local-storage");
        const res = await deleteMultipleLocalFiles(validPaths);
        if (res.success) {
            await logAction("Удалено несколько локальных файлов", "local_storage", "system", { count: filePaths.length });
            revalidatePath("/admin-panel/storage");
            return okVoid();
        }
        return err(res.errors?.join(", ") || "Ошибка удаления");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteMultipleLocalFilesAction" });
}

export async function getS3FileUrlAction(key: string): Promise<ActionResult<string>> {
    return withAuth(async () => {
        const { getFileUrl } = await import("@/lib/storage");
        const url = await getFileUrl(key);
        return ok(url);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getS3FileUrlAction" });
}
