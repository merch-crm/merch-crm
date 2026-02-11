"use client";

import { Palette, Clock, CheckCircle2, Sparkles } from "lucide-react";


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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
            {/* Main Stats: New Design Tasks - Span 6 */}
            <div className="crm-card col-span-12 md:col-span-6 lg:col-span-6 !bg-[#a855f7] text-white flex flex-col justify-between relative group !shadow-2xl !shadow-[#a855f7]/30 !border-[#a855f7]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[var(--radius)] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                            <Palette className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Дизайн-студия</h3>
                            <p className="text-sm font-medium text-white/70 mt-1">
                                Новые задачи на макетирование
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-8">
                    <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-bold tracking-normal">
                            {stats.newTasks}
                        </span>
                        <span className="text-xl font-bold text-white/60">задач</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Креативный процесс</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column Grid - Span 6 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pending Approval */}
                <div className="crm-card col-span-1 sm:col-span-2 !border-amber-100 relative group hover:!border-amber-200">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-600 tracking-normal leading-none mb-1">{stats.pendingApproval}</div>
                            <div className="text-sm font-bold text-amber-400  tracking-wide">На утверждении</div>
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div className="crm-card relative group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold  tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Готово</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-normal mb-1">{stats.completed}</div>
                        <p className="text-xs font-bold text-slate-400">Согласовано макетов</p>
                    </div>
                </div>

                {/* Quality Score */}
                <div className="crm-card relative group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[12px] bg-purple-50 flex items-center justify-center text-purple-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold  tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Качество</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 tracking-normal mb-1">{stats.efficiency}%</div>
                        <p className="text-xs font-bold text-slate-400">Принято с первого раза</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
