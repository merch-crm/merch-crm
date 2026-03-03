import React from 'react';
import { cn } from"@/lib/utils";

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
            className={cn("flex items-center gap-3 p-3 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors duration-200",
                className
            )}
            aria-label={`${label}: ${value}`}
        >
            <div className="w-10 h-10 rounded-2xl bg-white hidden sm:flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Icon className={cn("w-5 h-5", iconColor)} aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
                <div className="text-xs font-bold text-slate-500 leading-tight sm:truncate mt-0.5">
                    {label}
                </div>
                <div className="text-xl font-black text-slate-900 tabular-nums leading-none">
                    {value}
                </div>
            </div>
        </div>
    );
}
