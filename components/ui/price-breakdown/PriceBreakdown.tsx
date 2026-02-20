"use client";

import * as React from "react";
import { Calculator, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { formatPrice } from "./utils";
import { PriceBreakdownProps } from "./types";
import { PriceLineItem } from "./PriceLineItem";

export function PriceBreakdown({
    lines,
    title = "Расчёт стоимости",
    currency = "₽",
    showQuantity = true,
    showUnitPrice = true,
    collapsible = false,
    defaultExpanded = true,
    className,
}: PriceBreakdownProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const totalLine = lines.find((l) => l.type === "total");
    const otherLines = lines.filter((l) => l.type !== "total");

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            {/* Хедер */}
            <div role="button" tabIndex={0}
                className={cn(
                    "p-4 border-b border-slate-100 flex items-center justify-between",
                    collapsible && "cursor-pointer hover:bg-slate-50 transition-colors"
                )}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                onClick={() => collapsible && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                        <p className="text-xs text-slate-500">
                            {lines.length} {pluralize(lines.length, 'позиция', 'позиции', 'позиций')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {totalLine && (
                        <span className="text-lg font-bold text-slate-900">
                            {formatPrice(totalLine.amount, currency)}
                        </span>
                    )}
                    {collapsible && (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Контент */}
            {(!collapsible || isExpanded) && (
                <div className="divide-y divide-slate-100">
                    {otherLines.map((line) => (
                        <PriceLineItem
                            key={line.id}
                            line={line}
                            currency={currency}
                            showQuantity={showQuantity}
                            showUnitPrice={showUnitPrice}
                        />
                    ))}

                    {/* Итого */}
                    {totalLine && (
                        <div className="p-4 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">{totalLine.label}</span>
                                <span className="text-xl font-bold text-slate-900">
                                    {formatPrice(totalLine.amount, currency)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
