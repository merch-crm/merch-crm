import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes } from './lib/schema';

async function main() {
  const types = await db.select().from(inventoryAttributeTypes);
  console.log(JSON.stringify(types, null, 2));
  process.exit(0);
}

main().catch(console.error);
