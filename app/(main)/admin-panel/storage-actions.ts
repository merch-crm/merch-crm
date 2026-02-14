"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
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
    try {
        await requireAdmin(session);

        const record = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "storage_config")
        });

        if (!record) return { success: true, data: DEFAULT_SETTINGS };
        return { success: true, data: record.value as unknown as StorageQuotaSettings };
    } catch (e) {
        console.error("Error fetching storage settings:", e);
        return { success: false, error: e instanceof Error ? e.message : "Ошибка получения настроек" };
    }
}

export async function updateStorageQuotaSettings(settings: StorageQuotaSettings) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        await db.insert(systemSettings).values({
            key: "storage_config",
            value: settings,
            updatedAt: new Date()
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: settings, updatedAt: new Date() }
        });

        revalidatePath("/admin-panel/storage");
        return { success: true };
    } catch (e) {
        console.error("Error updating storage settings:", e);
        return { success: false, error: e instanceof Error ? e.message : "Ошибка сохранения настроек" };
    }
}

export async function checkStorageQuotas() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const { data: settings = DEFAULT_SETTINGS } = await getStorageQuotaSettings() as { data?: StorageQuotaSettings };

        // 1. S3 Usage
        const { getStorageStats } = await import("@/lib/storage");
        let s3Stats = { size: 0, fileCount: 0 };
        try {
            s3Stats = await getStorageStats();
        } catch (e) {
            console.warn("S3 check failed:", e);
        }

        // 2. Local Usage
        let localUsed = 0;
        try {
            const stat = fs.statfsSync(process.cwd());
            localUsed = Number(stat.bsize * (stat.blocks - stat.bfree));
        } catch (e) {
            console.warn("Local storage check failed:", e);
        }

        const actualSettings = settings || DEFAULT_SETTINGS;

        // Calculate S3
        const s3Percent = actualSettings.maxS3Size > 0 ? (s3Stats.size / actualSettings.maxS3Size) : 0;
        const s3Status: QuotaStatus['status'] = s3Percent >= 1 ? 'critical' : s3Percent >= actualSettings.warningThreshold ? 'warning' : 'ok';

        // Calculate Local
        const localPercent = actualSettings.maxLocalSize > 0 ? (localUsed / actualSettings.maxLocalSize) : 0;
        const localStatus: QuotaStatus['status'] = localPercent >= 1 ? 'critical' : localPercent >= actualSettings.warningThreshold ? 'warning' : 'ok';

        const result: StorageQuotaUsage = {
            s3: {
                used: s3Stats.size,
                limit: actualSettings.maxS3Size,
                percent: s3Percent,
                status: s3Status
            },
            local: {
                used: localUsed,
                limit: actualSettings.maxLocalSize,
                percent: localPercent,
                status: localStatus
            }
        };

        return { success: true, data: result };
    } catch (e) {
        console.error("Storage quota check error:", e);
        return { success: false, error: e instanceof Error ? e.message : "Ошибка проверки квот" };
    }
}
