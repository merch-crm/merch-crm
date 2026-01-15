import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../lib/db";
import { inventoryTransactions } from "../lib/schema";
import { desc } from "drizzle-orm";

async function check() {
    const last = await db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt)).limit(10);
    console.log(JSON.stringify(last, null, 2));
    process.exit(0);
}

check();
