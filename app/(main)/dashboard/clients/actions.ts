"use server";

import { db } from "@/lib/db";
import { clients, orders, users, orderItems, inventoryItems, payments } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { asc, desc, eq, sql, or, and, ilike, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { ClientSchema, ClientUpdateSchema } from "./validation";
import { ActionResult } from "@/lib/types";


export async function getManagers(): Promise<ActionResult<{ id: string; name: string }[]>> {
    try {
        const data = await db.query.users.findMany({
            columns: {
                id: true,
                name: true,
            },
            orderBy: (users, { asc }) => [asc(users.name)],
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching managers:", error);
        return { success: false, error: "Failed to fetch managers" };
    }
}


export interface ClientListItem extends Omit<typeof clients.$inferSelect, 'updatedAt'> {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

export async function getClients(showArchived = false): Promise<ActionResult<ClientListItem[]>> {
    try {
        const data = await db.select({
            id: clients.id,
            lastName: clients.lastName,
            firstName: clients.firstName,
            patronymic: clients.patronymic,
            clientType: clients.clientType,
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
            acquisitionSource: clients.acquisitionSource,
            managerId: clients.managerId,
            isArchived: clients.isArchived,
            createdAt: clients.createdAt,
            totalOrders: sql<number>`count(${orders.id})`,
            totalSpent: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
            lastOrderDate: sql<string>`max(${orders.createdAt})`
        })
            .from(clients)
            .leftJoin(orders, eq(orders.clientId, clients.id))
            .where(eq(clients.isArchived, showArchived))
            .groupBy(clients.id)
            .orderBy(asc(clients.lastName), asc(clients.firstName));

        const session = await getSession();
        const userRole = session?.roleName;
        const shouldHidePhone = ["Печатник", "Дизайнер"].includes(userRole || "");

        const safeData = data.map(client => ({
            ...client,
            phone: shouldHidePhone ? "HIDDEN" : client.phone
        }));

        return { success: true, data: safeData };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/clients",
            method: "getClients"
        });
        return { success: false, error: "Failed to fetch clients" };
    }
}

export async function checkClientDuplicates(data: { phone?: string, email?: string, lastName?: string, firstName?: string }): Promise<ActionResult<(typeof clients.$inferSelect)[]>> {
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

        if (conditions.length === 0) return { success: true, data: [] };

        const duplicates = await db.select().from(clients)
            .where(and(or(...conditions), eq(clients.isArchived, false)))
            .limit(5);

        return { success: true, data: duplicates };
    } catch (error) {
        console.error("Error checking duplicates:", error);
        return { success: false, error: "Ошибка при проверке дубликатов" };
    }
}

export async function addClient(formData: FormData): Promise<ActionResult<{ duplicates?: (typeof clients.$inferSelect)[] } | void>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const validation = ClientSchema.safeParse(Object.fromEntries(formData));

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        lastName, firstName, patronymic, company, phone,
        telegram, instagram, email, city, address, comments,
        socialLink, acquisitionSource, managerId, clientType,
        ignoreDuplicates
    } = validation.data;

    try {
        // Final duplicate check before insert
        if (!ignoreDuplicates) {
            const dupRes = await checkClientDuplicates({
                phone,
                email: email || undefined,
                lastName,
                firstName
            });
            if (dupRes.success && dupRes.data && dupRes.data.length > 0) {
                return {
                    success: true,
                    data: { duplicates: dupRes.data }
                };
            }
        }

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");

        const [newClient] = await db.insert(clients).values({
            clientType,
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
            acquisitionSource,
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
        return { success: false, error: "Failed to add client" };
    }
}

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const validation = ClientUpdateSchema.safeParse(Object.fromEntries(formData));

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        lastName, firstName, patronymic, company, phone,
        telegram, instagram, email, city, address, comments,
        socialLink, acquisitionSource, managerId, clientType
    } = validation.data;

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });

        if (!user || !user.role) return { success: false, error: "User role not found" };

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");

        await db.update(clients)
            .set({
                clientType,
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
                acquisitionSource,
                managerId: managerId || null,
                updatedAt: new Date(),
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
        return { success: false, error: "Failed to update client" };
    }
}

export async function updateClientComments(clientId: string, comments: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(clients)
            .set({ comments, updatedAt: new Date() })
            .where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Error updating comments:", error);
        return { success: false, error: "Failed to update comments" };
    }
}

export interface ClientDetails {
    id: string;
    name: string | null;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    company: string | null;
    phone: string;
    telegram: string | null;
    instagram: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
    comments: string | null;
    socialLink: string | null;
    acquisitionSource: string | null;
    managerId: string | null;
    clientType: "b2c" | "b2b";
    isArchived: boolean;
    createdAt: Date;
    orders: (typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect)[] })[];
    stats: {
        count: number;
        total: string;
        balance: number;
    };
}

export async function getClientDetails(clientId: string): Promise<ActionResult<ClientDetails>> {
    try {
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
        });

        if (!client) return { success: false, error: "Client not found" };

        const session = await getSession();
        const userRole = session?.roleName;
        const shouldHidePhone = ["Печатник", "Дизайнер"].includes(userRole || "");

        if (shouldHidePhone) {
            client.phone = "HIDDEN";
        }

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

        const totalOrders = Number(stats[0]?.total || 0);

        const paymentsRes = await db.select({
            total: sql<string>`coalesce(sum(${payments.amount}), 0)`
        })
            .from(payments)
            .leftJoin(orders, eq(payments.orderId, orders.id))
            .where(eq(orders.clientId, clientId));

        const totalPaid = Number(paymentsRes[0]?.total || 0);
        const balance = totalPaid - totalOrders;

        return {
            success: true,
            data: {
                ...client,
                orders: clientOrders,
                stats: {
                    ...stats[0],
                    balance
                }
            }
        };
    } catch (error) {
        console.error("Error fetching client details:", error);
        return { success: false, error: "Failed to fetch client details" };
    }
}

