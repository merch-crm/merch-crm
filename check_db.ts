import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'product_lines' 
            AND column_name = 'print_collection_id';
        `);
        console.log("Check result:", JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Schema check failed:", e);
    } finally {
        process.exit();
    }
}

checkSchema();
