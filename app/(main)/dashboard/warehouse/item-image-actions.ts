"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { logAction } from "@/lib/audit";
import { withAuth } from "@/lib/action-helpers";
import { type ActionResult, okVoid, ERRORS } from "@/lib/types";

/**
 * Delete a specific image from an inventory item
 */
export async function deleteInventoryItemImage(
    itemId: string,
    type: "front" | "back" | "side" | "details",
    index?: number
): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(itemId);
    if (!idValidation.success) {
        return ERRORS.VALIDATION("Некорректный ID товара");
    }

    return withAuth(async () => {
        const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
        if (!item) return ERRORS.NOT_FOUND("Товар");

        const updates: Partial<typeof item> = { updatedAt: new Date() };

        if (type === "front") updates.image = null;
        else if (type === "back") updates.imageBack = null;
        else if (type === "side") updates.imageSide = null;
        else if (type === "details" && typeof index === "number") {
            const details = [...((item.imageDetails as string[]) || [])];
            if (index >= 0 && index < details.length) {
                details.splice(index, 1);
                updates.imageDetails = details;
            }
        }

        await db.update(inventoryItems).set(updates).where(eq(inventoryItems.id, itemId));
        await logAction("Удалено изображение товара", "inventory_item", itemId, { type, index });
        revalidatePath("/dashboard/warehouse");

        return okVoid();
    }, { 
        roles: ["Администратор", "Руководство", "Склад"],
        errorPath: "deleteInventoryItemImage" 
    });
}
