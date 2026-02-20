"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusTimelineHorizontalProps } from "./types";
import { STATUS_CONFIG } from "./constants";

export function StatusTimelineHorizontal({ events, className }: StatusTimelineHorizontalProps) {
    return (
        <div className={cn("flex items-start", className)}>
            {events.map((event, index) => {
                const config = STATUS_CONFIG[event.status];
                const state = event.state || (index === events.length - 1 ? "current" : "completed");
                const isLast = index === events.length - 1;

                return (
                    <div key={event.id} className="flex items-start flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            {/* Иконка */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                    state === "completed" && "bg-emerald-500 border-emerald-500 text-white",
                                    state === "current" && "bg-primary border-primary text-white",
                                    state === "pending" && "bg-white border-slate-300 text-slate-400",
                                    state === "error" && "bg-rose-500 border-rose-500 text-white"
                                )}
                            >
                                {state === "completed" ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    event.icon || config.icon
                                )}
                            </div>

                            {/* Текст */}
                            <p className={cn(
                                "text-xs font-bold mt-2 text-center max-w-[80px]",
                                state === "pending" ? "text-slate-400" : "text-slate-900"
                            )}>
                                {event.label}
                            </p>
                            <time className="text-xs text-slate-400 mt-0.5">
                                {format(event.timestamp, "d MMM", { locale: ru })}
                            </time>
                        </div>

                        {/* Линия */}
                        {!isLast && (
                            <div className="flex-1 h-0.5 mt-5 mx-2">
                                <div
                                    className={cn(
                                        "h-full rounded-full",
                                        state === "completed" ? "bg-emerald-500" : "bg-slate-200"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
