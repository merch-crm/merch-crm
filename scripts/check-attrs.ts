import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from '../lib/schema';
import { inventoryAttributes, inventoryAttributeTypes } from '../lib/schema';
import { eq } from 'drizzle-orm';

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined (masked)" : "UNDEFINED");
if (process.env.DATABASE_URL) {
    const parts = process.env.DATABASE_URL.split("@");
    if (parts.length > 1) {
        console.log("DB Host:", parts[1]);
    }
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const db = drizzle(pool, { schema });

async function main() {
    const attrs = await db.select().from(inventoryAttributes);
    console.log("Found attributes:", attrs.length);

    attrs.forEach(a => {
        console.log(`- ${a.name} (${a.value}): Meta = ${JSON.stringify(a.meta)}`);
    });

    const types = await db.select().from(inventoryAttributeTypes); // Add import!
    console.log("Found attribute types:", types.length);
    types.forEach(t => {
        console.log(`- ${t.name} (${t.slug})`);
    });
}

main().catch(console.error);
