import { db } from "./lib/db";
import { inventoryAttributes } from "./lib/schema";
import { eq } from "drizzle-orm";

async function debug() {
    const attrs = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.type, "tsvet1")).limit(10);
    console.log("--- Attributes for 'tsvet1' ---");
    for (const a of attrs) {
        console.log(`Attribute: ID=${a.id}, Name=${a.name}, Value=${a.value}`);
    }
}

debug().catch(console.error);
