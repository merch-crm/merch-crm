import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./lib/db";
import { inventoryTransactions, inventoryItems } from "./lib/schema";
import { desc, isNotNull } from "drizzle-orm";

async function main() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

    const transactions = await db.query.inventoryTransactions.findMany({
        with: {
            item: true
        },
        orderBy: [desc(inventoryTransactions.createdAt)],
        limit: 50
    });

    console.log("Recent Transactions:");
    transactions.forEach(t => {
        if (t.costPrice) {
            console.log(`- Date: ${t.createdAt.toLocaleString()}, Item: ${t.item?.name}, Qty: ${t.changeAmount}, Price: ${t.costPrice}, Reason: ${t.reason}`);
        }
    });

    // Also check the specific item current cost price
    // Since we don't have the ID, let's find the one most likely being viewed
    // It's probably the one with recent "in" transaction or most recently updated
    const items = await db.query.inventoryItems.findMany({
        orderBy: [desc(inventoryItems.updatedAt)],
        limit: 5
    });

    console.log("\nRecently Updated Items:");
    items.forEach(i => {
        console.log(`- ID: ${i.id}, Name: ${i.name}, CostPrice: ${i.costPrice}`);
    });
}

main().catch(err => {
    console.error("Internal Error:", err);
});
