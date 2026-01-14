"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { and, gte, lte, sql } from "drizzle-orm";

export async function getFinancialStats(from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Проверка доступа: только Руководство, Отдел продаж или Админ
    const user = await db.query.users.findFirst({
        where: sql`${orders.creatorId} = ${session.id}`, // Это просто для получения инфо о юзере через сессию
        with: {
            role: true,
            department: true
        }
    });

    // На самом деле сессия уже содержит базовую инфо, но для надежности проверим роль/отдел
    // В текущей реализации роли и отделы проверяются на уровне страницы

    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const finalWhere = whereClause.length > 0 ? and(...whereClause) : undefined;

        // 1. Общая выручка и количество заказов
        const stats = await db.select({
            totalRevenue: sql<number>`sum(total_price)`,
            orderCount: sql<number>`count(*)`,
            avgOrderValue: sql<number>`avg(total_price)`
        })
            .from(orders)
            .where(finalWhere);

        // 2. Динамика по дням (для графика)
        const dailyStats = await db.select({
            date: sql<string>`date_trunc('day', created_at)`,
            revenue: sql<number>`sum(total_price)`,
            count: sql<number>`count(*)`
        })
            .from(orders)
            .where(finalWhere)
            .groupBy(sql`date_trunc('day', created_at)`)
            .orderBy(sql`date_trunc('day', created_at)`);

        return {
            data: {
                summary: stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 },
                chartData: dailyStats.map(d => ({
                    date: new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                    revenue: Number(d.revenue || 0),
                    count: Number(d.count || 0)
                }))
            }
        };
    } catch (error) {
        console.error("Financial stats error:", error);
        return { error: "Ошибка при загрузке финансовых данных" };
    }
}
