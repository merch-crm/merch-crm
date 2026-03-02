import { db } from "./lib/db";
import { inventoryCategories } from "./lib/schema";
import { inArray } from "drizzle-orm";

async function debug() {
    const ids = ["c8f23df3-87b1-4bde-b50a-c54f63ebbc6d", "0189442d-66f6-44c6-be47-21d5c38096cf"];
    const cats = await db.select().from(inventoryCategories).where(inArray(inventoryCategories.id, ids)).limit(100);
    console.log("--- Categories ---");
    for (const c of cats) {
        console.log(`Category: ID=${c.id}, Name=${c.name}`);
    }
}

debug().catch(console.error);
