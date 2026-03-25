"use client";

import Link from "next/link";
import {
    TrendingUp,
    ArrowUpRight,
    Zap,
    LayoutGrid,
    Clock,
    CalendarDays
} from "lucide-react";
import { useBranding } from "@/components/branding-provider";
import { DashboardStats as DashboardStatsComponent } from "./components/dashboard-stats";
import { DashboardNotifications } from "./components/dashboard-notifications";
import { DashboardActions } from "./components/dashboard-actions";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { pluralize } from "@/lib/pluralize";
import type { BrandingSettings } from "@/lib/types";

interface DashboardStats {
    totalClients: number;
    newClients: number;
    totalOrders: number;
    inProduction: number;
    revenue: string;
    averageCheck: string;
    rawRevenue: number;
}

interface DashboardClientProps {
    initialStats: DashboardStats;
    period: string;
    userName: string;
    branding?: BrandingSettings | null;
}

export function DashboardClient({ initialStats, period, userName, branding: initialBranding }: DashboardClientProps) {
    const { currencySymbol } = useBranding();
    const {
        statsData,
        notifications,
        formattedTime,
        formattedDate
    } = useDashboardData(initialStats, period);

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Top Navigation / Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Главная</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm group hover:bg-white/60 transition-all duration-300 hover:scale-[1.02]">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                            {formattedTime}
                        </div>
                        <div className="h-4 w-px bg-slate-200/50" />
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                            <CalendarDays className="w-3.5 h-3.5 text-primary/70" />
                            {formattedDate}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN BENTO GRID */}
            <div className="grid grid-cols-12 gap-3">
                {/* Hero / Welcome Card - Spans 8 cols */}
                <div className="crm-card col-span-12 md:col-span-8 lg:col-span-8 relative group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 via-violet-500/5 to-transparent rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                {initialBranding?.dashboardWelcome?.includes('%name%')
                                    ? initialBranding.dashboardWelcome.replace('%name%', userName.split(' ')[0])
                                    : (initialBranding?.dashboardWelcome || "Привет") + `, `} <span className="text-primary">{userName.split(' ')[0]}</span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
                            <p className="text-slate-500 font-medium max-w-sm leading-relaxed text-sm" suppressHydrationWarning>
                                {`Система работает стабильно. У вас `}
                                <span className="text-primary font-bold">
                                    {statsData.inProduction} новых {pluralize(statsData.inProduction, "заказ", "заказа", "заказов")}
                                </span>
                                {`, которые ожидают внимания.`}
                            </p>
                            <Link
                                href="/dashboard/orders"
                                className="group/btn btn-dark px-6 py-3 rounded-[var(--radius-inner)] font-bold text-sm shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 border-none"
                            >
                                Посмотреть заказы
                                <ArrowUpRight className="w-4 h-4 text-white/70" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Metric - Revenue - Spans 4 cols */}
                <div className="crm-card col-span-12 md:col-span-4 lg:col-span-4 flex flex-col justify-between relative group">
                    <div className="flex flex-col justify-between h-full">
                        <div className="absolute top-0 right-0 p-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold mb-2 border border-emerald-100">
                                +18.4% рост
                            </div>
                            <h3 className="text-slate-500 text-sm font-semibold mb-1" suppressHydrationWarning>Выручка за период</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl sm:text-5xl font-bold text-slate-900" suppressHydrationWarning>
                                    {statsData?.revenue?.replace(new RegExp(`[\\s\\u00A0]*${(currencySymbol || "₽").replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\u00A0]*`, 'g'), '') || '0'}
                                </span>
                                <span className="text-2xl font-bold text-slate-400">{currencySymbol}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>Прогноз: 1.2M {currencySymbol}</span>
                            <div className="flex h-1.5 w-24 bg-slate-100 rounded-2xl overflow-hidden">
                                <div className="h-full bg-primary w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics Row */}
                <DashboardStatsComponent statsData={statsData} currencySymbol={currencySymbol || "₽"} />

                {/* Quick Actions Header */}
                <div className="col-span-12 mt-6 mb-2 flex items-center gap-3">
                    <h2 className="text-sm font-bold text-slate-900 whitespace-nowrap">Управление системой</h2>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Primary Action Buttons */}
                <DashboardActions />

                {/* Bottom Decorative Row */}
                <div className="crm-card col-span-12 lg:col-span-4 !bg-primary !border-primary text-white relative group !shadow-lg !shadow-primary/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="relative z-10">
                        <Zap className="w-8 h-8 text-primary-foreground/20 mb-4" />
                        <h4 className="text-xl font-bold mb-2">Обновите запасы</h4>
                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                            Мы заметили, что на складе осталось менее 10 футболок черного цвета (L).
                        </p>
                        <Link href="/dashboard/warehouse" className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl transition-colors border border-white/10 backdrop-blur-md">
                            Проверить склад <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Notifications */}
                <DashboardNotifications notifications={notifications} />
            </div>
        </div>
    );
}


