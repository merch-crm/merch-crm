"use server";

import { db } from "@/lib/db";
import { orders, payments, expenses, inventoryTransactions } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { and, gte, lte, sql, eq, desc, type SQL } from "drizzle-orm";
import { subDays } from "date-fns";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";
import { CreateExpenseSchema } from "./validation";
import { revalidatePath } from "next/cache";
import { validatePromocode as validatePromoLib } from "@/lib/promocodes";
import type { FinancialStats, SalaryStats, FundStats } from "./types";
export type { FinancialStats, SalaryStats, FundStats, CreateExpenseData } from "./types";



export async function getFinancialStats(from?: Date, to?: Date): Promise<ActionResult<FinancialStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (!["admin", "management"].includes(session.roleSlug)) {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        const whereClause: (SQL | undefined)[] = [];
        whereClause.push(gte(orders.createdAt, fromDate));
        whereClause.push(lte(orders.createdAt, toDate));

        const finalWhere = and(...whereClause);

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
            }).from(orders).where(finalWhere).limit(1),

            db.select({
                date: sql<string>`DATE(${orders.createdAt})`,
                revenue: sql<number>`SUM(${orders.totalAmount})`,
                count: sql<number>`COUNT(*)`
            }).from(orders).where(finalWhere).groupBy(sql`DATE(${orders.createdAt})`).orderBy(sql`DATE(${orders.createdAt})`).limit(365),

            db.select({
                category: orders.category,
                revenue: sql<number>`SUM(${orders.totalAmount})`,
                count: sql<number>`COUNT(*)`
            }).from(orders).where(finalWhere).groupBy(orders.category).orderBy(sql`SUM(${orders.totalAmount}) DESC`).limit(50),

            db.query.orders.findMany({
                where: finalWhere,
                with: { client: true },
                orderBy: desc(orders.createdAt),
                limit: 10
            }),

            db.select({
                totalCOGSCost: sql<number>`COALESCE(SUM(ABS(${inventoryTransactions.changeAmount}) * CAST(${inventoryTransactions.costPrice} AS DECIMAL)), 0)`
            }).from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, "out"),
                    gte(inventoryTransactions.createdAt, fromDate),
                    lte(inventoryTransactions.createdAt, toDate)
                ))
                .limit(1)
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
            chartData: dailyStats.map((d: any) => ({
                date: d.date,
                revenue: Number(d.revenue || 0),
                count: Number(d.count || 0)
            })),
            categories: categoryStats.map((c: any) => ({
                name: c.category || "Другое",
                revenue: Number(c.revenue || 0),
                count: Number(c.count || 0)
            })),
            recentTransactions: recentOrders.map((o) => ({
                id: o.id,
                clientName: o.client ? ([o.client.lastName, o.client.firstName].filter(Boolean).join(' ') || o.client.name || "Без имени") : "Без имени",
                amount: Number(o.totalAmount || 0),
                date: o.createdAt,
                status: o.status || "new",
                category: o.category || "other"
            }))
        };

        return { success: true, data: result };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance",
            method: "getFinancialStats"
        });
        return { success: false, error: "Не удалось загрузить финансовую статистику" };
    }
}

export async function getSalaryStats(from?: Date, to?: Date): Promise<ActionResult<SalaryStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();
        const finalWhere = and(gte(orders.createdAt, fromDate), lte(orders.createdAt, toDate), eq(orders.status, "done"));

        const [allUsers, ordersStats] = await Promise.all([
            db.query.users.findMany({
                with: {
                    role: true,
                    department: true
                },
                limit: 500
            }),
            db.select({
                userId: orders.createdBy,
                count: sql<number>`COUNT(*)`
            })
                .from(orders)
                .where(finalWhere)
                .groupBy(orders.createdBy)
                .limit(1000)
        ]);

        const ordersMap = new Map(ordersStats.map(s => [s.userId, Number(s.count || 0)]));

        const employeePayments = allUsers.map(user => {
            const ordersCount = ordersMap.get(user.id) || 0;
            const baseSalary = user.role?.slug === "manager" ? 40000 : 30000;
            const bonus = ordersCount * 300;

            return {
                id: user.id,
                name: user.name || "Сотрудник",
                role: user.role?.name || "Сотрудник",
                department: user.department?.name || "Общий",
                baseSalary,
                bonus,
                total: baseSalary + bonus,
                ordersCount
            };
        });

        const totalBudget = employeePayments.reduce((sum, e) => sum + e.total, 0);

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
        return { success: false, error: "Не удалось загрузить статистику зарплат" };
    }
}

