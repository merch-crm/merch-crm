"use server";

import { db } from "@/lib/db";
import { orders, orderItems, clients, users, inventoryItems, inventoryTransactions, orderAttachments } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, inArray, and, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function getOrders(from?: Date, to?: Date, page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;

        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const finalWhere = whereClause.length > 0 ? and(...whereClause) : undefined;

        // 1. Get Total Count
        // Note: db.query.orders.findMany doesn"t support count easily with filters without raw sql or selecting count
        // Using db.select count
        const totalRes = await db.select({ count: sql<number>`count(*)` })
            .from(orders)
            .where(finalWhere);
        const total = Number(totalRes[0]?.count || 0);

        // 2. Get Paginated Data
        const data = await db.query.orders.findMany({
            where: finalWhere,
            with: {
                client: true,
                items: true,
                creator: true,
                attachments: true,
            },
            orderBy: desc(orders.createdAt),
            limit,
            offset
        });

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
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
        revalidatePath("/dashboard/admin/warehouse"); // Update warehouse counts
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

export async function updateOrderPriority(orderId: string, newPriority: string) {
    try {
        await db.update(orders).set({ priority: newPriority }).where(eq(orders.id, orderId));
        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to update priority" };
    }
}

export async function bulkUpdateOrderStatus(orderIds: string[], newStatus: (typeof orders.$inferInsert)["status"]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(orders).set({ status: newStatus }).where(inArray(orders.id, orderIds));

        for (const orderId of orderIds) {
            await logAction("Обновлен статус (массово)", "order", orderId, {
                status: newStatus
            });
            revalidatePath(`/dashboard/orders/${orderId}`);
        }

        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update status" };
    }
}

export async function bulkUpdateOrderPriority(orderIds: string[], newPriority: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(orders).set({ priority: newPriority }).where(inArray(orders.id, orderIds));

        for (const orderId of orderIds) {
            await logAction("Обновлен приоритет (массово)", "order", orderId, {
                priority: newPriority
            });
            revalidatePath(`/dashboard/orders/${orderId}`);
        }

        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update priority" };
    }
}

export async function bulkDeleteOrders(orderIds: string[]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Check if admin - we should probably check role name or permissions
    // For now, let's assume the component will check, but we should double check session here too
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (user?.role?.name !== "administrator") {
        return { error: "Доступ запрещен. Только администратор может удалять заказы." };
    }

    try {
        for (const orderId of orderIds) {
            await logAction("Удален заказ (массово)", "order", orderId);
        }
        await db.delete(orders).where(inArray(orders.id, orderIds));
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting orders:", error);
        return { error: "Failed to delete orders" };
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

// Separate stats fetcher to avoid fetching all orders for pagination
export async function getOrderStats(from?: Date, to?: Date) {
    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const finalWhere = whereClause.length > 0 ? and(...whereClause) : undefined;

        const allOrders = await db.select({
            status: orders.status,
            totalAmount: orders.totalAmount
        }).from(orders).where(finalWhere);

        return {
            total: allOrders.length,
            new: allOrders.filter(o => o.status === "new").length,
            inProduction: allOrders.filter(o => ["design", "production"].includes(o.status)).length,
            completed: allOrders.filter(o => ["done", "shipped"].includes(o.status)).length,
            revenue: allOrders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0)
        };
    } catch (error) {
        console.error("Error fetching order stats:", error);
        return { total: 0, new: 0, inProduction: 0, completed: 0, revenue: 0 };
    }
}
