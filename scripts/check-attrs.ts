import { db } from '../lib/db';
import { inventoryAttributes } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function check() {
    try {
        const attrs = await db.select().from(inventoryAttributes);
        attrs.forEach(a => {
            console.log(`Attr: ${a.name}, Meta Type: ${typeof a.meta}, Meta: ${JSON.stringify(a.meta)}`);
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
