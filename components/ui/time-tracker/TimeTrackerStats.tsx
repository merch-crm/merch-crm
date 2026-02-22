import * as React from "react";
import { Clock, CalendarDays, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDurationLong } from "./utils";
import { TimeTrackerStatsProps } from "./types";

export function TimeTrackerStats({
    periodLabel,
    totalTime,
    averagePerDay,
    daysWorked,
    className,
}: TimeTrackerStatsProps) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3", className)}>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-black">Всего за {periodLabel}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatDurationLong(totalTime)}</p>
            </div>

            {averagePerDay !== undefined && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-xs font-black">В среднем в день</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{formatDurationLong(averagePerDay)}</p>
                </div>
            )}

            {daysWorked !== undefined && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-xs font-black">Отработано дней</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{daysWorked}</p>
                </div>
            )}
        </div>
    );
}
