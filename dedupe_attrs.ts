import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributes } from './lib/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const attrs = await db.select().from(inventoryAttributes);
    const seen = new Set();
    let deleted = 0;

    // Sort: keep records with more metadata or newer ones
    attrs.sort((a, b) => {
        const aMeta = Object.keys(a.meta || {}).length;
        const bMeta = Object.keys(b.meta || {}).length;
        if (aMeta !== bMeta) return bMeta - aMeta;
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    for (const a of attrs) {
        // Key by type and normalized name/value
        const nameKey = `N:${a.type}:${(a.name || "").toLowerCase().trim()}`;
        const valueKey = `V:${a.type}:${(a.value || "").toLowerCase().trim()}`;

        if (seen.has(nameKey) || seen.has(valueKey)) {
            console.log(`Deleting duplicate: [${a.type}] Name: "${a.name}", Value: "${a.value}"`);
            await db.delete(inventoryAttributes).where(eq(inventoryAttributes.id, a.id));
            deleted++;
        } else {
            seen.add(nameKey);
            seen.add(valueKey);
        }
    }

    console.log(`\nCleanup finished. Deleted ${deleted} redundant attribute values.`);
    process.exit(0);
}

main().catch(console.error);
