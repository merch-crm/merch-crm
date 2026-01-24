
import { db } from './lib/db.js';
import { roles } from './lib/schema.js';

async function main() {
    const allRoles = await db.select().from(roles);
    console.log(JSON.stringify(allRoles, null, 2));
}

main().catch(console.error);
