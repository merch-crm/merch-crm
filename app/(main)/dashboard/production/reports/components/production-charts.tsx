"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DailyOutput {
    date: string;
    completed: number;
    defects: number;
    target: number;
}

/**
 * График ежедневной выработки (Bar Chart)
 */
export function DailyOutputChart({ data = [] }: { data: DailyOutput[] }) {
    const safeData = data || [];
    if (!safeData.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Нет данных за выбранный период
            </div>
        );
    }

    const maxValue = Math.max(...safeData.map((d) => Math.max(d.completed, d.target)));

    return (
        <div className="h-64 flex items-end gap-1">
            {safeData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-0.5" style={{ height: "200px" }}>
                        <div
                            className="w-full bg-emerald-500 rounded-t transition-all"
                            style={{
                                height: `${(item.completed / maxValue) * 100}%`,
                            }}
                        />
                        {item.defects > 0 && (
                            <div
                                className="w-full bg-rose-400 rounded-b transition-all"
                                style={{
                                    height: `${(item.defects / maxValue) * 100}%`,
                                }}
                            />
                        )}
                    </div>
                    <span className="text-xs text-slate-400">
                        {format(new Date(item.date), "dd.MM", { locale: ru })}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Индикатор процента выполнения плана (Circular Chart)
 */
export function CompletionRateChart({ data = [] }: { data: DailyOutput[] }) {
    const safeData = data || [];
    if (!safeData.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Нет данных за выбранный период
            </div>
        );
    }

    const totalCompleted = safeData.reduce((sum, d) => sum + d.completed, 0);
    const totalTarget = safeData.reduce((sum, d) => sum + d.target, 0);
    const completionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

    return (
        <div className="h-64 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={completionRate >= 100 ? "#10b981" : "#6366f1"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(completionRate / 100) * 440} 440`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                        {completionRate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400">выполнено</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                    {totalCompleted.toLocaleString()} из {totalTarget.toLocaleString()} шт
                </p>
            </div>
        </div>
    );
}