export async function getFundsStats(from?: Date, to?: Date): Promise<ActionResult<FundStats>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        const [stats] = await db.select({
            totalRevenue: sql<number>`SUM(${orders.totalAmount})`,
        })
            .from(orders)
            .where(and(gte(orders.createdAt, fromDate), lte(orders.createdAt, toDate)))
            .limit(1);

        const totalRevenue = Number(stats?.totalRevenue || 0);

        const fundDefinitions = [
            { name: "Операционный фонд", percentage: 40, color: "bg-blue-500", icon: "Activity" },
            { name: "Фонд оплаты труда", percentage: 30, color: "bg-primary", icon: "Users" },
            { name: "Фонд развития", percentage: 15, color: "bg-emerald-500", icon: "TrendingUp" },
            { name: "Резервный фонд", percentage: 10, color: "bg-amber-500", icon: "ShieldCheck" },
            { name: "Маркетинг", percentage: 5, color: "bg-rose-500", icon: "Megaphone" },
        ];

        const funds = fundDefinitions.map((f) => ({
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
        return { success: false, error: "Не удалось загрузить фонды" };
    }
}

export async function validatePromocode(code: string, totalAmount: number = 0, cartItems: Array<{ inventoryId?: string; price: number; quantity: number; category?: string }> = []) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

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
        await logError({
            error,
            path: "/dashboard/finance/promocode",
            method: "validatePromocode"
        });
        return { success: false, error: "Ошибка при валидации промокода" };
    }
}

export async function getFinanceTransactions(type: 'payment' | 'expense', from?: Date, to?: Date): Promise<ActionResult<any[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        if (type === 'payment') {
            const data = await db.query.payments.findMany({
                where: and(gte(payments.createdAt, fromDate), lte(payments.createdAt, toDate)),
                with: { order: { with: { client: true } } },
                orderBy: [desc(payments.createdAt)],
                limit: 1000
            });
            return { success: true, data };
        } else {
            const data = await db.query.expenses.findMany({
                where: and(gte(expenses.createdAt, fromDate), lte(expenses.createdAt, toDate)),
                orderBy: [desc(expenses.createdAt)],
                limit: 1000
            });
            return { success: true, data };
        }
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/transactions",
            method: "getFinanceTransactions"
        });
        return { success: false, error: "Ошибка при получении транзакций" };
    }
}

export async function createExpense(data: unknown): Promise<ActionResult<any>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = CreateExpenseSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { category, amount, description, date } = validation.data;

    try {
        const newExpense = await db.transaction(async (tx) => {
            const [expense] = await tx.insert(expenses).values({
                category: category as any,
                amount: String(amount),
                description: description,
                date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                createdBy: session.id
            }).returning();

            await logAction("Создан расход", "expense",
                expense.id,
                { category, amount, description },
                tx
            );

            return expense;
        });

        revalidatePath("/dashboard/finance");
        return { success: true, data: newExpense };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance",
            method: "createExpense"
        });
        return { success: false, error: "Ошибка при создании расхода" };
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
    if (!session) return { success: false, error: "Не авторизован" };

    if (!["admin", "management"].includes(session.roleSlug)) {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const fromDate = from || subDays(new Date(), 30);
        const toDate = to || new Date();

        const [revenueRes, cogsRes, overheadRes] = await Promise.all([
            db.select({
                total: sql<number>`SUM(CAST(${payments.amount} AS DECIMAL))`
            })
                .from(payments)
                .where(and(gte(payments.createdAt, fromDate), lte(payments.createdAt, toDate)))
                .limit(1),

            db.select({
                total: sql<number>`SUM(ABS(${inventoryTransactions.changeAmount}) * CAST(${inventoryTransactions.costPrice} AS DECIMAL))`
            })
                .from(inventoryTransactions)
                .where(and(
                    eq(inventoryTransactions.type, 'out'),
                    gte(inventoryTransactions.createdAt, fromDate),
                    lte(inventoryTransactions.createdAt, toDate)
                ))
                .limit(1),

            db.select({
                total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`
            })
                .from(expenses)
                .where(and(gte(expenses.createdAt, fromDate), lte(expenses.createdAt, toDate)))
                .limit(1)
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
        await logError({
            error,
            path: "/dashboard/finance/report",
            method: "getPLReport"
        });
        return { success: false, error: "Ошибка при формировании P&L отчета" };
    }
}

