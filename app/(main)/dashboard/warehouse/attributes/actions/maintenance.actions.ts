"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryAttributes } from "@/lib/schema/warehouse/attributes";
import { 
    inventoryAttributeTypes, 
    inventoryCategories 
} from "@/lib/schema/warehouse/categories";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { logAction } from "@/lib/audit";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { refreshWarehouse } from "../../warehouse-shared.actions";
import { type ActionResult, ok, ERRORS } from "@/lib/types";
import { generateItemName, generateItemSku } from "../libs/sku-generator";

const regenerateSchema = z.object({
    confirm: z.boolean().optional()
});

/**
 * Regenerate all item SKUs and names based on their attributes and categories.
 * This is a heavy operation used for maintenance.
 */
export async function regenerateAllItemSKUs(input?: z.infer<typeof regenerateSchema>): Promise<ActionResult<{ updatedCount: number; totalItems: number }>> {
    const validated = regenerateSchema.safeParse(input || {});
    if (!validated.success) {
        return ERRORS.VALIDATION("Неверные параметры запроса");
    }

    return withAuth(async () => {
        const items = await db.select().from(inventoryItems).limit(10000);
        const allAttributes = await db.select().from(inventoryAttributes).limit(10000);
        const allCategories = await db.select().from(inventoryCategories).limit(1000);
        const allTypes = await db.select().from(inventoryAttributeTypes)
            .orderBy(inventoryAttributeTypes.sortOrder, inventoryAttributeTypes.createdAt)
            .limit(100);

        const customTypes = allTypes.filter(t => !["brand", "quality", "material", "size", "color"].includes(t.slug));

        let updatedCount = 0;

        for (const item of items) {
            if (!item.categoryId) continue;

            const category = allCategories.find(c => c.id === item.categoryId);
            if (!category) continue;

            const params = {
                item,
                category,
                allAttributes,
                customTypes
            };

            const newSku = generateItemSku(params) || item.sku;
            const newName = generateItemName(params);

            if (newSku !== item.sku || newName !== item.name) {
                await db.update(inventoryItems)
                    .set({
                        sku: newSku,
                        name: newName,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryItems.id, item.id));
                updatedCount++;
            }
        }

        await logAction("Массовое обновление SKU и имен", "inventory_items", "bulk",
            { updatedCount, totalItems: items?.length }
        );

        refreshWarehouse();
        return ok({ updatedCount, totalItems: items?.length });
    }, { 
        roles: ROLE_GROUPS.ADMINS,
        errorPath: "regenerateAllItemSKUs" 
    });
}
