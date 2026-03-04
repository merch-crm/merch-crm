import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes, inventoryAttributes } from './lib/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const types = await db.select().from(inventoryAttributeTypes);

    // Group types by name
    const groups: Record<string, typeof types> = {};
    for (const t of types) {
        if (!groups[t.name]) groups[t.name] = [];
        groups[t.name].push(t);
    }

    let deletedTypesCount = 0;

    for (const name in groups) {
        const instances = groups[name];
        if (instances.length > 1) {
            console.log(`\nFound duplicate group: "${name}"`);

            // Pick the canonical one: prioritize the one with a category or the first one
            const canonical = instances.find(t => t.categoryId) || instances[0];
            const duplicates = instances.filter(t => t.id !== canonical.id);

            for (const dupe of duplicates) {
                console.log(`Merging slug "${dupe.slug}" (ID: ${dupe.id}) into master slug "${canonical.slug}" (ID: ${canonical.id})`);

                // Move attributes
                await db.update(inventoryAttributes)
                    .set({ type: canonical.slug })
                    .where(eq(inventoryAttributes.type, dupe.slug));

                // In case there are duplicates with same code in the same type now, we'll let the user handle it or log it
                // But usually these were separate categories or just ghost duplicates.



                // Delete the redundant type
                await db.delete(inventoryAttributeTypes)
                    .where(eq(inventoryAttributeTypes.id, dupe.id));

                deletedTypesCount++;
            }
        }
    }

    console.log(`\nMaintenance complete.`);
    console.log(`Merged attributes from ${deletedTypesCount} duplicate types.`);
    console.log(`Deleted ${deletedTypesCount} redundant characteristic types.`);
    process.exit(0);
}

main().catch(console.error);
