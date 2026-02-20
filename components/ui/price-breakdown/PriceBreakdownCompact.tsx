"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "./utils";
import { PriceBreakdownCompactProps } from "./types";

export function PriceBreakdownCompact({
    lines,
    currency = "₽",
    className,
}: PriceBreakdownCompactProps) {
    const totalLine = lines.find((l) => l.type === "total");
    const otherLines = lines.filter((l) => l.type !== "total");

    return (
        <div className={cn("space-y-2", className)}>
            {otherLines.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-sm">
                    <span className={cn(line.isNegative ? "text-emerald-600" : "text-slate-600")}>
                        {line.label}
                    </span>
                    <span className={cn("font-medium", line.isNegative ? "text-emerald-600" : "text-slate-900")}>
                        {line.isNegative && "−"}
                        {formatPrice(Math.abs(line.amount), currency)}
                    </span>
                </div>
            ))}

            {totalLine && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{totalLine.label}</span>
                    <span className="text-lg font-bold text-slate-900">
                        {formatPrice(totalLine.amount, currency)}
                    </span>
                </div>
            )}
        </div>
    );
}
