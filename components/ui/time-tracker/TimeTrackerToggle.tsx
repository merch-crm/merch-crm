"use client";

import * as React from"react";
import { Play, Square, Pause } from"lucide-react";
import { cn } from"@/lib/utils";
import { formatDuration } from"./utils";
import { TimeTrackerToggleProps } from"./types";
import { useTimeTracker } from"./useTimeTracker";

export function TimeTrackerToggle({
    status,
    startTime,
    initialElapsed = 0,
    onStart,
    onStop,
    onPause,
    onResume,
    size ="md",
    className,
}: TimeTrackerToggleProps) {
    const isActive = status ==="working";
    const elapsed = useTimeTracker(startTime, isActive, initialElapsed);

    const sizeClasses = {
        sm:"h-8 px-3 text-xs gap-1.5",
        md:"h-10 px-4 text-sm gap-2",
        lg:"h-12 px-6 text-base gap-3",
    };

    return (
        <div className={cn(
            "inline-flex items-center rounded-[20px] transition-all duration-300 shadow-sm overflow-hidden",
            status === "working" ? "bg-[#FFF9E6] text-[#D97706]" :
            status === "paused" ? "bg-[#FFF9E6] text-[#D97706]" :
            "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:ring-slate-300",
            sizeClasses[size],
            // For active state we remove the outer rings since it looks like a flat color and give specific width maybe or let it fit content
            status !== "idle" ? "ring-2 ring-inset ring-[#FDE68A]" : "",
            className
        )}>
            {status !== "idle" && (
                <>
                    {/* Main Interaction Side: Pause/Resume + Timer */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (status === "working") {
                                onPause?.();
                            } else {
                                onResume?.();
                            }
                        }}
                        className="flex-1 px-4 flex items-center justify-center gap-2.5 transition-colors h-full"
                        title={status === "working" ? "Пауза" : "Продолжить"}
                    >
                        {status === "working" ? (
                            <Pause className="w-4 h-4 fill-current" />
                        ) : (
                            <Play className="w-4 h-4 fill-current" />
                        )}
                        <span className="font-mono tabular-nums font-black tracking-tight whitespace-nowrap">
                            {formatDuration(elapsed)}
                        </span>
                    </button>

                    {/* Side Action: Stop */}
                    <div className="h-full py-1 pr-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStop(); }}
                            className="h-full px-4 rounded-[16px] flex items-center justify-center transition-all bg-[#FE2C55] hover:bg-[#E11D48] text-white"
                            title="Остановить рабочую смену"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                </>
            )}

            {status === "idle" && (
                <button
                    onClick={(e) => { e.stopPropagation(); onStart(); }}
                    className="flex-1 px-5 flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-colors h-full"
                >
                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                    <span className="font-bold text-sm">Начать смену</span>
                </button>
            )}
        </div>
    );
}
