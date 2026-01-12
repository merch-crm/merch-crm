import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Applying step 2 migration: Dropping old role column...");

    try {
        // Read the SQL file
        const sqlContent = readFileSync(
            join(process.cwd(), "drizzle/0002_step2_drop_old_role.sql"),
            "utf-8"
        );

        // Execute the SQL
        await db.execute(sql.raw(sqlContent));

        console.log("✓ Step 2 migration completed successfully!");
        console.log("✓ Old role column and enum have been removed");
    } catch (error) {
        console.error("Error applying migration:", error);
        throw error;
    }

    process.exit(0);
}

main();
