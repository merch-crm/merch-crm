"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import {
    UserPlus,
    MessageCircle,
    Handshake,
    ShoppingBag,
    Crown,
    AlertTriangle,
} from "lucide-react";
import type { FunnelStage } from "@/lib/schema/clients";

interface FunnelStageBadgeProps {
    stage: FunnelStage | string | null;
    isLost?: boolean;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

const STAGE_CONFIG: Record<string, {
    icon: typeof UserPlus;
    label: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
}> = {
    lead: {
        icon: UserPlus,
        label: "Лид",
        bgColor: "bg-slate-100",
        textColor: "text-slate-700",
        iconColor: "text-slate-500",
    },
    first_contact: {
        icon: MessageCircle,
        label: "Первый контакт",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        iconColor: "text-blue-500",
    },
    negotiation: {
        icon: Handshake,
        label: "Переговоры",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        iconColor: "text-amber-500",
    },
    first_order: {
        icon: ShoppingBag,
        label: "Первый заказ",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
        iconColor: "text-emerald-500",
    },
    regular: {
        icon: Crown,
        label: "Постоянный",
        bgColor: "bg-primary/10",
        textColor: "text-primary",
        iconColor: "text-primary",
    },
};

const LOST_CONFIG = {
    icon: AlertTriangle,
    label: "Потерян",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    iconColor: "text-rose-500",
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

export const FunnelStageBadge = memo(function FunnelStageBadge({
    stage,
    isLost = false,
    size = "md",
    showLabel = true,
    className,
}: FunnelStageBadgeProps) {
    const config = isLost ? LOST_CONFIG : (STAGE_CONFIG[stage || "lead"] || STAGE_CONFIG.lead);
    const Icon = config.icon;
    const sizeClasses = SIZE_CLASSES[size];

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full font-bold shrink-0",
                config.bgColor,
                config.textColor,
                sizeClasses.container,
                className
            )}
        >
            <Icon className={cn(sizeClasses.icon, config.iconColor)} />
            {showLabel && <span>{config.label}</span>}
        </div>
    );
});
