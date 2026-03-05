
import { db } from "./lib/db";
import { inventoryAttributes } from "./lib/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("--- Repairing Sizes ---");
    const result = await db.update(inventoryAttributes)
        .set({ categoryId: null })
        .where(eq(inventoryAttributes.type, 'size'))
        .returning();

    console.log(`Updated ${result.length} size values to be global (categoryId = null).`);
    result.forEach(v => console.log(`- ${v.name} (${v.value})`));
}

main().catch(console.error);
