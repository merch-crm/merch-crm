"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timeframe } from "./types";

interface PriceHistoryChartProps {
    points: { date: Date; label: string; avg: number }[];
    min: number;
    max: number;
    currencySymbol: string;
    timeframe: Timeframe;
}

export function PriceHistoryChart({
    points,
    min,
    max,
    currencySymbol,
    timeframe
}: PriceHistoryChartProps) {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [graphWidth, setGraphWidth] = useState(1000);
    const graphRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === graphRef.current) {
                    setGraphWidth(Math.max(100, entry.contentRect.width));
                }
            }
        });

        const el = graphRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
            observer.disconnect();
        };
    }, []);

    if (points.length < 2) return (
        <div className="h-[120px] w-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Недостаточно данных для графика
        </div>
    );

    const paddingX = 40;
    const paddingY = 10;
    const currentGraphWidth = graphWidth - paddingX * 2;
    const graphHeight = 120 - paddingY * 2;
    const range = Math.max(1, max - min);

    const getY = (val: number) => 120 - paddingY - ((val - min) / range) * graphHeight;
    const getX = (i: number) => paddingX + (i / (points.length - 1)) * currentGraphWidth;

    // Generate Path
    let d = `M ${getX(0)} ${getY(points[0].avg)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const x1 = getX(i);
        const y1 = getY(points[i].avg);
        const x2 = getX(i + 1);
        const y2 = getY(points[i + 1].avg);
        const cp1x = x1 + (x2 - x1) * 0.4;
        const cp2x = x1 + (x2 - x1) * 0.6;
        d += ` C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    }

    const areaD = `${d} L ${getX(points.length - 1)} 120 L ${getX(0)} 120 Z`;

    return (
        <div className="relative h-[120px] w-full group/chart overflow-visible" ref={graphRef}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={timeframe}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${graphWidth} 120`}
                        className="overflow-visible"
                    >
                        <defs>
                            <linearGradient id="premiumChartCompactGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 25, 50, 75, 100].map(p => (
                            <line
                                key={p}
                                x1="0"
                                y1={`${p}%`}
                                x2={graphWidth}
                                y2={`${p}%`}
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeOpacity="0.1"
                                className="text-muted-foreground"
                            />
                        ))}

                        <motion.path
                            d={areaD}
                            fill="url(#premiumChartCompactGradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                        <motion.path
                            d={d}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />

                        {/* Dots and Labels */}
                        {points.map((p, i) => (
                            <g
                                key={i}
                                onMouseEnter={() => setHoveredPoint(i)}
                                onMouseLeave={() => setHoveredPoint(null)}
                                className="cursor-pointer"
                            >
                                <AnimatePresence>
                                    {hoveredPoint === i && (
                                        <motion.line
                                            x1={getX(i)}
                                            y1={getY(p.avg)}
                                            x2={getX(i)}
                                            y2="105"
                                            stroke="#4f46e5"
                                            strokeWidth="1"
                                            strokeDasharray="4 2"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.circle
                                    cx={getX(i)}
                                    cy={getY(p.avg)}
                                    r="4"
                                    fill="white"
                                    stroke="#4f46e5"
                                    strokeWidth="2.5"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ r: 6, strokeWidth: 3 }}
                                />

                                <circle
                                    cx={getX(i)}
                                    cy={getY(p.avg)}
                                    r="15"
                                    fill="transparent"
                                />

                                <AnimatePresence>
                                    {hoveredPoint === i && (
                                        <motion.g
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="pointer-events-none"
                                        >
                                            <rect
                                                x={getX(i) - 35}
                                                y={getY(p.avg) - 32}
                                                width="70"
                                                height="22"
                                                rx="8"
                                                fill="#1f1f1f"
                                                className="shadow-xl"
                                            />
                                            <text
                                                x={getX(i)}
                                                y={getY(p.avg) - 17}
                                                textAnchor="middle"
                                                className="text-xs font-black fill-white tabular-nums"
                                            >
                                                {Math.round(p.avg).toLocaleString()} {currencySymbol}
                                            </text>
                                            <path
                                                d={`M ${getX(i) - 4} ${getY(p.avg) - 10} L ${getX(i)} ${getY(p.avg) - 5} L ${getX(i) + 4} ${getY(p.avg) - 10} Z`}
                                                fill="#1f1f1f"
                                            />
                                        </motion.g>
                                    )}
                                </AnimatePresence>

                                <text
                                    x={getX(i)}
                                    y="115"
                                    textAnchor="middle"
                                    className="text-xs font-bold fill-muted-foreground pointer-events-none"
                                >
                                    {p.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
