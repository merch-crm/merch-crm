"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/error-logger";
import { type ActionResult } from "@/lib/types";

// Schema for actions without parameters
const VoidSchema = z.void();

import { getSession } from "@/lib/auth";

/**
 * Standardized refresh for warehouse data across different layouts
 */
export async function refreshWarehouse() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    VoidSchema.parse(undefined);
    try {
        revalidatePath("/dashboard/warehouse", "layout");
        revalidatePath("/dashboard/orders", "layout");
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/warehouse-shared.actions",
            method: "refreshWarehouse"
        });
    }
}

/**
 * Get available measurement units for inventory items
 */
export async function getMeasurementUnits(): Promise<ActionResult<{ id: string; name: string }[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    VoidSchema.parse(undefined);
    try {
        return {
            success: true,
            data: [
                { id: "шт.", name: "Штука" },
                { id: "liters", name: "Литр" },
                { id: "meters", name: "Метр" },
                { id: "kg", name: "Килограмм" }
            ]
        };
    } catch {
        return { success: false, error: "Ошибка при получении единиц измерения" };
    }
}
