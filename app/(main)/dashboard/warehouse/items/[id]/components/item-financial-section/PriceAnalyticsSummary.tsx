"use client";

import React from "react";
import { ArrowUp, Activity, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceAnalyticsSummaryProps {
    actualMax: number;
    avg: number;
    actualMin: number;
    currencySymbol: string;
}

export function PriceAnalyticsSummary({
    actualMax,
    avg,
    actualMin,
    currencySymbol
}: PriceAnalyticsSummaryProps) {
    const stats = [
        { label: 'Максимум', value: actualMax, color: 'text-foreground', icon: ArrowUp, iconColor: 'text-rose-500' },
        { label: 'Средняя', value: avg, color: 'text-primary', icon: Activity, iconColor: 'text-primary' },
        { label: 'Минимум', value: actualMin, color: 'text-foreground', icon: ArrowDown, iconColor: 'text-emerald-500' }
    ];

    return (
        <div className="grid grid-cols-3 gap-3 relative z-10 px-0.5">
            {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-muted/20 border border-border transition-all hover:bg-card hover:border-border/80 group/stat">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-black text-muted-foreground transition-colors group-hover/stat:text-muted-foreground/80">{stat.label}</span>
                        <stat.icon className={cn("w-3.5 h-3.5 transition-transform duration-500 group-hover/stat:scale-110", stat.iconColor)} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className={cn("text-xl font-black tracking-tight", stat.color)}>
                            {Math.round(stat.value).toLocaleString()}
                        </span>
                        <span className="text-xs font-black text-muted-foreground/50">{currencySymbol}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
