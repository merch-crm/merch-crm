"use client";

import { Palette, Clock, TrendingUp } from "lucide-react";

interface DesignStatsProps {
    stats: {
        newTasks: number;
        pendingApproval: number;
        completed: number;
        efficiency: number;
    };
}

export function DesignWidgets({ stats }: DesignStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Hero Metric — 2 cols */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Задачи в работе</p>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[52px] font-black text-slate-900 tracking-tight leading-none tabular-nums">{stats.newTasks}</span>
                    <span className="text-[13px] font-semibold text-slate-400 mb-1">активных</span>
                </div>
                <p className="text-[12px] text-slate-400 mt-2">Дизайн-студия · Текущая очередь</p>
            </div>

            {/* Na utverzhdenii */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">На утверждении</p>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[52px] font-black text-amber-500 tracking-tight leading-none tabular-nums">{stats.pendingApproval}</span>
                </div>
                <p className="text-[12px] text-slate-400 mt-2">Ожидают ответа клиента</p>
            </div>

            {/* Effektivnost */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Эффективность</p>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[52px] font-black text-emerald-500 tracking-tight leading-none tabular-nums">{stats.efficiency}</span>
                    <span className="text-[22px] font-bold text-emerald-400 mb-1">%</span>
                </div>
                <p className="text-[12px] text-slate-400 mt-2">Принято с первого раза</p>
            </div>
        </div>
    );
}
