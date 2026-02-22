"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "./utils";
import { PriceRowProps } from "./types";

export function PriceRow({
    icon,
    colorClasses,
    label,
    description,
    amount,
    currency,
    isNegative,
    highlighted,
    onClick,
    hasDetails,
    showDetails,
    quantityInfo
}: PriceRowProps) {
    const Component = onClick ? "button" : "div";

    return (
        <Component
            type={onClick ? "button" : undefined}
            className={cn(
                "w-full text-left p-4 flex items-center gap-3 border-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-transparent",
                highlighted && "bg-amber-50",
                onClick && "cursor-pointer hover:bg-slate-50 transition-colors"
            )}
            onClick={onClick}
            onKeyDown={onClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClasses.bg)}>
                <span className={colorClasses.text}>{icon}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    {hasDetails && (
                        <ChevronDown
                            className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                showDetails && "rotate-180"
                            )}
                        />
                    )}
                </div>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
                {quantityInfo && <p className="text-xs text-slate-400 mt-0.5">{quantityInfo}</p>}
            </div>

            <div className="text-right shrink-0">
                <p className={cn("text-sm font-bold", isNegative ? "text-emerald-600" : "text-slate-900")}>
                    {isNegative && "−"}
                    {formatPrice(Math.abs(amount), currency)}
                </p>
            </div>
        </Component>
    );
}
