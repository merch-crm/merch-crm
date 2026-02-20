"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StockEntry {
    quantity: number;
    storageLocation?: {
        name: string;
    } | null;
}

interface ItemStockLocationsProps {
    stocks: StockEntry[];
}

export const ItemStockLocations = React.memo(({ stocks }: ItemStockLocationsProps) => {
    const sortedStocks = [...stocks].sort((a, b) => b.quantity - a.quantity);

    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-2 gap-3 pr-1 p-1 pb-4",
            sortedStocks.length > 5 && "max-h-[460px] overflow-y-auto custom-scrollbar"
        )}>
            {sortedStocks.map((s, idx) => {
                const isMain = idx === 0;
                const isLastSingle = !isMain && idx === sortedStocks.length - 1 && idx % 2 === 1;
                const isFullWidth = isMain || isLastSingle;

                return (
                    <div
                        key={idx}
                        className={cn(
                            "min-h-[100px] md:min-h-[110px] group p-4 md:p-5 rounded-2xl transition-all flex flex-col justify-between border",
                            isFullWidth && "md:col-span-1 xl:col-span-2",
                            isMain
                                ? "bg-emerald-50/30 border-emerald-200"
                                : "bg-muted/30 border-border hover:shadow-crm-md"
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <span className={cn(
                                "text-[14px] md:text-[15px] font-bold transition-colors truncate",
                                isMain ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {s.storageLocation?.name}
                            </span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-xl md:text-2xl font-black text-foreground tabular-nums leading-none">
                                    {s.quantity}
                                </span>
                                <span className="text-xs md:text-[11px] font-bold text-muted-foreground">
                                    шт.
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {isMain && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            )}

                            <span className="text-xs md:text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                                {isMain ? "Основной объём" : "Доп. склад"}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

ItemStockLocations.displayName = "ItemStockLocations";
