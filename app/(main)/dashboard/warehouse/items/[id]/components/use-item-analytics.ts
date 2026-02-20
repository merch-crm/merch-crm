import { useMemo } from "react";
import { subDays, isAfter, differenceInCalendarDays } from "date-fns";
import { ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";

interface UseItemAnalyticsProps {
    history: ItemHistoryTransaction[];
    currentQuantity: number;
    lowStockThreshold: number;
    criticalStockThreshold?: number;
}

export function useItemAnalytics({ history = [], currentQuantity, lowStockThreshold, criticalStockThreshold = 0 }: UseItemAnalyticsProps) {
    return useMemo(() => {
        const now = new Date();
        const last30Days = subDays(now, 30);
        const previous30DaysStart = subDays(now, 60);

        const suppliesData = new Array(30).fill(0);
        const ordersData = new Array(30).fill(0);
        const wastageData = new Array(30).fill(0);

        let totalIn = 0;
        let totalOut = 0;
        let totalWastage = 0;

        // Previous period metrics
        let prevTotalIn = 0;
        let prevTotalOut = 0;
        let prevTotalWastage = 0;

        // Process transactions
        (history || []).forEach(tx => {
            const txDate = new Date(tx.createdAt);
            const amount = Math.abs(tx.changeAmount);
            const reason = (tx.reason || "").toLowerCase();

            if (isAfter(txDate, last30Days)) {
                // Current 30 days
                const dayIndex = 29 - Math.min(29, Math.max(0, differenceInCalendarDays(now, txDate)));

                const isRealMove = !reason.includes("корректировка") && !reason.includes("set") && tx.type !== 'transfer';

                if (tx.type === 'in' && isRealMove) {
                    suppliesData[dayIndex] += amount;
                    totalIn += amount;
                } else if (tx.type === 'out') {
                    if (isRealMove) {
                        const isOrder = reason.includes("заказ") || reason.includes("order") || reason.includes("sale");

                        if (isOrder) {
                            ordersData[dayIndex] += amount;
                            totalOut += amount;
                        } else {
                            // Any other outgoing real move is considered wastage/write-off
                            wastageData[dayIndex] += amount;
                            totalWastage += amount;
                        }
                    }
                }
            } else if (isAfter(txDate, previous30DaysStart)) {
                // Previous 30 days (for comparison)
                const isRealMove = !reason.includes("корректировка") && !reason.includes("set") && tx.type !== 'transfer';

                if (tx.type === 'in' && isRealMove) {
                    prevTotalIn += amount;
                } else if (tx.type === 'out') {
                    if (isRealMove) {
                        const isOrder = reason.includes("заказ") || reason.includes("order") || reason.includes("sale");

                        if (isOrder) {
                            prevTotalOut += amount;
                        } else {
                            prevTotalWastage += amount;
                        }
                    }
                }
            }
        });

        // Helper for forecast simulation
        const generateForecast = (inputData: number[] = []) => {
            const data = Array.isArray(inputData) ? inputData : [];
            if ((data || []).length < 5) return [];

            const last7Days = (data || []).slice(-7);
            const avgLast7 = last7Days.reduce((a, b) => a + b, 0) / (last7Days.length || 1);
            const avgOverall = (data || []).reduce((a, b) => a + b, 0) / ((data || []).length || 1);
            const currentTrend = (avgLast7 - avgOverall) * 0.5;

            const forecast = [];
            let lastValue = (data || [])[(data || []).length - 1];

            for (let i = 1; i <= 12; i++) {
                const decay = Math.pow(0.85, i);
                const nextVal = avgOverall + (lastValue - avgOverall) * decay + currentTrend * decay;
                const finalVal = Math.max(0, nextVal);
                forecast.push(finalVal);
                lastValue = finalVal;
            }
            return forecast;
        };

        const totalConsumption = totalOut + totalWastage;

        // Smarter Daily Outgoing Rate: Weighted toward recent activity
        const recent7DaysConsumption = (ordersData.slice(-7).reduce((a, b) => a + b, 0) + wastageData.slice(-7).reduce((a, b) => a + b, 0)) / 7;
        const avgDailyOverall = totalConsumption / 30;
        const weightedAvgDailyOut = recent7DaysConsumption * 0.7 + avgDailyOverall * 0.3;

        // --- FORECAST SIMULATION ---
        const orderFC = generateForecast(ordersData);
        const supplyFC = generateForecast(suppliesData);
        const wastageFC = generateForecast(wastageData);

        let daysToLow = Infinity;
        let daysToCritical = Infinity;
        let daysToZero = Infinity;

        if (currentQuantity <= lowStockThreshold) {
            daysToLow = 0;
        }
        if (currentQuantity <= (criticalStockThreshold || 0)) {
            daysToCritical = 0;
        }

        let virtualStockSim = currentQuantity;
        // Simulate day-by-day for the first 12 days using the detailed forecast
        for (let day = 0; day < orderFC.length; day++) {
            virtualStockSim += (supplyFC[day] - orderFC[day] - wastageFC[day]);

            if (daysToLow === Infinity && virtualStockSim <= lowStockThreshold) {
                daysToLow = day + 1;
            }
            if (daysToCritical === Infinity && virtualStockSim <= (criticalStockThreshold || 0)) {
                daysToCritical = day + 1;
            }
            if (daysToZero === Infinity && virtualStockSim <= 0) {
                daysToZero = day + 1;
            }
        }

        // --- LINEAR FALLBACK FOR LONG-TERM FORECAST ---
        // If we haven't reached the thresholds in 12 days, continue linearly based on weighted average
        if (weightedAvgDailyOut > 0) {
            const remainingSteps = 180 - 12; // Forecast up to 180 days total
            for (let day = 1; day <= remainingSteps; day++) {
                virtualStockSim -= weightedAvgDailyOut;
                const totalDays = day + 12;

                if (daysToLow === Infinity && virtualStockSim <= lowStockThreshold) {
                    daysToLow = totalDays;
                }
                if (daysToCritical === Infinity && virtualStockSim <= (criticalStockThreshold || 0)) {
                    daysToCritical = totalDays;
                }
                if (daysToZero === Infinity && virtualStockSim <= 0) {
                    daysToZero = totalDays;
                }

                if (virtualStockSim <= 0) break;
            }
        }

        // --- COMPARISON LOGIC ---
        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const inGrowth = calculateGrowth(totalIn, prevTotalIn);
        const ordersGrowth = calculateGrowth(totalOut, prevTotalOut);
        const wastageGrowth = calculateGrowth(totalWastage, prevTotalWastage);
        const wastageRate = totalConsumption > 0 ? Math.round((totalWastage / totalConsumption) * 100) : 0;

        return {
            totalIn,
            totalOut,
            totalWastage,
            avgDailyOut: weightedAvgDailyOut.toFixed(1),
            daysToLow,
            daysToCritical,
            daysToZero,
            suppliesData,
            ordersData,
            wastageData,
            maxVal: Math.max(...suppliesData, ...ordersData, ...wastageData, 5),
            inGrowth,
            ordersGrowth,
            wastageGrowth,
            wastageRate,
            prevTotalIn,
            prevTotalOut,
            generateForecast
        };
    }, [history, currentQuantity, lowStockThreshold, criticalStockThreshold]);
}
