"use client";

import * as React from"react";
import { Play, Square, Pause } from"lucide-react";
import { cn } from"@/lib/utils";
import { formatDuration } from"./utils";
import { TimeTrackerCompactProps } from"./types";
import { useTimeTracker } from"./useTimeTracker";

export function TimeTrackerCompact({
    status,
    startTime,
    initialElapsed = 0,
    onStart,
    onStop,
    onPause,
    onResume,
    className,
}: TimeTrackerCompactProps) {
    const isActive = status ==="working";
    const isWorking = status !=="idle";
    const elapsed = useTimeTracker(startTime, isActive, initialElapsed);

    return (
        <div className={cn("flex items-center gap-2 p-1 pl-3 rounded-xl border transition-all",
            isWorking
                ? status ==="paused"
                    ?"bg-amber-50 border-amber-100 shadow-sm shadow-amber-100/50"
                    :"bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100/50"
                :"bg-white border-slate-200 hover:border-slate-300",
            className
        )}>
            <div className="flex flex-col min-w-[70px]">
                <span className={cn("text-[10px] font-black leading-none mb-0.5 uppercase tracking-wider",
                    status ==="working" ?"text-emerald-500" : status ==="paused" ?"text-amber-500" :"text-slate-400"
                )}>
                    {status ==="working" ?"В работе" : status ==="paused" ?"Пауза" :"Стоп"}
                </span>
                <span className={cn("text-xs font-black tabular-nums leading-none",
                    isWorking ? (status ==="paused" ?"text-amber-600" :"text-emerald-600") :"text-slate-400"
                )}>
                    {isWorking ? formatDuration(elapsed) :"--:--:--"}
                </span>
            </div>

            <div className="flex items-center gap-1">
                {isWorking && (
                    <button
                        type="button"
                        onClick={status ==="paused" ? onResume : onPause}
                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95",
                            status ==="paused"
                                ?"bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                                :"bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                        )}
                    >
                        {status ==="paused" ? (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        ) : (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                        )}
                    </button>
                )}

                <button
                    type="button"
                    onClick={isWorking ? onStop : onStart}
                    className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95",
                        isWorking
                            ?"bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200"
                            :"bg-emerald-500 hover:bg-emerald-600 text-white"
                    )}
                >
                    {isWorking ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
