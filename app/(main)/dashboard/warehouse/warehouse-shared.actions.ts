"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, okVoid, ok } from "@/lib/types";
import { withAuth } from "@/lib/action-helpers";

import { z } from "zod";

/**
 * Standardized refresh for warehouse data across different layouts
 */
export async function refreshWarehouse(): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const _validation = z.object({}).safeParse({});
        revalidatePath("/dashboard/warehouse", "layout");
        revalidatePath("/dashboard/orders", "layout");
        return okVoid();
    }, { errorPath: "refreshWarehouse" });
}

/**
 * Get available measurement units for inventory items
 */
export async function getMeasurementUnits(): Promise<ActionResult<{ id: string; name: string }[]>> {
    return withAuth(async () => {
        const _validation = z.object({}).safeParse({});
        return ok([
            { id: "шт.", name: "Штука" },
            { id: "liters", name: "Литр" },
            { id: "meters", name: "Метр" },
            { id: "kg", name: "Килограмм" }
        ]);
    }, { errorPath: "getMeasurementUnits" });
}
