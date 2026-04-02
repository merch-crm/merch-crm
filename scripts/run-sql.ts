import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`SELECT event_object_table, trigger_name, event_manipulation FROM information_schema.triggers WHERE event_object_table = 'orders'`);
  console.log(result.rows);
  process.exit(0);
}
main();
