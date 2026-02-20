"use client";

import * as React from "react";
import { Play, Square, Clock, CalendarDays } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatDuration } from "./utils";
import { TimeTrackerWidgetProps } from "./types";
import { TimeTrackerToggle } from "./TimeTrackerToggle";
import { useTimeTracker } from "./useTimeTracker";

export function TimeTrackerWidget({
    status,
    startTime,
    entries,
    onStart,
    onStop,
    className,
}: TimeTrackerWidgetProps) {
    const isWorking = status === "working";
    const elapsed = useTimeTracker(startTime, isWorking);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="crm-card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            isWorking ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Рабочее время</h3>
                            <p className="text-xs font-bold text-slate-400">
                                {format(new Date(), "d MMMM, EEEE", { locale: ru })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <span className={cn(
                        "text-4xl font-black tabular-nums tracking-tighter mb-2",
                        isWorking ? "text-emerald-600" : "text-slate-300"
                    )}>
                        {isWorking ? formatDuration(elapsed) : "00:00:00"}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isWorking ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                        )} />
                        <span className="text-xs font-black text-slate-400">
                            {isWorking ? "Идет учет времени" : "Таймер остановлен"}
                        </span>
                    </div>
                </div>

                <TimeTrackerToggle
                    isWorking={isWorking}
                    startTime={startTime}
                    onToggle={isWorking ? onStop : onStart}
                    size="lg"
                    className="w-full"
                />
            </div>

            {/* История за сегодня */}
            <div className="crm-card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-400">История за сегодня</h3>
                    <span className="text-xs font-bold text-slate-300">{entries.length} записей</span>
                </div>

                <div className="space-y-3">
                    {entries.length === 0 ? (
                        <div className="text-center py-6">
                            <CalendarDays className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-300 tracking-tight">Записей пока нет</p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            {format(entry.startTime, "HH:mm", { locale: ru })} — {entry.endTime ? format(entry.endTime, "HH:mm", { locale: ru }) : "..."}
                                        </p>
                                        {entry.note && (
                                            <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>
                                        )}
                                    </div>
                                </div>
                                {entry.endTime && (
                                    <span className="text-xs font-black text-slate-900 tabular-nums">
                                        {formatDuration(differenceInSeconds(entry.endTime, entry.startTime))}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
