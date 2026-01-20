"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    UserPlus,
    UploadCloud,
    Package,
    TrendingUp
} from "lucide-react";
import { Rouble } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getDashboardStatsByPeriod } from "./actions";

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
}


export function DashboardClient({ initialStats, period, userName }: DashboardClientProps) {
    const [statsData, setStatsData] = useState<DashboardStats>(initialStats);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getDashboardStatsByPeriod(period);
            setStatsData(data);
            setStatsData(data);
        };

        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, [period]);

    // Stat Cards Configuration
    const stats = [
        {
            name: "Всего клиентов",
            value: (statsData?.totalClients ?? 0).toString(),
            change: "+12%",
            isNegative: false,
            icon: Users,
            color: "bg-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            name: "Новых за период",
            value: (statsData?.newClients ?? 0).toString(),
            change: "+8%",
            isNegative: false,
            icon: UserPlus,
            color: "bg-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
        },
        {
            name: "Средний чек",
            value: statsData?.averageCheck ?? "0 ₽",
            change: "-2%",
            isNegative: true,
            icon: Rouble,
            color: "bg-slate-700",
            lightColor: "bg-slate-50",
            textColor: "text-slate-600",
        },
        {
            name: "Общая выручка",
            value: statsData?.revenue ?? "0 ₽",
            change: "+18%",
            isNegative: false,
            icon: Rouble,
            color: "bg-indigo-700",
            lightColor: "bg-indigo-50",
            textColor: "text-indigo-700",
        },
    ];

    const actions = [
        {
            name: "Новый заказ",
            icon: Plus,
            color: "bg-blue-600",
            href: "/dashboard/orders",
        },
        {
            name: "Добавить клиента",
            icon: UserPlus,
            color: "bg-emerald-600",
            href: "/dashboard/clients",
        },
        {
            name: "Загрузить дизайн",
            icon: UploadCloud,
            color: "bg-indigo-600",
            href: "/dashboard/design/upload",
        },
        {
            name: "Управление складом",
            icon: Package,
            color: "bg-amber-600",
            href: "/dashboard/admin/warehouse",
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-10">
            {/* Header with Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition-colors">Главная</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-bold">Обзор</span>
                </div>
                <div className="text-xs font-bold text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-white">
                    {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">

                {/* Welcome Banner - Span 8 (Large) */}
                <div className="col-span-12 lg:col-span-8 glass-panel p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full bg-slate-50/50 -z-10" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-md rounded-full text-[11px] font-bold text-primary mb-6 border border-white/40 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    ONLINE SYSTEM
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-[0.9] tracking-tight mb-4">
                                    Привет, <br />
                                    <span className="text-primary">{userName || "Администратор"}</span>
                                </h1>
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium max-w-md leading-relaxed">
                            Система работает в штатном режиме. Показатели обновлены.
                        </p>
                    </div>
                </div>

                {/* Primary Stat (Revenue) - Span 4 (Vertical) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 glass-panel p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-12 w-12 rounded-[14px] bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Rouble className="h-6 w-6" />
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +18%
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-medium mb-1">Общая выручка</p>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{statsData?.revenue ?? "0 ₽"}</p>
                    </div>
                </div>

                {/* Secondary Stats - 3 blocks spanning 4 cols each */}
                {stats.slice(0, 3).map((item) => (
                    <div key={item.name} className="col-span-12 md:col-span-4 glass-panel p-6 flex flex-col justify-between h-[180px] group hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className={cn("h-10 w-10 rounded-[12px] flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110", item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-[8px]", item.isNegative ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                                {item.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{item.name}</p>
                            <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                        </div>
                    </div>
                ))}

                {/* Quick Actions Header */}
                <div className="col-span-12 mt-8 mb-2 flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Быстрые действия</h2>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Actions Grid */}
                {actions.map((action) => (
                    <Link key={action.name} href={action.href} className="col-span-12 sm:col-span-6 lg:col-span-3 group">
                        <div className="glass-panel h-[160px] flex flex-col items-center justify-center gap-4 hover:border-primary/30 hover:shadow-primary/10 transition-all duration-300">
                            <div className={cn("h-14 w-14 rounded-[16px] flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", action.color)}>
                                <action.icon className="h-7 w-7" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{action.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
