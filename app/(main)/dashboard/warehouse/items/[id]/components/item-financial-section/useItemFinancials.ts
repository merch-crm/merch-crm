"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { InventoryItem, ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { Timeframe } from "./types";

interface UseItemFinancialsProps {
    item: InventoryItem;
    history: ItemHistoryTransaction[];
    timeframe: Timeframe;
}

export function useItemFinancials({ item, history, timeframe }: UseItemFinancialsProps) {
    // Calculate last purchase price (most recent supply)
    const lastInCostPrice = useMemo(() => {
        const supplyTxs = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0);
        if (supplyTxs.length > 0) {
            return Number(supplyTxs[0].costPrice);
        }
        return Number(item.costPrice) || 0;
    }, [history, item.costPrice]);

    // Calculate Weighted Average Cost (WAC)
    const weightedAverageCost = useMemo(() => {
        const supplyTxs = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0 && tx.changeAmount > 0);

        if (supplyTxs.length === 0) {
            return Number(item.costPrice) || 0;
        }

        let totalCost = 0;
        let totalQuantity = 0;

        for (const tx of supplyTxs) {
            const qty = tx.changeAmount;
            const price = Number(tx.costPrice);
            totalCost += qty * price;
            totalQuantity += qty;
        }

        if (totalQuantity === 0) {
            return Number(item.costPrice) || 0;
        }

        return totalCost / totalQuantity;
    }, [history, item.costPrice]);

    const costHistoryStats = useMemo(() => {
        const supplyTxs = history
            .filter(tx => tx.type === 'in' && tx.costPrice)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const lastPriceFromHistory = supplyTxs.length > 0 ? Number(supplyTxs[supplyTxs.length - 1].costPrice) : 0;
        const currentPrice = (Number(item.costPrice) > 0) ? Number(item.costPrice) : (lastPriceFromHistory || 0);

        const groupedByDate: Record<string, { date: Date, prices: number[] }> = {};
        supplyTxs.forEach(tx => {
            const dateKey = format(new Date(tx.createdAt), 'yyyy-MM-dd', { locale: ru });
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { date: new Date(tx.createdAt), prices: [] };
            }
            groupedByDate[dateKey].prices.push(Number(tx.costPrice));
        });

        const supplyPoints = Object.values(groupedByDate).map(group => ({
            date: group.date,
            costs: group.prices,
            label: format(group.date, 'd MMM', { locale: ru }),
            avg: group.prices.reduce((a, b) => a + b, 0) / group.prices.length,
            hasData: true,
            lastDate: group.date
        }));

        let filteredPoints = [...supplyPoints];
        const now = new Date();

        if (timeframe === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            filteredPoints = supplyPoints.filter(p => p.date >= oneMonthAgo);
        } else if (timeframe === 'quarter') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            filteredPoints = supplyPoints.filter(p => p.date >= threeMonthsAgo);
        } else if (timeframe === 'half-year') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            filteredPoints = supplyPoints.filter(p => p.date >= sixMonthsAgo);
        } else if (timeframe === 'year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            filteredPoints = supplyPoints.filter(p => p.date >= oneYearAgo);
        }

        filteredPoints.push({
            date: new Date(),
            costs: [currentPrice],
            label: "Тек.",
            avg: currentPrice,
            hasData: currentPrice > 0,
            lastDate: new Date()
        });

        const points = filteredPoints.filter(p => p.avg > 0);

        const allIndividualCosts = points.map(p => p.avg).filter(v => v > 0);

        let minVal = allIndividualCosts.length > 0 ? Math.min(...allIndividualCosts) : (currentPrice > 0 ? currentPrice : 100);
        let maxVal = allIndividualCosts.length > 0 ? Math.max(...allIndividualCosts) : (currentPrice > 0 ? currentPrice : 110);

        const diff = maxVal - minVal;
        if (diff === 0) {
            minVal = minVal > 0 ? minVal * 0.8 : 0;
            maxVal = maxVal > 0 ? maxVal * 1.2 : 100;
        } else {
            minVal = Math.max(0, minVal - diff * 0.15);
            maxVal = maxVal + diff * 0.15;
        }

        const firstPoint = supplyPoints[0];
        let yearlyChange = 0;
        if (firstPoint && firstPoint.avg > 0) {
            yearlyChange = ((currentPrice - firstPoint.avg) / firstPoint.avg) * 100;
        }

        const supplyTxsForWac = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0 && tx.changeAmount > 0);
        let wacForStats = currentPrice;
        if (supplyTxsForWac.length > 0) {
            let totalCost = 0;
            let totalQty = 0;
            for (const tx of supplyTxsForWac) {
                totalCost += tx.changeAmount * Number(tx.costPrice);
                totalQty += tx.changeAmount;
            }
            if (totalQty > 0) {
                wacForStats = totalCost / totalQty;
            }
        }

        return {
            points,
            max: maxVal,
            min: minVal,
            actualMax: allIndividualCosts.length > 0 ? Math.max(...allIndividualCosts) : currentPrice,
            actualMin: allIndividualCosts.length > 0 ? Math.min(...allIndividualCosts) : currentPrice,
            avg: wacForStats,
            yearlyChange: yearlyChange
        };
    }, [history, item.costPrice, timeframe]);

    return {
        lastInCostPrice,
        weightedAverageCost,
        costHistoryStats
    };
}
