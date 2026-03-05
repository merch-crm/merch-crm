"use client";

import { motion } from "framer-motion";
import {
    Instagram,
    Send,
    MessageCircle,
    Globe,
    Users,
    Calendar,
    Megaphone,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcquisitionSourceData } from "../../actions/analytics.actions";

interface AcquisitionSourcesChartProps {
    data: AcquisitionSourceData[];
    currencySymbol?: string;
    className?: string;
}

const iconMap: Record<string, React.ElementType> = {
    Instagram,
    Send,
    MessageCircle,
    Globe,
    Users,
    Calendar,
    Megaphone,
    HelpCircle,
};

const colorMap: Record<string, string> = {
    instagram: "#E4405F",
    telegram: "#26A5E4",
    whatsapp: "#25D366",
    vk: "#4680C2",
    website: "#3B82F6",
    referral: "#8B5CF6",
    exhibition: "#F59E0B",
    ads: "#EF4444",
    other: "#6B7280",
    "": "#94A3B8",
};

export function AcquisitionSourcesChart({
    data,
    currencySymbol = "₽",
    className
}: AcquisitionSourcesChartProps) {
    const maxCount = Math.max(...(data || []).map((d) => d.count), 1);

    return (
        <div className={cn("space-y-2", className)}>
            {(data || []).map((source, index) => {
                const Icon = iconMap[source.icon] || HelpCircle;
                const color = colorMap[source.source.toLowerCase()] || "#94A3B8";
                const widthPercentage = (source.count / maxCount) * 100;

                return (
                    <motion.div
                        key={source.source || "empty"}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                <Icon className="w-4 h-4" style={{ color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-900">
                                        {source.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {source.count} ({source.percentage}%)
                                    </span>
                                </div>

                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${widthPercentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>
                            </div>

                            <div className="text-right text-xs text-slate-400 w-24 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p>{source.revenue.toLocaleString()} {currencySymbol}</p>
                                <p>Ср. {source.averageCheck.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
