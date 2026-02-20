"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusTimelineMiniProps } from "./types";
import { STATUS_CONFIG } from "./constants";

export function StatusTimelineMini({ events, maxVisible = 4, className }: StatusTimelineMiniProps) {
    const visibleEvents = events.slice(-maxVisible);

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {visibleEvents.map((event, index) => {
                const config = STATUS_CONFIG[event.status];
                const state = event.state || (index === visibleEvents.length - 1 ? "current" : "completed");
                const isLast = index === visibleEvents.length - 1;

                return (
                    <React.Fragment key={event.id}>
                        <div
                            className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                state === "completed" && "bg-emerald-100 text-emerald-600",
                                state === "current" && "bg-primary/10 text-primary",
                                state === "pending" && "bg-slate-100 text-slate-400",
                                state === "error" && "bg-rose-100 text-rose-600"
                            )}
                            title={`${event.label} — ${format(event.timestamp, "d MMM, HH:mm", { locale: ru })}`}
                        >
                            {state === "completed" ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <span className="scale-75">{event.icon || config.icon}</span>
                            )}
                        </div>
                        {!isLast && (
                            <div
                                className={cn(
                                    "w-4 h-0.5 rounded-full",
                                    state === "completed" ? "bg-emerald-300" : "bg-slate-200"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
