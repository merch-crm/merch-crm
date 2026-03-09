/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });
    try {
        await client.connect();
        console.log("Applying final schema fixes...");

        // 1. product_lines
        await client.query(`ALTER TABLE "product_lines" ADD COLUMN IF NOT EXISTS "base_line_id" uuid`);

        // 2. print_collections
        await client.query(`ALTER TABLE "print_collections" ADD COLUMN IF NOT EXISTS "slug" varchar(255)`);
        await client.query(`UPDATE "print_collections" SET "slug" = "id"::text WHERE "slug" IS NULL`);

        // 3. print_design_versions
        await client.query(`ALTER TABLE "print_design_versions" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL`);

        // 4. print_design_files
        await client.query(`ALTER TABLE "print_design_files" ADD COLUMN IF NOT EXISTS "original_name" varchar(255) DEFAULT '' NOT NULL`);
        await client.query(`ALTER TABLE "print_design_files" ADD COLUMN IF NOT EXISTS "file_type" varchar(50) DEFAULT 'preview' NOT NULL`);
        await client.query(`ALTER TABLE "print_design_files" ADD COLUMN IF NOT EXISTS "width" integer`);
        await client.query(`ALTER TABLE "print_design_files" ADD COLUMN IF NOT EXISTS "height" integer`);
        await client.query(`ALTER TABLE "print_design_files" ADD COLUMN IF NOT EXISTS "path" varchar(500) DEFAULT '' NOT NULL`);

        // Migration: url -> path
        await client.query(`UPDATE "print_design_files" SET "path" = "url" WHERE "path" = '' AND "url" IS NOT NULL`);

        console.log("Schema fix applied successfully.");
    } catch (err) {
        console.error("Error applying fix:", err);
    } finally {
        await client.end();
    }
}
fix();
