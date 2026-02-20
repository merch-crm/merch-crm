"use client";

import React from "react";
import { Banknote, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";
import { InventoryItem, ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { Session } from "@/lib/auth";

import { useItemFinancials } from "./useItemFinancials";
import { Timeframe } from "./types";
import { FinancialMetricsGrid } from "./FinancialMetricsGrid";
import { PriceAnalyticsSummary } from "./PriceAnalyticsSummary";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { TimeframeTabs } from "./TimeframeTabs";

interface ItemFinancialSectionProps {
    item: InventoryItem;
    history: ItemHistoryTransaction[];
    isEditing: boolean;
    editData: InventoryItem;
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>;
    handleStartEdit: () => void;
    user: Session | null;
    className?: string;
    timeframe: Timeframe;
    setTimeframe: (tf: Timeframe) => void;
}

export const ItemFinancialSection = React.memo(({
    item,
    history,
    isEditing,
    editData,
    setEditData,
    handleStartEdit,
    user,
    className,
    timeframe,
    setTimeframe
}: ItemFinancialSectionProps) => {
    const { currencySymbol = '₽' } = useBranding();

    const {
        lastInCostPrice,
        weightedAverageCost,
        costHistoryStats
    } = useItemFinancials({ item, history, timeframe });

    if (user?.roleName === 'Менеджер') return null;

    return (
        <div className={cn(
            "crm-card rounded-3xl p-6 transition-all bg-card relative overflow-hidden flex flex-col gap-4 shadow-sm hover:shadow-md duration-500",
            className
        )}>
            {/* Main Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                    <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-foreground">Стоимость</h3>
            </div>

            {/* SECTION 1: Metrics Grid */}
            <FinancialMetricsGrid
                item={item}
                weightedAverageCost={weightedAverageCost}
                lastInCostPrice={lastInCostPrice}
                currencySymbol={currencySymbol}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
                handleStartEdit={handleStartEdit}
            />

            {/* SECTION 2: History & Chart */}
            <div className="flex flex-col gap-3 flex-1">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-lg font-black text-foreground tracking-tight leading-none">Аналитика цен</h3>
                            <p className="text-xs font-black text-muted-foreground whitespace-nowrap">Динамика закупок</p>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Row */}
                <PriceAnalyticsSummary
                    actualMax={costHistoryStats.actualMax}
                    avg={costHistoryStats.avg}
                    actualMin={costHistoryStats.actualMin}
                    currencySymbol={currencySymbol}
                />

                <div className="flex flex-col gap-4 mt-6">
                    {/* Timeframe selector tabs */}
                    <TimeframeTabs
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                    />

                    {/* SVG Chart */}
                    <PriceHistoryChart
                        points={costHistoryStats.points}
                        min={costHistoryStats.min}
                        max={costHistoryStats.max}
                        currencySymbol={currencySymbol}
                        timeframe={timeframe}
                    />
                </div>
            </div>
        </div>
    );
});

ItemFinancialSection.displayName = "ItemFinancialSection";
