import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  const client = new Client({
    host: url.hostname, port: parseInt(url.port) || 5432,
    user: url.username, password: url.password, database: url.pathname.slice(1),
    ssl: false
  });

  try {
    await client.connect();
    console.log("Connected.");

    // application_types missing columns
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "category" varchar(50) NOT NULL DEFAULT 'print'`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "icon" varchar(100)`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "min_quantity" integer DEFAULT 1`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "max_colors" integer`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "max_print_area" varchar(50)`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "base_cost" integer DEFAULT 0`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "cost_per_unit" integer DEFAULT 0`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "setup_cost" integer DEFAULT 0`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "estimated_time" integer`);
    await client.query(`ALTER TABLE "application_types" ADD COLUMN IF NOT EXISTS "setup_time" integer`);
    console.log("Added missing columns to application_types");

    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}
main();
