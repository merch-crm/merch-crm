"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type IconType } from "@/components/ui/stat-card";

interface MetricCardProps {
    title: string;
    value: number;
    suffix?: string;
    icon: IconType;
    trend?: number;
    color: "emerald" | "blue" | "rose" | "violet" | "amber";
    invertTrend?: boolean;
}

/**
 * Карточка метрики с индикатором тренда
 */
export function MetricCard({
    title,
    value,
    suffix,
    icon: Icon,
    trend,
    color,
    invertTrend,
}: MetricCardProps) {
    const colorClasses = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        rose: "bg-rose-50 text-rose-600",
        violet: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-600",
    };

    const isPositive = invertTrend ? (trend || 0) < 0 : (trend || 0) > 0;

    return (
        <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
                <div
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        colorClasses[color]
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold ">{title}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                    {value.toLocaleString("ru-RU")}
                </span>
                {suffix && (
                    <span className="text-slate-400 text-xs font-bold">{suffix}</span>
                )}
                {trend !== undefined && (
                    <Badge
                        className={cn(
                            "ml-auto",
                            isPositive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                        )}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(trend).toFixed(1)}%
                    </Badge>
                )}
            </div>
        </div>
    );
}
