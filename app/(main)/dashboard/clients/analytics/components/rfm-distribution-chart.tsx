"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RFMDistributionData } from "../../actions/analytics.actions";

interface RFMDistributionChartProps {
    data: RFMDistributionData[];
    currencySymbol?: string;
    className?: string;
}

export function RFMDistributionChart({
    data,
    currencySymbol = "₽",
    className
}: RFMDistributionChartProps) {
    // const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className={cn("", className)}>
            {/* Donut-like bar visualization */}
            <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {(data || []).map((segment, index) => (
                    <motion.div
                        key={segment.segment}
                        initial={{ width: 0 }}
                        animate={{ width: `${segment.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full"
                        style={{ backgroundColor: segment.color }}
                        title={`${segment.label}: ${segment.percentage}%`}
                    />
                ))}
            </div>

            {/* Legend with details */}
            <div className="grid grid-cols-2 gap-2">
                {(data || []).map((segment, index) => (
                    <motion.div
                        key={segment.segment}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: segment.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {segment.label}
                            </p>
                            <p className="text-xs text-slate-500">
                                {segment.count} клиентов • {segment.percentage}%
                            </p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                            ~{segment.avgRevenue.toLocaleString()} {currencySymbol}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
