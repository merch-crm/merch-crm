
import { db } from "./lib/db";
import { inventoryAttributes } from "./lib/schema";
import { eq } from "drizzle-orm";

async function main() {
    const cats = await db.query.inventoryCategories.findMany();
    console.log("--- Categories ---");
    cats.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}, Parent: ${c.parentId}`));

    const types = await db.query.inventoryAttributeTypes.findMany();
    console.log("\n--- Attribute Types ---");
    types.forEach(t => console.log(`ID: ${t.id}, Name: ${t.name}, Slug: ${t.slug}, CatID: ${t.categoryId}`));

    console.log("\n--- " + "Size" + " Values ---");
    const sizeVals = await db.query.inventoryAttributes.findMany({
        where: eq(inventoryAttributes.type, 'size')
    });
    sizeVals.forEach(v => console.log(`Value: ${v.name}, CatID: ${v.categoryId}`));
}

main().catch(console.error);
