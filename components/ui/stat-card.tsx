"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ModernStatCardProps {
    icon: React.ElementType;
    value: string | number;
    label: string;
    subLabel?: string;
    badge?: {
        text: string;
        variant?: "success" | "warning" | "error" | "info" | "primary" | "neutral";
    };
    colorScheme?: "primary" | "emerald" | "amber" | "rose" | "blue" | "purple" | "indigo" | "slate" | "violet";
    className?: string;
    onClick?: () => void;
    suffix?: React.ReactNode;
}

const schemeMap = {
    primary: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/10", badgeBg: "bg-primary/10", badgeText: "text-primary" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", badgeBg: "bg-amber-50", badgeText: "text-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", badgeBg: "bg-rose-50", badgeText: "text-rose-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", badgeBg: "bg-blue-50", badgeText: "text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", badgeBg: "bg-purple-50", badgeText: "text-purple-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", badgeBg: "bg-indigo-50", badgeText: "text-indigo-600" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", badgeBg: "bg-slate-100", badgeText: "text-slate-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100", badgeBg: "bg-violet-50", badgeText: "text-violet-600" },
};

const badgeVariantMap = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    error: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    primary: "bg-primary/5 text-primary border-primary/20",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
};

export function ModernStatCard({
    icon: Icon,
    value,
    label,
    subLabel,
    badge,
    colorScheme = "primary",
    className,
    onClick,
    suffix
}: ModernStatCardProps) {
    const scheme = schemeMap[colorScheme] || schemeMap.primary;

    const Component = onClick ? "button" : "div";

    return (
        <Component
            onClick={onClick}
            type={onClick ? "button" : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            className={cn(
                "crm-card relative group transition-all duration-300 w-full text-left border-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-transparent",
                onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                className
            )}
        >
            <div className="flex items-center justify-between mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm",
                    scheme.bg,
                    scheme.text,
                    "border",
                    scheme.border
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                {badge && (
                    <div className={cn(
                        "px-2.5 py-1 rounded-2xl text-xs font-bold border",
                        badge.variant ? badgeVariantMap[badge.variant] : cn(scheme.badgeBg, scheme.badgeText, scheme.border)
                    )}>
                        {badge.text}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-slate-400 text-[11px] font-black tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {value}
                    </h3>
                    {suffix && (
                        <span className="text-lg font-bold text-slate-400">
                            {suffix}
                        </span>
                    )}
                </div>
                {subLabel && (
                    <p className="text-xs font-bold text-slate-400 mt-2">{subLabel}</p>
                )}
            </div>

            {/* Subtle glow effect on hover */}
            <div className={cn(
                "absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 blur-xl",
                scheme.bg
            )} />
        </Component>
    );
}

// Keep the old StatCard for backward compatibility if needed, but we could also merge them.
// For now, I'll export both.
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    colorScheme?: "emerald" | "amber" | "rose" | "blue" | "purple" | "indigo" | "slate" | "primary";
    className?: string;
    loading?: boolean;
    onClick?: () => void;
}

const oldColorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    slate: "bg-slate-50 text-slate-600",
    primary: "bg-primary/5 text-primary",
};

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    colorScheme = "primary",
    className,
    loading = false,
    onClick,
}: StatCardProps) {
    const Component = onClick ? "button" : "div";

    return (
        <Component
            className={cn(
                "border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden transition-all w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                onClick && "cursor-pointer hover:bg-slate-50 active:scale-[0.99]",
                className
            )}
            onClick={onClick}
            type={onClick ? "button" : undefined}
        >
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-[18px]", oldColorMap[colorScheme])}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-400 font-bold ">{title}</p>
                        {loading ? (
                            <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-lg mt-1" />
                        ) : (
                            <h3 className="text-xl font-bold text-slate-900">{value}</h3>
                        )}
                        {subtitle && (
                            <p className="text-xs text-slate-500 font-bold mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Component>
    );
}
