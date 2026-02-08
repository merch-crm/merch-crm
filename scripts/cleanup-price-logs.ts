
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { inventoryTransactions } from "../lib/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Disable SSL for this cleanup script as the local/dev server doesn't support it
});

const db = drizzle(pool);

async function cleanup() {
    console.log("Starting cleanup of incorrect price adjustment logs...");

    try {
        const result = await db.delete(inventoryTransactions)
            .where(
                and(
                    eq(inventoryTransactions.reason, "Корректировка цены (редактирование)"),
                    eq(inventoryTransactions.changeAmount, 0)
                )
            )
            .returning();

        console.log(`Successfully deleted ${result.length} incorrect transaction logs.`);
    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

cleanup();
