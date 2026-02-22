"use client";

import * as React from "react";
import { Play, Square, Coffee, Pause, Clock, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, formatDurationLong } from "./utils";
import { TimeTrackerProps } from "./types";
import { useTimeTracker } from "./useTimeTracker";

export function TimeTracker({
    status,
    startTime,
    totalToday = 0,
    onStart,
    onStop,
    onPause,
    onResume,
    onBreak,
    className,
}: TimeTrackerProps) {
    const isWorking = status !== "idle";
    const isActive = status === "working";
    const elapsed = useTimeTracker(startTime, isActive);

    return (
        <div className={cn(
            "crm-card bg-white border-2 rounded-3xl p-6 transition-all duration-300",
            isWorking ? "border-emerald-500/20 shadow-xl shadow-emerald-500/5 scale-[1.02]" : "border-slate-100 shadow-sm",
            className
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isWorking ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400"
                    )}>
                        <Clock className={cn("w-7 h-7", isActive && "animate-pulse-slow")} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Трекер смены</h2>
                            {isWorking && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-xs font-black text-emerald-600 animate-pulse">
                                    Активен
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-slate-400">Контролируйте свое рабочее время</p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="text-xs font-black tracking-wider">Всего за сегодня</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">
                        {formatDurationLong(totalToday + elapsed)}
                    </p>
                </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 mb-8 flex flex-col items-center">
                <div className={cn(
                    "text-6xl font-black tabular-nums tracking-tighter mb-4 transition-all duration-500",
                    isWorking ? "text-emerald-600 scale-110" : "text-slate-200"
                )}>
                    {isActive ? formatDuration(elapsed) : "00:00:00"}
                </div>
                {isWorking ? (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black">Идет учет</span>
                    </div>
                ) : (
                    <span className="text-xs font-black text-slate-300 italic">Нажмите кнопку для начала</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {!isWorking ? (
                    <button
                        type="button"
                        onClick={onStart}
                        className="lg:col-span-4 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                    >
                        <Play className="w-5 h-5 fill-current ml-1" />
                        Начать рабочую смену
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onStop}
                            className="h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-200 active:scale-95"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            Завершить
                        </button>

                        {status === "paused" ? (
                            <button
                                type="button"
                                onClick={onResume}
                                className="h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-600 font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Продолжить
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onPause}
                                className="h-14 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-600 font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                                Пауза
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onBreak}
                            className="h-14 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-600 font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Coffee className="w-5 h-5" />
                            Перерыв
                        </button>

                        <button
                            type="button"
                            className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Pause className="w-5 h-5" />
                            Заметка
                        </button>
                    </>
                )}
            </div>
        </div >
    );
}
