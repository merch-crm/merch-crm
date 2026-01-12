import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Applying client schema migration...");

    try {
        const sqlContent = readFileSync(
            join(process.cwd(), "drizzle/0002_colossal_the_professor.sql"),
            "utf-8"
        );

        // Split by statement-breakpoint if needed, but drizzle SQL usually works as is if it's one block
        // Drizzle-kit SQL files contain --> statement-breakpoint
        const statements = sqlContent.split("--> statement-breakpoint");

        for (const statement of statements) {
            if (statement.trim()) {
                await db.execute(sql.raw(statement));
            }
        }

        console.log("✓ Client schema migration completed successfully!");
    } catch (error) {
        console.error("Error applying migration:", error);
        throw error;
    }

    process.exit(0);
}

main();
