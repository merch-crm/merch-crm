"use server";

import { db } from "@/lib/db";
import { orders, users, promocodes, payments, expenses, inventoryTransactions } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { and, gte, lte, sql, eq, desc } from "drizzle-orm";
import { subDays } from "date-fns";
import { logError } from "@/lib/error-logger";

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
    await db.query.users.findFirst({
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

        // Запускаем все запросы параллельно для максимальной скорости
        const [
            stats,
            dailyStats,
            categoryStats,
            recentOrders,
            cogsRes
        ] = await Promise.all([
            // 1. Общая выручка и количество заказов
            db.select({
                totalRevenue: sql<number>`sum(total_amount)`,
                orderCount: sql<number>`count(*)`,
                avgOrderValue: sql<number>`avg(total_amount)`
            })
                .from(orders)
                .where(finalWhere),

            // 2. Динамика по дням (для графика)
            db.select({
                date: sql<string>`date_trunc('day', created_at)`,
                revenue: sql<number>`sum(total_amount)`,
                count: sql<number>`count(*)`
            })
                .from(orders)
                .where(finalWhere)
                .groupBy(sql`date_trunc('day', created_at)`)
                .orderBy(sql`date_trunc('day', created_at)`),

            // 3. Выручка по категориям
            db.select({
                category: orders.category,
                revenue: sql<number>`sum(total_amount)`,
                count: sql<number>`count(*)`
            })
                .from(orders)
                .where(finalWhere)
                .groupBy(orders.category),

            // 4. Последние транзакции (заказы)
            db.query.orders.findMany({
                where: finalWhere,
                orderBy: [desc(orders.createdAt)],
                limit: 5,
                with: {
                    client: true
                }
            }),

            // 5. Calculate actual COGS from inventory transactions
            db.select({
                total: sql<number>`sum(abs(change_amount) * cast(cost_price as decimal))`
            })
                .from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    from ? gte(inventoryTransactions.createdAt, from) : undefined,
                    to ? lte(inventoryTransactions.createdAt, to) : undefined
                ))
        ]);

        const actualCOGS = Number(cogsRes[0]?.total || 0);

        const summary = stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
        const totalRevenue = Number(summary.totalRevenue || 0);

        return {
            data: {
                summary: {
                    totalRevenue: totalRevenue,
                    orderCount: Number(summary.orderCount || 0),
                    avgOrderValue: Number(summary.avgOrderValue || 0),
                    netProfit: totalRevenue - actualCOGS,
                    averageCost: Number(summary.orderCount || 0) > 0 ? (actualCOGS / Number(summary.orderCount)) : 0,
                    writeOffs: actualCOGS * 0.05, // Still a fallback but based on real COGS
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
                recentTransactions: recentOrders.map((o) => ({
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
        await logError({
            error,
            path: "/dashboard/finance",
            method: "getFinancialStats",
            details: { from, to }
        });
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

        // Получаем статистику выполненных заказов по сотрудникам через один группированный запрос
        const ordersStats = await db.select({
            userId: orders.createdBy,
            count: sql<number>`count(*)`
        })
            .from(orders)
            .where(finalWhere)
            .groupBy(orders.createdBy);

        const ordersMap = new Map(ordersStats.map(s => [s.userId, Number(s.count || 0)]));

        const employeePayments = allUsers.map(user => {
            const ordersCount = ordersMap.get(user.id) || 0;
            const baseSalary = 30000; // Условный оклад
            const bonus = ordersCount * 500; // 500р за каждый готовый заказ

            return {
                id: user.id,
                name: user.name,
                role: user.role?.name || "Сотрудник",
                department: user.department?.name || "Общий",
                baseSalary,
                bonus,
                total: baseSalary + bonus,
                ordersCount
            };
        });

        const totalBudget = employeePayments.reduce((sum: number, e: any) => sum + e.total, 0);

        return {
            data: {
                totalBudget,
                employeePayments: employeePayments.sort((a: any, b: any) => b.total - a.total)
            } as SalaryStats
        };


    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/salary",
            method: "getSalaryStats",
            details: { from, to }
        });
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
            { name: "Фонд оплаты труда", percentage: 30, color: "bg-primary", icon: "Users" },
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
        await logError({
            error,
            path: "/dashboard/finance/funds",
            method: "getFundsStats",
            details: { from, to }
        });
        console.error("Funds stats error:", error);
        return { error: "Ошибка при загрузке данных по фондам" };
    }
}

// --- Promocodes ---



import { validatePromocode as validatePromoLib } from "@/lib/promocodes";

export async function validatePromocode(code: string, totalAmount: number = 0, cartItems: any[] = []) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const result = await validatePromoLib(code, totalAmount, cartItems);

        if (!result.isValid) {
            return { error: result.error || "Промокод невалиден" };
        }

        return {
            success: true,
            data: {
                ...result.promo,
                calculatedDiscount: result.discount,
                message: result.message
            }
        };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Internal error" };
    }
}



