"use server";

import { db } from "@/lib/db";
import { inventoryItems, inventoryTransactions } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function getInventoryItems() {
    try {
        const items = await db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt));
        return { data: items };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return { error: "Failed to fetch inventory items" };
    }
}

export async function addInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const unit = formData.get("unit") as string;
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string);

    if (!name || isNaN(quantity)) {
        return { error: "Invalid data" };
    }

    try {
        const [newItem] = await db.insert(inventoryItems).values({
            name,
            sku,
            quantity,
            unit,
            lowStockThreshold,
        }).returning();

        // Log transaction
        await db.insert(inventoryTransactions).values({
            itemId: newItem.id,
            changeAmount: quantity,
            type: "in",
            reason: "Initial stock",
            createdBy: session.id,
        });

        await logAction("Поставка", "inventory_item", newItem.id, {
            name,
            quantity,
            sku
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error adding item:", error);
        return { error: "Failed to add item" };
    }
}
