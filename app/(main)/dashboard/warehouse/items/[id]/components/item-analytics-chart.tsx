"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { cn, formatUnit } from "@/lib/utils";

// Define the shape of analytics data expected
interface AnalyticsData {
    ordersData: number[];
    suppliesData: number[];
    wastageData: number[];
    maxVal: number;
    generateForecast: (data: number[]) => number[];
    totalOut: number;
    totalIn: number;
    totalWastage: number;
    ordersGrowth: number;
    inGrowth: number;
    wastageGrowth: number;
}

interface ChartLine {
    data: number[];
    color: string;
    label: string;
    id: string;
    total: number;
    growth: number;
    invert: boolean;
}

interface ItemAnalyticsChartProps {
    analytics: AnalyticsData;
    chartLines: ChartLine[];
    unit: string;
}

export function ItemAnalyticsChart({ analytics, chartLines, unit }: ItemAnalyticsChartProps) {
    const [hoveredData, setHoveredData] = useState<{ x: number; y: number; value: number; date: Date } | null>(null);

    if (!analytics) return null;

    const { maxVal, generateForecast } = analytics;
    const width = 1000;
    const height = 140;
    const paddingX = 40;
    const paddingBottom = 25;
    const paddingTop = 15;
    const forecastSplitX = paddingX + (width - paddingX * 2) * (2 / 3);

    const generatePath = (data: number[] = []) => {
        const safeData = Array.isArray(data) ? data : [];
        if (safeData.length === 0) return "";
        const points = safeData.map((val, i) => ({
            x: paddingX + (i / (safeData.length - 1)) * (forecastSplitX - paddingX),
            y: (height - paddingBottom) - ((val || 0) / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom)
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

    const lines = (chartLines || []).map(line => ({
        ...line,
        data: line.data || [],
        color: line.id === 'orders' ? '#5d00ff' : line.color
    }));

    return (
        <div className="lg:col-span-9 bg-card rounded-3xl p-5 border border-border flex flex-col h-fit">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
                <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-muted-foreground leading-none">Аналитика движений</h4>
                    <p className="text-[13px] font-black text-foreground leading-none">Динамика за последние 30 дней</p>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-3">
                    {(chartLines || []).map(line => (
                        <div key={line.id} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-muted-foreground leading-none">{line.label}</span>
                                    {line.growth !== 0 && (
                                        <span className={cn("text-xs font-bold flex items-center gap-0.5",
                                            line.invert
                                                ? (line.growth > 0 ? "text-rose-500" : "text-emerald-500")
                                                : (line.growth > 0 ? "text-emerald-500" : "text-rose-500")
                                        )}>
                                            {line.growth > 0 ? "↑" : "↓"} {Math.abs(line.growth)}%
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-sm font-black text-foreground leading-none">{line.total} <span className="text-xs text-muted-foreground font-normal opacity-50">{unit}</span></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1">
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

                            <rect
                                x={forecastSplitX}
                                y={paddingTop}
                                width={(width - paddingX) - forecastSplitX}
                                height={height - paddingTop - paddingBottom}
                                fill="currentColor"
                                className="text-muted/10"
                                opacity="0.3"
                            />

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

                            <text
                                x={forecastSplitX}
                                y={paddingTop - 5}
                                textAnchor="middle"
                                className="text-[6px] font-bold fill-[#5d00ff] opacity-40"
                            >
                                Сегодня
                            </text>

                            {[0, 0.5, 1].map((p, i) => (
                                <line
                                    key={i}
                                    x1={paddingX}
                                    y1={paddingTop + p * (height - paddingTop - paddingBottom)}
                                    x2={width - paddingX}
                                    y2={paddingTop + p * (height - paddingTop - paddingBottom)}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    className="opacity-10 text-border"
                                />
                            ))}

                            {(() => {
                                const labels = [];
                                for (let i = 0; i <= 2; i++) {
                                    const daysAgo = 30 - (i * 10);
                                    const date = subDays(new Date(), daysAgo);
                                    const x = paddingX + (i / 3) * (forecastSplitX - paddingX);
                                    labels.push(
                                        <text key={`hist-${i}`} x={x} y={height - 5} textAnchor="middle" className="text-[7px] font-bold fill-muted-foreground opacity-60">
                                            {format(date, "d MMM", { locale: ru })}
                                        </text>
                                    );
                                }
                                labels.push(
                                    <text key="today" x={forecastSplitX} y={height - 5} textAnchor="middle" className="text-[7px] font-black fill-[#5d00ff] opacity-80">
                                        Сегодня
                                    </text>
                                );
                                const futureDate = addDays(new Date(), 10);
                                labels.push(
                                    <text key="future" x={width - paddingX} y={height - 5} textAnchor="end" className="text-[7px] font-bold fill-muted-foreground opacity-40">
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
                                            <motion.path
                                                d={`${path} L ${forecastSplitX},${height - paddingBottom} L ${paddingX},${height - paddingBottom} Z`}
                                                fill={`url(#grad-${line.id})`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />

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

                                            {(() => {
                                                const forecast = generateForecast(line.data);
                                                if (forecast.length === 0) return null;

                                                const safeData = line.data || [];
                                                const lastHistoricalY = (height - paddingBottom) - (safeData[safeData.length - 1] || 0) / (maxVal * 1.02 || 1) * (height - paddingTop - paddingBottom);
                                                const forecastPoints = forecast.map((val, i) => ({
                                                    x: forecastSplitX + ((i + 1) / (forecast.length || 1)) * ((width - paddingX) - forecastSplitX),
                                                    y: (height - paddingBottom) - ((val || 0) / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom)
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

                                            {(line.data || []).map((val, i) => {
                                                const safeData = line.data || [];
                                                const x = paddingX + (i / (safeData.length - 1 || 1)) * (forecastSplitX - paddingX);
                                                const y = (height - paddingBottom) - ((val || 0) / (maxVal * 1.02 || 1)) * (height - paddingTop - paddingBottom);

                                                return (
                                                    <g
                                                        key={i}
                                                        onMouseEnter={() => setHoveredData({ x, y, value: val, date: subDays(new Date(), (safeData.length - 1) - i) })}
                                                        onMouseLeave={() => setHoveredData(null)}
                                                        onClick={() => setHoveredData({ x, y, value: val, date: subDays(new Date(), (safeData.length - 1) - i) })}
                                                        onTouchStart={() => setHoveredData({ x, y, value: val, date: subDays(new Date(), (safeData.length - 1) - i) })}
                                                        className="cursor-pointer group/dot"
                                                    >
                                                        <circle cx={x} cy={y} r="15" fill="transparent" />
                                                        <motion.circle
                                                            cx={x}
                                                            cy={y}
                                                            r={i === (safeData.length - 1) ? "4" : "3.5"}
                                                            fill="white"
                                                            stroke={line.color}
                                                            strokeWidth="2.5"
                                                            initial={i === ((line.data || []).length - 1) ? { scale: 0 } : false}
                                                            animate={i === ((line.data || []).length - 1) ? { scale: 1 } : {}}
                                                            transition={{ delay: 2, duration: 0.4 }}
                                                            className={cn(
                                                                "transition-all duration-200 shadow-sm",
                                                                i === ((line.data || []).length - 1) ? "opacity-100" : "opacity-0 group-hover/dot:opacity-100 group-hover/dot:scale-110"
                                                            )}
                                                        />
                                                    </g>
                                                );
                                            })}

                                            {line.id === 'orders' && (() => {
                                                // Forecast logic removed as parameters are unused
                                                return null;
                                            })()}
                                        </g>
                                    );
                                })}
                            </AnimatePresence>

                            {hoveredData && (
                                <line
                                    x1={hoveredData.x} y1={15}
                                    x2={hoveredData.x} y2={height - 25}
                                    stroke="#5d00ff" strokeWidth="1" strokeDasharray="4 4"
                                    className="opacity-30"
                                />
                            )}
                        </motion.svg>

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
                                    "relative bg-foreground/95 backdrop-blur-xl border border-background/10 px-3 py-1.5 rounded-lg shadow-xl min-w-[80px] flex flex-col items-center",
                                    hoveredData.y < 80 ? "mt-2" : "mb-2"
                                )}>
                                    <span className="text-xs font-black text-background/50 block mb-0.5 whitespace-nowrap">
                                        {format(hoveredData.date, 'dd MMMM', { locale: ru })}
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-background">{hoveredData.value}</span>
                                        <span className="text-xs font-bold text-white/50">{formatUnit(unit)}</span>
                                    </div>
                                    <div className={cn(
                                        "absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-foreground/95 border-background/10 rotate-45",
                                        hoveredData.y < 80
                                            ? "-top-1.25 border-l border-t"
                                            : "-bottom-1.25 border-r border-b"
                                    )} />
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-border">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                                    {format(subDays(new Date(), 29), 'd MMMM', { locale: ru })}
                                </span>
                                <div className="h-px w-10 bg-border" />
                            </div>

                            <div className="group flex items-center gap-3 text-xs font-black text-foreground bg-card px-4 py-2 rounded-full shadow-crm-sm border border-border transition-all hover:shadow-crm-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(93,0,255,0.4)]" />
                                <span className="opacity-80">Сегодня</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
