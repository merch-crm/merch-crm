import React from "react";
import { CircleDollarSign, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Financials {
    totalCostValue: number;
    totalRetailValue: number;
    frozenCostValue: number;
    frozenRetailValue: number;
    writeOffValue30d: number;
}

interface FinancialBentoProps {
    financials: Financials;
    currencySymbol: string;
}

function formatMoney(value: number, symbol: string): string {
    if (value === 0) return `0 ${symbol}`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн ${symbol}`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)} тыс ${symbol}`;
    return `${value.toFixed(0)} ${symbol}`;
}

export const FinancialBento = React.memo(({ financials, currencySymbol }: FinancialBentoProps) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* 1. Себестоимость склада */}
            <div className="crm-card bg-gradient-to-b from-slate-50/80 to-white flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <span className="text-sm font-black">С/С​</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                            <span className="hidden sm:inline">Себестоимость</span>
                            <span className="sm:hidden">С/с</span>
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 hidden sm:block">Оценка по закупке</p>
                    </div>
                </div>
                <div className="mt-auto pt-2 border-t border-slate-100">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums ">
                        {formatMoney(financials.totalCostValue, currencySymbol)}
                    </span>
                </div>
            </div>

            {/* 2. Розничная стоимость */}
            <div className="crm-card bg-gradient-to-b from-emerald-50/60 to-white flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <CircleDollarSign className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">Розница</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 hidden sm:block">Оценка по продаже</p>
                    </div>
                </div>
                <div className="mt-auto pt-2 border-t border-slate-100">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums ">
                        {formatMoney(financials.totalRetailValue, currencySymbol)}
                    </span>
                </div>
            </div>

            {/* 3. Заморожено в резерве */}
            <div className="crm-card bg-gradient-to-b from-indigo-50/60 to-white flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">В резерве</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 hidden sm:block">Забронировано</p>
                    </div>
                </div>
                <div className="mt-auto pt-2 border-t border-slate-100">
                    <span className="text-xl sm:text-2xl font-black text-indigo-600 tabular-nums ">
                        {formatMoney(financials.frozenCostValue, currencySymbol)}
                    </span>
                </div>
            </div>

            {/* 4. Списания за 30 дней */}
            <div className="crm-card bg-gradient-to-b from-rose-50/60 to-white flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">Списания</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 hidden sm:block">За 30 дней</p>
                    </div>
                </div>
                <div className="mt-auto pt-2 border-t border-slate-100">
                    <span className={cn(
                        "text-xl sm:text-2xl font-black tabular-nums ",
                        financials.writeOffValue30d > 0 ? "text-rose-500" : "text-slate-400"
                    )}>
                        {formatMoney(financials.writeOffValue30d, currencySymbol)}
                    </span>
                </div>
            </div>
        </div>
    );
});

FinancialBento.displayName = "FinancialBento";
