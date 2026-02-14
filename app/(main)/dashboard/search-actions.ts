"use server";

import { db } from "@/lib/db";
import { orders, clients, inventoryItems, users, tasks, promocodes, wikiPages, storageLocations, expenses, inventoryCategories } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { ilike, or, desc } from "drizzle-orm";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

import { ActionResult } from "@/lib/types";

export interface SearchResult {
    id: string;
    type: "order" | "client" | "item" | "user" | "task" | "promocode" | "wiki" | "page" | "location" | "expense" | "category";
    title: string;
    subtitle?: string;
    href: string;
    status?: string;
}

export async function globalSearch(query: string): Promise<ActionResult<SearchResult[]>> {
    if (!query || query.length < 2) return { success: true, data: [] };

    const session = await getSession();
    if (!session) return { success: true, data: [] };

    const dep = session.departmentName;
    const isAdmin = dep === "Руководство";
    const isSales = dep === "Отдел продаж";
    const isProd = dep === "Производство";
    const isDesign = dep === "Дизайн";

    try {
        const branding = await getBrandingSettings();
        const currencySymbol = branding?.currencySymbol || "₽";
        const searchTerm = `%${query}%`;

        // Define permissions
        const canSearchOrders = isAdmin || isSales || isProd;
        const canSearchClients = isAdmin || isSales;
        const canSearchFinance = isAdmin;
        const canSearchUsers = isAdmin;
        const canSearchWarehouse = isAdmin || isSales || isProd || isDesign;

        // Parallel search across different entities based on permissions
        const [
            foundOrders,
            foundClients,
            foundItems,
            foundUsers,
            foundTasks,
            foundPromocodes,
            foundWiki,
            foundLocations,
            foundExpenses,
            foundCategories
        ] = await Promise.all([
            // 1. Orders
            canSearchOrders ? db.query.orders.findMany({
                where: ilike(orders.orderNumber, searchTerm),
                limit: 5,
                orderBy: [desc(orders.createdAt)],
                with: { client: true }
            }) : Promise.resolve([]),

            // 2. Clients
            canSearchClients ? db.query.clients.findMany({
                where: or(
                    ilike(clients.firstName, searchTerm),
                    ilike(clients.lastName, searchTerm),
                    ilike(clients.company, searchTerm),
                    ilike(clients.phone, searchTerm),
                    ilike(clients.email, searchTerm)
                ),
                limit: 5,
                orderBy: [desc(clients.createdAt)]
            }) : Promise.resolve([]),

            // 3. Inventory Items
            canSearchWarehouse ? db.query.inventoryItems.findMany({
                where: or(
                    ilike(inventoryItems.name, searchTerm),
                    ilike(inventoryItems.sku, searchTerm)
                ),
                limit: 5,
                orderBy: [desc(inventoryItems.createdAt)]
            }) : Promise.resolve([]),

            // 4. Users
            canSearchUsers ? db.query.users.findMany({
                where: or(
                    ilike(users.name, searchTerm),
                    ilike(users.email, searchTerm)
                ),
                limit: 5
            }) : Promise.resolve([]),

            // 5. Tasks
            db.query.tasks.findMany({
                where: or(
                    ilike(tasks.title, searchTerm),
                    ilike(tasks.description, searchTerm)
                ),
                limit: 5,
                orderBy: [desc(tasks.createdAt)]
            }),

            // 6. Promocodes
            isAdmin || isSales ? db.query.promocodes.findMany({
                where: ilike(promocodes.code, searchTerm),
                limit: 3
            }) : Promise.resolve([]),

            // 7. Wiki
            db.query.wikiPages.findMany({
                where: or(
                    ilike(wikiPages.title, searchTerm),
                    ilike(wikiPages.content, searchTerm)
                ),
                limit: 5
            }),

            // 8. Locations
            canSearchWarehouse ? db.query.storageLocations.findMany({
                where: or(
                    ilike(storageLocations.name, searchTerm),
                    ilike(storageLocations.address, searchTerm)
                ),
                limit: 3
            }) : Promise.resolve([]),

            // 9. Expenses
            canSearchFinance ? db.query.expenses.findMany({
                where: ilike(expenses.description, searchTerm),
                limit: 3
            }) : Promise.resolve([]),

            // 10. Categories
            canSearchWarehouse ? db.query.inventoryCategories.findMany({
                where: ilike(inventoryCategories.name, searchTerm),
                limit: 3
            }) : Promise.resolve([])
        ]);

        const navigationPages = [
            { title: "Заказы", href: "/dashboard/orders", keywords: ["заказы", "продажи"], deps: ["Руководство", "Отдел продаж", "Производство"] },
            { title: "Клиенты", href: "/dashboard/clients", keywords: ["клиенты", "заказчики", "база"], deps: ["Руководство", "Отдел продаж"] },
            { title: "Склад", href: "/dashboard/warehouse", keywords: ["склад", "остатки", "товары", "инвентарь"], deps: ["Руководство", "Отдел продаж", "Производство", "Дизайн"] },
            { title: "Промокоды", href: "/dashboard/finance/promocodes", keywords: ["промокоды", "скидки", "акции"], deps: ["Руководство", "Отдел продаж"] },
            { title: "Финансы", href: "/dashboard/finance", keywords: ["финансы", "деньги", "касса", "отчеты"], deps: ["Руководство"] },
            { title: "Сотрудники", href: "/admin-panel/users", keywords: ["сотрудники", "пользователи", "права", "админ"], deps: ["Руководство"] },
            { title: "Задачи", href: "/dashboard/tasks", keywords: ["задачи", "дела", "план"], deps: [] }, // Everyone
            { title: "Дизайн", href: "/dashboard/design", keywords: ["дизайн", "макеты"], deps: ["Руководство", "Дизайн"] },
            { title: "Производство", href: "/dashboard/production", keywords: ["производство", "печать", "вышивка"], deps: ["Руководство", "Производство"] },
            { title: "Админ-панель", href: "/admin-panel", keywords: ["админ", "панель", "управление", "settings"], deps: ["Руководство"] },
            { title: "Брендинг", href: "/admin-panel/branding", keywords: ["логотип", "цвета", "админ", "настройки"], deps: ["Руководство"] },
            { title: "Безопасность", href: "/admin-panel/security", keywords: ["логи", "входы", "админ", "безопасность"], deps: ["Руководство"] },
            { title: "Референсы", href: "/dashboard/references", keywords: ["референсы", "дизайн", "showcase", "примеры"], deps: ["Руководство"] },
        ].filter(page => {
            const matchesQuery = page.title.toLowerCase().includes(query.toLowerCase()) ||
                page.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()));
            const hasAccess = page.deps.length === 0 || page.deps.includes(dep);
            return matchesQuery && hasAccess;
        });

        const results: SearchResult[] = [
            ...foundOrders.map(o => ({
                id: o.id,
                type: "order" as const,
                title: `Заказ #${o.orderNumber}`,
                subtitle: o.client ? `${o.client.lastName} ${o.client.firstName}` : "Без клиента",
                href: `/dashboard/orders/${o.id}`,
                status: o.status
            })),
            ...foundClients.map(c => ({
                id: c.id,
                type: "client" as const,
                title: `${c.lastName} ${c.firstName}`,
                subtitle: c.company || c.phone,
                href: `/dashboard/clients?id=${c.id}`, // Client profiles often open in drawers on lists
                status: c.clientType
            })),
            ...foundItems.map(i => ({
                id: i.id,
                type: "item" as const,
                title: i.name,
                subtitle: i.sku || "Без артикула",
                href: `/dashboard/warehouse/items?id=${i.id}`,
                status: `${i.quantity} шт.`
            })),
            ...foundUsers.map(u => ({
                id: u.id,
                type: "user" as const,
                title: u.name,
                subtitle: u.email,
                href: `/admin-panel/users?id=${u.id}`
            })),
            ...foundTasks.map(t => ({
                id: t.id,
                type: "task" as const,
                title: t.title,
                subtitle: t.status,
                href: `/dashboard/tasks?id=${t.id}`
            })),
            ...foundPromocodes.map(p => ({
                id: p.id,
                type: "promocode" as const,
                title: p.code,
                subtitle: `${p.discountType === 'percentage' ? p.value + '%' : p.value + currencySymbol} скидка`,
                href: `/dashboard/finance/promocodes?id=${p.id}`,
                status: p.isActive ? "Активен" : "Неактивен"
            })),
            ...foundWiki.map(w => ({
                id: w.id,
                type: "wiki" as const,
                title: w.title,
                subtitle: "Статья в базе знаний",
                href: `/dashboard/knowledge-base?pageId=${w.id}`
            })),
            ...foundLocations.map(l => ({
                id: l.id,
                type: "location" as const,
                title: l.name,
                subtitle: l.address,
                href: `/dashboard/warehouse?tab=locations&id=${l.id}`
            })),
            ...foundExpenses.map(e => ({
                id: e.id,
                type: "expense" as const,
                title: e.description || "Расход без описания",
                subtitle: `${e.amount}${currencySymbol} - ${e.category}`,
                href: `/dashboard/finance?id=${e.id}`
            })),
            ...foundCategories.map(c => ({
                id: c.id,
                type: "category" as const,
                title: c.name,
                subtitle: "Категория склада",
                href: `/dashboard/warehouse?categoryId=${c.id}`
            })),
            ...navigationPages.map(p => ({
                id: p.href,
                type: "page" as const,
                title: p.title,
                subtitle: "Раздел меню",
                href: p.href
            }))
        ];

        return { success: true, data: results.slice(0, 15) }; // Limit total results
    } catch (error) {
        console.error("Global search error:", error);
        return { success: false, error: "Ошибка поиска" };
    }
}
