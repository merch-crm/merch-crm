"use server";

import { eq } from "drizzle-orm";
import Fuse from "fuse.js";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { CheckDuplicateItemSchema } from "./validation";

/**
 * Check for duplicate items by name or SKU
 */
export async function checkDuplicateItem(name: string, sku?: string, currentItemId?: string): Promise<{
    duplicate: { id: string; name: string; sku: string | null } | null;
    type?: "sku_exact" | "name_fuzzy";
    isArchived?: boolean;
    score?: number;
}> {
    const validation = CheckDuplicateItemSchema.safeParse({ name, sku, currentItemId });

    if (!validation.success) {
        return { duplicate: null };
    }

    try {
        const allItems = await db.query.inventoryItems.findMany({
            columns: { id: true, name: true, sku: true },
            limit: 2000
        });

        const otherItems = currentItemId ? allItems.filter(i => i.id !== currentItemId) : allItems;

        if (sku && sku !== "") {
            const exactSku = otherItems.find(i => i.sku?.toUpperCase() === sku.toUpperCase());
            if (exactSku) {
                const res = await db.query.inventoryItems.findFirst({
                    where: eq(inventoryItems.id, exactSku.id),
                    columns: { isArchived: true }
                });
                return {
                    duplicate: exactSku,
                    type: "sku_exact",
                    isArchived: res?.isArchived || false
                };
            }
        }

        const fuse = new Fuse(otherItems, {
            keys: ["name"],
            threshold: 0.3,
            includeScore: true
        });

        const results = fuse.search(name);
        if ((results?.length ?? 0) > 0 && (results[0].score ?? 1) < 0.2) {
            return { duplicate: results[0].item, type: "name_fuzzy", score: results[0].score ?? undefined };
        }

        return { duplicate: null };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-duplicate-actions",
            method: "checkDuplicateItem",
            details: { name, sku }
        });
        return { duplicate: null };
    }
}
