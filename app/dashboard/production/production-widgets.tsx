"use client";

import { Factory, AlertCircle, CheckCircle2, Gauge, Timer } from "lucide-react";


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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
            {/* Main Stats: Active in Production - Span 6 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-[#f59e0b] text-white rounded-[var(--radius-outer)] p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-[#f59e0b]/30 border border-[#f59e0b]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[18px] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                            <Factory className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Производство</h3>
                            <p className="text-sm font-medium text-white/70 mt-1">
                                Активные заказы в цеху
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-8">
                    <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-bold tracking-tighter">
                            {stats.active}
                        </span>
                        <span className="text-xl font-bold text-white/60">заказов</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                            <Timer className="w-3.5 h-3.5" />
                            <span>Среднее время: 48ч</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column Grid - Span 6 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Urgent Attention */}
                <div className="col-span-1 sm:col-span-2 bg-white p-6 rounded-[var(--radius-outer)] border border-rose-100 shadow-crm-md relative overflow-hidden group hover:border-rose-200 transition-all duration-300">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-[14px] bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-rose-600 tracking-tight leading-none mb-1">{stats.urgent}</div>
                            <div className="text-sm font-bold text-rose-400 uppercase tracking-wide">Срочные / Просроченные</div>
                        </div>
                    </div>
                </div>

                {/* Efficiency */}
                <div className="bg-white p-6 rounded-[var(--radius-outer)] border border-slate-200/60 shadow-crm-md relative overflow-hidden group hover:shadow-crm-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Gauge className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">KPI</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{stats.efficiency}%</div>
                        <p className="text-xs font-bold text-slate-400">Эффективность смены</p>
                    </div>
                </div>

                {/* Completed Today */}
                <div className="bg-white p-6 rounded-[var(--radius-outer)] border border-slate-200/60 shadow-crm-md relative overflow-hidden group hover:shadow-crm-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Сегодня</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{stats.completedToday}</div>
                        <p className="text-xs font-bold text-slate-400">Готово к сдаче</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
