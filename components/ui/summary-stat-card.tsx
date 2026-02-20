import React from 'react';
import { cn } from "@/lib/utils";

export interface SummaryStatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    label: string;
    value: number | string;
    className?: string;
}

export function SummaryStatCard({ icon: Icon, iconColor, label, value, className }: SummaryStatCardProps) {
    return (
        <div
            className={cn(
                "group flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all",
                className
            )}
            aria-label={`${label}: ${value}`}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-transform">
                    <Icon className={cn("w-4.5 h-4.5", iconColor)} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-600 transition-colors">{label}</span>
            </div>
            <div className="text-xl font-black text-slate-900 tabular-nums shrink-0">{value}</div>
        </div>
    );
}
