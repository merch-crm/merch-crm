import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { performDatabaseBackup } from "@/lib/backup";


export async function GET(request: NextRequest) {
    try {
        // 1. Validate cron secret
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || secret !== cronSecret) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }


        // 2. Check backup frequency setting
        const frequencySetting = await db.query.systemSettings.findFirst({
            where: (s, { eq }) => eq(s.key, "backup_frequency")
        });
        const frequency = (frequencySetting?.value as string) || "daily";

        // 3. Check last backup time
        const lastBackupSetting = await db.query.systemSettings.findFirst({
            where: (s, { eq }) => eq(s.key, "last_backup_at")
        });
        const lastBackupAt = lastBackupSetting?.value
            ? new Date(lastBackupSetting.value as string)
            : new Date(0);

        const now = new Date();
        const diffMs = now.getTime() - lastBackupAt.getTime();

        let shouldBackup = false;
        if (frequency === "none") {
            // Manual only — skip
            return NextResponse.json({
                success: true,
                skipped: true,
                reason: "Frequency set to none"
            });
        }

        if (frequency === "daily" && diffMs > 24 * 60 * 60 * 1000) shouldBackup = true;
        if (frequency === "weekly" && diffMs > 7 * 24 * 60 * 60 * 1000) shouldBackup = true;
        if (frequency === "monthly" && diffMs > 30 * 24 * 60 * 60 * 1000) shouldBackup = true;

        if (!shouldBackup) {
            return NextResponse.json({
                success: true,
                skipped: true,
                reason: `Last backup ${Math.round(diffMs / 3600000)}h ago, frequency: ${frequency}`
            });
        }

        // 4. Update timestamp immediately to prevent concurrent triggers
        await db.insert(systemSettings).values({
            key: "last_backup_at",
            value: now.toISOString(),
            updatedAt: now
        }).onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: now.toISOString(), updatedAt: now }
        });

        // 5. Create the backup
        // Use service function directly to bypass session check
        const result = await performDatabaseBackup(null, "cron");

        if (result.success) {
            // 6. Log success (already logged in service, but we add extra audit here if needed or just trust service)
            // The service logs with userId=null if we pass null.
            // Let's add specific cron audit with more details here if the service one is generic.
            // Service log: "Создана резервная копия БД: ..."
            // We can rely on that.

            return NextResponse.json({
                success: true,
                fileName: result.fileName,
                timestamp: now.toISOString()
            });
        } else {
            console.error("[Cron Backup] Failed:", result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[Cron Backup] Critical error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
