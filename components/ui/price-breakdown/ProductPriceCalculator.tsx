"use client";

import * as React from "react";
import { Box, Minus, Paintbrush, Percent, Plus, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { formatPrice } from "./utils";
import { TYPE_COLORS } from "./constants";
import { PriceRow } from "./PriceRow";
import { ProductPriceCalculatorProps } from "./types";

export function ProductPriceCalculator({
    blankPrice,
    blankName = "Бланк",
    quantity,
    printOptions = [],
    discount,
    shipping,
    currency = "₽",
    onQuantityChange,
    className,
}: ProductPriceCalculatorProps) {
    // Расчёты
    const blankTotal = blankPrice * quantity;

    const printDetails = printOptions.map((opt) => ({
        ...opt,
        total: opt.pricePerUnit * quantity + (opt.setupPrice || 0),
    }));

    const printTotal = printDetails.reduce((sum, opt) => sum + opt.total, 0);
    const subtotal = blankTotal + printTotal;

    let discountAmount = 0;
    if (discount) {
        discountAmount =
            discount.type === "percent" ? subtotal * (discount.value / 100) : discount.value;
    }

    const shippingAmount = shipping || 0;
    const total = subtotal - discountAmount + shippingAmount;

    // Цена за единицу с учётом всего
    const pricePerUnit = total / quantity;

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            {/* Хедер с количеством */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-900">Калькулятор стоимости</p>
                        <p className="text-xs text-slate-500">Цена за шт: {formatPrice(pricePerUnit, currency)}</p>
                    </div>

                    {onQuantityChange && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <Minus className="w-4 h-4 text-slate-600" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 h-8 text-center border border-slate-200 rounded-lg text-sm font-bold"
                            />
                            <button
                                type="button"
                                onClick={() => onQuantityChange(quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <Plus className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Разбивка */}
            <div className="divide-y divide-slate-100">
                {/* Бланк */}
                <PriceRow
                    icon={<Box className="w-4 h-4" />}
                    colorClasses={TYPE_COLORS.blank}
                    label={blankName}
                    amount={blankTotal}
                    currency={currency}
                    quantityInfo={`${quantity} × ${formatPrice(blankPrice, currency)}`}
                />

                {/* Нанесение */}
                {printDetails.map((opt) => (
                    <PriceRow
                        key={opt.id}
                        icon={<Paintbrush className="w-4 h-4" />}
                        colorClasses={TYPE_COLORS.print}
                        label={opt.name}
                        amount={opt.total}
                        currency={currency}
                        quantityInfo={`${quantity} × ${formatPrice(opt.pricePerUnit, currency)}${opt.setupPrice && opt.setupPrice > 0 ? ` + приладка ${formatPrice(opt.setupPrice, currency)}` : ""}${opt.colors ? ` • ${opt.colors} ${pluralize(opt.colors, 'цвет', 'цвета', 'цветов')}` : ""}${opt.positions ? ` • ${opt.positions} ${pluralize(opt.positions, 'позиция', 'позиции', 'позиций')}` : ""}`}
                    />
                ))}

                {/* Скидка */}
                {discount && discountAmount > 0 && (
                    <PriceRow
                        icon={<Percent className="w-4 h-4" />}
                        colorClasses={TYPE_COLORS.discount}
                        label={discount.label || "Скидка"}
                        amount={discountAmount}
                        currency={currency}
                        isNegative={true}
                        highlighted={true}
                        description={discount.type === "percent" ? `${discount.value}%` : undefined}
                    />
                )}

                {/* Доставка */}
                {shippingAmount > 0 && (
                    <PriceRow
                        icon={<Truck className="w-4 h-4" />}
                        colorClasses={TYPE_COLORS.shipping}
                        label="Доставка"
                        amount={shippingAmount}
                        currency={currency}
                    />
                )}
            </div>

            {/* Итого */}
            <div className="p-4 bg-slate-900">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">Итого</p>
                        <p className="text-xs text-slate-500">{quantity} шт.</p>
                    </div>
                    <span className="text-2xl font-bold text-white">
                        {formatPrice(total, currency)}
                    </span>
                </div>
            </div>
        </div>
    );
}
