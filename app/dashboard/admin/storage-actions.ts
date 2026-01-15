"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs";

export interface StorageQuotaSettings {
    maxS3Size: number;
    maxLocalSize: number;
    warningThreshold: number; // 0.0 - 1.0
}

const DEFAULT_SETTINGS: StorageQuotaSettings = {
    maxS3Size: 5 * 1024 * 1024 * 1024, // 5GB
    maxLocalSize: 50 * 1024 * 1024 * 1024, // 50GB (changed to 50GB as 10GB might be too small for full disk check)
    warningThreshold: 0.8
};

export interface QuotaStatus {
    used: number;
    limit: number;
    percent: number;
    status: 'ok' | 'warning' | 'critical';
}

export interface StorageQuotaUsage {
    s3: QuotaStatus;
    local: QuotaStatus;
}

export async function getStorageQuotaSettings() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { error: "Доступ запрещен" };

    try {
        const record = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "storage_config")
        });

        if (!record) return { data: DEFAULT_SETTINGS };
        return { data: record.value as unknown as StorageQuotaSettings };
    } catch (e) {
        console.error("Error fetching storage settings:", e);
        return { error: "Ошибка получения настроек" };
    }
}

export async function updateStorageQuotaSettings(settings: StorageQuotaSettings) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { error: "Доступ запрещен" };

    try {
        await db.insert(systemSettings).values({
            key: "storage_config",
            value: settings,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: settings, updatedAt: new Date() }
        });

        revalidatePath("/dashboard/admin/storage");
        return { success: true };
    } catch (e) {
        console.error("Error updating storage settings:", e);
        return { error: "Ошибка сохранения настроек" };
    }
}

export async function checkStorageQuotas() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") return { error: "Доступ запрещен" };

    try {
        const { data: settings = DEFAULT_SETTINGS } = await getStorageQuotaSettings();

        // 1. S3 Usage
        // We use dynamic import to avoid crashes if credentials are missing during build time
        const { getStorageStats } = await import("@/lib/storage");
        // getStorageStats returns { size: number, fileCount: number }
        // If S3 is not configured, it might throw or return 0. Ideally handler inside lib/storage handles it.
        let s3Stats = { size: 0, fileCount: 0 };
        try {
            s3Stats = await getStorageStats();
        } catch (e) {
            console.warn("S3 check failed:", e);
            // Ignore error, assume 0 usage or S3 unavailable
        }

        // 2. Local Usage
        // fs.statfsSync checks filesystem stats. process.cwd() is usually where the app runs.
        let localUsed = 0;
        try {
            const stat = fs.statfsSync(process.cwd());
            // total = bsize * blocks
            // free = bsize * bfree
            // used = total - free
            localUsed = Number(stat.bsize * (stat.blocks - stat.bfree));
        } catch (e) {
            console.warn("Local storage check failed:", e);
        }

        // Calculate S3
        const s3Percent = settings.maxS3Size > 0 ? (s3Stats.size / settings.maxS3Size) : 0;
        const s3Status: QuotaStatus['status'] = s3Percent >= 1 ? 'critical' : s3Percent >= settings.warningThreshold ? 'warning' : 'ok';

        // Calculate Local
        const localPercent = settings.maxLocalSize > 0 ? (localUsed / settings.maxLocalSize) : 0;
        const localStatus: QuotaStatus['status'] = localPercent >= 1 ? 'critical' : localPercent >= settings.warningThreshold ? 'warning' : 'ok';

        const result: StorageQuotaUsage = {
            s3: {
                used: s3Stats.size,
                limit: settings.maxS3Size,
                percent: s3Percent,
                status: s3Status
            },
            local: {
                used: localUsed,
                limit: settings.maxLocalSize,
                percent: localPercent,
                status: localStatus
            }
        };

        return { data: result };
    } catch (e) {
        console.error("Storage quota check error:", e);
        return { error: "Ошибка проверки квот" };
    }
}
