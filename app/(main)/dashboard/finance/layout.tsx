"use client";

import {
    TrendingUp,
    Wallet,
    Layers,
    Tags,
    Activity,
    CreditCard,
    PieChart,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FinanceDateFilter } from "./finance-date-filter";

const TABS = [
    { id: "sales", label: "Продажи", icon: TrendingUp, href: "/dashboard/finance/sales" },
    { id: "salary", label: "Зарплата", icon: Wallet, href: "/dashboard/finance/salary" },
    { id: "funds", label: "Фонды", icon: Layers, href: "/dashboard/finance/funds" },
    { id: "promocodes", label: "Промокоды", icon: Tags, href: "/dashboard/finance/promocodes" },
    { id: "transactions", label: "Транзакции", icon: Activity, href: "/dashboard/finance/transactions" },
    { id: "expenses", label: "Расходы", icon: CreditCard, href: "/dashboard/finance/expenses" },
    { id: "pl", label: "P&L Отчет", icon: PieChart, href: "/dashboard/finance/pl", activeColor: "bg-indigo-600", shadowColor: "shadow-indigo-500/25" }
];

const TAB_INFO: Record<string, { title: string, description: string }> = {
    "/dashboard/finance/sales": { title: "Аналитика продаж", description: "Мониторинг выручки, прибыли и эффективности по категориям" },
    "/dashboard/finance/salary": { title: "Управление ФОТ", description: "Расчет заработных плат, бонусов и KPI сотрудников" },
    "/dashboard/finance/funds": { title: "Фонды компании", description: "Распределение капитала и управление резервами" },
    "/dashboard/finance/promocodes": { title: "Промокоды", description: "Управление маркетинговыми акциями и скидками" },
    "/dashboard/finance/transactions": { title: "Транзакции", description: "Полный журнал всех денежных движений в системе" },
    "/dashboard/finance/expenses": { title: "Расходы", description: "Учет косвенных и операционных затрат компании" },
    "/dashboard/finance/pl": { title: "P&L Отчет", description: "Отчет о прибылях и убытках для комплексного анализа" }
};

export default function FinanceLayout({
    children
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Find active tab info or default to sales
    const currentTabInfo = TAB_INFO[pathname] || TAB_INFO["/dashboard/finance/sales"];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            {/* 1. Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                        {currentTabInfo.title}
                    </h1>
                    <p className="text-slate-400 text-[13px] font-medium max-w-2xl">
                        {currentTabInfo.description}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <FinanceDateFilter />
                </div>
            </div>

            {/* 2. Control Header: Navigation Tabs */}
            <div className="flex w-full h-[58px] items-center gap-2 p-[6px] !rounded-[22px] bg-white border border-slate-200/50 shadow-sm relative z-20">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 h-full relative z-0">
                    {TABS.map((tab) => {
                        const isActive = pathname === tab.href || (tab.id === "sales" && pathname === "/dashboard/finance/sales");
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cn(
                                    "flex-1 h-full relative flex items-center justify-center gap-2.5 px-6 !rounded-[16px] text-[13px] font-bold group min-w-[130px] whitespace-nowrap transition-all",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabFinanceNav"
                                        className={cn(
                                            "absolute inset-0 !rounded-[16px] shadow-lg z-0",
                                            tab.activeColor || "bg-[#6366f1]", // Matching user's purple color
                                            tab.shadowColor || "shadow-indigo-500/20"
                                        )}
                                        transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                                    />
                                )}
                                <tab.icon className={cn("w-4 h-4 relative z-10 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                                <span className="relative z-10">{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 3. Content Area */}
            <div className="relative z-10 min-h-[400px]">
                {children}
            </div>
        </div>
    );
}