export interface ClientStats {
    totalClients: number;
    newThisMonth: number;
    avgCheck: number;
    totalRevenue: number;
    totalOrders: number;
    avgRevenue: number;
}

export async function getClientStats(): Promise<ActionResult<ClientStats>> {
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
            success: true,
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
        return { success: false, error: "Failed to get client stats" };
    }
}
export async function deleteClient(clientId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });

        if (!user || user.role?.name !== "Администратор") {
            return { success: false, error: "Только администратор может удалять клиентов" };
        }

        await db.transaction(async (tx) => {
            const clientToDelete = await tx.query.clients.findFirst({
                where: eq(clients.id, clientId),
                with: { orders: true }
            });

            if (clientToDelete && clientToDelete.orders.length > 0) {
                const orderIds = clientToDelete.orders.map(o => o.id);
                await releaseReservationsForOrders(orderIds, tx);

                for (const orderId of orderIds) {
                    await logAction("Удален заказ (из удаления клиента)", "order", orderId);
                }
                await tx.delete(orders).where(eq(orders.clientId, clientId));
            }
            await tx.delete(clients).where(eq(clients.id, clientId));
        });

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
        return { success: false, error: "Failed to delete client" };
    }
}

export async function bulkDeleteClients(clientIds: string[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });

        if (!user || user.role?.name !== "Администратор") {
            return { success: false, error: "Только администратор может удалять базу" };
        }

        await db.transaction(async (tx) => {
            const clientOrders = await tx.query.orders.findMany({
                where: inArray(orders.clientId, clientIds)
            });

            if (clientOrders.length > 0) {
                const orderIds = clientOrders.map(o => o.id);
                await releaseReservationsForOrders(orderIds, tx);

                await tx.delete(orders).where(inArray(orders.clientId, clientIds));
            }

            await tx.delete(clients).where(inArray(clients.id, clientIds));
        });

        revalidatePath("/dashboard/clients");
        await logAction("Групповое удаление клиентов", "client", "bulk", { count: clientIds.length });
        return { success: true };
    } catch (error) {
        console.error("Error in bulk delete:", error);
        return { success: false, error: "Failed to delete clients" };
    }
}

import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/schema";

type Transaction = NodePgDatabase<typeof schema> | Parameters<Parameters<NodePgDatabase<typeof schema>['transaction']>[0]>[0];

/** Helper to release inventory reservations for multiple orders atomically */
async function releaseReservationsForOrders(orderIds: string[], tx: Transaction) {
    const reservationStatuses = ["new", "design", "production"] as const;

    // Find all orders that have reserved status
    const targetOrders = await tx.query.orders.findMany({
        where: and(inArray(orders.id, orderIds), inArray(orders.status, reservationStatuses))
    });

    if (targetOrders.length === 0) return;

    const actualOrderIds = targetOrders.map(o => o.id);

    // Find all items for these orders
    const items = await tx.query.orderItems.findMany({
        where: inArray(orderItems.orderId, actualOrderIds)
    });

    for (const item of items) {
        if (item.inventoryId) {
            await tx.update(inventoryItems)
                .set({
                    reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${item.quantity})`
                })
                .where(eq(inventoryItems.id, item.inventoryId));
        }
    }
}

export async function bulkUpdateClientManager(clientIds: string[], managerId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(clients)
            .set({ managerId: managerId || null, updatedAt: new Date() })
            .where(inArray(clients.id, clientIds));

        revalidatePath("/dashboard/clients");
        await logAction("Групповая смена менеджера", "client", "bulk", { count: clientIds.length, managerId });
        return { success: true };
    } catch (error) {
        console.error("Error in bulk manager update:", error);
        return { success: false, error: "Failed to update clients" };
    }
}

export async function toggleClientArchived(clientId: string, isArchived: boolean): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(clients)
            .set({ isArchived, updatedAt: new Date() })
            .where(eq(clients.id, clientId));

        await logAction(isArchived ? "Архивация клиента" : "Разархивация клиента", "client", clientId, { isArchived });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Error toggling client archive:", error);
        return { success: false, error: "Failed to archive client" };
    }
}

export async function updateClientField(clientId: string, field: string, value: string | number | boolean | null): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const allowedFields = ["managerId", "clientType", "city", "lastName", "firstName", "company"];
        if (!allowedFields.includes(field)) return { success: false, error: "Invalid field" };

        await db.update(clients)
            .set({ [field]: value || null, updatedAt: new Date() })
            .where(eq(clients.id, clientId));

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Error updating client field:", error);
        return { success: false, error: "Failed to update client field" };
    }
}

export async function bulkArchiveClients(clientIds: string[], isArchived: boolean = true): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(clients)
            .set({ isArchived, updatedAt: new Date() })
            .where(inArray(clients.id, clientIds));

        await logAction(isArchived ? "Групповая архивация клиентов" : "Групповая разархивация клиентов", "client", "bulk", { count: clientIds.length, isArchived });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Error in bulk archive:", error);
        return { success: false, error: "Failed to archive clients" };
    }
}
