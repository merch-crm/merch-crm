"use server";

import { db } from "@/lib/db";
import { orders, orderItems, clients, users, inventoryItems, inventoryTransactions, orderAttachments, inventoryStocks } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, inArray, and, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";

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
        await logError({
            error,
            path: "/dashboard/orders",
            method: "getOrders",
            details: { from, to, page, limit }
        });
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
    } catch {
        return { error: "Invalid items data" };
    }

    if (!clientId || items.length === 0) {
        return { error: "Клиент и товары обязательны" };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Create Order
            const [newOrder] = await tx.insert(orders).values({
                clientId,
                status: "new",
                priority,
                deadline,
                createdBy: session.id,
                totalAmount: "0",
            }).returning();

            // Fetch client for logging
            const client = await tx.query.clients.findFirst({
                where: eq(clients.id, clientId),
            });

            await logAction("Создан заказ", "order", newOrder.id, {
                name: `Заказ для ${client?.name || "неизвестного клиента"}`,
                orderNumber: `#${newOrder.id.slice(0, 8)}`
            });

            // 2. Create Order Items & Deduct Inventory
            let totalAmount = 0;

            for (const item of items) {
                await tx.insert(orderItems).values({
                    orderId: newOrder.id,
                    description: item.description,
                    quantity: item.quantity,
                    price: String(item.price),
                    inventoryId: item.inventoryId || null
                });

                // Reserve in inventory if it's linked
                if (item.inventoryId) {
                    const [invItem] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, item.inventoryId));
                    if (invItem) {
                        await tx.update(inventoryItems)
                            .set({ reservedQuantity: (invItem.reservedQuantity || 0) + item.quantity })
                            .where(eq(inventoryItems.id, item.inventoryId));

                        await logAction("Резерв", "inventory_item", item.inventoryId, {
                            reason: `Заказ #${newOrder.id.slice(0, 8)}`,
                            quantity: item.quantity
                        });
                    }
                }

                totalAmount += (item.quantity * item.price);
            }

            // Update total
            await tx.update(orders).set({ totalAmount: String(totalAmount) }).where(eq(orders.id, newOrder.id));
        });

        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard/admin/warehouse"); // Update warehouse counts
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/orders/new",
            method: "createOrder",
            details: { clientId, priority }
        });
        console.error("Error creating order:", error);
        return { error: "Failed to create order" };
    }
}


