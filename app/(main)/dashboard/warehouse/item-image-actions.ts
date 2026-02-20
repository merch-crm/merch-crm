"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { type ActionResult } from "@/lib/types";

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
        return { success: false, error: "Некорректный ID товара" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
        if (!item) return { success: false, error: "Товар не найден" };

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
        revalidatePath("/dashboard/warehouse");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/item-image-actions",
            method: "deleteInventoryItemImage",
            details: { itemId, type, index }
        });
        return { success: false, error: "Ошибка при удалении изображения" };
    }
}
