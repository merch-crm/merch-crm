"use client";

import * as React from "react";
import { User, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusTimelineGroupedProps, StatusEvent } from "./types";
import { STATUS_CONFIG } from "./constants";

export function StatusTimelineGrouped({ events, className }: StatusTimelineGroupedProps) {
    const groupedEvents = React.useMemo(() => {
        const groups: Record<string, StatusEvent[]> = {};

        events.forEach((event) => {
            const dateKey = format(event.timestamp, "yyyy-MM-dd", { locale: ru });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
        });

        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, items]) => ({
                date: new Date(date),
                events: items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
            }));
    }, [events]);

    return (
        <div className={cn("space-y-3", className)}>
            {groupedEvents.map((group) => (
                <div key={group.date.toISOString()}>
                    {/* Дата */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-bold text-slate-500 px-2">
                            {format(group.date, "d MMMM yyyy", { locale: ru })}
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* События */}
                    <div className="space-y-3">
                        {group.events.map((event) => {
                            const config = STATUS_CONFIG[event.status];
                            const state = event.state || "completed";

                            return (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            state === "error" ? "bg-rose-100 text-rose-600" : config.bgColor,
                                            state !== "error" && config.color
                                        )}
                                    >
                                        {event.icon || config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold text-slate-900">{event.label}</p>
                                            <time className="text-xs text-slate-400">
                                                {format(event.timestamp, "HH:mm", { locale: ru })}
                                            </time>
                                        </div>
                                        {event.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                                        )}
                                        {event.user && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <User className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-400">{event.user}</span>
                                            </div>
                                        )}
                                        {event.comment && (
                                            <div className="flex items-start gap-1.5 mt-2">
                                                <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5" />
                                                <p className="text-xs text-slate-500 italic">«{event.comment}»</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
