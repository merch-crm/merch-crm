import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function checkDbSize() {
    try {
        console.log("🔍 Checking database size...");
        const dbSizeResult = await db.execute(sql`SELECT pg_database_size(current_database())`);
        const rows = dbSizeResult.rows as any[];
        const dbSize = parseInt(rows[0]?.pg_database_size || "0");
        console.log("✅ Database size:", dbSize, "bytes");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkDbSize();
