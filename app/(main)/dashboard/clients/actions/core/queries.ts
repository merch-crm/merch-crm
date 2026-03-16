"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { sql, and, or, ilike, eq, lt, desc, asc, gte, lte, count, type SQL } from "drizzle-orm";
import { getOrSetCache, CACHE_TTL } from "@/lib/redis";
import { ClientFiltersSchema } from "../../validation";
import { createSafeAction } from "@/lib/safe-action";
import {
    ClientSummary,
    ClientStats,
    ClientProfileOrder,
    ClientType,
    ClientProfile,
    ActionResult,
    AuditLogDetails
} from "@/lib/types";

const { clients, orders, payments, auditLogs } = schema;

export async function getAcquisitionSources(): Promise<ActionResult<string[]>> {
    const action = createSafeAction({
        handler: async () => {
            const data = await getOrSetCache("clients:acquisition_sources", async () => {
                const result = await db.selectDistinct({ source: clients.acquisitionSource })
                    .from(clients)
                    .where(sql`${clients.acquisitionSource} IS NOT NULL AND ${clients.acquisitionSource} != ''`)
                    .orderBy(asc(clients.acquisitionSource))
                    .limit(100);
                return result.map(r => r.source as string).filter(Boolean);
            }, CACHE_TTL.MEDIUM);

            return { success: true, data };
        }
    });

    return action();
}

export async function getManagers(): Promise<ActionResult<{ id: string; name: string }[]>> {
    const action = createSafeAction({
        handler: async () => {
            const data = await getOrSetCache("clients:managers", async () => {
                return await db.query.users.findMany({
                    columns: { id: true, name: true },
                    where: (users, { eq }) => eq(users.isSystem, false),
                    orderBy: (users, { asc }) => [asc(users.name)],
                    limit: 100,
                });
            }, CACHE_TTL.MEDIUM);
            
            return { success: true, data };
        }
    });

    return action();
}

export async function getRegions(): Promise<ActionResult<string[]>> {
    const action = createSafeAction({
        handler: async () => {
            const data = await getOrSetCache("clients:regions", async () => {
                const result = await db.selectDistinct({ city: clients.city }).from(clients)
                    .where(sql`${clients.city} IS NOT NULL AND ${clients.city} != ''`)
                    .orderBy(asc(clients.city)).limit(100);
                return result.map(r => r.city as string);
            }, CACHE_TTL.MEDIUM);

            return { success: true, data };
        }
    });

    return action();
}

