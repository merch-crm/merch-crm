"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusTimelineProps } from "./types";
import { STATUS_CONFIG, STATE_STYLES } from "./constants";

export function StatusTimeline({ events, className }: StatusTimelineProps) {
    return (
        <div className={cn("relative", className)}>
            {events.map((event, index) => {
                const config = STATUS_CONFIG[event.status];
                const state = event.state || (index === events.length - 1 ? "current" : "completed");
                const stateStyle = STATE_STYLES[state];
                const isLast = index === events.length - 1;

                return (
                    <div key={event.id} className="relative flex gap-3 pb-8 last:pb-0">
                        {/* Линия */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "absolute left-[15px] top-8 bottom-0 w-0.5",
                                    stateStyle.line
                                )}
                            />
                        )}

                        {/* Иконка */}
                        <div
                            className={cn(
                                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                                state === "completed" && "bg-emerald-500 border-emerald-500 text-white",
                                state === "current" && "bg-primary border-primary text-white",
                                state === "pending" && "bg-white border-slate-300 text-slate-400",
                                state === "error" && "bg-rose-500 border-rose-500 text-white"
                            )}
                        >
                            {state === "completed" ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                event.icon || config.icon
                            )}
                        </div>

                        {/* Контент */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className={cn(
                                        "text-sm font-bold",
                                        state === "pending" ? "text-slate-400" : "text-slate-900"
                                    )}>
                                        {event.label}
                                    </p>
                                    {event.description && (
                                        <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                                    )}
                                </div>
                                <time className="text-xs text-slate-400 whitespace-nowrap">
                                    {format(event.timestamp, "d MMM, HH:mm", { locale: ru })}
                                </time>
                            </div>

                            {/* Комментарий */}
                            {event.comment && (
                                <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-600">{event.comment}</p>
                                    {event.user && (
                                        <p className="text-xs text-slate-400 mt-1">— {event.user}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
