"use client";

import React, { useMemo, useState } from "react";
import {
    Activity,
    Package,
    ShoppingCart,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ItemHistoryTransaction } from "../../../types";
import { cn } from "@/lib/utils";
import { format, subDays, addDays, isAfter, differenceInCalendarDays } from "date-fns";
import { ru } from "date-fns/locale";

interface ItemAnalyticsSectionProps {
    history: ItemHistoryTransaction[];
    currentQuantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold?: number;
}

export function ItemAnalyticsSection({ history, currentQuantity, unit, lowStockThreshold, criticalStockThreshold = 0 }: ItemAnalyticsSectionProps) {
    const [hoveredData, setHoveredData] = useState<{ x: number; y: number; value: number; date: Date } | null>(null);

    const analytics = useMemo(() => {
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
        history.forEach(tx => {
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
        const generateForecast = (data: number[]) => {
            if (data.length < 5) return [];
            const last7Days = data.slice(-7);
            const avgLast7 = last7Days.reduce((a, b) => a + b, 0) / (last7Days.length || 1);
            const avgOverall = data.reduce((a, b) => a + b, 0) / (data.length || 1);
            const currentTrend = (avgLast7 - avgOverall) * 0.5;
            const forecast = [];
            let lastValue = data[data.length - 1];
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

    const chartLines = useMemo(() => [
        { data: analytics.ordersData, color: "#5d00ff", label: "Заказы", id: "orders", total: analytics.totalOut, growth: analytics.ordersGrowth, invert: false },
        { data: analytics.suppliesData, color: "#10b981", label: "Поставки", id: "supplies", total: analytics.totalIn, growth: analytics.inGrowth, invert: false },
        { data: analytics.wastageData, color: "#f43f5e", label: "Списания", id: "wastage", total: analytics.totalWastage, growth: analytics.wastageGrowth, invert: true }
    ], [analytics]);

    const renderMultiLineChart = () => {
        const { suppliesData, ordersData, wastageData, maxVal, generateForecast } = analytics;
        const width = 1000;
        const height = 140; // Increased height to accommodate date labels
        const paddingX = 40;
        const paddingBottom = 25; // More space at bottom for dates
        const paddingTop = 15;

        // Visual forecast zone at 2/3 mark (doesn't affect data positioning)
        const forecastSplitX = paddingX + (width - paddingX * 2) * (2 / 3);


        const generatePath = (data: number[]) => {
            if (data.length === 0) return "";
            // Map historical data points across 2/3 of the chart width
            const points = data.map((val, i) => ({
                x: paddingX + (i / (data.length - 1)) * (forecastSplitX - paddingX),
                y: (height - paddingBottom) - (val / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom)
            }));

            return points.reduce((acc, curr, i, a) => {
                if (i === 0) return `M ${curr.x},${curr.y}`;
                const prev = a[i - 1];
                const cp1x = prev.x + (curr.x - prev.x) / 2.5;
                const cp1y = prev.y;
                const cp2x = curr.x - (curr.x - prev.x) / 2.5;
                const cp2y = curr.y;
                return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
            }, "");
        };


        const lines = chartLines.map(line => ({
            ...line,
            // Use primary purple from design system for orders
            color: line.id === 'orders' ? '#5d00ff' : line.color
        }));

        return (
            <div className="relative bg-white pt-1 group/chart cursor-crosshair isolate">
                <div className="relative">
                    <motion.svg
                        width="100%"
                        height={height}
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                    >
                        <defs>
                            {lines.map(line => (
                                <linearGradient key={`grad-${line.id}`} id={`grad-${line.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={line.color} stopOpacity="0.1" />
                                    <stop offset="100%" stopColor={line.color} stopOpacity="0" />
                                </linearGradient>
                            ))}
                        </defs>

                        {/* Forecast Zone Background - Visual Only */}
                        <rect
                            x={forecastSplitX}
                            y={paddingTop}
                            width={(width - paddingX) - forecastSplitX}
                            height={height - paddingTop - paddingBottom}
                            fill="#f8f9fa"
                            opacity="0.3"
                        />

                        {/* Forecast Divider Line */}
                        <line
                            x1={forecastSplitX}
                            y1={paddingTop}
                            x2={forecastSplitX}
                            y2={height - paddingBottom}
                            stroke="#5d00ff"
                            strokeWidth="1"
                            strokeDasharray="4 2"
                            opacity="0.3"
                        />

                        {/* "TODAY" Marker Text */}
                        <text
                            x={forecastSplitX}
                            y={paddingTop - 5}
                            textAnchor="middle"
                            className="text-[6px] font-bold fill-[#5d00ff] opacity-40"
                        >
                            Сегодня
                        </text>

                        {/* Minimalist Reference-style Grid */}
                        {[0, 0.5, 1].map((p, i) => (
                            <line
                                key={i}
                                x1={paddingX}
                                y1={paddingTop + p * (height - paddingTop - paddingBottom)}
                                x2={width - paddingX}
                                y2={paddingTop + p * (height - paddingTop - paddingBottom)}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                className="opacity-60"
                            />
                        ))}

                        {/* X-Axis Date Labels */}
                        {(() => {
                            const labels = [];
                            // 3 Historical dates
                            for (let i = 0; i <= 2; i++) {
                                const daysAgo = 30 - (i * 10);
                                const date = subDays(new Date(), daysAgo);
                                const x = paddingX + (i / 3) * (forecastSplitX - paddingX);
                                labels.push(
                                    <text key={`hist-${i}`} x={x} y={height - 5} textAnchor="middle" className="text-[7px] font-bold fill-slate-400 opacity-60 uppercase tracking-normal">
                                        {format(date, "d MMM", { locale: ru })}
                                    </text>
                                );
                            }
                            // Today
                            labels.push(
                                <text key="today" x={forecastSplitX} y={height - 5} textAnchor="middle" className="text-[7px] font-black fill-[#5d00ff] opacity-80">
                                    Сегодня
                                </text>
                            );
                            // Forecast date (+10 days)
                            const futureDate = addDays(new Date(), 10);
                            labels.push(
                                <text key="future" x={width - paddingX} y={height - 5} textAnchor="end" className="text-[7px] font-bold fill-slate-400 opacity-40 uppercase">
                                    {format(futureDate, "d MMM", { locale: ru })}
                                </text>
                            );
                            return labels;
                        })()}

                        <AnimatePresence>
                            {lines.map(line => {
                                const path = generatePath(line.data);

                                return (
                                    <g key={line.id}>
                                        {/* Area Fill */}
                                        <motion.path
                                            d={`${path} L ${forecastSplitX},${height - paddingBottom} L ${paddingX},${height - paddingBottom} Z`}
                                            fill={`url(#grad-${line.id})`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />

                                        {/* Main Line with Framer Motion */}
                                        <motion.path
                                            d={path}
                                            fill="none"
                                            stroke={line.color}
                                            strokeWidth={line.id === 'orders' ? "4" : "3"}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{
                                                duration: 2,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                            className={line.id === 'orders' ? "drop-shadow-[0_0_12px_rgba(93,0,255,0.2)]" : ""}
                                        />

                                        {/* Forecast Extension (Dashed) */}
                                        {(() => {
                                            const forecast = generateForecast(line.data);
                                            if (forecast.length === 0) return null;

                                            const lastHistoricalY = (height - paddingBottom) - (line.data[line.data.length - 1] / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom);
                                            const forecastPoints = forecast.map((val, i) => ({
                                                x: forecastSplitX + ((i + 1) / forecast.length) * ((width - paddingX) - forecastSplitX),
                                                y: (height - paddingBottom) - (val / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom)
                                            }));

                                            let forecastPath = `M ${forecastSplitX},${lastHistoricalY}`;
                                            forecastPoints.forEach((point, i) => {
                                                const prev = i === 0 ? { x: forecastSplitX, y: lastHistoricalY } : forecastPoints[i - 1];
                                                const cp1x = prev.x + (point.x - prev.x) / 2.5;
                                                const cp1y = prev.y;
                                                const cp2x = point.x - (point.x - prev.x) / 2.5;
                                                const cp2y = point.y;
                                                forecastPath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
                                            });

                                            return (
                                                <motion.path
                                                    d={forecastPath}
                                                    fill="none"
                                                    stroke={line.color}
                                                    strokeWidth={line.id === 'orders' ? "3" : "2"}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeDasharray="5 3"
                                                    opacity="0.4"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 0.4 }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 2.2,
                                                        ease: [0.16, 1, 0.3, 1]
                                                    }}
                                                />
                                            );
                                        })()}


                                        {/* Interactive Data Points */}
                                        {line.data.map((val, i) => {
                                            const x = paddingX + (i / (line.data.length - 1)) * (forecastSplitX - paddingX);
                                            const y = (height - paddingBottom) - (val / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom);

                                            return (
                                                <g
                                                    key={i}
                                                    onMouseEnter={() => setHoveredData({ x, y, value: val, date: subDays(new Date(), (line.data.length - 1) - i) })}
                                                    onMouseLeave={() => setHoveredData(null)}
                                                    className="cursor-pointer group/dot"
                                                >
                                                    {/* Invisible larger hit area */}
                                                    <circle cx={x} cy={y} r="15" fill="transparent" />

                                                    {/* Visible Dot */}
                                                    <motion.circle
                                                        cx={x}
                                                        cy={y}
                                                        r={i === (line.data.length - 1) ? "4" : "3.5"}
                                                        fill="white"
                                                        stroke={line.color}
                                                        strokeWidth="2.5"
                                                        initial={i === (line.data.length - 1) ? { scale: 0 } : false}
                                                        animate={i === (line.data.length - 1) ? { scale: 1 } : {}}
                                                        transition={{ delay: 2, duration: 0.4 }}
                                                        className={cn(
                                                            "transition-all duration-200 shadow-sm",
                                                            i === (line.data.length - 1) ? "opacity-100" : "opacity-0 group-hover/dot:opacity-100 group-hover/dot:scale-110"
                                                        )}
                                                    />
                                                </g>
                                            );
                                        })}

                                        {/* Out of Stock Indicators in Forecast */}
                                        {line.id === 'orders' && (() => {
                                            const orderForecast = generateForecast(ordersData);
                                            const wastageForecast = generateForecast(wastageData);
                                            const supplyForecast = generateForecast(suppliesData);

                                            let virtualStock = currentQuantity;
                                            let outOfStockIndex = -1;

                                            for (let i = 0; i < orderForecast.length; i++) {
                                                virtualStock += (supplyForecast[i] - orderForecast[i] - wastageForecast[i]);
                                                if (virtualStock <= 0) {
                                                    outOfStockIndex = i;
                                                    break;
                                                }
                                            }

                                            if (outOfStockIndex !== -1) {
                                                const x = forecastSplitX + ((outOfStockIndex + 1) / orderForecast.length) * ((width - paddingX) - forecastSplitX);
                                                const y = (height - paddingBottom) / 2; // Middle of chart for visibility

                                                return (
                                                    <motion.g
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 3, duration: 0.5 }}
                                                    >
                                                        <line x1={x} y1={paddingTop} x2={x} y2={height - paddingBottom} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                                                        <circle cx={x} cy={y} r="8" fill="#ef4444" />
                                                        <text x={x} y={y + 3} textAnchor="middle" className="text-[8px] font-bold fill-white">!</text>
                                                        <text x={x} y={y - 12} textAnchor="middle" className="text-[7px] font-black fill-[#ef4444] uppercase tracking-normaler">
                                                            Товар кончится
                                                        </text>
                                                    </motion.g>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </g>
                                );
                            })}
                        </AnimatePresence>

                        {/* Interactive Tooltip Line */}
                        {hoveredData && (
                            <line
                                x1={hoveredData.x} y1={15}
                                x2={hoveredData.x} y2={height - 25}
                                stroke="#5d00ff" strokeWidth="1" strokeDasharray="4 4"
                                className="opacity-30"
                            />
                        )}
                    </motion.svg>

                    {/* Premium Floating Glass Tooltip */}
                    {hoveredData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute z-[100] pointer-events-none -translate-x-1/2"
                            style={{
                                left: `${(hoveredData.x / width) * 100}%`,
                                top: hoveredData.y < 80 ? hoveredData.y + 15 : hoveredData.y - 65
                            }}
                        >
                            <div className={cn(
                                "relative bg-slate-900/95 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg shadow-xl min-w-[80px] flex flex-col items-center",
                                hoveredData.y < 80 ? "mt-2" : "mb-2"
                            )}>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.1em] block mb-0.5 whitespace-nowrap">
                                    {format(hoveredData.date, 'dd MMMM', { locale: ru })}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-white">{hoveredData.value}</span>
                                    <span className="text-[8px] font-black text-white/50 uppercase tracking-normaler">{unit}</span>
                                </div>

                                {/* Little arrow pointer */}
                                <div className={cn(
                                    "absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900/95 border-white/10 rotate-45",
                                    hoveredData.y < 80
                                        ? "-top-1.25 border-l border-t"
                                        : "-bottom-1.25 border-r border-b"
                                )} />
                            </div>
                        </motion.div>
                    )}

                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-300 bg-slate-100/30 px-3 py-1 rounded-full border border-slate-100/50">
                                {format(subDays(new Date(), 29), 'd MMMM', { locale: ru })}
                            </span>
                            <div className="h-px w-10 bg-slate-100" />
                        </div>

                        <div className="group flex items-center gap-3 text-[10px] font-black text-slate-900 bg-white px-4 py-2 rounded-full shadow-crm-sm border border-slate-100 transition-all hover:border-primary/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(93,0,255,0.4)]" />
                            <span className="uppercase tracking-[0.1em] opacity-80">Сегодня</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper for Russian declension
    function getDayDeclension(number: number) {
        const abs = Math.abs(number);
        if (abs % 10 === 1 && abs % 100 !== 11) return "день";
        if (abs % 10 >= 2 && abs % 10 <= 4 && (abs % 100 < 10 || abs % 100 >= 20)) return "дня";
        return "дней";
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Main Multi-Line Chart Section - 9 columns on desktop */}
            <div className="lg:col-span-9 bg-white rounded-[24px] p-5 border border-slate-100 flex flex-col h-fit">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                    <div className="space-y-1">
                        <h4 className="text-[11px] font-black text-slate-400 leading-none">Аналитика движений</h4>
                        <p className="text-[13px] font-black text-slate-900 leading-none">Динамика за последние 30 дней</p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                        {chartLines.map(line => (
                            <div key={line.id} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 leading-none">{line.label}</span>
                                        {line.growth !== 0 && (
                                            <span className={cn("text-[9px] font-bold flex items-center gap-0.5",
                                                line.invert
                                                    ? (line.growth > 0 ? "text-rose-500" : "text-emerald-500")
                                                    : (line.growth > 0 ? "text-emerald-500" : "text-rose-500")
                                            )}>
                                                {line.growth > 0 ? "↑" : "↓"} {Math.abs(line.growth)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-sm font-black text-slate-900 leading-none">{line.total} <span className="text-[10px] text-slate-400 font-normal opacity-50">{unit}</span></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    {renderMultiLineChart()}
                </div>
            </div>

            {/* Vertical Stock Timeline Section - 3 columns on desktop */}
            <div className="lg:col-span-3 bg-primary/5 rounded-[24px] p-5 border border-primary/10 relative overflow-hidden group flex flex-col">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                <div className="flex items-center gap-3 mb-6 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500/80 transition-all shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h5 className="text-[11px] font-black text-primary leading-tight">Таймлайн<br />остатков</h5>
                </div>

                <div className="flex-1 relative mt-2">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[15px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-emerald-400 via-amber-400 to-rose-400 opacity-20 z-0" />

                    <div className="flex flex-col gap-4 h-full relative z-10">
                        {/* Stage 1: Today */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-sm z-10 shrink-0">
                                <Package className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black text-emerald-600 truncate">Сегодня</span>
                                    <span className="text-[9px] font-black text-slate-400 shrink-0">{format(new Date(), 'd MMM', { locale: ru })}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5 leading-none">
                                    <span className={cn(
                                        "text-2xl font-black tracking-normaler",
                                        currentQuantity <= criticalStockThreshold ? "text-rose-600" :
                                            currentQuantity <= lowStockThreshold ? "text-amber-600" : "text-slate-900"
                                    )}>{currentQuantity}</span>
                                    <span className="text-[10px] font-black text-slate-400">{unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stage 2: Low Stock */}
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 border-2 transition-colors shrink-0",
                                analytics.daysToLow <= 7 ? "bg-amber-50 border-amber-500" : "bg-white border-slate-200"
                            )}>
                                <ShoppingCart className={cn("w-4 h-4", analytics.daysToLow <= 7 ? "text-amber-600" : "text-slate-300")} />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black text-amber-600 truncate">Порог закупки</span>
                                    {analytics.daysToLow !== Infinity && (
                                        <span className="text-[9px] font-black text-slate-400 shrink-0">
                                            ~ {format(addDays(new Date(), analytics.daysToLow), 'd MMM', { locale: ru })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center flex-wrap gap-2 leading-none">
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn(
                                            "text-2xl font-black tracking-normaler",
                                            analytics.daysToLow === 0 ? "text-amber-600" : "text-slate-900"
                                        )}>
                                            {analytics.daysToLow === 0 ? "—" : (analytics.daysToLow === Infinity ? "∞" : analytics.daysToLow)}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400">
                                            {analytics.daysToLow === 0 ? "достигнут" : (analytics.daysToLow === Infinity ? "дней" : getDayDeclension(analytics.daysToLow))}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap",
                                        analytics.daysToLow === 0 ? "bg-amber-500 text-white" : "bg-amber-100/50 text-amber-700"
                                    )}>
                                        {lowStockThreshold} {unit}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stage 3: Critical */}
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 border-2 transition-colors shrink-0",
                                analytics.daysToCritical <= 3 ? "bg-rose-50 border-rose-500" : "bg-white border-slate-200"
                            )}>
                                <AlertTriangle className={cn("w-4 h-4", analytics.daysToCritical <= 3 ? "text-rose-600" : "text-slate-300")} />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black text-rose-600 truncate">Критический</span>
                                    {analytics.daysToCritical !== Infinity && (
                                        <span className="text-[9px] font-black text-slate-400 shrink-0">
                                            ~ {format(addDays(new Date(), analytics.daysToCritical), 'd MMM', { locale: ru })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center flex-wrap gap-2 leading-none">
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn(
                                            "text-2xl font-black tracking-normaler",
                                            analytics.daysToCritical === 0 ? "text-rose-600" : "text-slate-900"
                                        )}>
                                            {analytics.daysToCritical === 0 ? "—" : (analytics.daysToCritical === Infinity ? "∞" : analytics.daysToCritical)}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400">
                                            {analytics.daysToCritical === 0 ? "критично" : (analytics.daysToCritical === Infinity ? "дней" : getDayDeclension(analytics.daysToCritical))}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap",
                                        analytics.daysToCritical === 0 ? "bg-rose-500 text-white" : "bg-rose-100/50 text-rose-700"
                                    )}>
                                        {criticalStockThreshold} {unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
