"use client";

import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statCardVariants = cva("", {
    variants: {
        variant: {
            default: "",
            success: "border-green-200 bg-green-50/50",
            warning: "border-yellow-200 bg-yellow-50/50",
            danger: "border-red-200 bg-red-50/50",
            info: "border-blue-200 bg-blue-50/50",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface StatCardProps extends VariantProps<typeof statCardVariants> {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    trend?: {
        value: number;
        label?: string;
    };
    chart?: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = "text-muted-foreground",
    trend,
    chart,
    variant,
    className,
    onClick,
}: StatCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return TrendingUp;
        if (trend.value < 0) return TrendingDown;
        return Minus;
    };

    const getTrendColor = () => {
        if (!trend) return "";
        if (trend.value > 0) return "text-green-600";
        if (trend.value < 0) return "text-red-600";
        return "text-muted-foreground";
    };

    const TrendIcon = getTrendIcon();

    return (
        <Card className={cn( statCardVariants({ variant }), onClick && "cursor-pointer hover:shadow-md transition-shadow", className )} onClick={onClick}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">{value}</p>
                            {trend && TrendIcon && (
                                <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                                    <TrendIcon className="h-4 w-4" />
                                    <span>{Math.abs(trend.value)}%</span>
                                    {trend.label && (
                                        <span className="text-muted-foreground">{trend.label}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn("p-2 rounded-lg bg-muted", iconColor)}>
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
                {chart && <div className="mt-4">{chart}</div>}
            </CardContent>
        </Card>
    );
}
