"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Timeframe, PERIODS } from "./types";

interface TimeframeTabsProps {
    timeframe: Timeframe;
    setTimeframe: (tf: Timeframe) => void;
}

export function TimeframeTabs({ timeframe, setTimeframe }: TimeframeTabsProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 bg-slate-100/60 backdrop-blur-sm rounded-2xl shadow-inner border border-slate-200/50">
                {PERIODS.map((p) => (
                    <button type="button"
                        key={p.value}
                        onClick={() => setTimeframe(p.value as Timeframe)}
                        aria-label={`Период: ${p.label}`}
                        aria-pressed={timeframe === p.value}
                        className={cn("px-4 py-1.5 text-xs font-black transition-all duration-300 rounded-xl whitespace-nowrap",
                            timeframe === p.value
                                ? "bg-white text-slate-900 shadow-sm scale-100"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95 hover:scale-100"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
