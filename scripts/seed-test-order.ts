import "dotenv/config";
import { db } from "../lib/db";
import { orders, orderItems, clients, inventoryItems, users } from "../lib/schema";
import { like } from "drizzle-orm";

async function seedTestOrder() {
    console.log("Starting seed with dotenv/config...");

    try {
        // 1. Find a t-shirt item (or any item)
        const item = await db.query.inventoryItems.findFirst({
            where: like(inventoryItems.name, "%Футболка%"),
        });

        const targetItem = item || await db.query.inventoryItems.findFirst();

        if (!targetItem) {
            console.error("No items found in inventory");
            return;
        }
        console.log(`Using item: ${targetItem.name} (${targetItem.id})`);

        // 2. Find a client
        const client = await db.query.clients.findFirst();
        if (!client) {
            console.error("No clients found");
            return;
        }
        console.log(`Using client: ${client.name} (${client.id})`);

        // 3. Find a user (manager)
        const user = await db.query.users.findFirst();
        if (!user) {
            console.error("No users found");
            return;
        }

        // 4. Create order
        const [newOrder] = await db.insert(orders).values({
            clientId: client.id,
            status: "new",
            totalAmount: "5000.00",
            managerId: user.id,
            createdBy: user.id,
            orderNumber: `TEST-${Date.now()}`,
        }).returning();

        console.log(`Order created: ${newOrder.orderNumber} (${newOrder.id})`);

        // 5. Create order item
        await db.insert(orderItems).values({
            orderId: newOrder.id,
            inventoryId: targetItem.id,
            quantity: 10,
            price: "1000.00",
            description: "Тестовая футболка для резерва",
        });

        console.log(`Order item created for 10 units of ${targetItem.name}`);
        console.log(`RESULT_ITEM_ID=${targetItem.id}`);
    } catch (error) {
        console.error("Failed to seed order:", error);
        throw error;
    }
}

seedTestOrder().then(() => {
    console.log("Seed completed successfully!");
    process.exit(0);
}).catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
});
