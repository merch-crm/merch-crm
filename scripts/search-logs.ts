
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../lib/schema";
import { auditLogs, inventoryTransactions, inventoryAttributeTypes, inventoryAttributes } from "../lib/schema";
import { desc, eq, like, or } from "drizzle-orm";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const db = drizzle(pool, { schema });

async function main() {
    console.log("🔍 Searching audit logs for characteristic changes...");

    // Check audit_logs
    const logs = await db.query.auditLogs.findMany({
        where: or(
            eq(auditLogs.entityType, "inventory_attribute"),
            eq(auditLogs.entityType, "inventory_attribute_type"),
            like(auditLogs.action, "%delete%"),
            like(auditLogs.action, "%update%")
        ),
        orderBy: desc(auditLogs.createdAt),
        limit: 50
    });

    console.log(`Found ${logs.length} audit log entries.`);
    logs.forEach(log => {
        console.log(`[${log.createdAt?.toISOString()}] ${log.action} on ${log.entityType} (ID: ${log.entityId})`);
        console.log(`   Details:`, JSON.stringify(log.details, null, 2));
    });

    console.log("\n🔍 Searching inventory transactions...");
    const transactions = await db.query.inventoryTransactions.findMany({
        where: eq(inventoryTransactions.type, "attribute_change"),
        orderBy: desc(inventoryTransactions.createdAt),
        limit: 50
    });

    console.log(`Found ${transactions.length} transactions.`);
    transactions.forEach(tx => {
        console.log(`[${tx.createdAt.toISOString()}] ${tx.reason}`);
    });

    process.exit(0);
}

main().catch(console.error);
