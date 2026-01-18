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
import { Card } from "@/components/ui/card";
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header with Breadcrumbs and Period Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">Главная</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-bold">Dashboard</span>
                </div>
            </div>

            {/* Welcome Banner */}
            <Card className="p-10 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[14px] bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">

                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Добро пожаловать,<br /> {userName || "Администратор"}! 👋
                    </h1>
                    <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl leading-relaxed">
                        Вот ваш персональный дашборд с ключевыми показателями эффективности.
                        Все данные синхронизированы в реальном времени.
                    </p>
                </div>
            </Card>

            {/* Stats Grid - 4 Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <Card key={item.name} className="p-7 border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[14px] bg-white flex flex-col justify-between h-48 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <div className={`h-14 w-14 rounded-[14px] flex items-center justify-center ${item.color} text-white shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="h-7 w-7" />
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] ${item.isNegative ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <TrendingUp className={cn("h-3 w-3", item.isNegative && "rotate-180")} />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                    {item.change}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-tight mb-1">{item.name}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{item.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions Section */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight text-nowrap">Быстрые действия</h2>
                    <div className="h-px bg-slate-100 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {actions.map((action) => (
                        <Link key={action.name} href={action.href} className="group">
                            <Card className="h-56 border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[14px] bg-white flex flex-col items-center justify-center gap-6 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-pointer relative overflow-hidden text-center p-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center text-white ${action.color} shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className="h-10 w-10" />
                                </div>
                                <div className="relative z-10 space-y-1">
                                    <span className="block font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{action.name}</span>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">Нажать для перехода</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
