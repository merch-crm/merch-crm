"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { FinancialMetricCardProps } from "./types";

export function FinancialMetricCard({
    label,
    value,
    secondaryValue,
    icon: Icon,
    bgColor,
    iconColor,
    currencySymbol,
    isEditing,
    editValue,
    onEditChange,
    onDoubleClick,
    className
}: FinancialMetricCardProps) {
    const isLucideIcon = typeof Icon !== "string";

    return (
        <div className={cn(
            "group p-4 rounded-2xl bg-muted/20 border border-border transition-all duration-300 hover:bg-card hover:border-border/80 flex items-center gap-3 text-left h-full",
            className
        )}>
            <div className={cn(
                "w-11 h-11 rounded-3xl flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm border",
                bgColor,
                iconColor,
                bgColor.replace("bg-", "border-").concat("/50")
            )}>
                <div className="absolute inset-0 bg-white/40" />
                {isLucideIcon ? (
                    <Icon className="w-5 h-5 relative z-10" />
                ) : (
                    <span className="text-lg font-bold relative z-10">{Icon}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <span className="block text-xs font-black text-muted-foreground mb-1 transition-colors group-hover:text-muted-foreground/80">
                    {label}
                </span>
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            value={editValue ?? ""}
                            onChange={(e) => onEditChange?.(e.target.value)}
                            aria-label={label}
                            className="text-lg font-black text-foreground bg-transparent border-none p-1 w-full focus-visible:ring-0 shadow-none rounded-lg h-auto"
                        />
                    </div>
                ) : (
                    <div className={cn(onDoubleClick && "cursor-pointer")} onDoubleClick={onDoubleClick}>
                        <p className="text-lg font-black text-foreground tracking-tight group-hover:text-foreground/80 transition-colors">
                            {typeof value === "number" ? Math.round(value).toLocaleString('ru-RU') : value} {currencySymbol}
                        </p>
                        {secondaryValue && (
                            <span className="text-xs text-muted-foreground block -mt-0.5">
                                {secondaryValue}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
