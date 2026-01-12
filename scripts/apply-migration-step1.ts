import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Applying step 1 migration: Creating new tables and columns...");

    try {
        // Read the SQL file
        const sqlContent = readFileSync(
            join(process.cwd(), "drizzle/0001_step1_add_tables.sql"),
            "utf-8"
        );

        // Execute the SQL
        await db.execute(sql.raw(sqlContent));

        console.log("✓ Step 1 migration completed successfully!");
    } catch (error) {
        console.error("Error applying migration:", error);
        throw error;
    }

    process.exit(0);
}

main();
