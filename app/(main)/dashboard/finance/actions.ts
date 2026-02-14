"use server";

import { db } from "@/lib/db";
import { orders, payments, expenses, inventoryTransactions } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { and, gte, lte, sql, eq, desc } from "drizzle-orm";
import { subDays } from "date-fns";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";
import { CreateExpenseSchema } from "./validation";
import { z } from "zod";
export type CreateExpenseData = z.infer<typeof CreateExpenseSchema>;
import { validatePromocode as validatePromoLib } from "@/lib/promocodes";
import { revalidatePath } from "next/cache";

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

export async function getFinancialStats(from?: Date, to?: Date): Promise<ActionResult<FinancialStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));

        const finalWhere = whereClause.length > 0 ? and(...whereClause) : undefined;

        const [
            summaryRes,
            dailyStats,
            categoryStats,
            recentOrders,
            cogsRes
        ] = await Promise.all([
            db.select({
                totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
                orderCount: sql<number>`COUNT(*)`,
                avgOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`
            }).from(orders).where(finalWhere),

            db.select({
                date: sql<string>`DATE(${orders.createdAt})`,
                revenue: sql<number>`SUM(${orders.totalAmount})`,
                count: sql<number>`COUNT(*)`
            }).from(orders).where(finalWhere).groupBy(sql`DATE(${orders.createdAt})`),

            db.select({
                category: orders.category,
                revenue: sql<number>`SUM(${orders.totalAmount})`,
                count: sql<number>`COUNT(*)`
            }).from(orders).where(finalWhere).groupBy(orders.category),

            db.query.orders.findMany({
                where: finalWhere,
                with: { client: true },
                orderBy: desc(orders.createdAt),
                limit: 10
            }),

            db.select({
                totalCOGSCost: sql<number>`COALESCE(SUM(ABS(${inventoryTransactions.changeAmount}) * ${inventoryTransactions.costPrice}), 0)`
            }).from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, "out"),
                    from ? gte(inventoryTransactions.createdAt, from) : undefined,
                    to ? lte(inventoryTransactions.createdAt, to) : undefined
                ))
        ]);

        const summaryData = summaryRes[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
        const totalRevenue = Number(summaryData.totalRevenue || 0);
        const actualCOGS = Number(cogsRes[0]?.totalCOGSCost || 0);

        const result: FinancialStats = {
            summary: {
                totalRevenue,
                orderCount: Number(summaryData.orderCount || 0),
                avgOrderValue: Number(summaryData.avgOrderValue || 0),
                netProfit: totalRevenue - actualCOGS,
                averageCost: Number(summaryData.orderCount || 0) > 0 ? (actualCOGS / Number(summaryData.orderCount)) : 0,
                writeOffs: actualCOGS * 0.05,
            },
            chartData: dailyStats.map(d => ({
                date: d.date,
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
                clientName: o.client ? `${o.client.lastName} ${o.client.firstName}` : "Unnamed",
                amount: Number(o.totalAmount || 0),
                date: o.createdAt,
                status: o.status,
                category: o.category
            }))
        };

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance",
            method: "getFinancialStats"
        });
        return { success: false, error: "Failed to fetch financial statistics" };
    }
}

export async function getSalaryStats(from?: Date, to?: Date): Promise<ActionResult<SalaryStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const whereClause = [];
        if (from) whereClause.push(gte(orders.createdAt, from));
        if (to) whereClause.push(lte(orders.createdAt, to));
        const finalWhere = and(...whereClause, eq(orders.status, "done"));

        const allUsers = await db.query.users.findMany({
            with: {
                role: true,
                department: true
            }
        });

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
            const baseSalary = 30000;
            const bonus = ordersCount * 500;

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

        const totalBudget = employeePayments.reduce((sum: number, e) => sum + e.total, 0);

        return {
            success: true,
            data: {
                totalBudget,
                employeePayments: employeePayments.sort((a, b) => b.total - a.total)
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/salary",
            method: "getSalaryStats"
        });
        return { success: false, error: "Failed to fetch salary statistics" };
    }
}

export async function getFundsStats(from?: Date, to?: Date): Promise<ActionResult<FundStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

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
            success: true,
            data: {
                totalRevenue,
                funds
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/funds",
            method: "getFundsStats"
        });
        return { success: false, error: "Failed to fetch funds statistics" };
    }
}

export async function validatePromocode(code: string, totalAmount: number = 0, cartItems: Array<{ inventoryId?: string; price: number; quantity: number; category?: string }> = []) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const result = await validatePromoLib(code, totalAmount, cartItems);

        if (!result.isValid) {
            return { success: false, error: result.error || "Промокод невалиден" };
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
        return { success: false, error: error instanceof Error ? error.message : "Internal error" };
    }
}

export async function getFinanceTransactions(type: 'payment' | 'expense', from?: Date, to?: Date): Promise<ActionResult<(typeof payments.$inferSelect | typeof expenses.$inferSelect)[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

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
            return { success: true, data };
        } else {
            const whereClause = [];
            if (from) whereClause.push(gte(expenses.createdAt, from));
            if (to) whereClause.push(lte(expenses.createdAt, to));

            const data = await db.query.expenses.findMany({
                where: whereClause.length > 0 ? and(...whereClause) : undefined,
                orderBy: [desc(expenses.createdAt)]
            });
            return { success: true, data };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Internal error" };
    }
}

export async function createExpense(data: unknown): Promise<ActionResult<typeof expenses.$inferSelect>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const validation = CreateExpenseSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { category, amount, description, date } = validation.data;

    try {
        const [newExpense] = await db.insert(expenses).values({
            category: category as "rent" | "salary" | "purchase" | "tax" | "other",
            amount: String(amount),
            description: description,
            date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            createdBy: session.id
        }).returning();

        revalidatePath("/dashboard/finance");
        return { success: true, data: newExpense };
    } catch (error) {
        console.error("[Finance] Create expense error:", error);
        return { success: false, error: "Внутренняя ошибка сервера при создании расхода" };
    }
}

export async function getPLReport(from?: Date, to?: Date): Promise<ActionResult<{
    totalRevenue: number;
    totalCOGS: number;
    grossProfit: number;
    totalOverhead: number;
    netProfit: number;
    margin: number;
}>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        const [revenueRes, cogsRes, overheadRes] = await Promise.all([
            db.select({
                total: sql<number>`sum(amount)`
            })
                .from(payments)
                .where(and(gte(payments.createdAt, fromDate), lte(payments.createdAt, toDate))),

            db.select({
                total: sql<number>`sum(abs(change_amount) * cast(cost_price as decimal))`
            })
                .from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    gte(inventoryTransactions.createdAt, fromDate),
                    lte(inventoryTransactions.createdAt, toDate)
                )),

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
            success: true,
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
        return { success: false, error: "Ошибка при формировании P&L отчета" };
    }
}
