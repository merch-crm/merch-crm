"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    UserPlus,
    UploadCloud,
    Package,
    TrendingUp,
    ArrowUpRight,
    ShoppingBag,
    Zap,
    LayoutGrid,
    Timer,
    CheckCircle2
} from "lucide-react";
import { Rouble } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";
import { useBranding } from "@/components/branding-provider";

type BrandingSettings = Awaited<ReturnType<typeof getBrandingSettings>>;
import { getDashboardStatsByPeriod, getDashboardNotifications } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
    createdAt: Date;
    isRead: boolean;
}

export function DashboardClient({ initialStats, period, userName, branding: initialBranding }: DashboardClientProps) {
    const { currencySymbol } = useBranding();
    const [statsData, setStatsData] = useState<DashboardStats>(initialStats);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTimeout(() => setTime(new Date()), 0);
        const fetchData = async () => {
            try {
                const [stats, notifs] = await Promise.all([
                    getDashboardStatsByPeriod(period),
                    getDashboardNotifications()
                ]);
                setStatsData(stats);
                setNotifications(notifs as Notification[]);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        // Initial fetch
        fetchData();

        const interval = setInterval(fetchData, 15000);
        const clockInterval = setInterval(() => setTime(new Date()), 60000);
        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, [period]);

    const primaryAction = {
        name: "Новый заказ",
        icon: Plus,
        color: "bg-primary",
        href: "/dashboard/orders",
    };

    const actions = [
        {
            name: "Добавить клиента",
            icon: UserPlus,
            color: "bg-primary",
            href: "/dashboard/clients",
        },
        {
            name: "Загрузить дизайн",
            icon: UploadCloud,
            color: "bg-violet-500",
            href: "/dashboard/design",
        },
        {
            name: "Склад",
            icon: Package,
            color: "bg-amber-500",
            href: "/dashboard/warehouse",
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Top Navigation / Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Общий обзор</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
                        <Timer className="w-3.5 h-3.5 text-primary" />
                        {time ? time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl text-xs font-bold text-white shadow-lg shadow-primary/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
                        {time ? time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : "..."}
                    </div>
                </div>
            </div>

            {/* MAIN BENTO GRID */}
            <div className="grid grid-cols-12 gap-4">

                {/* Hero / Welcome Card - Spans 8 cols */}
                <div className="col-span-12 md:col-span-8 lg:col-span-8 relative group overflow-hidden bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 via-violet-500/5 to-transparent rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-2xl text-[10px] font-bold text-primary mb-6 border border-primary/10 shadow-sm tracking-normal">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                </span>
                                AI-Integrated CRM v2.0
                            </div>

                            <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-normal mb-6">
                                {initialBranding?.dashboardWelcome?.includes('%name%')
                                    ? initialBranding.dashboardWelcome.replace('%name%', userName.split(' ')[0])
                                    : (initialBranding?.dashboardWelcome || "Привет") + `, `} <span className="text-primary">{userName.split(' ')[0]}</span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                            <p className="text-slate-500 font-medium max-w-sm leading-relaxed text-sm">
                                Система работает стабильно. У вас <span className="text-primary font-bold">4 новых заказа</span>, которые ожидают внимания.
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
                <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#212121] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-white rounded-2xl text-[10px] font-bold tracking-normal mb-2 border border-primary/30">
                            +18.4% рост
                        </div>
                        <h3 className="text-slate-400 text-sm font-semibold mb-1">Выручка за период</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl sm:text-5xl font-bold text-white tracking-normal">
                                {statsData?.revenue.replace(' ' + currencySymbol, '')}
                            </span>
                            <span className="text-2xl font-bold text-slate-500">{currencySymbol}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Прогноз: 1.2M {currencySymbol}</span>
                        <div className="flex h-1.5 w-24 bg-white/5 rounded-2xl overflow-hidden">
                            <div className="h-full bg-primary w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics Row */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Metric 1 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-primary flex items-center justify-center border border-slate-200 transition-all">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-2xl text-[10px] font-bold">
                                +12%
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold tracking-normal mb-1">Всего клиентов</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-normal">{statsData?.totalClients ?? 0}</p>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-primary flex items-center justify-center border border-slate-200 transition-all">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div className="bg-violet-50 text-primary px-2 py-1 rounded-2xl text-[10px] font-bold">
                                {statsData?.inProduction ?? 0} в работе
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold tracking-normal mb-1">Заказов в работе</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-normal">{statsData?.totalOrders ?? 0}</p>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-primary flex items-center justify-center border border-slate-200 transition-all">
                                <Rouble className="h-5 w-5" />
                            </div>
                            <div className="bg-rose-50 text-rose-600 px-2 py-1 rounded-2xl text-[10px] font-bold">
                                -2.4%
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold tracking-normal mb-1">Средний чек</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900 tracking-normal">{statsData?.averageCheck.replace(' ' + currencySymbol, '')}</span>
                            <span className="text-lg font-bold text-slate-400">{currencySymbol}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Header */}
                <div className="col-span-12 mt-6 mb-2 flex items-center gap-4">
                    <h2 className="text-sm font-bold text-slate-900 tracking-normal whitespace-nowrap">Управление системой</h2>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Primary Action Button - Spans full width or grid */}
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href={primaryAction.href} className="group flex flex-col">
                        <div className="h-full bg-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 transition-all">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-normal">{primaryAction.name}</span>
                        </div>
                    </Link>

                    {actions.map((action) => (
                        <Link key={action.name} href={action.href} className="group">
                            <div className="h-full bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all", action.color === "bg-primary" ? "bg-primary/10" : action.color.replace('bg-', 'bg-').replace('500', '50'))}>
                                    <action.icon className={cn("h-7 w-7", action.color === "bg-primary" ? "text-primary" : action.color.replace('bg-', 'text-').replace('500', '600'))} />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{action.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom Decorative Row */}
                <div className="col-span-12 lg:col-span-4 bg-primary rounded-2xl p-8 text-white relative overflow-hidden group shadow-lg shadow-primary/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                        < Zap className="w-8 h-8 text-primary-foreground/20 mb-4" />
                        <h4 className="text-xl font-bold mb-2">Обновите запасы</h4>
                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                            Мы заметили, что на складе осталось менее 10 футболок черного цвета (L).
                        </p>
                        <Link href="/dashboard/warehouse" className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl transition-colors border border-white/10 backdrop-blur-md">
                            Проверить склад <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 tracking-normal">Последние уведомления</h4>
                            <p className="text-slate-400 text-xs font-medium">Обновлено только что</p>
                        </div>
                        <button className="text-primary text-xs font-bold hover:underline">Прочитать все</button>
                    </div>

                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Нет новых уведомлений
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <div key={note.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/50 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full ring-4 shrink-0",
                                            note.type === "success" ? "bg-emerald-500 ring-emerald-500/10" :
                                                note.type === "info" ? "bg-sky-500 ring-sky-500/10" :
                                                    note.type === "warning" ? "bg-amber-500 ring-amber-500/10" :
                                                        "bg-rose-500 ring-rose-500/10"
                                        )} />
                                        <div>
                                            <span className="text-sm font-bold text-slate-700 block">{note.title}</span>
                                            <span className="text-xs text-slate-500 line-clamp-1">{note.message}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-normal shrink-0 ml-4">
                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ru })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
