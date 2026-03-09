import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, uuid, text, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import pg from "pg";
import { like } from "drizzle-orm";

// 1. Define minimal schema for seed
const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});

const clients = pgTable("clients", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});

const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});

const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id"),
    status: text("status").notNull().default("new"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    managerId: uuid("manager_id"),
    createdBy: uuid("created_by"),
    orderNumber: text("order_number").unique(),
});

const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id"),
    inventoryId: uuid("inventory_id"),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
});

async function seedTestOrder() {
    console.log("Starting standalone seed...");

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false // Based on previous attempts failing with SSL
    });

    const db = drizzle(pool);

    try {
        // 1. Find a t-shirt item
        const items = await db.select().from(inventoryItems).where(like(inventoryItems.name, "%Футболка%")).limit(1);
        const targetItem = items[0] || (await db.select().from(inventoryItems).limit(1))[0];

        if (!targetItem) {
            console.error("No items found in inventory");
            return;
        }
        console.log(`Using item: ${targetItem.name} (${targetItem.id})`);

        // 2. Find a client
        const allClients = await db.select().from(clients).limit(1);
        const client = allClients[0];
        if (!client) {
            console.error("No clients found");
            return;
        }
        console.log(`Using client: ${client.name} (${client.id})`);

        // 3. Find a user
        const allUsers = await db.select().from(users).limit(1);
        const user = allUsers[0];
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
        console.error("Standalone seed failed:", error);
    } finally {
        await pool.end();
    }
}

seedTestOrder();
