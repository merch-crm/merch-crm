import { db } from "./lib/db";
import { inventoryAttributes, inventoryAttributeTypes } from "./lib/schema";
import { eq, sql } from "drizzle-orm";

async function debug() {
    const stats = await db.select({
        name: inventoryAttributeTypes.name,
        slug: inventoryAttributeTypes.slug,
        id: inventoryAttributeTypes.id,
        isSystem: inventoryAttributeTypes.isSystem,
        categoryId: inventoryAttributeTypes.categoryId,
        count: sql<number>`count(${inventoryAttributes.id})`
    })
        .from(inventoryAttributeTypes)
        .leftJoin(inventoryAttributes, eq(inventoryAttributes.type, inventoryAttributeTypes.slug))
        .groupBy(inventoryAttributeTypes.id)
        .limit(100);

    console.log("--- Attribute Types ---");
    for (const s of stats) {
        console.log(`${s.name} (${s.slug}): ID=${s.id}, isSystem=${s.isSystem}, categoryId=${s.categoryId}, count=${s.count}`);
    }
}

debug().catch(console.error);
