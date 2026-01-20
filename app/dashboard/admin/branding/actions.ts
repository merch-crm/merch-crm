"use server";

import { db } from "@/lib/db";
import { systemSettings, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
    primary_color?: string;
    radius_outer?: number;
    radius_inner?: number;
    [key: string]: unknown;
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
    try {
        const settings = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });

        const defaultBranding: BrandingSettings = {
            companyName: "MerchCRM",
            logoUrl: null,
            primaryColor: "#5d00ff",
            faviconUrl: null,
            radius_outer: 24,
            radius_inner: 14
        };

        if (!settings) return defaultBranding;

        const val = settings.value as Record<string, unknown>;
        return {
            ...defaultBranding,
            ...val,
            primaryColor: (val.primaryColor as string) || (val.primary_color as string) || "#5d00ff"
        };
    } catch (error) {
        console.error("Error fetching branding settings:", error);
        return {
            companyName: "MerchCRM",
            logoUrl: null,
            primaryColor: "#5d00ff",
            faviconUrl: null
        };
    }
}

export async function updateBrandingSettings(data: BrandingSettings) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Check if settings exist
        const existing = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });

        const saveData = { ...data };
        if (saveData.primaryColor && !saveData.primary_color) {
            saveData.primary_color = saveData.primaryColor;
        }

        if (existing) {
            await db.update(systemSettings)
                .set({ value: saveData, updatedAt: new Date() })
                .where(eq(systemSettings.key, "branding"));
        } else {
            await db.insert(systemSettings).values({
                key: "branding",
                value: saveData,
            });
        }

        await logAction("Обновление настроек брендинга", "system", "branding", saveData);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/admin/branding");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating branding settings:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
        return { error: errorMessage };
    }
}

export async function exportDatabaseBackup() {
    const session = await getSession();
    if (!session || (await db.query.users.findFirst({ where: eq(users.id, session.id), with: { role: true } }))?.role?.name !== "Администратор") {
        return { error: "Permission denied" };
    }

    try {
        const data = {
            users: await db.query.users.findMany(),
            roles: await db.query.roles.findMany(),
            departments: await db.query.departments.findMany(),
            clients: await db.query.clients.findMany(),
            orders: await db.query.orders.findMany(),
            orderItems: await db.query.orderItems.findMany(),
            inventoryItems: await db.query.inventoryItems.findMany(),
            inventoryCategories: await db.query.inventoryCategories.findMany(),
            storageLocations: await db.query.storageLocations.findMany(),
            payments: await db.query.payments.findMany(),
            expenses: await db.query.expenses.findMany(),
            promocodes: await db.query.promocodes.findMany(),
            wikiPages: await db.query.wikiPages.findMany(),
            wikiFolders: await db.query.wikiFolders.findMany(),
            tasks: await db.query.tasks.findMany(),
            auditLogs: await db.query.auditLogs.findMany(),
            timestamp: new Date().toISOString(),
        };

        return { success: true, data };
    } catch (error: unknown) {
        console.error("Error exporting database:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to export database";
        return { error: errorMessage };
    }
}
