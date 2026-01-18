import { db } from "@/lib/db";
import { inventoryItems, inventoryAttributes, inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * This script updates all inventory items that have old material codes
 * and regenerates their SKUs based on current attribute codes
 */

async function updateItemSKUs() {
    console.log("🔄 Starting SKU update process...");

    // Get all items
    const items = await db.select().from(inventoryItems);
    console.log(`📦 Found ${items.length} items to check`);

    let updatedCount = 0;

    for (const item of items) {
        if (!item.categoryId) continue;

        // Get category for prefix
        const [cat] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.id, item.categoryId)).limit(1);
        if (!cat?.prefix) continue;

        // Build SKU from current codes
        const skuParts = [
            cat.prefix,
            item.brandCode,
            item.qualityCode,
            item.materialCode,
            item.attributeCode,
            item.sizeCode
        ].filter(Boolean);

        const newSku = skuParts.join("-").toUpperCase();

        // Update if SKU changed
        if (newSku !== item.sku) {
            console.log(`  ✏️  Updating item ${item.id}:`);
            console.log(`     Old SKU: ${item.sku}`);
            console.log(`     New SKU: ${newSku}`);

            await db.update(inventoryItems)
                .set({ sku: newSku })
                .where(eq(inventoryItems.id, item.id));

            updatedCount++;
        }
    }

    console.log(`\n✅ Updated ${updatedCount} items`);
    console.log(`✅ ${items.length - updatedCount} items were already up to date`);
}

updateItemSKUs()
    .then(() => {
        console.log("\n🎉 Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
