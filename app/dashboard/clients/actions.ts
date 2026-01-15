"use server";

import { db } from "@/lib/db";
import { clients, orders, users, orderItems, inventoryItems } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { asc, desc, eq, sql, or, and, ilike } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";


export async function getManagers() {
    try {
        const data = await db.query.users.findMany({
            columns: {
                id: true,
                name: true,
            },
            orderBy: (users, { asc }) => [asc(users.name)],
        });
        return { data };
    } catch (error) {
        console.error("Error fetching managers:", error);
        return { error: "Failed to fetch managers" };
    }
}


export async function getClients() {
    try {
        const data = await db.select({
            id: clients.id,
            lastName: clients.lastName,
            firstName: clients.firstName,
            patronymic: clients.patronymic,
            name: clients.name,
            company: clients.company,
            phone: clients.phone,
            telegram: clients.telegram,
            instagram: clients.instagram,
            email: clients.email,
            city: clients.city,
            address: clients.address,
            comments: clients.comments,
            socialLink: clients.socialLink,
            managerId: clients.managerId,
            createdAt: clients.createdAt,
            totalOrders: sql<number>`count(${orders.id})`,
            totalSpent: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
            lastOrderDate: sql<string>`max(${orders.createdAt})`
        })
            .from(clients)
            .leftJoin(orders, eq(orders.clientId, clients.id))
            .groupBy(clients.id)
            .orderBy(asc(clients.lastName), asc(clients.firstName));

        return { data };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/clients",
            method: "getClients"
        });
        console.error("Error fetching clients:", error);
        return { error: "Failed to fetch clients" };
    }
}

export async function checkClientDuplicates(data: { phone?: string, email?: string, lastName?: string, firstName?: string }) {
    try {
        const conditions = [];

        if (data.phone) {
            const phoneDigits = data.phone.replace(/\D/g, "");
            if (phoneDigits.length >= 6) { // Min 6 digits to check
                conditions.push(sql`regexp_replace(${clients.phone}, '\\D', '', 'g') LIKE ${'%' + phoneDigits + '%'}`);
            }
        }

        if (data.email && data.email.trim().length > 3) {
            conditions.push(ilike(clients.email, data.email.trim()));
        }

        if (data.lastName && data.firstName && data.lastName.trim().length > 1 && data.firstName.trim().length > 1) {
            conditions.push(and(
                ilike(clients.lastName, data.lastName.trim()),
                ilike(clients.firstName, data.firstName.trim())
            ));
        }

        if (conditions.length === 0) return { data: [] };

        const duplicates = await db.select().from(clients)
            .where(or(...conditions))
            .limit(5);

        return { data: duplicates };
    } catch (error) {
        console.error("Error checking duplicates:", error);
        return { error: "Ошибка при проверке дубликатов" };
    }
}

export async function addClient(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const patronymic = formData.get("patronymic") as string;
    const company = formData.get("company") as string;
    const phone = formData.get("phone") as string;
    const telegram = formData.get("telegram") as string;
    const instagram = formData.get("instagram") as string;
    const email = formData.get("email") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const comments = formData.get("comments") as string;
    const socialLink = formData.get("socialLink") as string;
    const managerId = formData.get("managerId") as string;
    const ignoreDuplicates = formData.get("ignoreDuplicates") === "true";

    if (!lastName || !firstName || !phone) {
        return { error: "Фамилия, Имя и Телефон обязательны" };
    }

    try {
        // Final duplicate check before insert
        if (!ignoreDuplicates) {
            const dupRes = await checkClientDuplicates({ phone, email, lastName, firstName });
            if (dupRes.data && dupRes.data.length > 0) {
                return {
                    error: "Похожий клиент уже существует",
                    duplicates: dupRes.data
                };
            }
        }

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");

        const [newClient] = await db.insert(clients).values({
            lastName,
            firstName,
            patronymic,
            name: fullName,
            company,
            phone,
            telegram,
            instagram,
            email,
            city,
            address,
            comments,
            socialLink,
            managerId: managerId || null,
        }).returning();

        await logAction("Создан клиент", "client", newClient.id, { name: fullName });

        revalidatePath("/dashboard/clients");
        revalidatePath("/dashboard/orders"); // For client selection
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/clients",
            method: "addClient",
            details: { lastName, firstName, phone, email }
        });
        console.error("Error adding client:", error);
        return { error: "Failed to add client" };
    }
}

