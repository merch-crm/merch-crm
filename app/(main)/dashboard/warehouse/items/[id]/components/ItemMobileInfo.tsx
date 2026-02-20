"use client";

import { cn } from "@/lib/utils";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

interface ItemMobileInfoProps {
    item: InventoryItem;
    handleStartEdit: () => void;
    displayUnit: string;
    reservedQuantity: number;
}

export function ItemMobileInfo({
    item,
    handleStartEdit,
    displayUnit,
    reservedQuantity
}: ItemMobileInfoProps) {
    return (
        <div className="flex flex-col gap-2 justify-between md:contents h-full">
            <div className="md:hidden xl:flex flex flex-col flex-1 crm-card rounded-3xl p-3 sm:p-6 justify-between overflow-hidden h-full">
                <div className="mb-1 sm:mb-4 pb-1 sm:pb-4 border-b border-border">
                    <h3 className="text-[6px] sm:text-[11px] font-bold text-muted-foreground mb-0.5">Артикул / SKU</h3>
                    <p className="text-[14px] sm:text-[16px] font-black text-foreground leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>
                        {item.sku || "—"}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 sm:gap-3">
                    <div className="space-y-1 sm:space-y-3">
                        <div>
                            <h2 className="text-[5px] sm:text-xs font-bold text-muted-foreground mb-0.5 leading-none">Резерв и остаток</h2>
                            <div className="flex items-baseline gap-1 sm:gap-1.5">
                                <span className="text-5xl sm:text-5xl md:text-6xl font-black text-foreground leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.quantity}</span>
                                <span className="text-[11px] sm:text-sm font-black text-muted-foreground">{displayUnit}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            <div className={cn(
                                "inline-flex items-center px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-xs sm:text-xs font-bold border shrink-0",
                                item.quantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    (item.quantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                            )}>
                                {item.quantity === 0 ? "Нет" :
                                    (item.quantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                            </div>
                            <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-xs sm:text-xs font-bold border bg-amber-50/50 text-amber-600 border-amber-100 shrink-0">
                                Резерв: {reservedQuantity}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
