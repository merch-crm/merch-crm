"use server";

import { sql, and, or, ilike, eq, lt, gt, desc, asc, type SQL, count, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { ClientSchema, ClientUpdateSchema, ClientFiltersSchema, ClientIdSchema, UpdateClientFieldSchema } from "../validation";
import {
    ClientSummary,
    ClientStats,
    ClientProfileOrder,
    ClientType,
    ClientProfile,
    ActionResult,
    AuditLogDetails
} from "@/lib/types";
import { releaseReservationsForOrders } from "./utils";

const { clients, orders, payments, auditLogs } = schema;

export async function getManagers(): Promise<ActionResult<{ id: string; name: string }[]>> {
    try {
        const data = await db.query.users.findMany({
            columns: { id: true, name: true },
            where: (users, { eq }) => eq(users.isSystem, false),
            orderBy: (users, { asc }) => [asc(users.name)],
            limit: 100,
        });
        return { success: true, data };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "getManagers" });
        return { success: false, error: "Не удалось загрузить менеджеров" };
    }
}

export async function getRegions(): Promise<ActionResult<string[]>> {
    try {
        const result = await db.selectDistinct({ city: clients.city }).from(clients)
            .where(sql`${clients.city} IS NOT NULL AND ${clients.city} != ''`)
            .orderBy(asc(clients.city)).limit(100);
        return { success: true, data: result.map(r => r.city as string) };
    } catch (error) {
        logError({ error, path: "getRegions" });
        return { success: false, error: "Не удалось загрузить регионы" };
    }
}

export async function getClients(filters: Record<string, unknown> = {}): Promise<ActionResult<{
    clients: ClientSummary[];
    total: number;
    totalPages: number;
    currentPage: number;
}>> {
    const validated = ClientFiltersSchema.safeParse(filters);
    const params = validated.success ? validated.data : ClientFiltersSchema.parse({});

    try {
        const { page, limit, search, sortBy, period, orderCount, region, status, showArchived } = params;
        const offset = (page - 1) * limit;
        const baseConditions: (SQL | undefined)[] = [eq(clients.isArchived, showArchived)];

        if (search) {
            const pattern = `%${search}%`;
            baseConditions.push(or(ilike(clients.name, pattern), ilike(clients.lastName, pattern), ilike(clients.firstName, pattern), ilike(clients.company, pattern), ilike(clients.phone, pattern), ilike(clients.email, pattern)));
        }
        if (region && region !== "all") baseConditions.push(eq(clients.city, region));

        const havingConditions: (SQL | undefined)[] = [];
        if (period !== "all") {
            const filterDate = new Date();
            if (period === "month") filterDate.setMonth(new Date().getMonth() - 1);
            else if (period === "quarter") filterDate.setMonth(new Date().getMonth() - 3);
            else if (period === "year") filterDate.setFullYear(new Date().getFullYear() - 1);
            havingConditions.push(gt(sql<Date>`max(${orders.createdAt})`, filterDate));
        }

        if (orderCount !== "any") {
            if (orderCount === "0") havingConditions.push(eq(sql<number>`count(${orders.id})`, 0));
            else if (orderCount === "1-5") { havingConditions.push(gte(sql<number>`count(${orders.id})`, 1)); havingConditions.push(lte(sql<number>`count(${orders.id})`, 5)); }
            else if (orderCount === "5+") havingConditions.push(gt(sql<number>`count(${orders.id})`, 5));
        }

        if (status === "lost") {
            const limit = new Date(); limit.setMonth(limit.getMonth() - 3);
            havingConditions.push(lt(sql<Date>`max(${orders.createdAt})`, limit));
        }

        const query = db.select({
            id: clients.id, lastName: clients.lastName, firstName: clients.firstName, patronymic: clients.patronymic,
            clientType: clients.clientType, name: clients.name, company: clients.company, phone: clients.phone,
            telegram: clients.telegram, instagram: clients.instagram, email: clients.email, city: clients.city,
            address: clients.address, comments: clients.comments, socialLink: clients.socialLink,
            acquisitionSource: clients.acquisitionSource, managerId: clients.managerId, isArchived: clients.isArchived,
            createdAt: clients.createdAt, totalOrders: count(orders.id),
            totalSpent: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
            lastOrderDate: sql<Date>`max(${orders.createdAt})`
        }).from(clients).leftJoin(orders, eq(orders.clientId, clients.id)).where(and(...baseConditions)).groupBy(clients.id).$dynamic();

        if (havingConditions.length > 0) query.having(and(...havingConditions));

        if (sortBy === "alphabet") query.orderBy(asc(clients.lastName), asc(clients.firstName));
        else if (sortBy === "last_order") query.orderBy(desc(sql`max(${orders.createdAt})`));
        else if (sortBy === "order_count") query.orderBy(desc(sql<number>`count(${orders.id})`));
        else if (sortBy === "revenue") query.orderBy(desc(sql`coalesce(sum(${orders.totalAmount}), 0)`));
        else query.orderBy(asc(clients.lastName));

        const data = await query.limit(limit).offset(offset);

        let total = 0;
        if (havingConditions.length > 0) {
            const sub = db.select({ id: clients.id }).from(clients).leftJoin(orders, eq(orders.clientId, clients.id)).where(and(...baseConditions)).groupBy(clients.id).having(and(...havingConditions));
            const res = await db.select({ count: sql<number>`count(*)` }).from(sub.as('sub')).limit(1);
            total = Number(res[0]?.count || 0);
        } else {
            const res = await db.select({ count: sql<number>`count(distinct ${clients.id})` }).from(clients).where(and(...baseConditions)).limit(1);
            total = Number(res[0]?.count || 0);
        }

        const session = await getSession();
        const shouldHidePhone = ["Печатник", "Дизайнер"].includes(session?.roleName || "");

        const safeData: ClientSummary[] = (data ?? []).map(c => ({
            ...c,
            displayName: String(c.name || ((c.lastName || "") + " " + (c.firstName || "")).trim()),
            isVip: (Number(c.totalSpent) || 0) > 100000,
            phone: shouldHidePhone ? "HIDDEN" : String(c.phone),
            totalOrders: Number(c.totalOrders || 0),
            totalSpent: Number(c.totalSpent || 0),
            type: (c.clientType === "b2b" ? "b2b" : "b2c") as "b2b" | "b2c"
        })) as unknown as ClientSummary[];

        return { success: true, data: { clients: safeData, total, totalPages: Math.ceil(total / limit), currentPage: page } };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "getClients", details: filters });
        return { success: false, error: "Не удалось загрузить клиенты" };
    }
}

