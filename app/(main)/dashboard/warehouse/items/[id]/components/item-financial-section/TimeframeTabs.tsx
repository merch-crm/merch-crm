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
            <div className="inline-flex p-1 bg-muted/30 backdrop-blur-md border border-border/40 rounded-full shadow-sm">
                {PERIODS.map((p) => (
                    <button type="button"
                        key={p.value}
                        onClick={() => setTimeframe(p.value as Timeframe)}
                        aria-label={`Период: ${p.label}`}
                        aria-pressed={timeframe === p.value}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold transition-all duration-300 rounded-full whitespace-nowrap",
                            timeframe === p.value
                                ? "bg-foreground text-background shadow-md transform scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
