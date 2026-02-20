"use client";

import * as React from "react";
import { Play, Square } from "lucide-react";
import { differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { formatDuration } from "./utils";
import { TimeTrackerToggleProps } from "./types";
import { useTimeTracker } from "./useTimeTracker";

export function TimeTrackerToggle({
    isWorking,
    startTime,
    onToggle,
    size = "md",
    className,
}: TimeTrackerToggleProps) {
    const elapsed = useTimeTracker(startTime, isWorking);

    const sizeClasses = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-3",
    };

    const iconSize = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "rounded-xl font-black transition-all flex items-center shadow-sm active:scale-95",
                isWorking
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white",
                sizeClasses[size],
                className
            )}
        >
            {isWorking ? (
                <>
                    <Square className={cn(iconSize[size], "fill-current")} />
                    <span className="font-mono tabular-nums">{formatDuration(elapsed)}</span>
                </>
            ) : (
                <>
                    <Play className={cn(iconSize[size], "fill-current ml-0.5")} />
                    <span>Начать смену</span>
                </>
            )}
        </button>
    );
}
