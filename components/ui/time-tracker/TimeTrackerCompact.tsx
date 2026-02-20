"use client";

import * as React from "react";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "./utils";
import { TimeTrackerCompactProps } from "./types";
import { useTimeTracker } from "./useTimeTracker";

export function TimeTrackerCompact({
    status,
    startTime,
    onStart,
    onStop,
    className,
}: TimeTrackerCompactProps) {
    const isWorking = status === "working";
    const elapsed = useTimeTracker(startTime, isWorking);

    return (
        <div className={cn(
            "flex items-center gap-2 p-1 pl-3 rounded-xl border transition-all",
            isWorking
                ? "bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100/50"
                : "bg-white border-slate-200 hover:border-slate-300",
            className
        )}>
            <div className="flex flex-col">
                <span className={cn(
                    "text-xs font-black leading-none mb-0.5",
                    isWorking ? "text-emerald-500" : "text-slate-400"
                )}>
                    {isWorking ? "В работе" : "Смена не начата"}
                </span>
                <span className={cn(
                    "text-xs font-black tabular-nums leading-none",
                    isWorking ? "text-emerald-600" : "text-slate-400"
                )}>
                    {isWorking ? formatDuration(elapsed) : "--:--:--"}
                </span>
            </div>

            <button
                type="button"
                onClick={isWorking ? onStop : onStart}
                className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95",
                    isWorking
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                )}
            >
                {isWorking ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
            </button>
        </div>
    );
}
