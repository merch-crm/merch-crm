import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    const { inventoryCategories } = await import("@/lib/schema");

    console.log("Applying inventory categories migration...");

    try {
        // 1. Create table if not exists
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS "inventory_categories" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "name" text NOT NULL UNIQUE,
                "description" text,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `));

        // 2. Add column to inventory_items if not exists
        await db.execute(sql.raw(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='category_id') THEN
                    ALTER TABLE "inventory_items" ADD COLUMN "category_id" uuid REFERENCES "inventory_categories"("id");
                END IF;
            END $$;
        `));

        console.log("✓ Schema updated.");

        // 3. Seed initial categories
        const categories = [
            "Футболки", "Худи", "Свитшот", "Лонгслив", "Анорак",
            "Зип-худи", "Штаны", "Поло", "Упаковка", "Расходники"
        ];

        console.log("Seeding categories...");
        for (const name of categories) {
            try {
                await db.insert(inventoryCategories).values({ name }).onConflictDoNothing();
                console.log(`  - ${name}`);
            } catch (e) {
                // Ignore conflicts as we handle them with onConflictDoNothing
            }
        }

        console.log("✓ Seeding completed successfully!");
    } catch (error) {
        console.error("Error applying migration:", error);
        throw error;
    }

    process.exit(0);
}

main();