export async function getClients(filters: Record<string, unknown> = {}): Promise<ActionResult<{
    clients: ClientSummary[];
    total: number;
    totalPages: number;
    currentPage: number;
}>> {
    const action = createSafeAction({
        schema: ClientFiltersSchema,
        handler: async (params, ctx) => {
            const {
                page, limit, search, sortBy, region, showArchived,
                clientType, managerId, acquisitionSource,
                activityStatus, minTotalAmount, maxTotalAmount, rfmSegment, loyaltyLevelId
            } = params;
            const offset = (page! - 1) * limit!;
            const baseConditions: (SQL | undefined)[] = [eq(clients.isArchived, showArchived ?? false)];

            if (clientType && clientType !== "all") {
                baseConditions.push(eq(clients.clientType, clientType));
            }

            if (managerId && managerId !== "all") {
                if (managerId === "none") {
                    baseConditions.push(sql`${clients.managerId} IS NULL`);
                } else {
                    baseConditions.push(eq(clients.managerId, managerId));
                }
            }

            if (search) {
                const pattern = `%${search}%`;
                baseConditions.push(or(ilike(clients.name, pattern), ilike(clients.lastName, pattern), ilike(clients.firstName, pattern), ilike(clients.company, pattern), ilike(clients.phone, pattern), ilike(clients.email, pattern)));
            }
            if (region && region !== "all") baseConditions.push(eq(clients.city, region));

            if (acquisitionSource && acquisitionSource !== "all") {
                if (acquisitionSource === "none") {
                    baseConditions.push(sql`(${clients.acquisitionSource} IS NULL OR ${clients.acquisitionSource} = '')`);
                } else {
                    baseConditions.push(eq(clients.acquisitionSource, acquisitionSource));
                }
            }

            if (activityStatus && activityStatus !== "all") {
                switch (activityStatus) {
                    case "active":
                        baseConditions.push(sql`(${clients.daysSinceLastOrder} < 60 OR (${clients.daysSinceLastOrder} IS NULL AND ${clients.createdAt} > NOW() - INTERVAL '60 days'))`);
                        break;
                    case "attention":
                        baseConditions.push(and(gte(clients.daysSinceLastOrder, 60), lt(clients.daysSinceLastOrder, 90)));
                        break;
                    case "at_risk":
                        baseConditions.push(and(gte(clients.daysSinceLastOrder, 90), lt(clients.daysSinceLastOrder, 180)));
                        break;
                    case "inactive":
                        baseConditions.push(sql`(${clients.daysSinceLastOrder} >= 180 OR (${clients.daysSinceLastOrder} IS NULL AND ${clients.createdAt} <= NOW() - INTERVAL '60 days'))`);
                        break;
                }
            }

            if (loyaltyLevelId && loyaltyLevelId !== "all") {
                baseConditions.push(eq(clients.loyaltyLevelId, loyaltyLevelId));
            }

            if (minTotalAmount !== undefined) {
                baseConditions.push(gte(clients.totalOrdersAmount, String(minTotalAmount)));
            }
            if (maxTotalAmount !== undefined) {
                baseConditions.push(lte(clients.totalOrdersAmount, String(maxTotalAmount)));
            }

            if (rfmSegment && rfmSegment !== "all") {
                baseConditions.push(eq(clients.rfmSegment, rfmSegment));
            }

            const query = db.select({
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
                totalOrders: clients.totalOrdersCount,
                totalSpent: clients.totalOrdersAmount,
                lastOrderDate: clients.lastOrderAt,
                daysSinceLastOrder: clients.daysSinceLastOrder,
                funnelStage: clients.funnelStage,
                loyaltyLevelId: clients.loyaltyLevelId,
            })
                .from(clients)
                .where(and(...baseConditions))
                .limit(100)
                .$dynamic();

            if (sortBy === "alphabet") {
                query.orderBy(asc(clients.lastName), asc(clients.firstName));
            } else if (sortBy === "last_order") {
                query.orderBy(desc(clients.lastOrderAt));
            } else if (sortBy === "order_count") {
                query.orderBy(desc(clients.totalOrdersCount));
            } else if (sortBy === "revenue") {
                query.orderBy(desc(clients.totalOrdersAmount));
            } else {
                query.orderBy(asc(clients.lastName));
            }

            const data = await query.limit(limit!).offset(offset);

            const [countResult] = await db.select({
                count: sql<number>`COUNT(*)`,
            })
                .from(clients)
                .where(and(...baseConditions))
                .limit(1);

            const total = Number(countResult?.count || 0);
            const shouldHidePhone = ["Печатник", "Дизайнер"].includes(ctx.roleName);

            const safeData: ClientSummary[] = (data ?? []).map(c => ({
                ...c,
                displayName: c.clientType === "b2b" && c.company
                    ? c.company
                    : String(c.name || `${c.lastName || ""} ${c.firstName || ""}`.trim()),
                isVip: (Number(c.totalSpent) || 0) > 100000,
                phone: shouldHidePhone ? "HIDDEN" : String(c.phone),
                totalOrders: Number(c.totalOrders || 0),
                totalSpent: Number(c.totalSpent || 0),
                type: (c.clientType === "b2b" ? "b2b" : "b2c") as "b2b" | "b2c"
            })) as unknown as ClientSummary[];

            return { success: true, data: { clients: safeData, total, totalPages: Math.ceil(total / limit!), currentPage: page! } };
        }
    });

    return action(filters);
}

