import { db } from "../lib/db";
import { inventoryAttributes } from "../lib/schema";
import { eq } from "drizzle-orm";

async function checkMaterial() {
    const materials = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.type, 'material'));
    console.log("Materials in DB:", materials);
}

checkMaterial().then(() => process.exit(0)).catch(console.error);
