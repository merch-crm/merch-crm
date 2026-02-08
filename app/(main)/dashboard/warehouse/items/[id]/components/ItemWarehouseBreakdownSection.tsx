"use client";

import React from "react";
import { Warehouse } from "lucide-react";
import { ItemStock } from "../../../types";

interface ItemWarehouseBreakdownSectionProps {
    stocks: ItemStock[];
    unit: string;
}

export function ItemWarehouseBreakdownSection({
    stocks,
    unit,
}: ItemWarehouseBreakdownSectionProps) {
    return (
        <div className="space-y-4">
            {stocks.map((stock) => (
                <div
                    key={stock.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50 group hover:bg-white hover:shadow-md transition-all duration-300"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Warehouse className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 leading-none mb-1">
                                {stock.storageLocation?.name || "Основной"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                                Локация
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-900 tabular-nums">{stock.quantity}</span>
                            <span className="text-[10px] font-bold text-slate-400">{unit}</span>
                        </div>
                    </div>
                </div>
            ))}
            {stocks.length === 0 && (
                <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400">Нет запасов на складах</p>
                </div>
            )}
        </div>
    );
}
