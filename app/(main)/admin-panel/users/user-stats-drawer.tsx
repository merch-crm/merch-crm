"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, CheckCircle, PieChart, Loader2, Calendar } from "lucide-react";
import { getUserStats } from "./stats/actions";
import { useBranding } from "@/components/branding-provider";
import { Button } from "@/components/ui/button";


interface UserStatsDrawerProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface StatsData {
    user: {
        name: string;
        role: string;
        avatar: string | null;
    };
    orders: {
        total: number;
        totalRevenue: number;
        month: number;
        monthRevenue: number;
    };
    tasks: {
        total: number;
        completed: number;
        monthCompleted: number;
        efficiency: number;
    };
}

export function UserStatsDrawer({ userId, isOpen, onClose }: UserStatsDrawerProps) {
    const { currencySymbol } = useBranding();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            const loadStats = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await getUserStats(userId);
                    if (res.data) {
                        setStats(res.data as StatsData);
                    } else if (res.error) {
                        setError(res.error);
                    }
                } catch (err) {
                    console.error(err);
                    setError("Failed to load stats");
                } finally {
                    setLoading(false);
                }
            };
            loadStats();
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-end" role="dialog" aria-modal="true" data-dialog-open="true">
            <div role="button" tabIndex={0}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} />
            <div className="relative w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-200 bg-white">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                {loading ? "Загрузка..." : stats?.user.name || "Статистика"}
                            </h2>
                            <p className="text-sm font-medium text-slate-400 mt-1">
                                {stats?.user.role || "Сотрудник"}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 hover:bg-white transition-all font-bold shadow-sm"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-xs font-medium text-slate-400">Считаем показатели...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-rose-50 text-rose-600 rounded-[18px] border border-rose-100 font-medium text-center">
                            {error}
                        </div>
                    ) : stats ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Orders Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <TrendingUp className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-xs font-bold  text-slate-400">Продажи и Заказы</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-[18px] border border-slate-200 shadow-sm">
                                        <p className="text-xs font-medium text-slate-400 mb-1">Выручка за месяц</p>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {stats.orders.monthRevenue.toLocaleString()} {currencySymbol}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-[18px]">
                                            <Calendar className="w-3 h-3" />
                                            {stats.orders.month} заказов в этом месяце
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-[18px] border border-slate-200 shadow-sm">
                                            <p className="text-xs font-medium text-slate-400 mb-1">Всего заказов</p>
                                            <div className="text-xl font-bold text-slate-900">{stats.orders.total}</div>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-[18px] border border-slate-200 shadow-sm">
                                            <p className="text-xs font-medium text-slate-400 mb-1">Всего выручка</p>
                                            <div className="text-xl font-bold text-slate-900 truncate" title={stats.orders.totalRevenue.toLocaleString()}>
                                                {(stats.orders.totalRevenue / 1000).toFixed(0)}k {currencySymbol}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Efficiency Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <PieChart className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-xs font-bold  text-slate-400">Задачи и Эффективность</h3>
                                </div>
                                <div className="p-6 bg-primary rounded-[2rem] text-white shadow-lg shadow-primary/20">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-white/70 text-xs font-bold ">Эффективность</p>
                                            <div className="text-4xl font-bold mt-1">{stats.tasks.efficiency}%</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-white/70 text-xs mb-1">Выполнено задач</p>
                                            <p className="text-lg font-bold">{stats.tasks.completed} <span className="text-xs text-white/50 font-normal">/ {stats.tasks.total}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-xs mb-1">В этом месяце</p>
                                            <p className="text-lg font-bold">+{stats.tasks.monthCompleted}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
