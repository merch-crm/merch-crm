"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveOrderItem } from "@/app/(main)/dashboard/warehouse/types";
import { ItemActiveOrdersSection } from "./ItemActiveOrdersSection";

interface ItemActiveOrdersWrapperProps {
    activeOrders: ActiveOrderItem[];
    reservedQuantity: number;
    displayUnit: string;
    tabletTab: string;
}

export function ItemActiveOrdersWrapper({
    activeOrders,
    reservedQuantity,
    displayUnit,
    tabletTab
}: ItemActiveOrdersWrapperProps) {
    return (
        <div className={cn(
            "md:col-span-2 xl:col-span-12 crm-card rounded-3xl p-4 sm:p-8 flex flex-col space-y-4",
            tabletTab === 'placement' ? "flex" : "hidden",
            "xl:flex"
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-foreground">Зарезервировано в заказах</h3>
                </div>
                {activeOrders.length > 0 && (
                    <div className="px-4 py-2 bg-amber-100/50 rounded-3xl border border-amber-200/50 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-amber-700">
                            Всего в заказах: {reservedQuantity} {displayUnit}
                        </span>
                    </div>
                )}
            </div>
            <ItemActiveOrdersSection orders={activeOrders} />
        </div>
    );
}
