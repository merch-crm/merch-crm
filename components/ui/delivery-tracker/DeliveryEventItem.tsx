"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryEvent } from "./types";
import { STATUS_CONFIG } from "./constants";

interface DeliveryEventItemProps {
    event: DeliveryEvent;
    isFirst: boolean;
    isLast: boolean;
}

export function DeliveryEventItem({ event, isFirst, isLast }: DeliveryEventItemProps) {
    const eventStatusConfig = STATUS_CONFIG[event.status];

    return (
        <div className="relative flex gap-3 pb-4 last:pb-0">
            {/* Линия */}
            {!isLast && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Иконка */}
            <div
                className={cn(
                    "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    isFirst ? eventStatusConfig.bgColor : "bg-slate-100",
                    isFirst ? eventStatusConfig.color : "text-slate-400"
                )}
            >
                <span className="scale-75">{eventStatusConfig.icon}</span>
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", isFirst ? "text-slate-900" : "text-slate-600")}>
                        {event.title}
                    </p>
                    <time className="text-xs text-slate-400 whitespace-nowrap">
                        {format(event.timestamp, "d MMM, HH:mm", { locale: ru })}
                    </time>
                </div>
                {event.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{event.location}</span>
                    </div>
                )}
                {event.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                )}
            </div>
        </div>
    );
}
