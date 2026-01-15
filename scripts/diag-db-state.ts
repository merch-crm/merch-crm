import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { clients, inventoryItems } from "../lib/schema";
import { sql } from "drizzle-orm";

async function diag() {
    try {
        console.log("--- Checking Clients Table ---");
        const clientCount = await db.select({ count: sql`count(*)` }).from(clients);
        console.log("Total clients:", clientCount[0].count);

        const firstClient = await db.query.clients.findFirst();
        console.log("First client sample:", firstClient ? { id: firstClient.id, name: firstClient.name } : "No clients found");

        console.log("\n--- Checking Inventory Items Table ---");
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'inventory_items'
        `);
        console.log("Columns in inventory_items:");
        columns.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });

        // Check for image and reservedQuantity specifically
        const hasImage = columns.rows.some(r => r.column_name === 'image');
        const hasReserved = columns.rows.some(r => r.column_name === 'reserved_quantity');
        console.log(`\nSchema Sync Check:`);
        console.log(`- image column exists: ${hasImage}`);
        console.log(`- reserved_quantity column exists: ${hasReserved}`);

    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error);
    } finally {
        process.exit(0);
    }
}

diag();
Riverside
