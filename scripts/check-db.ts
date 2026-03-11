
import { db } from "./lib/db";
import { printCollections, sessions } from "./lib/schema";
import { desc } from "drizzle-orm";

async function check() {
    console.log("Checking print_collections...");
    const collections = await db.select().from(printCollections).orderBy(desc(printCollections.createdAt)).limit(5);
    console.log("Last 5 collections:", JSON.stringify(collections, null, 2));

    console.log("\nChecking sessions...");
    const lastSessions = await db.select().from(sessions).orderBy(desc(sessions.createdAt)).limit(5);
    console.log("Last 5 sessions:", JSON.stringify(lastSessions, null, 2));
}

check().catch(console.error).finally(() => process.exit(0));
