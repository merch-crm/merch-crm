import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating avatars...");
  await db.execute(sql`UPDATE users SET image = avatar WHERE image IS NULL AND avatar IS NOT NULL`);
  console.log("Done.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