export async function updateClient(clientId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const patronymic = formData.get("patronymic") as string;
    const company = formData.get("company") as string;
    const phone = formData.get("phone") as string;
    const telegram = formData.get("telegram") as string;
    const instagram = formData.get("instagram") as string;
    const email = formData.get("email") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const comments = formData.get("comments") as string;
    const socialLink = formData.get("socialLink") as string;
    const managerId = formData.get("managerId") as string;

    if (!lastName || !firstName || !phone) {
        return { error: "Фамилия, Имя и Телефон обязательны" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });

        if (!user || !user.role) return { error: "User role not found" };

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");

        await db.update(clients)
            .set({
                lastName,
                firstName,
                patronymic,
                name: fullName,
                company,
                phone,
                telegram,
                instagram,
                email,
                city,
                address,
                comments,
                socialLink,
                managerId: managerId || null,
            })
            .where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/clients/${clientId}`,
            method: "updateClient",
            details: { clientId, lastName, firstName, phone }
        });
        console.error("Error updating client:", error);
        return { error: "Failed to update client" };
    }
}

export async function updateClientComments(clientId: string, comments: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.update(clients)
            .set({ comments })
            .where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Error updating comments:", error);
        return { error: "Failed to update comments" };
    }
}

export async function getClientDetails(clientId: string) {
    try {
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
        });

        if (!client) return { error: "Client not found" };

        const clientOrders = await db.query.orders.findMany({
            where: eq(orders.clientId, clientId),
            orderBy: [desc(orders.createdAt)],
            with: {
                items: true,
            }
        });

        const stats = await db.select({
            count: sql<number>`count(*)`,
            total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`
        })
            .from(orders)
            .where(eq(orders.clientId, clientId));

        return {
            data: {
                ...client,
                orders: clientOrders,
                stats: stats[0]
            }
        };
    } catch (error) {
        console.error("Error fetching client details:", error);
        return { error: "Failed to fetch client details" };
    }
}

export async function getClientStats() {
    try {
        const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients);

        // New this month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const newThisMonth = await db.select({ count: sql<number>`count(*)` })
            .from(clients)
            .where(sql`${clients.createdAt} >= ${firstDayOfMonth.toISOString()}`);

        const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);

        const totalRevenue = await db.select({
            sum: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`
        }).from(orders);

        const avgRevenue = totalClients[0].count > 0
            ? parseFloat(totalRevenue[0].sum) / totalClients[0].count
            : 0;

        const avgCheck = totalOrders[0].count > 0
            ? parseFloat(totalRevenue[0].sum) / totalOrders[0].count
            : 0;

        return {
            data: {
                totalClients: totalClients[0].count,
                newThisMonth: newThisMonth[0].count,
                avgCheck: Math.round(avgCheck),
                totalRevenue: Math.round(parseFloat(totalRevenue[0].sum)),
                totalOrders: totalOrders[0].count,
                avgRevenue: Math.round(avgRevenue)
            }
        };
    } catch (error) {
        console.error("Error getting client stats:", error);
        return { error: "Failed to get client stats" };
    }
}
export async function deleteClient(clientId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Get user role with permissions
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });

        if (!user || !user.role) return { error: "User role not found" };

        // Strict role check: Only Administrator can delete clients
        if (user.role.name !== "Администратор") {
            return { error: "Только администратор может удалять клиентов" };
        }

        // Cascade delete: first delete all orders (orderItems will trigger cascade if set in DB, but safe to assume we just delete orders first)
        // Note: orderItems has onDelete: "cascade" in schema, so deleting orders matches.

        const clientToDelete = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
            with: { orders: true } // Fetch orders to process them
        });

        if (clientToDelete && clientToDelete.orders.length > 0) {
            const reservationStatuses = ["new", "design", "production"];

            for (const order of clientToDelete.orders) {
                // If the order has items reserved, release them
                if (reservationStatuses.includes(order.status)) {
                    // We need to fetch items for this order locally or import the logic
                    // Since we can"t easily import releaseOrderReservation from another server action file without circular deps often,
                    // we will inline the logic or use a shared helper if possible.
                    // For now, inline the logic:
                    const items = await db.query.orderItems.findMany({
                        where: eq(orderItems.orderId, order.id),
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
                // Log order deletion
                await logAction("Удален заказ (из удаления клиента)", "order", order.id);
            }
            // Now delete orders
            await db.delete(orders).where(eq(orders.clientId, clientId));
        }
        await db.delete(clients).where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/clients/${clientId}`,
            method: "deleteClient",
            details: { clientId }
        });
        console.error("Error deleting client:", error);
        return { error: "Failed to delete client" };
    }
}