export async function checkClientDuplicates(data: { phone?: string, email?: string, lastName?: string, firstName?: string }): Promise<ActionResult<(typeof clients.$inferSelect)[]>> {
    try {
        const conditions: (SQL | undefined)[] = [];
        if (data.phone) {
            const digits = data.phone.replace(/\D/g, "");
            if (digits.length >= 6) conditions.push(sql`regexp_replace(${clients.phone}, '\\D', '', 'g') LIKE ${'%' + digits + '%'}`);
        }
        if (data.email && data.email.trim().length > 3) {
            conditions.push(ilike(clients.email, data.email.trim()));
        }
        if (data.lastName && data.firstName && data.lastName.trim().length > 1 && data.firstName.trim().length > 1) {
            conditions.push(and(ilike(clients.lastName, data.lastName.trim()), ilike(clients.firstName, data.firstName.trim())));
        }

        if (conditions.length === 0) return { success: true, data: [] };
        const filtered = conditions.filter((c): c is SQL => !!c);
        if (filtered.length === 0) return { success: true, data: [] };

        const duplicates = await db.select().from(clients).where(and(or(...filtered), eq(clients.isArchived, false))).limit(5);
        return { success: true, data: duplicates };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "checkClientDuplicates" });
        return { success: false, error: "Ошибка при проверке дубликатов" };
    }
}

