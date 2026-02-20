"use client";

import React, { useMemo } from "react";
import { ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { useItemAnalytics } from "./use-item-analytics";
import { ItemAnalyticsChart } from "./item-analytics-chart";
import { StockTimeline } from "./stock-timeline";

interface ItemAnalyticsSectionProps {
    history: ItemHistoryTransaction[];
    currentQuantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold?: number;
}

export function ItemAnalyticsSection({ history, currentQuantity, unit, lowStockThreshold, criticalStockThreshold = 0 }: ItemAnalyticsSectionProps) {
    const analytics = useItemAnalytics({ history, currentQuantity, lowStockThreshold, criticalStockThreshold });

    const chartLines = useMemo(() => [
        { data: analytics.ordersData, color: "#5d00ff", label: "Заказы", id: "orders", total: analytics.totalOut, growth: analytics.ordersGrowth, invert: false },
        { data: analytics.suppliesData, color: "#10b981", label: "Поставки", id: "supplies", total: analytics.totalIn, growth: analytics.inGrowth, invert: false },
        { data: analytics.wastageData, color: "#f43f5e", label: "Списания", id: "wastage", total: analytics.totalWastage, growth: analytics.wastageGrowth, invert: true }
    ], [analytics]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Main Multi-Line Chart Section - 9 columns on desktop */}
            <ItemAnalyticsChart
                analytics={analytics}
                chartLines={chartLines}
                unit={unit}
            />

            {/* Vertical Stock Timeline Section - 3 columns on desktop */}
            <StockTimeline
                currentQuantity={currentQuantity}
                unit={unit}
                lowStockThreshold={lowStockThreshold}
                criticalStockThreshold={criticalStockThreshold}
                analytics={{
                    daysToLow: analytics.daysToLow,
                    daysToCritical: analytics.daysToCritical
                }}
            />
        </div>
    );
}
