"use client";

import { PlusCircle, Settings, CheckCircle2, TrendingUp, Sparkles, Layers } from "lucide-react";
import { Rouble } from "@/components/ui/icons";
import { pluralize } from "@/lib/pluralize";

interface OrderStatsProps {
    stats: {
        total: number;
        new: number;
        inProduction: number;
        completed: number;
        revenue: number;
    };
    showFinancials?: boolean;
}

export function OrdersWidgets({ stats, showFinancials }: OrderStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Main Stats: Revenue (if visible) or Total - Span 8 */}
            <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-slate-900 text-white rounded-[var(--radius-outer)] p-8 flex flex-col justify-between relative overflow-hidden group shadow-crm-xl border border-slate-800 min-h-[240px]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[var(--radius)] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                            {showFinancials ? <Rouble className="w-7 h-7" /> : <Layers className="w-7 h-7" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">
                                {showFinancials ? "Выручка за период" : "Всего заказов"}
                            </h3>
                            <p className="text-sm font-medium text-white/50 mt-1">
                                {showFinancials ? "Общая сумма подтвержденных заказов" : "Общее количество заказов в работе"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-8">
                    <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-bold tracking-normal">
                            {showFinancials ? stats.revenue.toLocaleString("ru-RU") : stats.total}
                        </span>
                        {showFinancials && <span className="text-3xl font-medium text-white/50">₽</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+12.5% к прошлому периоду</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column Grid - Span 4 */}
            <div className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col gap-5">
                {/* New Orders - Accent Card */}
                <div className="flex-1 glass-panel p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold  tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">Новые</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-normal mb-1">{stats.new}</div>
                        <p className="text-xs font-bold text-slate-400">Требуют обработки</p>
                    </div>
                </div>

                {/* In Production */}
                <div className="flex-1 glass-panel p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-orange-50 flex items-center justify-center text-orange-600">
                            <Settings className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <span className="text-[10px] font-bold  tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded-full">В работе</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-normal mb-1">{stats.inProduction}</div>
                        <p className="text-xs font-bold text-slate-400">На производстве</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Completed & Efficiency */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Completed */}
                <div className="glass-panel p-6 flex items-center gap-5 hover:border-emerald-200 group transition-all">
                    <div className="w-16 h-16 rounded-[var(--radius)] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 tracking-normal">{stats.completed}</div>
                        <div className="text-sm font-bold text-slate-400">{pluralize(stats.completed, 'заказ выполнен', 'заказа выполнено', 'заказов выполнено')}</div>
                    </div>
                    <div className="ml-auto">
                        <div className="w-12 h-12 rounded-full border-[3px] border-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                            100%
                        </div>
                    </div>
                </div>

                {/* Efficiency / AI Insight */}
                <div className="glass-panel p-6 flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <div className="w-16 h-16 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center text-primary shadow-sm relative z-10">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-lg font-bold text-slate-900 leading-tight mb-1">Эффективность</div>
                        <div className="text-sm font-medium text-slate-500">Все заказы обрабатываются в срок</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
