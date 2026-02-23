import React from "react";
import { RecentTransactionsClient } from "./recent-transactions";
import { RecentTransaction } from "./warehouse-stats-actions";
import { StatsOverview } from "./components/StatsOverview";
import { StockAlerts } from "./components/StockAlerts";
import { FinancialBento } from "./components/FinancialBento";
import { ActivityTrend } from "./components/ActivityTrend";
import { InventoryAnalytics } from "./components/InventoryAnalytics";

interface WarehouseWidgetsProps {
    stats: {
        totalItems: number;
        totalQuantity: number;
        totalReserved: number;
        totalStorages: number;
        archivedCount: number;
        totalCategories: number;
        totalSubCategories: number;
        criticalItems: Array<{ id: string; name: string; quantity: number; unit: string }>;
        activity: {
            ins: number;
            usage: number;
            waste: number;
            transfers: number;
            adjustments: number;
        };
        financials: {
            totalCostValue: number;
            totalRetailValue: number;
            frozenCostValue: number;
            frozenRetailValue: number;
            writeOffValue30d: number;
        };
        currencySymbol: string;
        recentTransactions: RecentTransaction[];
        topSoldItems: Array<{ id: string; name: string; unit: string; totalSold: number }>;
        stagnantItems: Array<{ id: string; name: string; quantity: number; unit: string; lastActivityAt: Date | null }>;
    };
}

export function WarehouseWidgets({ stats }: WarehouseWidgetsProps) {
    if (!stats) return null;

    const {
        totalItems = 0,
        totalQuantity = 0,
        totalReserved = 0,
        totalStorages = 0,
        archivedCount = 0,
        totalCategories = 0,
        criticalItems = [],
        activity = { ins: 0, usage: 0, waste: 0, transfers: 0, adjustments: 0 },
        financials = { totalCostValue: 0, totalRetailValue: 0, frozenCostValue: 0, frozenRetailValue: 0, writeOffValue30d: 0 },
        currencySymbol = '₽',
        recentTransactions = [],
        topSoldItems = [],
        stagnantItems = [],
    } = stats;

    return (
        <div className="flex flex-col gap-3">
            {/* Top Row: Combined Stats & Expanded Deficit */}
            <div className="grid grid-cols-12 gap-3">
                <StatsOverview
                    totalStorages={totalStorages}
                    totalItems={totalItems}
                    totalQuantity={totalQuantity}
                    totalCategories={totalCategories}
                    totalReserved={totalReserved}
                    archivedCount={archivedCount}
                />
                <StockAlerts criticalItems={criticalItems} />
            </div>

            {/* Financial Bento Row */}
            <FinancialBento
                financials={financials}
                currencySymbol={currencySymbol}
            />

            {/* Activity Trend */}
            <ActivityTrend activity={activity} />

            {/* Analytics Row: Top Sold & Stagnant */}
            <InventoryAnalytics
                topSoldItems={topSoldItems}
                stagnantItems={stagnantItems}
            />

            {/* Recent Transactions Table */}
            {recentTransactions && recentTransactions.length > 0 && (
                <RecentTransactionsClient transactions={recentTransactions} />
            )}
        </div>
    );
}

export function WarehouseWidgetsSkeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {/* Top Row Skeleton */}
            <div className="grid grid-cols-12 gap-3">
                {/* Stats Skeleton */}
                <div className="col-span-12 md:col-span-6 lg:col-span-5 crm-card shadow-sm bg-white flex flex-col justify-between h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-100 rounded-full" />
                            <div className="h-3 w-16 bg-slate-50 rounded-full" />
                        </div>
                    </div>
                    <div className="flex-1 mt-5 grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-14 rounded-2xl bg-slate-50/50 border border-slate-100" />
                        ))}
                    </div>
                </div>

                {/* Replenishment Skeleton */}
                <div className="col-span-12 md:col-span-6 lg:col-span-7 crm-card flex flex-col shadow-sm bg-white h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-100 rounded-full" />
                            <div className="h-3 w-24 bg-slate-50 rounded-full" />
                        </div>
                    </div>
                    <div className="card-breakout border-b border-slate-100 mt-6" />
                    <div className="flex-1 pt-6 flex flex-col justify-center items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 mb-3" />
                        <div className="h-3 w-40 bg-slate-100 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Activity Skeleton */}
            <div className="crm-card flex flex-col sm:flex-row items-center gap-3 sm:justify-between bg-white">
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded-full" />
                        <div className="h-3 w-20 bg-slate-50 rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-2 space-y-2">
                            <div className="h-2 w-12 bg-slate-50 rounded-full" />
                            <div className="h-6 w-10 bg-slate-100 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
