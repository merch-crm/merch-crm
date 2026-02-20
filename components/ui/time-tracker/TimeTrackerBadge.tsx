"use client";

import * as React from "react";
import { format, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { formatDuration } from "./utils";
import { TimeTrackerBadgeProps } from "./types";
import { useTimeTracker } from "./useTimeTracker";

export function TimeTrackerBadge({ status, startTime, className }: TimeTrackerBadgeProps) {
    const elapsed = useTimeTracker(startTime, status === "working");

    const statusColors = {
        idle: "bg-slate-100 text-slate-500",
        working: "bg-emerald-100 text-emerald-600",
        break: "bg-amber-100 text-amber-600",
        paused: "bg-blue-100 text-blue-600",
    };

    const statusLabels = {
        idle: "Оффлайн",
        working: "В работе",
        break: "Перерыв",
        paused: "На паузе",
    };

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-black transition-colors",
            statusColors[status],
            className
        )}>
            <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                status === "working" ? "bg-emerald-500 animate-pulse" : "bg-current opacity-40"
            )} />
            <span>{statusLabels[status]}</span>
            {status === "working" && elapsed > 0 && (
                <span className="font-mono tabular-nums opacity-60">
                    {formatDuration(elapsed)}
                </span>
            )}
        </div>
    );
}
