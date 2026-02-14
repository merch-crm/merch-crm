"use client";

import React from "react";
import { formatUnit } from "@/lib/utils";
import { Store } from "lucide-react";
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
                    key={stock.id} // Kept original key, assuming stock.id is still valid
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors group" // Replaced slate colors
                >
                    <div className="flex items-center gap-4"> {/* Changed gap-3 to gap-4 */}
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border shadow-sm group-hover:border-primary/20 transition-colors"> {/* Replaced slate colors and rounded-2xl to rounded-xl */}
                            <Store className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> {/* Replaced Warehouse icon and slate colors */}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-foreground"> {/* Replaced text-xs font-bold text-slate-900 */}
                                {stock.storageLocation?.name || "Основной"}
                            </h4>
                            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Складское помещение</p> {/* Replaced text-[9px] font-bold text-slate-400 and text */}
                        </div>
                    </div>
                    <div className="flex items-center gap-2"> {/* Added gap-2 */}
                        <div className="px-3 py-1.5 rounded-lg bg-background border border-border shadow-sm"> {/* New div for quantity display */}
                            <span className="text-base font-black text-foreground tabular-nums">{stock.quantity}</span> {/* Replaced text-xl font-bold text-slate-900 */}
                            <span className="ml-1 text-[10px] font-bold text-muted-foreground">{formatUnit(unit)}</span> {/* Replaced text-[10px] font-bold text-slate-400 */}
                        </div>
                    </div>
                </div>
            ))}
            {stocks.length === 0 && ( // Kept original condition, assuming stocks is still the array
                <div className="p-8 text-center bg-muted/30 rounded-3xl border border-dashed border-border/50"> {/* Replaced slate colors and styling */}
                    <p className="text-sm font-bold text-muted-foreground">Нет данных по размещению</p> {/* Replaced text-[10px] font-bold text-slate-400 and text */}
                </div>
            )}
        </div>
    );
}
