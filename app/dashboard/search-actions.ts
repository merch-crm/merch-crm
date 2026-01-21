"use server";

import { db } from "@/lib/db";
import { clients, orders, inventoryItems, wikiPages } from "@/lib/schema";
import { ilike, or } from "drizzle-orm";

export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { results: [] };

    try {
        const [foundClients, foundOrders, foundItems, foundWiki] = await Promise.all([
            db.query.clients.findMany({
                where: or(
                    ilike(clients.name, `%${query}%`),
                    ilike(clients.firstName, `%${query}%`),
                    ilike(clients.lastName, `%${query}%`),
                    ilike(clients.phone, `%${query}%`)
                ),
                limit: 5
            }),
            db.query.orders.findMany({
                where: ilike(orders.orderNumber, `%${query}%`),
                with: { client: true },
                limit: 5
            }),
            db.query.inventoryItems.findMany({
                where: or(
                    ilike(inventoryItems.name, `%${query}%`),
                    ilike(inventoryItems.sku, `%${query}%`)
                ),
                limit: 5
            }),
            db.query.wikiPages.findMany({
                where: ilike(wikiPages.title, `%${query}%`),
                limit: 5
            })
        ]);

        const results = [
            ...foundClients.map(c => ({
                id: c.id,
                title: c.name || `${c.lastName} ${c.firstName}`,
                subtitle: c.phone || c.email,
                type: 'client' as const,
                href: `/dashboard/clients?id=${c.id}`
            })),
            ...foundOrders.map(o => ({
                id: o.id,
                title: `Заказ ${o.orderNumber}`,
                subtitle: o.client?.name || 'Без имени',
                type: 'order' as const,
                href: `/dashboard/orders/${o.id}`
            })),
            ...foundItems.map(i => ({
                id: i.id,
                title: i.name,
                subtitle: `SKU: ${i.sku} | ${i.quantity} ${i.unit}`,
                type: 'inventory' as const,
                href: `/dashboard/warehouse/items/${i.id}`
            })),
            ...foundWiki.map(w => ({
                id: w.id,
                title: w.title,
                subtitle: 'База знаний',
                type: 'wiki' as const,
                href: `/dashboard/knowledge-base?page=${w.id}`
            }))
        ];

        return { results };
    } catch (error) {
        console.error("Global search failed:", error);
        return { results: [], error: "Search failed" };
    }
}
