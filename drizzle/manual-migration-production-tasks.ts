import { sql } from 'drizzle-orm';
import { db } from '../lib/db';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    await db.execute(sql`ALTER TABLE "production_tasks" ADD COLUMN IF NOT EXISTS "defect_quantity" integer DEFAULT 0`);
    console.log("Added defect_quantity to production_tasks");
    await db.execute(sql`ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "application_type_ids" jsonb DEFAULT '[]'`);
    console.log("Added application_type_ids to equipment");
    await db.execute(sql`ALTER TABLE "system_fonts" ADD COLUMN IF NOT EXISTS "regular_path" text`);
    console.log("Added regular_path to system_fonts");
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}
main();