export async function getClientDetails(clientId: string): Promise<ActionResult<ClientProfile>> {
    const action = createSafeAction({
        handler: async (id: string, ctx) => {
            const client = await db.query.clients.findFirst({ where: eq(clients.id, id), with: { manager: { columns: { name: true } } } });
            if (!client) throw new Error("Клиент не найден");

            const shouldHidePhone = ["Печатник", "Дизайнер"].includes(ctx.roleName);
            if (shouldHidePhone) client.phone = "HIDDEN";

            const ordersRaw = await db.query.orders.findMany({ where: eq(orders.clientId, id), orderBy: [desc(orders.createdAt)], limit: 100 });
            const clientOrders: ClientProfileOrder[] = ordersRaw.map(o => ({ id: o.id, orderNumber: o.orderNumber || o.id.slice(0, 8).toUpperCase(), createdAt: o.createdAt, status: o.status, totalPrice: Number(o.totalAmount) }));

            const [statsRes] = await db.select({ count: sql<number>`count(*)`, total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.clientId, id)).limit(1);
            const [paymentsRes] = await db.select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` }).from(payments).leftJoin(orders, eq(payments.orderId, orders.id)).where(eq(orders.clientId, id)).limit(1);

            const totalSpentVal = Number(statsRes?.total || 0);
            const totalPaid = Number(paymentsRes?.total || 0);

            const activityRaw = await db.query.auditLogs.findMany({ where: and(eq(auditLogs.entityId, id), eq(auditLogs.entityType, "client")), orderBy: [desc(auditLogs.createdAt)], limit: 20, with: { user: { columns: { name: true } } } });
            const activity = activityRaw.map(l => ({ id: l.id, action: l.action, createdAt: l.createdAt.toISOString(), user: l.user, details: l.details as AuditLogDetails | null }));

            const clientProfile: ClientProfile = {
                ...client,
                name: client.name || `${client.lastName} ${client.firstName}`,
                clientType: client.clientType as ClientType,
                orders: clientOrders,
                totalOrders: client.totalOrdersCount || Number(statsRes?.count || 0),
                totalSpent: Number(client.totalOrdersAmount) || totalSpentVal,
                activity,
                stats: {
                    count: client.totalOrdersCount || Number(statsRes?.count || 0),
                    total: Number(client.totalOrdersAmount) || totalSpentVal,
                    balance: totalPaid - totalSpentVal
                }
            } as unknown as ClientProfile;

            return { success: true, data: clientProfile };
        }
    });

    // Zod validation isn't directly placed in safeAction schema here due to input mismatch, but can be replaced later
    return action(clientId);
}

export async function getClientStats(): Promise<ActionResult<ClientStats>> {
    const action = createSafeAction({
        handler: async () => {
            const [statsResult] = await db.select({
                totalClients: sql<number>`count(*)`,
                totalOrders: sql<number>`coalesce(sum(${clients.totalOrdersCount}), 0)`,
                totalRevenue: sql<string>`coalesce(sum(${clients.totalOrdersAmount}), 0)`,
            }).from(clients).where(eq(clients.isArchived, false)).limit(1);

            const firstDay = new Date();
            firstDay.setDate(1);
            firstDay.setHours(0, 0, 0, 0);

            const [newClientsResult] = await db.select({
                count: sql<number>`count(*)`
            }).from(clients).where(sql`${clients.createdAt} >= ${firstDay.toISOString()}`).limit(1);

            const rev = parseFloat(statsResult?.totalRevenue || "0");
            const totalC = Number(statsResult?.totalClients || 0);
            const totalO = Number(statsResult?.totalOrders || 0);

            return {
                success: true,
                data: {
                    totalClients: totalC,
                    newThisMonth: Number(newClientsResult?.count || 0),
                    avgCheck: totalO > 0 ? Math.round(rev / totalO) : 0,
                    totalRevenue: Math.round(rev),
                    totalOrders: totalO,
                    avgRevenue: totalC > 0 ? Math.round(rev / totalC) : 0
                }
            };
        }
    });

    return action();
}

export async function getClientTypeCounts(showArchived: boolean = false): Promise<ActionResult<{
    all: number;
    b2c: number;
    b2b: number;
}>> {
    const action = createSafeAction({
        handler: async (archived: boolean) => {
            const [result] = await db.select({
                all: count(),
                b2c: sql<number>`count(*) filter (where ${clients.clientType} = 'b2c')`,
                b2b: sql<number>`count(*) filter (where ${clients.clientType} = 'b2b')`,
            })
                .from(clients)
                .where(eq(clients.isArchived, archived))
                .limit(1);

            return {
                success: true,
                data: {
                    all: Number(result?.all || 0),
                    b2c: Number(result?.b2c || 0),
                    b2b: Number(result?.b2b || 0),
                }
            };
        }
    });

    return action(showArchived);
}

export async function getClientsInitialData(filters: Record<string, unknown> = {}): Promise<ActionResult<{
    clients: ClientSummary[];
    total: number;
    totalPages: number;
    currentPage: number;
    managers: { id: string; name: string }[];
    regions: string[];
    sources: string[];
    typeCounts: { all: number; b2c: number; b2b: number };
    activityCounts: { active: number; attention: number; atRisk: number; inactive: number; total: number };
}>> {
    const action = createSafeAction({
        handler: async (params: Record<string, unknown>) => {
            const [
                clientsRes,
                managersRes,
                regionsRes,
                sourcesRes,
                typeCountsRes,
                activityCountsRes
            ] = await Promise.all([
                getClients(params),
                getManagers(),
                getRegions(),
                getAcquisitionSources(),
                getClientTypeCounts(Boolean(params.showArchived)),
                import("../stats.actions").then(m => m.getActivityStats())
            ]);

            if (!clientsRes.success) throw new Error(clientsRes.error);
            if (!clientsRes.data) throw new Error("No clients data returned");

            return {
                success: true,
                data: {
                    ...clientsRes.data,
                    managers: managersRes.success ? managersRes.data || [] : [],
                    regions: regionsRes.success ? regionsRes.data || [] : [],
                    sources: sourcesRes.success ? sourcesRes.data || [] : [],
                    typeCounts: typeCountsRes.success ? typeCountsRes.data || { all: 0, b2c: 0, b2b: 0 } : { all: 0, b2c: 0, b2b: 0 },
                    activityCounts: activityCountsRes.success ? activityCountsRes.data || { active: 0, attention: 0, atRisk: 0, inactive: 0, total: 0 } : { active: 0, attention: 0, atRisk: 0, inactive: 0, total: 0 },
                }
            };
        }
    });

    return action(filters);
}
