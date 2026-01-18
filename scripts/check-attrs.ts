import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from '../lib/db';
import { inventoryAttributes } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const attrs = await db.select().from(inventoryAttributes);
    console.log("Found attributes:", attrs.length);

    attrs.forEach(a => {
        console.log(`- ${a.name} (${a.value}): Meta = ${JSON.stringify(a.meta)}`);
    });
}

main().catch(console.error);
