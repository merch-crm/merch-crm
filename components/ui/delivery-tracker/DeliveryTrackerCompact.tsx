"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryTrackerCompactProps } from "./types";
import { PROVIDER_CONFIG, STATUS_CONFIG } from "./constants";

export function DeliveryTrackerCompact({ delivery, onClick, className }: DeliveryTrackerCompactProps) {
    const providerConfig = PROVIDER_CONFIG[delivery.provider];
    const statusConfig = STATUS_CONFIG[delivery.status];

    return (
        <div role="button" tabIndex={0}
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors",
                onClick && "cursor-pointer",
                className
            )}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", providerConfig.bgColor)}>
                        <Truck className={cn("w-4 h-4", providerConfig.color)} />
                    </div>
                    <div>
                        <p className={cn("text-xs font-bold", providerConfig.color)}>
                            {delivery.providerName || providerConfig.name}
                        </p>
                        <code className="text-xs font-mono text-slate-500">{delivery.trackingNumber}</code>
                    </div>
                </div>
                <div className={cn("px-2 py-1 rounded-md flex items-center gap-1", statusConfig.bgColor)}>
                    <span className="scale-75">{statusConfig.icon}</span>
                    <span className={cn("text-xs font-bold", statusConfig.color)}>
                        {delivery.statusLabel || statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Маршрут */}
            {(delivery.senderCity || delivery.receiverCity) && (
                <div className="flex items-center gap-2 text-xs">
                    {delivery.senderCity && <span className="text-slate-500">{delivery.senderCity}</span>}
                    {delivery.senderCity && delivery.receiverCity && <div className="flex-1 h-px bg-slate-200" />}
                    {delivery.receiverCity && <span className="font-medium text-slate-900">{delivery.receiverCity}</span>}
                </div>
            )}

            {/* Дата */}
            {delivery.estimatedDelivery && delivery.status !== "delivered" && (
                <p className="text-xs text-slate-500 mt-2">
                    Ожидается {format(delivery.estimatedDelivery, "d MMMM", { locale: ru })}
                </p>
            )}
        </div>
    );
}