export async function updateOrderStatus(orderId: string, newStatus: (typeof orders.$inferInsert)["status"]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: { items: { with: { inventoryItem: true } } }
            });

            if (!order) throw new Error("Заказ не найден");
            const oldStatus = order.status;

            if (oldStatus === newStatus) return;

            // Stock Adjustment Logic
            const deductionStatuses: string[] = ["shipped", "done"];
            const oldStatusString = oldStatus as string || ""; // Ensure string
            const isDeduction = deductionStatuses.includes(newStatus as string) && !deductionStatuses.includes(oldStatusString);
            const isCancellation = ((newStatus as string) === "cancelled") && (oldStatusString !== "cancelled") && !deductionStatuses.includes(oldStatusString);

            for (const item of order.items) {
                if (item.inventoryId && item.inventoryItem) {
                    const qty = item.quantity;

                    if (isDeduction) {
                        // Reduce reservation AND reduce physical quantity
                        await tx.update(inventoryItems)
                            .set({
                                reservedQuantity: Math.max(0, (item.inventoryItem.reservedQuantity || 0) - qty),
                                quantity: Math.max(0, (item.inventoryItem.quantity || 0) - qty)
                            })
                            .where(eq(inventoryItems.id, item.inventoryId));

                        let sourceLocationId = item.inventoryItem.storageLocationId;

                        let stockToDeduct = null;

                        if (sourceLocationId) {
                            const [s] = await tx.select().from(inventoryStocks).where(and(
                                eq(inventoryStocks.itemId, item.inventoryId),
                                eq(inventoryStocks.storageLocationId, sourceLocationId)
                            ));
                            if (s && s.quantity >= qty) {
                                stockToDeduct = s;
                            }
                        }

                        if (!stockToDeduct) {
                            // Fallback: Find best stock
                            const [bestStock] = await tx.select().from(inventoryStocks)
                                .where(and(
                                    eq(inventoryStocks.itemId, item.inventoryId),
                                    gte(inventoryStocks.quantity, qty)
                                ))
                                .orderBy(desc(inventoryStocks.quantity))
                                .limit(1);

                            if (bestStock) {
                                stockToDeduct = bestStock;
                                sourceLocationId = bestStock.storageLocationId;
                            }
                        }

                        // Sync with inventoryStocks
                        if (stockToDeduct) {
                            await tx.update(inventoryStocks)
                                .set({ quantity: Math.max(0, stockToDeduct.quantity - qty) })
                                .where(eq(inventoryStocks.id, stockToDeduct.id));
                        } else {
                            console.warn(`Order ${orderId}: Item ${item.inventoryId} shipped without sufficient physical stock record.`);
                        }

                        // Log transaction
                        await tx.insert(inventoryTransactions).values({
                            itemId: item.inventoryId,
                            changeAmount: -qty,
                            type: "out",
                            reason: `Отгрузка: Заказ #${orderId.slice(0, 8)}`,
                            createdBy: session.id,
                            storageLocationId: sourceLocationId || null
                        });
                    } else if (isCancellation) {
                        // Just release reservation
                        await tx.update(inventoryItems)
                            .set({
                                reservedQuantity: Math.max(0, (item.inventoryItem.reservedQuantity || 0) - qty)
                            })
                            .where(eq(inventoryItems.id, item.inventoryId));
                    }
                }
            }

            await tx.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));

            await logAction("Обновлен статус", "order", orderId, {
                from: String(oldStatus),
                to: String(newStatus)
            });
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/orders/${orderId}`,
            method: "updateOrderStatus",
            details: { orderId, newStatus }
        });
        console.error("Error updating order status:", error);
        return { error: "Failed to update status" };
    }
}

export async function updateOrderPriority(orderId: string, newPriority: string) {
    try {
        await db.update(orders).set({ priority: newPriority }).where(eq(orders.id, orderId));
        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch {
        return { error: "Failed to update priority" };
    }
}

export async function bulkUpdateOrderStatus(orderIds: string[], newStatus: (typeof orders.$inferInsert)["status"]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        for (const orderId of orderIds) {
            const res = await updateOrderStatus(orderId, newStatus);
            if (res.error) {
                console.error(`Failed to update order ${orderId}: ${res.error}`);
            }
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

    if (user?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен. Только администратор может удалять заказы." };
    }

    try {
        const ordersToDelete = await db.query.orders.findMany({
            where: inArray(orders.id, orderIds)
        });

        const reservationStatuses = ["new", "design", "production"];

        for (const order of ordersToDelete) {
            if (reservationStatuses.includes(order.status)) {
                await releaseOrderReservation(order.id);
            }
            await logAction("Удален заказ (массово)", "order", order.id);
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

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (user?.role?.name !== "Администратор") {
        return { error: "Доступ запрещен. Только администратор может удалять заказы." };
    }

    try {
        const orderToDelete = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: { client: true }
        });

        if (orderToDelete) {
            // If order is in a state where items are reserved, release them
            const reservationStatuses = ["new", "design", "production"];
            if (reservationStatuses.includes(orderToDelete.status)) {
                await releaseOrderReservation(orderId);
            }

            await logAction("Удален заказ", "order", orderId, {
                name: `Заказ #${orderId.slice(0, 8)} (${orderToDelete?.client?.name || "неизвестного клиента"})`
            });
            await db.delete(orders).where(eq(orders.id, orderId));
        }
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/orders/${orderId}`,
            method: "deleteOrder",
            details: { orderId }
        });
        console.error("Error deleting order:", error);
        return { error: "Failed to delete order" };
    }
}

async function releaseOrderReservation(orderId: string) {
    const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
        with: { inventoryItem: true }
    });

    for (const item of items) {
        if (item.inventoryId && item.inventoryItem) {
            await db.update(inventoryItems)
                .set({
                    reservedQuantity: Math.max(0, (item.inventoryItem.reservedQuantity || 0) - item.quantity)
                })
                .where(eq(inventoryItems.id, item.inventoryId));
        }
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

        await logAction("Загружен файл заказа", "s3_storage", orderId, {
            fileName: file.name,
            fileKey: key,
            orderId
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
