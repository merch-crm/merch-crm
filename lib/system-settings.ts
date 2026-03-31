import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Настройки системы с кэшированием
 */
const globalSettings = global as unknown as {
    maintenanceMode: boolean | null;
    lastUpdate: number;
};

const TTL = 60 * 1000; // 1 min

export const getMaintenanceMode = cache(async (): Promise<boolean> => {
    const now = Date.now();
    if (globalSettings.maintenanceMode !== null && (now - globalSettings.lastUpdate < TTL)) {
        return globalSettings.maintenanceMode;
    }

    try {
        const result = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "maintenance_mode")
        });
        const isMaintenance = result?.value === true;
        
        globalSettings.maintenanceMode = isMaintenance;
        globalSettings.lastUpdate = now;
        return isMaintenance;
    } catch (error) {
        console.error("Failed to fetch maintenance mode:", error);
        return false;
    }
});
