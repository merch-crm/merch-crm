import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes, inventoryAttributes } from './lib/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';

async function main() {
    const auditData = JSON.parse(fs.readFileSync('final_audit.json', 'utf8'));
    const originalTypes = auditData.types;
    const originalAttrs = auditData.attrs;

    console.log(`Original types count: ${originalTypes.length}`);
    console.log(`Original attrs count: ${originalAttrs.length}`);

    // 1. Restore missing types
    // Fetch all existing IDs in a single query to avoid N+1
    const existingTypes = await db.select({ id: inventoryAttributeTypes.id }).from(inventoryAttributeTypes);
    const existingTypeIds = new Set(existingTypes.map((t) => t.id));

    for (const t of originalTypes) {
        if (!existingTypeIds.has(t.id)) {
            console.log(`Restoring type: "${t.name}" (Slug: ${t.slug}, Category: ${t.categoryId})`);
            await db.insert(inventoryAttributeTypes).values({
                id: t.id,
                slug: t.slug,
                name: t.name,
                isSystem: t.isSystem,
                sortOrder: t.sortOrder,
                categoryId: t.categoryId,
                dataType: t.dataType,
                showInSku: t.showInSku,
                showInName: t.showInName,
                hasColor: t.hasColor,
                hasUnits: t.hasUnits,
                hasComposition: t.hasComposition,
                updatedAt: new Date(t.updatedAt),
                createdAt: new Date(t.createdAt),
                meta: t.meta
            });
        }
    }

    // 2. Point attributes back to their original slugs
    for (const a of originalAttrs) {
        // a.type is the original slug
        await db.update(inventoryAttributes)
            .set({ type: a.type })
            .where(eq(inventoryAttributes.id, a.id));
    }

    console.log("Restoration complete. Attributes are back to their original category-scoped slugs.");
    process.exit(0);
}

main().catch(console.error);
