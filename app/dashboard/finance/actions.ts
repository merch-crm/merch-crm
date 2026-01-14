"use server";

import { db } from "@/lib/db";
import { orders, users, auditLogs } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { and, gte, lte, sql, eq, desc } from "drizzle-orm";

export interface FinancialStats {
    summary: {
        totalRevenue: number;
        orderCount: number;
        avgOrderValue: number;
        netProfit: number;
        averageCost: number;
        writeOffs: number;
    };
    chartData: Array<{
        date: string;
        revenue: number;
        count: number;
    }>;
    categories: Array<{
        name: string;
        revenue: number;
        count: number;
    }>;
    recentTransactions: Array<{
        id: string;
        clientName: string;
        amount: number;
        date: Date;
        status: string;
        category: string;
    }>;
}

export interface SalaryStats {
    totalBudget: number;
    employeePayments: Array<{
        id: string;
        name: string;
        role: string;
        department: string;
        baseSalary: number;
        bonus: number;
        total: number;
        ordersCount: number;
    }>;
}

export interface FundStats {
    totalRevenue: number;
    funds: Array<{
        name: string;
        percentage: number;
        amount: number;
        color: string;
        icon: string;
    }>;
}

export async function getFinancialStats(from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Проверка доступа
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
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
            totalRevenue: sql<number>`sum(total_amount)`,
            orderCount: sql<number>`count(*)`,
            avgOrderValue: sql<number>`avg(total_amount)`
        })
            .from(orders)
            .where(finalWhere);

        // 2. Динамика по дням (для графика)
        const dailyStats = await db.select({
            date: sql<string>`date_trunc('day', created_at)`,
            revenue: sql<number>`sum(total_amount)`,
            count: sql<number>`count(*)`
        })
            .from(orders)
            .where(finalWhere)
            .groupBy(sql`date_trunc('day', created_at)`)
            .orderBy(sql`date_trunc('day', created_at)`);

        // 3. Выручка по категориям
        const categoryStats = await db.select({
            category: orders.category,
            revenue: sql<number>`sum(total_amount)`,
            count: sql<number>`count(*)`
        })
            .from(orders)
            .where(finalWhere)
            .groupBy(orders.category);

        // 4. Последние транзакции (заказы)
        const recentOrders = await db.query.orders.findMany({
            where: finalWhere,
            orderBy: [desc(orders.createdAt)],
            limit: 5,
            with: {
                client: true
            }
        });

        const summary = stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };

        return {
            data: {
                summary: {
                    totalRevenue: Number(summary.totalRevenue || 0),
                    orderCount: Number(summary.orderCount || 0),
                    avgOrderValue: Number(summary.avgOrderValue || 0),
                    netProfit: Number(summary.totalRevenue || 0) * 0.3, // Примерный расчет: 30% маржинальность
                    averageCost: Number(summary.avgOrderValue || 0) * 0.7, // Примерный расчет: 70% себестоимость
                    writeOffs: Number(summary.totalRevenue || 0) * 0.02, // Примерный расчет: 2% списания
                },
                chartData: dailyStats.map(d => ({
                    date: new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                    revenue: Number(d.revenue || 0),
                    count: Number(d.count || 0)
                })),
                categories: categoryStats.map(c => ({
                    name: c.category as string,
                    revenue: Number(c.revenue || 0),
                    count: Number(c.count || 0)
                })),
                recentTransactions: recentOrders.map((o: any) => ({
                    id: o.id,
                    clientName: `${o.client.lastName} ${o.client.firstName}`,
                    amount: Number(o.totalAmount || 0),
                    date: o.createdAt,
                    status: o.status,
                    category: o.category
                }))
            } as FinancialStats
        };
    } catch (error) {
        console.error("Financial stats error:", error);
        return { error: "Ошибка при загрузке финансовых данных" };
    }
}

export async function getSalaryStats(from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));
        const finalWhere = and(...whereClause, eq(orders.status, "done"));

        // Получаем всех сотрудников
        const allUsers = await db.query.users.findMany({
            with: {
                role: true,
                department: true
            }
        });

        // Получаем выполненные заказы для расчета бонусов (сдельной части)
        const doneOrders = await db.query.orders.findMany({
            where: finalWhere,
        });

        // В реальности здесь должна быть сложная логика расчета по KPI или ставкам
        // Для демонстрации: каждый заказ дает 500р бонуса создателю
        const employeePayments = allUsers.map(user => {
            const userOrders = doneOrders.filter(o => o.createdBy === user.id);
            const baseSalary = 30000; // Условный оклад
            const bonus = userOrders.length * 500; // 500р за каждый готовый заказ

            return {
                id: user.id,
                name: user.name,
                role: user.role?.name || "Сотрудник",
                department: user.department?.name || "Общий",
                baseSalary,
                bonus,
                total: baseSalary + bonus,
                ordersCount: userOrders.length
            };
        });

        const totalBudget = employeePayments.reduce((sum, e) => sum + e.total, 0);

        return {
            data: {
                totalBudget,
                employeePayments: employeePayments.sort((a, b) => b.total - a.total)
            } as SalaryStats
        };

    } catch (error) {
        console.error("Salary stats error:", error);
        return { error: "Ошибка при загрузке данных по зарплатам" };
    }
}

export async function getFundsStats(from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const finalWhere = whereClause.length > 0 ? and(...whereClause) : undefined;

        const stats = await db.select({
            totalRevenue: sql<number>`sum(total_amount)`,
        })
            .from(orders)
            .where(finalWhere);

        const totalRevenue = Number(stats[0]?.totalRevenue || 0);

        const fundDefinitions = [
            { name: "Операционный фонд", percentage: 40, color: "bg-blue-500", icon: "Activity" },
            { name: "Фонд оплаты труда", percentage: 30, color: "bg-indigo-500", icon: "Users" },
            { name: "Фонд развития", percentage: 15, color: "bg-emerald-500", icon: "TrendingUp" },
            { name: "Резервный фонд", percentage: 10, color: "bg-amber-500", icon: "ShieldCheck" },
            { name: "Маркетинг", percentage: 5, color: "bg-rose-500", icon: "Megaphone" },
        ];

        const funds = fundDefinitions.map(f => ({
            ...f,
            amount: (totalRevenue * f.percentage) / 100
        }));

        return {
            data: {
                totalRevenue,
                funds
            } as FundStats
        };

    } catch (error) {
        console.error("Funds stats error:", error);
        return { error: "Ошибка при загрузке данных по фондам" };
    }
}
