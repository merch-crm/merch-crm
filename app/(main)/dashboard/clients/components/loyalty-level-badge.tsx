"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Star, Award, Crown, User, Sparkles } from "lucide-react";
import type { LoyaltyLevel } from "@/lib/schema/clients/loyalty";

interface LoyaltyLevelBadgeProps {
    level: LoyaltyLevel | null;
    size?: "sm" | "md" | "lg";
    showDiscount?: boolean;
    className?: string;
}

// Маппинг иконок
const ICON_MAP: Record<string, typeof Star> = {
    user: User,
    star: Star,
    award: Award,
    crown: Crown,
    sparkles: Sparkles,
};

const SIZE_CLASSES = {
    sm: {
        container: "h-6 px-2 gap-1 text-xs",
        icon: "w-3 h-3",
    },
    md: {
        container: "h-7 px-2.5 gap-1.5 text-xs",
        icon: "w-3.5 h-3.5",
    },
    lg: {
        container: "h-8 px-3 gap-2 text-xs",
        icon: "w-4 h-4",
    },
};

export const LoyaltyLevelBadge = memo(function LoyaltyLevelBadge({
    level,
    size = "md",
    showDiscount = false,
    className,
}: LoyaltyLevelBadgeProps) {
    if (!level) {
        return (
            <div
                className={cn(
                    "inline-flex items-center rounded-full font-bold bg-slate-100 text-slate-500",
                    SIZE_CLASSES[size].container,
                    className
                )}
            >
                <User className={SIZE_CLASSES[size].icon} />
                <span>Без уровня</span>
            </div>
        );
    }

    const Icon = ICON_MAP[level.icon || "star"] || Star;
    const sizeClasses = SIZE_CLASSES[size];
    const discount = Number(level.discountPercent || 0);

    // Определяем цвета на основе HEX
    const isLightColor = (hex: string) => {
        const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.65;
    };

    const bgColor = level.color || "#64748b";
    const textColor = isLightColor(bgColor) ? "#1e293b" : "#ffffff";

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full font-bold",
                sizeClasses.container,
                className
            )}
            style={{
                backgroundColor: `${bgColor}20`,
                color: bgColor,
            }}
        >
            <Icon className={sizeClasses.icon} />
            <span>{level.levelName}</span>
            {showDiscount && discount > 0 && (
                <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                        backgroundColor: bgColor,
                        color: textColor,
                    }}
                >
                    -{discount}%
                </span>
            )}
        </div>
    );
});
