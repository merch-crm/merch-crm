"use server";

import { db } from "@/lib/db";
import { orders, orderItems, clients, users, inventoryItems, inventoryTransactions, orderAttachments } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, inArray, and, gte, lte } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function getOrders(from?: Date, to?: Date) {
    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const data = await db.query.orders.findMany({
            where: whereClause.length > 0 ? and(...whereClause) : undefined,
            with: {
                client: true,
                items: true,
                creator: true,
                attachments: true,
            },
            orderBy: desc(orders.createdAt),
        });
        return { data };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { error: "Failed to fetch orders" };
    }
}

// Helper to get clients for the dropdown
export async function getClientsForSelect() {
    return db.select({ id: clients.id, name: clients.name }).from(clients);
}

// Helper to get inventory for the dropdown
export async function getInventoryForSelect() {
    return db.select({ id: inventoryItems.id, name: inventoryItems.name, quantity: inventoryItems.quantity, unit: inventoryItems.unit }).from(inventoryItems);
}

export async function searchClients(query: string) {
    if (!query || query.length < 2) return { data: [] };

    try {
        const results = await db.query.clients.findMany({
            where: (c, { or, ilike }) => or(
                ilike(c.name, `%${query}%`),
                ilike(c.email, `%${query}%`),
                ilike(c.phone, `%${query}%`),
                ilike(c.city, `%${query}%`)
            ),
            limit: 5
        });
        return { data: results };
    } catch (error) {
        console.error("Error searching clients:", error);
        return { error: "Search failed" };
    }
}

export async function createOrder(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const clientId = formData.get("clientId") as string;
    const status = "new"; // Default status
    const priority = formData.get("priority") as string;
    const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : null;

    // Parse items from hidden JSON field (simplified for this demo)
    const itemsJson = formData.get("items") as string;
    let items: Array<{
        inventoryId?: string;
        quantity: number;
        price: number;
        description: string;
    }> = [];
    try {
        items = JSON.parse(itemsJson);
    } catch (e) {
        return { error: "Invalid items data" };
    }

    if (!clientId || items.length === 0) {
        return { error: "Клиент и товары обязательны" };
    }

    try {
        // Transaction would be better here, but Drizzle pg driver transaction support depends on exact setup
        // For now executing sequentially

        // 1. Create Order
        const [newOrder] = await db.insert(orders).values({
            clientId,
            status: "new",
            priority,
            deadline,
            createdBy: session.id,
            totalAmount: "0", // Calculate later
        }).returning();
        // Fetch client for logging
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
        });

        await logAction("Создан заказ", "order", newOrder.id, {
            name: `Заказ для ${client?.name || "неизвестного клиента"}`,
            orderNumber: `#${newOrder.id.slice(0, 8)}`
        });

        // 2. Create Order Items & Deduct Inventory
        let totalAmount = 0;

        for (const item of items) {
            // item: { inventoryId, quantity, price, description }
            await db.insert(orderItems).values({
                orderId: newOrder.id,
                description: item.description,
                quantity: item.quantity,
                price: String(item.price)
            });

            // Deduct from inventory if it's linked
            if (item.inventoryId) {
                // Deduct
                const [invItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, item.inventoryId));
                if (invItem) {
                    await db.update(inventoryItems)
                        .set({ quantity: invItem.quantity - item.quantity })
                        .where(eq(inventoryItems.id, item.inventoryId));

                    // Log transaction
                    await db.insert(inventoryTransactions).values({
                        itemId: item.inventoryId,
                        changeAmount: -item.quantity,
                        type: "out",
                        reason: `Order #${newOrder.id}`,
                        createdBy: session.id
                    });

                    await logAction("Списание", "inventory_item", item.inventoryId, {
                        reason: `Order #${newOrder.id}`,
                        quantity: -item.quantity
                    });
                }
            }

            totalAmount += (item.quantity * item.price);
        }

        // Update total
        await db.update(orders).set({ totalAmount: String(totalAmount) }).where(eq(orders.id, newOrder.id));

        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard/warehouse"); // Update warehouse counts
        return { success: true };
    } catch (error) {
        console.error("Error creating order:", error);
        return { error: "Failed to create order" };
    }
}


export async function updateOrderStatus(orderId: string, newStatus: (typeof orders.$inferInsert)["status"]) {
    try {
        await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
        revalidatePath("/dashboard/orders");
        // Also revalidate the specific order page
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to update status" };
    }
}

export async function getOrderById(id: string) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: {
                client: true,
                items: true,
                creator: true,
                attachments: true,
            }
        });
        return { data: order };
    } catch (e) {
        console.error(e);
        return { error: "Failed to fetch order" };
    }
}

export async function deleteOrder(orderId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const orderToDelete = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: { client: true }
        });

        await logAction("Удален заказ", "order", orderId, {
            name: `Заказ #${orderId.slice(0, 8)} (${orderToDelete?.client?.name || "неизвестного клиента"})`
        });
        await db.delete(orders).where(eq(orders.id, orderId));
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        console.error("Error deleting order:", error);
        return { error: "Failed to delete order" };
    }
}

export async function uploadOrderFile(orderId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { uploadFile } = await import("@/lib/s3");
        const { key, url } = await uploadFile(buffer, file.name, file.type);

        // const { orderAttachments } = await import("@/lib/schema"); // Already imported at the top
        await db.insert(orderAttachments).values({
            orderId,
            fileName: file.name,
            fileKey: key,
            fileUrl: url,
            fileSize: file.size,
            contentType: file.type,
            createdBy: session.id,
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        console.error("Error uploading order file:", error);
        return { error: "Failed to upload file" };
    }
}
