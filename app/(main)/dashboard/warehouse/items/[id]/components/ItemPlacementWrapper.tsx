"use client";

import React from "react";
import { MapPin, Package } from "lucide-react";
import { pluralize } from "@/lib/pluralize";
import { cn } from "@/lib/utils";
import { StorageLocation, ItemStock } from "@/app/(main)/dashboard/warehouse/types";
import { ItemStockLocations } from "./ItemStockLocations";

interface ItemPlacementWrapperProps {
    storageLocations: StorageLocation[];
    stocks: ItemStock[];
    tabletTab: string;
}

export function ItemPlacementWrapper({
    storageLocations,
    stocks,
    tabletTab
}: ItemPlacementWrapperProps) {
    const sortedStocks = React.useMemo(() => {
        return storageLocations
            .map(loc => {
                const stockEntry = stocks.find(s => s.storageLocationId === loc.id);
                return {
                    storageLocation: loc,
                    quantity: stockEntry?.quantity || 0,
                    storageLocationId: loc.id
                };
            })
            .sort((a, b) => b.quantity - a.quantity);
    }, [storageLocations, stocks]);

    return (
        <div className={
            cn(
                "crm-card rounded-3xl p-6 flex-col flex-1 h-full",
                "md:col-span-2 xl:col-span-4",
                tabletTab === 'placement' ? "flex" : "hidden",
                "xl:flex"
            )}>
            <div className="flex items-center justify-between mb-8 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-foreground">Размещение</h3>
                        <p className="text-xs font-black text-muted-foreground mt-0.5 md:mt-1">
                            Всего {storageLocations.length} {pluralize(storageLocations.length, 'локация', 'локации', 'локаций')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {sortedStocks.length === 0 ? (
                    <div className="table-empty p-8">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold text-muted-foreground">Нет данных о размещении</p>
                    </div>
                ) : (
                    <ItemStockLocations stocks={stocks} />
                )}
            </div>
        </div>
    );
}
