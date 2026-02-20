"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatPrice, formatPercent } from "./utils";
import { PriceComparisonProps } from "./types";

export function PriceComparison({
    quantities,
    calculatePrice,
    currentQuantity,
    onSelectQuantity,
    currency = "₽",
    className,
}: PriceComparisonProps) {
    const prices = quantities.map((qty) => ({
        quantity: qty,
        total: calculatePrice(qty),
        perUnit: calculatePrice(qty) / qty,
    }));

    const minPerUnit = Math.min(...prices.map((p) => p.perUnit));

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Сравнение тиражей</p>
                <p className="text-xs text-slate-500">Чем больше тираж — тем выгоднее</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100">
                {prices.map((price) => {
                    const isSelected = price.quantity === currentQuantity;
                    const isBest = price.perUnit === minPerUnit;
                    const savings = prices[0].perUnit - price.perUnit;
                    const savingsPercent = (savings / prices[0].perUnit) * 100;

                    return (
                        <button
                            key={price.quantity}
                            type="button"
                            onClick={() => onSelectQuantity?.(price.quantity)}
                            disabled={!onSelectQuantity}
                            className={cn(
                                "p-4 text-center transition-colors relative",
                                isSelected && "bg-primary/5",
                                onSelectQuantity && "hover:bg-slate-50",
                                !onSelectQuantity && "cursor-default"
                            )}
                        >
                            {isBest && (
                                <div className="absolute top-2 right-2">
                                    <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                                        Выгодно
                                    </span>
                                </div>
                            )}

                            <p className="text-2xl font-bold text-slate-900">{price.quantity}</p>
                            <p className="text-xs text-slate-500 mb-2">штук</p>

                            <p className="text-sm font-bold text-primary">
                                {formatPrice(price.perUnit, currency)}/шт
                            </p>
                            <p className="text-xs text-slate-400">
                                {formatPrice(price.total, currency)}
                            </p>

                            {savingsPercent > 0 && (
                                <p className="text-xs text-emerald-600 font-medium mt-1">
                                    −{formatPercent(savingsPercent)}
                                </p>
                            )}

                            {isSelected && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
