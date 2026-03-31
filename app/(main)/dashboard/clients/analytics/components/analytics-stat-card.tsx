"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    trend?: number;
    trendLabel?: string;
    className?: string;
    onClick?: () => void;
}

export function AnalyticsStatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = "text-blue-500",
    iconBgColor = "bg-blue-50",
    trend,
    trendLabel,
    className,
    onClick,
}: AnalyticsStatCardProps) {
    const hasTrend = trend !== undefined;
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;
    const isNeutral = trend === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "crm-card p-6 bg-white flex flex-col justify-between h-40 transition-all duration-300",
                onClick && "cursor-pointer hover:shadow-lg",
                className
            )}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div
                    className={cn(
                        "h-11 w-11 rounded-xl flex items-center justify-center shadow-inner",
                        iconBgColor
                    )}
                >
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>

                {hasTrend && (
                    <div
                        className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                            isPositive && "bg-emerald-50 text-emerald-600",
                            isNegative && "bg-rose-50 text-rose-600",
                            isNeutral && "bg-slate-50 text-slate-500"
                        )}
                    >
                        {isPositive && <TrendingUp className="w-3 h-3" />}
                        {isNegative && <TrendingDown className="w-3 h-3" />}
                        {isNeutral && <Minus className="w-3 h-3" />}
                        {trend > 0 ? "+" : ""}{trend}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
                {trendLabel && (
                    <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>
                )}
            </div>
        </motion.div>
    );
}
