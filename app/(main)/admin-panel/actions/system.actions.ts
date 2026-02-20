"use server";

import { db } from "@/lib/db";
import { systemSettings, auditLogs } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { performDatabaseBackup } from "@/lib/backup";
import os from "os";
import fs from "fs";
import path from "path";
import { z } from "zod";

const SYSTEM_ENTITY_ID = "00000000-0000-0000-0000-000000000000";

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
    ]);
};

export interface BackupFile {
    name: string;
    size: number;
    createdAt: string;
}

export async function getSystemStats() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        // Server stats
        const cpuLoad = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const uptime = os.uptime();

        // Database stats
        const dbResult = await db.execute(sql`SELECT pg_database_size(current_database()) as size`);
        const dbSize = Number(dbResult.rows[0]?.size || 0);

        // Get table counts
        const tableCounts: Record<string, number> = {};
        const tables = ["users", "roles", "departments", "clients", "orders", "audit_logs", "inventory_items", "tasks"];

        await Promise.all(tables.map(async (table) => {
            const countResult = await db.execute(sql.raw(`SELECT count(*)::int as count FROM ${table}`));
            tableCounts[table] = Number(countResult.rows[0]?.count || 0);
        }));

        // Storage stats
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        let storageSize = 0;
        let fileCount = 0;

        if (fs.existsSync(uploadDir)) {
            const getDirStats = (dir: string) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        getDirStats(filePath);
                    } else {
                        storageSize += stats.size;
                        fileCount++;
                    }
                });
            };
            getDirStats(uploadDir);
        }

        return {
            success: true,
            data: {
                server: {
                    cpuLoad,
                    totalMem,
                    freeMem,
                    uptime,
                    platform: os.platform(),
                    arch: os.arch()
                },
                database: {
                    size: dbSize,
                    tableCounts
                },
                storage: {
                    size: storageSize,
                    fileCount
                }
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/stats",
            method: "getSystemStats"
        });
        return { success: false, error: "Не удалось получить системные показатели" };
    }
}

export async function checkSystemHealth() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const startDb = Date.now();
        await withTimeout(db.execute(sql`SELECT 1`), 5000);
        const dbLatency = Date.now() - startDb;

        // Check file system
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const fsOk = fs.existsSync(uploadDir);

        return {
            success: true,
            data: {
                database: { status: "ok", latency: dbLatency },
                storage: { status: fsOk ? "ok" : "error" },
                api: { status: "ok" },
                timestamp: new Date()
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/health",
            method: "checkSystemHealth"
        });
        return { success: false, error: "Ошибка при выполнении диагностики" };
    }
}

export async function createDatabaseBackup() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const result = await performDatabaseBackup(session.id, "manual");
        return result;
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backup",
            method: "createDatabaseBackup"
        });
        return { success: false, error: "Не удалось создать резервную копию" };
    }
}

export async function getBackupsList() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) return { success: true, data: [] };

        const files = await fs.promises.readdir(backupDir);
        const backupPromises = files
            .filter((f: string) => f.endsWith(".json"))
            .map(async (f: string) => {
                const stats = await fs.promises.stat(path.join(backupDir, f));
                return {
                    name: f,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString()
                };
            });

        const backups = await Promise.all(backupPromises);
        return {
            success: true,
            data: backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backups",
            method: "getBackupsList"
        });
        return { success: false, error: "Не удалось получить список копий" };
    }
}

export async function deleteBackupAction(fileName: string) {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);
        const { fileName: validName } = z.object({ fileName: z.string().min(1, "Имя файла обязательно") }).parse({ fileName });

        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        const filePath = path.join(backupDir, validName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            await logAction(`Удалена резервная копия: ${fileName}`, "system", currentUser.id);
            return { success: true };
        }
        return { success: false, error: "Файл не найден" };
    } catch (error) {
        await logError({
            error,
            path: "/admin-panel/system/backup/delete",
            method: "deleteBackupAction",
            details: { fileName }
        });
        return { success: false, error: "Ошибка при удалении" };
    }
}

export async function getSystemSettings() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const settings = await db.select().from(systemSettings).limit(100);
        const settingsMap: Record<string, unknown> = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        return { success: true, data: settingsMap };
    } catch {
        return { success: false, error: "Не удалось загрузить настройки" };
    }
}

export async function updateSystemSetting(key: string, value: unknown) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const { key: validKey, value: validValue } = z.object({
            key: z.string().min(1, "Ключ настройки обязателен"),
            value: z.unknown()
        }).parse({ key, value });

        await db.insert(systemSettings).values({ // audit-ignore: одиночный upsert, транзакция не требуется
            key: validKey,
            value: validValue,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: validValue, updatedAt: new Date() }
        });

        revalidatePath("/admin-panel/settings");
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось обновить настройку" };
    }
}

export async function clearRamAction() {
    const session = await getSession();
    try {
        await requireAdmin(session);
        if (global.gc) {
            global.gc();
            return { success: true, message: "Сборщик мусора запущен успешно" };
        } else {
            return {
                success: false,
                error: "Сборщик мусора недоступен. Запустите Node.js с флагом --expose-gc"
            };
        }
    } catch {
        return { success: false, error: "Ошибка при очистке памяти" };
    }
}

export async function restartServerAction() {
    const session = await getSession();
    try {
        const currentUser = await requireAdmin(session);

        await db.insert(auditLogs).values({ // audit-ignore: одиночная запись в лог перед перезапуском
            userId: currentUser.id,
            action: "SERVER_RESTART",
            entityType: "SYSTEM",
            entityId: SYSTEM_ENTITY_ID,
            details: { info: "Перезапуск сервера через панель управления" },
            createdAt: new Date()
        });

        setTimeout(() => {
            process.exit(0);
        }, 1000);

        return { success: true, message: "Перезапуск инициирован" };
    } catch {
        return { success: false, error: "Ошибка при инициализации перезапуска" };
    }
}
