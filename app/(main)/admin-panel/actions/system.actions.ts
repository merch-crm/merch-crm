"use server";

import { db } from "@/lib/db";
import { systemSettings, auditLogs } from "@/lib/schema";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { performDatabaseBackup } from "@/lib/backup";
import os from "os";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { ActionResult, ok, okVoid, err, ERRORS } from "@/lib/types";

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

export async function getSystemStats(): Promise<ActionResult<{
    server: {
        cpuLoad: number[];
        totalMem: number;
        freeMem: number;
        uptime: number;
        platform: string;
        arch: string;
    };
    database: {
        size: number;
        tableCounts: Record<string, number>;
    };
    storage: {
        size: number;
        fileCount: number;
    };
}>> {
    return withAuth(async () => {
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
            // White-list table names
            if (!/^[a-z_]+$/.test(table)) return;
            
            // Using sql.identifier() is the correct way in Drizzle for dynamic identifiers, 
            // but we ensure extra safety by confirming the table name against our hardcoded list.
            if (!tables.includes(table)) return;

            const countResult = await db.execute(sql`SELECT count(*)::int as count FROM ${sql.identifier(table)}`);
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

        return ok({
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
        });
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getSystemStats" });
}

export async function checkSystemHealth(): Promise<ActionResult<{
    database: { status: string; latency: number };
    storage: { status: string };
    api: { status: string };
    timestamp: Date;
}>> {
    return withAuth(async () => {
        const startDb = Date.now();
        await withTimeout(db.execute(sql`SELECT 1`), 5000);
        const dbLatency = Date.now() - startDb;

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const fsOk = fs.existsSync(uploadDir);

        return ok({
            database: { status: "ok", latency: dbLatency },
            storage: { status: fsOk ? "ok" : "error" },
            api: { status: "ok" },
            timestamp: new Date()
        });
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "checkSystemHealth" });
}

export async function createDatabaseBackup(): Promise<ActionResult<string>> {
    return withAuth(async (session) => {
        const result = await performDatabaseBackup(session.id, "manual");
        if (result.success) {
            return ok(result.fileName!);
        }
        return err(result.error || "Ошибка бэкапа");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createDatabaseBackup" });
}

export async function getBackupsList(): Promise<ActionResult<BackupFile[]>> {
    return withAuth(async () => {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) return ok([]);

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
        return ok(backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getBackupsList" });
}

export async function deleteBackupAction(fileName: string): Promise<ActionResult<void>> {
    const validated = z.object({ fileName: z.string().min(1, "Имя файла обязательно") }).safeParse({ fileName });
    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    return withAuth(async (session) => {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        const safeFileName = path.basename(fileName);
        const filePath = path.join(backupDir, safeFileName);

        if (fs.existsSync(filePath) && filePath.startsWith(backupDir)) {
            fs.unlinkSync(filePath);
            await logAction(`Удалена резервная копия: ${safeFileName}`, "system", session.id);
            return okVoid();
        }
        return ERRORS.NOT_FOUND("Файл бэкапа");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteBackupAction" });
}

export async function getSystemSettings(): Promise<ActionResult<Record<string, unknown>>> {
    return withAuth(async () => {
        const settings = await db.select().from(systemSettings).limit(100);
        const settingsMap: Record<string, unknown> = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        return ok(settingsMap);
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getSystemSettings" });
}

export async function updateSystemSetting(key: string, value: unknown): Promise<ActionResult<void>> {
    const validated = z.object({
        key: z.string().min(1, "Ключ настройки обязателен"),
        value: z.unknown()
    }).safeParse({ key, value });

    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    return withAuth(async () => {
        await db.insert(systemSettings).values({ // audit-ignore: одиночный upsert, транзакция не требуется
            key,
            value,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value, updatedAt: new Date() }
        });

        revalidatePath("/admin-panel/settings");
        return okVoid();
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateSystemSetting" });
}

export async function clearRamAction(): Promise<ActionResult<string>> {
    return withAuth(async () => {
        if (global.gc) {
            global.gc();
            return ok("Сборщик мусора запущен успешно");
        } else {
            return err("Сборщик мусора недоступен. Запустите Node.js с флагом --expose-gc");
        }
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "clearRamAction" });
}

export async function restartServerAction(): Promise<ActionResult<string>> {
    return withAuth(async (session) => {
        await db.insert(auditLogs).values({ // audit-ignore: одиночная запись в лог перед перезапуском
            userId: session.id,
            action: "SERVER_RESTART",
            entityType: "SYSTEM",
            entityId: SYSTEM_ENTITY_ID,
            details: { info: "Перезапуск сервера через панель управления" },
            createdAt: new Date()
        });

        setTimeout(() => {
            process.exit(0);
        }, 1000);

        return ok("Перезапуск инициирован");
    }, { roles: ROLE_GROUPS.ADMINS, errorPath: "restartServerAction" });
}