// --- Payments & Expenses ---

export async function getFinanceTransactions(type: 'payment' | 'expense', from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        if (type === 'payment') {
            const whereClause = [];
            if (from) whereClause.push(gte(payments.createdAt, from));
            if (to) whereClause.push(lte(payments.createdAt, to));

            const data = await db.query.payments.findMany({
                where: whereClause.length > 0 ? and(...whereClause) : undefined,
                with: { order: { with: { client: true } } },
                orderBy: [desc(payments.createdAt)]
            });
            return { data };
        } else {
            const whereClause = [];
            if (from) whereClause.push(gte(expenses.createdAt, from));
            if (to) whereClause.push(lte(expenses.createdAt, to));

            const data = await db.query.expenses.findMany({
                where: whereClause.length > 0 ? and(...whereClause) : undefined,
                orderBy: [desc(expenses.createdAt)]
            });
            return { data };
        }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Internal error" };
    }
}

export interface CreateExpenseData {
    category: string;
    amount: number | string;
    description?: string;
    date?: string | Date;
}

export async function createExpense(data: CreateExpenseData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const [newExpense] = await db.insert(expenses).values({
            category: data.category as typeof expenses.$inferInsert.category,
            amount: String(data.amount),
            description: data.description,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            createdBy: session.id
        }).returning();

        return { success: true, data: newExpense };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Internal error" };
    }
}

export async function getPLReport(from?: Date, to?: Date) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        // 1. Parallel fetching of all P&L components
        const [revenueRes, cogsRes, overheadRes] = await Promise.all([
            // Revenue (Payments received)
            db.select({
                total: sql<number>`sum(amount)`
            })
                .from(payments)
                .where(and(gte(payments.createdAt, fromDate), lte(payments.createdAt, toDate))),

            // Direct Costs (COGS)
            db.select({
                total: sql<number>`sum(abs(change_amount) * cast(cost_price as decimal))`
            })
                .from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    gte(inventoryTransactions.createdAt, fromDate),
                    lte(inventoryTransactions.createdAt, toDate)
                )),

            // Overhead Expenses (OPEX)
            db.select({
                total: sql<number>`sum(amount)`
            })
                .from(expenses)
                .where(and(gte(expenses.createdAt, fromDate), lte(expenses.createdAt, toDate)))
        ]);

        const totalRevenue = Number(revenueRes[0]?.total || 0);
        const totalCOGS = Number(cogsRes[0]?.total || 0);
        const totalOverhead = Number(overheadRes[0]?.total || 0);

        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalOverhead;

        return {
            data: {
                totalRevenue,
                totalCOGS,
                grossProfit,
                totalOverhead,
                netProfit,
                margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
            }
        };
    } catch (error) {
        console.error("P&L Report error:", error);
        return { error: "Ошибка при формировании P&L отчета" };
    }
}
