"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusTimelineCardProps } from "./types";
import { StatusTimeline } from "./StatusTimeline";

export function StatusTimelineCard({
    events,
    title = "История заказа",
    currentStatus,
    className,
}: StatusTimelineCardProps) {
    const lastEvent = events[events.length - 1];

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            {/* Хедер */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                            <p className="text-xs text-slate-500">
                                {events.length} {events.length === 1 ? "событие" : "событий"}
                            </p>
                        </div>
                    </div>
                    {currentStatus && (
                        <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                            {currentStatus}
                        </div>
                    )}
                </div>
            </div>

            {/* Таймлайн */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
                <StatusTimeline events={events} />
            </div>

            {/* Футер */}
            {lastEvent && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Последнее обновление:{" "}
                        <span className="font-medium text-slate-700">
                            {formatDistanceToNow(lastEvent.timestamp, { addSuffix: true, locale: ru })}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
