"use server";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getBrandingSettings() {
    try {
        const settings = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });

        if (!settings) return null;

        return settings.value as {
            primaryColor?: string;
            radiusOuter?: string;
            radiusInner?: string;
            brandName?: string;
            logoUrl?: string;
        };
    } catch (error) {
        console.error("Failed to fetch branding settings:", error);
        return null;
    }
}
