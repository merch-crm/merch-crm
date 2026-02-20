"use client";

import { cn } from "@/lib/utils";
import { Palette, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { ModernStatCard } from "@/components/ui/stat-card";

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8">
            {/* Main Stats: New Design Tasks - Span 6 */}
            <div className="crm-card col-span-12 md:col-span-6 lg:col-span-6 !bg-[#a855f7] text-white flex flex-col justify-between relative group !shadow-2xl !shadow-[#a855f7]/30 !border-[#a855f7]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
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
                    <div className="flex items-baseline gap-3">
                        <span className="text-7xl font-bold">
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
            <div className="col-span-12 md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pending Approval */}
                <ModernStatCard
                    icon={Clock}
                    value={stats.pendingApproval}
                    label="На утверждении"
                    colorScheme="amber"
                    className="col-span-1 sm:col-span-2"
                />

                <ModernStatCard
                    icon={CheckCircle2}
                    value={stats.completed}
                    label="Готово"
                    subLabel="Согласовано макетов"
                    colorScheme="emerald"
                />

                <ModernStatCard
                    icon={Sparkles}
                    value={stats.efficiency}
                    suffix="%"
                    label="Качество"
                    subLabel="Принято с первого раза"
                    colorScheme="purple"
                />
            </div>
        </div>
    );
}
