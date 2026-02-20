"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
    icon: React.ReactNode;
    iconBgClassName: string;
    iconTextClassName: string;
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const StatCard = ({
    icon,
    iconBgClassName,
    iconTextClassName,
    title,
    value,
    subtitle,
    children,
    onClick
}: StatCardProps) => (
    <Card
        className={cn(
            "border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden",
            onClick && "cursor-pointer hover:bg-slate-50 transition-colors"
        )}
        onClick={onClick}
    >
        <CardContent className={cn("p-6", onClick && "flex items-center justify-between")}>
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-[18px]", iconBgClassName, iconTextClassName)}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold ">{title}</p>
                    {typeof value === 'string' ? <h3 className="text-xl font-bold text-slate-900">{value}</h3> : value}
                    {typeof subtitle === 'string' ? <p className="text-xs text-slate-500 font-bold mt-0.5">{subtitle}</p> : subtitle}
                    {children}
                </div>
            </div>
        </CardContent>
    </Card>
);
