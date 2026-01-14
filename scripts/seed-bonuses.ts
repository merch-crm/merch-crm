
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
    const { db } = await import("../lib/db");
    const { orders, users, clients } = await import("../lib/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Seeding done orders for bonuses...");

    try {
        const allUsers = await db.select().from(users).where(eq(users.email, "admin@crm.local")); // Fallback if needed
        const testUsers = await db.select().from(users);
        const allClients = await db.select().from(clients);

        if (allClients.length === 0) {
            console.log("No clients found. Please seed clients first.");
            return;
        }

        for (const user of testUsers) {
            if (!user.email.startsWith("test_")) continue;

            const numOrders = Math.floor(Math.random() * 10) + 1; // 1-10 orders
            console.log(`Creating ${numOrders} done orders for ${user.name}...`);

            for (let i = 0; i < numOrders; i++) {
                const client = allClients[Math.floor(Math.random() * allClients.length)];
                await db.insert(orders).values({
                    clientId: client.id,
                    status: "done",
                    category: "merch",
                    totalAmount: (Math.floor(Math.random() * 5000) + 1000).toString(),
                    createdBy: user.id,
                    createdAt: new Date(),
                });
            }
        }

        console.log("\n✓ Bonus seeding completed!");
    } catch (error) {
        console.error("Error seeding bonuses:", error);
    }

    process.exit(0);
}

main();
