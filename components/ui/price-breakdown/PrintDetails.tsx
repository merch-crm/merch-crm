"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { formatPrice } from "./utils";
import { PrintDetailsProps } from "./types";
import { PRINT_METHOD_CONFIG } from "./constants";

export function PrintDetails({
    method,
    colors,
    positions = 1,
    size,
    pricePerUnit,
    setupPrice = 0,
    quantity,
    currency = "₽",
    className,
}: PrintDetailsProps) {
    const config = PRINT_METHOD_CONFIG[method];
    const total = pricePerUnit * quantity + setupPrice;

    return (
        <div className={cn("p-4 rounded-xl border border-slate-200 bg-white", className)}>
            <div className="flex items-start gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                    <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">{config.name}</p>
                    <p className="text-xs text-slate-500">
                        {positions} {pluralize(positions, 'позиция', 'позиции', 'позиций')}
                        {colors && ` • ${colors} ${pluralize(colors, 'цвет', 'цвета', 'цветов')}`}
                    </p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                {size && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Размер</span>
                        <span className="font-medium text-slate-900">{size.width}×{size.height} мм</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-500">Цена за шт</span>
                    <span className="font-medium text-slate-900">{formatPrice(pricePerUnit, currency)}</span>
                </div>
                {setupPrice > 0 && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Приладка</span>
                        <span className="font-medium text-slate-900">{formatPrice(setupPrice, currency)}</span>
                    </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Итого ({quantity} шт)</span>
                    <span className="font-bold text-slate-900">{formatPrice(total, currency)}</span>
                </div>
            </div>
        </div>
    );
}
