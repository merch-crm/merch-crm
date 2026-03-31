"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ClientGrowthData } from "../../actions/analytics.actions";

interface ClientGrowthChartProps {
    data: ClientGrowthData[];
    className?: string;
    showCumulative?: boolean;
}

export function ClientGrowthChart({
    data,
    className,
    showCumulative = false
}: ClientGrowthChartProps) {
    const maxValue = useMemo(() => {
        const safeData = data || [];
        if (showCumulative) {
            return Math.max(...safeData.map((d) => d.cumulativeClients), 1);
        }
        return Math.max(...safeData.map((d) => d.newClients), 1);
    }, [data, showCumulative]);

    const chartHeight = 200;

    return (
        <div className={cn("", className)}>
            {/* Chart */}
            <div className="relative h-[200px] flex items-end gap-1">
                {(data || []).map((item, index) => {
                    const value = showCumulative ? item.cumulativeClients : item.newClients;
                    const height = (value / maxValue) * chartHeight;
                    const b2bHeight = showCumulative ? 0 : (item.b2bNew / maxValue) * chartHeight;

                    return (
                        <div
                            key={item.date}
                            className="flex-1 flex flex-col items-center group"
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                    <p className="font-semibold">{item.month}</p>
                                    {showCumulative ? (
                                        <p>Всего: {item.cumulativeClients}</p>
                                    ) : (
                                        <>
                                            <p>Новых: {item.newClients}</p>
                                            <p className="text-blue-300">B2C: {item.b2cNew}</p>
                                            <p className="text-purple-300">B2B: {item.b2bNew}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height }}
                                transition={{ duration: 0.5, delay: index * 0.03 }}
                                className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 relative overflow-hidden"
                            >
                                {!showCumulative && (
                                    <>
                                        <div
                                            className="absolute bottom-0 w-full bg-purple-500"
                                            style={{ height: b2bHeight }}
                                        />
                                    </>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1 mt-2">
                {(data || []).map((item, index) => (
                    <div
                        key={item.date}
                        className="flex-1 text-center"
                    >
                        {index % Math.ceil((data || []).length / 6) === 0 && (
                            <span className="text-xs text-slate-400">{item.month}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            {!showCumulative && (
                <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <span className="text-xs text-slate-500">B2C</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-purple-500" />
                        <span className="text-xs text-slate-500">B2B</span>
                    </div>
                </div>
            )}
        </div>
    );
}
