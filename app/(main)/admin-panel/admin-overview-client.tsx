"use client";

import React from "react";
import {
    Users,
    ShieldCheck,
    Database,
    Clock,
    AlertTriangle,
    ChevronRight,
    Plus,
    BarChart3,
    HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/formatters";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActiveUser {
    name?: string;
    avatar?: string | null;
    role?: string;
}

interface EntityStat {
    type: string;
    count: number;
}

interface AdminOverviewProps {
    stats?: {
        server?: unknown;
        database?: { size: number; tableCounts?: Record<string, number> };
        storage?: { size: number; fileCount?: number };
    };
    monitoring?: {
        activeUsers?: ActiveUser[];
        entityStats?: EntityStat[];
    };
    security?: {
        systemErrors?: unknown[];
    };
    backups?: unknown[];
}

export function AdminOverviewClient({ stats, monitoring, security, backups }: AdminOverviewProps) {
    const isMobile = useIsMobile();
    const activeUsers = monitoring?.activeUsers || [];
    const entityStats = monitoring?.entityStats || [];
    const systemErrors = security?.systemErrors || [];




    const platformItems = [
        {
            title: "База данных",
            subtitle: "PostgreSQL Production",
            value: formatFileSize(stats?.database?.size || 0),
            progress: 85,
            color: "bg-primary",
            icon: <Database className="w-5 h-5" />
        },
        {
            title: "Хранилище S3",
            subtitle: "Files & Documents",
            value: formatFileSize(stats?.storage?.size || 0),
            progress: 42,
            color: "bg-slate-900",
            icon: <HardDrive className="w-5 h-5" />
        },
    ];

    return (
        <div className="space-y-4 pb-20">
            {/* Page Header */}
            <AdminPageHeader
                title="Обзор системы"
                subtitle="Основные показатели и состояние платформы MerchCRM"
                icon={ShieldCheck}
            />

            {/* Row 1: Greetings & Recommended Items (Platform Health) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Состояние платформы</h2>
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all group h-auto p-2"
                        >
                            Подробный мониторинг <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platformItems.map((item, i) => (
                            <div key={i} className="crm-card group cursor-default">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all",
                                        item.color
                                    )}>
                                        {item.icon}
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">+8</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-900 mb-1 text-2xl">{item.value}</h4>
                                    <p className="text-xs font-bold text-slate-400 mb-6">{item.title}</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">{item.subtitle}</span>
                                            <span className="text-primary">{item.progress}% Load</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Area - System Activity */}
                    <div className="crm-card relative h-[400px]">
                        <div className="absolute inset-x-4 md:inset-x-8 bottom-8 top-32 flex items-end justify-between gap-1.5 md:gap-4">
                            {(isMobile ? [30, 60, 40, 80, 50, 90] : [30, 45, 25, 60, 40, 80, 50, 70, 40, 90, 60, 30]).map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                                    <div className="w-full relative h-full flex items-end">
                                        <div className="absolute inset-0 bg-slate-50/50 rounded-t-lg md:rounded-t-xl" />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05, duration: 0.8 }}
                                            className="w-full bg-primary/20 rounded-t-lg md:rounded-t-xl group-hover:bg-primary/40 transition-all relative border-t-2 border-primary/40"
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                        {isMobile ? (i * 2 + 8) : (i + 8)}:00
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Status & Logs */}
                <div className="lg:col-span-4 space-y-4">
                    {/* System Guard Card (Premium Perks style) */}
                    <div className="crm-card !bg-primary !border-primary text-white !shadow-2xl !shadow-primary/30 relative min-h-[300px] flex flex-col justify-between group">
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute -left-10 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Защита системы</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                                Все модули работают в штатном режиме. Последняя проверка была 5 минут назад.
                            </p>
                        </div>

                        <Button
                            type="button"
                            className="relative z-10 w-full py-6 bg-white text-slate-900 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-95 transition-all h-auto border-none hover:bg-white/90"
                        >
                            Запустить диагностику
                        </Button>
                    </div>

                    {/* Active Sessions List (Daily Schedule style) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-slate-900">Сотрудники онлайн</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors h-10 w-10"
                            >
                                <Users className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {activeUsers.length > 0 ? activeUsers.slice(0, 5).map((user: ActiveUser, i: number) => (
                                <div
                                    key={i}
                                    className="crm-card flex items-center gap-4 cursor-pointer group !p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            // Handle interaction or navigation if needed
                                        }
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                        {user.avatar ? (
                                            <Image src={user.avatar} alt={user.name || "User"} width={48} height={48} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">
                                                {(user.name || "")[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-xs font-bold text-slate-400">{user.role || "Сотрудник"}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-300 group-hover:text-primary transition-colors">
                                        <Clock className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
                                    Нет активных сессий
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group font-bold text-xs h-auto bg-transparent border-slate-200"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Уведомить всех
                        </Button>
                    </div>
                </div>
            </div>

            {/* Row 2: Secondary Metrics (Bento Grid Bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Пользователей", value: entityStats.find((s: EntityStat) => s.type === "users")?.count || 0, icon: <Users />, color: "text-blue-600 bg-blue-50" },
                    { title: "Всего заказов", value: entityStats.find((s: EntityStat) => s.type === "orders")?.count || 0, icon: <BarChart3 />, color: "text-emerald-600 bg-emerald-50" },
                    { title: "Ошибки системы", value: systemErrors.length, icon: <AlertTriangle />, color: "text-rose-600 bg-rose-50" },
                    { title: "Бэкапов", value: backups?.length || 0, icon: <Clock />, color: "text-amber-600 bg-amber-50" },
                ].map((stat, i) => (
                    <div key={i} className="crm-card flex items-center gap-4 group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all", stat.color)}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 mb-1">{stat.title}</p>
                            <h4 className="text-2xl font-extrabold text-slate-900">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
