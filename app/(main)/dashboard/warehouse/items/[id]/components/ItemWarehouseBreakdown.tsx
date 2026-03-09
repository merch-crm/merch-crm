"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Warehouse, Store, Factory, MapPin } from "lucide-react";

const LOCATION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    warehouse: { label: "Склад", color: "bg-slate-100 text-slate-500" },
    production: { label: "Производство", color: "bg-amber-50 text-amber-600" },
    office: { label: "Офис", color: "bg-violet-50 text-violet-600" },
};

interface ItemWarehouseBreakdownProps {
    stocks: {
        storageLocation: {
            name: string;
            code?: string;
            address?: string | null;
            type?: "warehouse" | "production" | "office";
        } | null;
        quantity: number;
    }[];
}

export const ItemWarehouseBreakdown = React.memo(({ stocks }: ItemWarehouseBreakdownProps) => {
    const maxQuantity = React.useMemo(() => {
        return stocks.length > 0 ? Math.max(...stocks.map(s => s.quantity)) : 0;
    }, [stocks]);

    const getWarehouseIcon = (name: string, type?: string) => {
        if (type === "production") return <Factory className="w-4 h-4 text-amber-400" />;
        if (type === "office") return <Store className="w-4 h-4 text-violet-400" />;
        const lowerName = name.toLowerCase();
        if (lowerName.includes('магазин') || lowerName.includes('шоурум')) return <Store className="w-4 h-4 text-slate-400" />;
        if (lowerName.includes('производство') || lowerName.includes('цех')) return <Factory className="w-4 h-4 text-slate-400" />;
        return <Warehouse className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                    <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Разбивка по складам</h3>
            </div>

            <div className="flex flex-col gap-3">
                {stocks.map((s, idx) => {
                    const percentage = maxQuantity > 0 ? (s.quantity / maxQuantity) * 100 : 0;
                    const locationName = s.storageLocation?.name || "Неизвестный склад";
                    const locationType = s.storageLocation?.type;
                    const locationAddress = s.storageLocation?.address;
                    const typeInfo = locationType ? LOCATION_TYPE_LABELS[locationType] : null;

                    return (
                        <div key={idx} className="group space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                                        {getWarehouseIcon(locationName, locationType)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[13px] font-bold text-foreground truncate">
                                                {locationName}
                                            </span>
                                            {typeInfo && (
                                                <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0", typeInfo.color)}>
                                                    {typeInfo.label}
                                                </span>
                                            )}
                                        </div>
                                        {locationAddress && (
                                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                                                {locationAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1 shrink-0 pt-0.5">
                                    <span className="text-[13px] font-bold text-foreground tabular-nums">
                                        {s.quantity.toLocaleString('ru-RU')}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground tracking-tight">шт.</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {stocks.length === 0 && (
                <div className="py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                    <p className="text-xs font-bold text-muted-foreground">Нет данных о распределении</p>
                </div>
            )}
        </div>
    );
});

ItemWarehouseBreakdown.displayName = "ItemWarehouseBreakdown";
