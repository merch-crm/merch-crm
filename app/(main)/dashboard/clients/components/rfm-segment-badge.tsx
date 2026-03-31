"use client";

import { motion } from "framer-motion";
import {
    Trophy,
    Heart,
    Sparkles,
    Star,
    TrendingUp,
    AlertCircle,
    Moon,
    AlertTriangle,
    CloudSnow,
    Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    TooltipRoot,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    rfmSegmentLabels,
    rfmSegmentColors,
    rfmSegmentDescriptions,
} from "../actions/rfm.types";

interface RFMSegmentBadgeProps {
    segment: string | null;
    score?: string | null;
    showScore?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

import { IconType } from "@/components/ui/stat-card";

const segmentIcons: Record<string, IconType> = {
    champions: Trophy as IconType,
    loyal: Heart as IconType,
    potential: Sparkles as IconType,
    new: Star as IconType,
    promising: TrendingUp as IconType,
    need_attention: AlertCircle as IconType,
    about_to_sleep: Moon as IconType,
    at_risk: AlertTriangle as IconType,
    hibernating: CloudSnow as IconType,
    lost: Skull as IconType,
};

export function RFMSegmentBadge({
    segment,
    score,
    showScore = false,
    size = "md",
    className,
}: RFMSegmentBadgeProps) {
    if (!segment) return null;

    const Icon = (segmentIcons[segment] || Star) as IconType;
    const color = rfmSegmentColors[segment] || "#6B7280";
    const label = rfmSegmentLabels[segment] || segment;
    const description = rfmSegmentDescriptions[segment] || "";

    const sizeClasses = {
        sm: "h-6 px-2 text-xs gap-1",
        md: "h-7 px-2.5 text-xs gap-1.5",
        lg: "h-8 px-3 text-sm gap-2",
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
        lg: "w-4 h-4",
    };

    return (
        <TooltipProvider>
            <TooltipRoot>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "inline-flex items-center rounded-full font-medium cursor-help",
                            sizeClasses[size],
                            className
                        )}
                        style={{
                            backgroundColor: `${color}15`,
                            color: color,
                        }}
                    >
                        <Icon className={iconSizes[size]} />
                        <span>{label}</span>
                        {showScore && score && (
                            <span
                                className="ml-1 opacity-60 font-mono text-xs"
                            >
                                {score}
                            </span>
                        )}
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl rounded-xl">
                    <div className="space-y-1">
                        <p className="font-semibold text-sm flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {label}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
                        {score && (
                            <div className="pt-2 mt-2 border-t border-white/10">
                                <p className="text-xs text-slate-400 font-bold mb-1">
                                    RFM Анализ
                                </p>
                                <div className="grid grid-cols-3 gap-1">
                                    <div className="bg-white/10 rounded-md p-1 text-center">
                                        <p className="text-xs text-slate-400">R</p>
                                        <p className="text-xs font-bold">{score[0]}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-md p-1 text-center">
                                        <p className="text-xs text-slate-400">F</p>
                                        <p className="text-xs font-bold">{score[1]}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-md p-1 text-center">
                                        <p className="text-xs text-slate-400">M</p>
                                        <p className="text-xs font-bold">{score[2]}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}
