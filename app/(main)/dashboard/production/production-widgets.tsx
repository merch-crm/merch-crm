"use client";

import { Factory, AlertCircle, CheckCircle2, Gauge, Timer } from"lucide-react";
import { pluralize } from"@/lib/pluralize";


interface ProductionStatsProps {
    stats: {
        active: number;
        urgent: number;
        efficiency: number;
        completedToday: number;
    };
}

export function ProductionWidgets({ stats }: ProductionStatsProps) {
    return (
        <div className="flex flex-col gap-3">
            {/* Top Row: Main Stats & Urgent Attention */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Main Stats: Active in Production - Span 7 */}
                <div className="crm-card col-span-12 md:col-span-12 lg:col-span-7 !bg-[#f59e0b] text-white flex flex-col justify-between relative group !shadow-2xl !shadow-[#f59e0b]/30 !border-[#f59e0b] min-h-[220px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                                <Factory className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">Производство</h3>
                                <p className="text-sm md:text-base font-medium text-white/70 mt-1">
                                    Активные заказы в цеху
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div className="flex items-baseline gap-3">
                            <span className="text-7xl md:text-8xl font-bold">
                                {stats.active}
                            </span>
                            <span className="text-xl md:text-2xl font-bold text-white/60">
                                {pluralize(stats.active, "заказ", "заказа", "заказов")}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                                <Timer className="w-3.5 h-3.5" />
                                <span>Среднее время: 48ч</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Urgent Attention - Span 5 */}
                <div className="crm-card col-span-12 md:col-span-12 lg:col-span-5 !border-rose-100 relative group hover:!border-rose-200 flex flex-col justify-between min-h-[220px]">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-rose-900 leading-tight">Внимание</h3>
                            <p className="text-sm font-medium text-rose-400">Срочно / Просрочено</p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="text-7xl font-bold text-rose-600 leading-none mb-1">
                            {stats.urgent}
                        </div>
                        <p className="text-sm font-bold text-rose-400/80 mt-3">Требуют немедленного вмешательства</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Efficiency & Completed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Efficiency Card */}
                <div className="crm-card relative group flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                <Gauge className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Эффективность</span>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">KPI</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold text-slate-900 mb-1">{stats.efficiency}%</div>
                        <p className="text-sm font-bold text-slate-400">Выполнение плана смены</p>
                    </div>
                </div>

                {/* Completed Today Card */}
                <div className="crm-card relative group flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Готово к сдаче</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Сегодня</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold text-slate-900 mb-1">{stats.completedToday}</div>
                        <p className="text-sm font-bold text-slate-400">
                            {pluralize(stats.completedToday, "заказ", "заказа", "заказов")} завершено
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
