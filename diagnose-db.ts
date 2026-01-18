import { db } from "./lib/db";
import { inventoryItems } from "./lib/schema";
import { eq, and, ne } from "drizzle-orm";

async function diagnose() {
    const itemId = "cbdf8c64-e972-46e3-8a71-112a27fccfcb";
    const sku = "FT-BS-FRT-BUB-KDS";

    console.log("Diagnosing item update...");

    // 1. Check if item exists
    const item = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.id, itemId)
    });

    if (!item) {
        console.error(`ERROR: Item with ID ${itemId} not found!`);
    } else {
        console.log(`FOUND ITEM: ${item.name} (${item.sku})`);
    }

    // 2. Check for SKU collision
    const collision = await db.query.inventoryItems.findFirst({
        where: and(
            eq(inventoryItems.sku, sku),
            ne(inventoryItems.id, itemId)
        )
    });

    if (collision) {
        console.error(`ERROR: SKU collision! Item ${collision.id} (${collision.name}) already has SKU ${sku}`);
    } else {
        console.log("No SKU collision found.");
    }

    process.exit(0);
}

diagnose().catch(err => {
    console.error(err);
    process.exit(1);
});
