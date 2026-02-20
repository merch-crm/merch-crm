"use client";

import * as React from "react";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryBadgeProps } from "./types";
import { PROVIDER_CONFIG, STATUS_CONFIG } from "./constants";

export function DeliveryBadge({ provider, tracking, status, className }: DeliveryBadgeProps) {
    const providerConfig = PROVIDER_CONFIG[provider];
    const statusConfig = STATUS_CONFIG[status];

    // Хак для получения более темного цвета - точки статуса
    const dotColorClass = statusConfig.color.replace("text-", "bg-").replace("600", "500");

    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <div className={cn("px-2 py-1 rounded-md flex items-center gap-1.5", providerConfig.bgColor)}>
                <Truck className={cn("w-3 h-3", providerConfig.color)} />
                <span className={cn("text-xs font-bold", providerConfig.color)}>
                    {providerConfig.name}
                </span>
            </div>
            <code className="text-xs font-mono text-slate-600">{tracking}</code>
            <div className={cn("w-2 h-2 rounded-full", dotColorClass)} />
        </div>
    );
}
