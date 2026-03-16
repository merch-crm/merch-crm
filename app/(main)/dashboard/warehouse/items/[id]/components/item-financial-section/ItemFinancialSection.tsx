"use client";

import React from "react";
import { Banknote, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";
import { InventoryItem, ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import type { Session } from "@/lib/session";

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
        <div className={cn("flex flex-col gap-3", className)}>
            {/* Cost Card */}
            <div className="crm-card transition-all bg-card relative overflow-hidden flex flex-col gap-3 hover:shadow-md duration-500">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Стоимость</h3>
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

            </div>

            {/* Analytics Card */}
            <div className="crm-card transition-all bg-card relative overflow-hidden flex flex-col gap-3 hover:shadow-md duration-500">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 shadow-sm border border-slate-100/50">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col mt-0.5">
                            <h3 className="text-lg font-black text-slate-900 leading-none mb-1">Аналитика цен</h3>
                            <PriceAnalyticsSummary
                                actualMax={costHistoryStats.actualMax}
                                avg={costHistoryStats.avg}
                                actualMin={costHistoryStats.actualMin}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>

                    <div className="shrink-0 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                        <TimeframeTabs
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-1">
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
