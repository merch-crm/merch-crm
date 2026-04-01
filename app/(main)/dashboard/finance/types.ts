import { z } from "zod";
import { CreateExpenseSchema } from "./validation";

export type CreateExpenseData = z.infer<typeof CreateExpenseSchema>;

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
