"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/error-logger";
import { type ActionResult } from "@/lib/types";

// Schema for actions without parameters
const VoidSchema = z.void();

/**
 * Standardized refresh for warehouse data across different layouts
 */
export async function refreshWarehouse() {
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
    VoidSchema.parse(undefined);
    try {
        return {
            success: true,
            data: [
                { id: "шт.", name: "шт." },
                { id: "liters", name: "л" },
                { id: "meters", name: "м" },
                { id: "kg", name: "кг" }
            ]
        };
    } catch {
        return { success: false, error: "Ошибка при получении единиц измерения" };
    }
}