export async function addClient(formData: FormData): Promise<ActionResult<{ duplicates?: (typeof clients.$inferSelect)[] } | void>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = ClientSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) return { success: false, error: validation.error.issues[0].message };

    const { lastName, firstName, patronymic, phone, email, ignoreDuplicates } = validation.data;

    try {
        if (!ignoreDuplicates) {
            const dupRes = await checkClientDuplicates({ phone, email: email || undefined, lastName, firstName });
            if (dupRes.success && (dupRes.data?.length || 0) > 0) return { success: true, data: { duplicates: dupRes.data } };
        }

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");
        await db.transaction(async (tx) => {
            const [newClient] = await tx.insert(clients).values({ ...validation.data, name: fullName, managerId: validation.data.managerId || null }).returning();
            await logAction("Создан клиент", "client", newClient.id, { name: fullName }, tx);
        });

        revalidatePath("/dashboard/clients");
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "addClient", details: { lastName, firstName, phone } });
        return { success: false, error: "Не удалось добавить клиент" };
    }
}

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = ClientUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) return { success: false, error: validation.error.issues[0].message };

    try {
        const fullName = [validation.data.lastName, validation.data.firstName, validation.data.patronymic].filter(Boolean).join(" ");
        await db.transaction(async (tx) => {
            await tx.update(clients).set({ ...validation.data, name: fullName, managerId: validation.data.managerId || null, updatedAt: new Date() }).where(eq(clients.id, clientId));
            await logAction("Обновлен клиент", "client", clientId, { name: fullName }, tx);
        });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/clients/${clientId}`, method: "updateClient" });
        return { success: false, error: "Не удалось обновить клиент" };
    }
}

export async function getClientDetails(clientId: string): Promise<ActionResult<ClientProfile>> {
    const validated = ClientIdSchema.safeParse({ clientId });
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId), with: { manager: { columns: { name: true } } } });
        if (!client) return { success: false, error: "Клиент не найден" };

        const session = await getSession();
        const shouldHidePhone = ["Печатник", "Дизайнер"].includes(session?.roleName || "");
        if (shouldHidePhone) client.phone = "HIDDEN";

        const ordersRaw = await db.query.orders.findMany({ where: eq(orders.clientId, clientId), orderBy: [desc(orders.createdAt)], limit: 100 });
        const clientOrders: ClientProfileOrder[] = ordersRaw.map(o => ({ id: o.id, orderNumber: o.orderNumber || o.id.slice(0, 8).toUpperCase(), createdAt: o.createdAt, status: o.status, totalPrice: Number(o.totalAmount) }));

        const [statsRes] = await db.select({ count: sql<number>`count(*)`, total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.clientId, clientId)).limit(1);
        const [paymentsRes] = await db.select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` }).from(payments).leftJoin(orders, eq(payments.orderId, orders.id)).where(eq(orders.clientId, clientId)).limit(1);

        const totalSpentVal = Number(statsRes?.total || 0);
        const totalPaid = Number(paymentsRes?.total || 0);

        const activityRaw = await db.query.auditLogs.findMany({ where: and(eq(auditLogs.entityId, clientId), eq(auditLogs.entityType, "client")), orderBy: [desc(auditLogs.createdAt)], limit: 20, with: { user: { columns: { name: true } } } });
        const activity = activityRaw.map(l => ({ id: l.id, action: l.action, createdAt: l.createdAt.toISOString(), user: l.user, details: l.details as AuditLogDetails | null }));

        const clientProfile: ClientProfile = {
            ...client,
            name: client.name || `${client.lastName} ${client.firstName}`,
            clientType: client.clientType as ClientType,
            orders: clientOrders,
            totalOrders: Number(statsRes?.count || 0),
            totalSpent: totalSpentVal,
            activity,
            stats: { count: Number(statsRes?.count || 0), total: totalSpentVal, balance: totalPaid - totalSpentVal }
        } as unknown as ClientProfile;

        return { success: true, data: clientProfile };
    } catch (error) {
        await logError({ error, path: `/dashboard/clients/${clientId}`, method: "getClientDetails" });
        return { success: false, error: "Не удалось загрузить данные клиента" };
    }
}

export async function getClientStats(): Promise<ActionResult<ClientStats>> {
    try {
        const [totalC] = await db.select({ count: sql<number>`count(*)` }).from(clients).limit(1);
        const firstDay = new Date(); firstDay.setDate(1); firstDay.setHours(0, 0, 0, 0);

        const [newC] = await db.select({ count: sql<number>`count(*)` }).from(clients).where(sql`${clients.createdAt} >= ${firstDay.toISOString()}`).limit(1);
        const [totalO] = await db.select({ count: sql<number>`count(*)` }).from(orders).limit(1);
        const [totalR] = await db.select({ sum: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(orders).limit(1);

        const rev = parseFloat(totalR.sum);
        return {
            success: true,
            data: {
                totalClients: totalC.count, newThisMonth: newC.count,
                avgCheck: totalO.count > 0 ? Math.round(rev / totalO.count) : 0,
                totalRevenue: Math.round(rev), totalOrders: totalO.count,
                avgRevenue: totalC.count > 0 ? Math.round(rev / totalC.count) : 0
            }
        };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "getClientStats" });
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };
    if (session.roleName !== "Администратор") return { success: false, error: "Только администратор может удалять клиентов" };

    try {
        await db.transaction(async (tx) => {
            const client = await tx.query.clients.findFirst({ where: eq(clients.id, clientId), with: { orders: true } });
            if (client?.orders && client.orders.length > 0) {
                await releaseReservationsForOrders(client.orders.map(o => o.id), tx);
                await tx.delete(orders).where(eq(orders.clientId, clientId));
            }
            await tx.delete(clients).where(eq(clients.id, clientId));
        });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/clients/${clientId}`, method: "deleteClient" });
        return { success: false, error: "Не удалось удалить клиент" };
    }
}

export async function updateClientField(clientId: string, field: string, value: unknown): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = UpdateClientFieldSchema.parse({ clientId, field, value });
        await db.update(clients).set({ [validated.field]: validated.value || null, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction(`Изменение поля клиента: ${field}`, "client", clientId, { field, value });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "updateClientField" });
        return { success: false, error: "Ошибка обновления" };
    }
}

export async function toggleClientArchived(clientId: string, isArchived: boolean): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.update(clients).set({ isArchived, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction(isArchived ? "Архивация клиента" : "Разархивация клиента", "client", clientId, { isArchived });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "toggleClientArchived" });
        return { success: false, error: "Ошибка" };
    }
}

export async function updateClientComments(clientId: string, comments: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.update(clients).set({ comments, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction("Обновлен комментарий клиента", "client", clientId, { comments });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "updateClientComments" });
        return { success: false, error: "Ошибка" };
    }
}
