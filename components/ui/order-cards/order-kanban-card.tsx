"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Package, Flame, AlertTriangle } from "lucide-react";
import { OrderData, PRIORITY_CONFIG } from "./types";
import { formatPrice, getDeadlineUrgency } from "./utils";

export interface OrderKanbanCardProps {
    order: OrderData;
    isDragging?: boolean;
    onClick?: () => void;
    className?: string;
}

export function OrderKanbanCard({
    order,
    isDragging = false,
    onClick,
    className,
}: OrderKanbanCardProps) {
    const priorityConfig = PRIORITY_CONFIG[order.priority];
    const deadlineUrgency = order.deadline ? getDeadlineUrgency(order.deadline) : null;

    return (
        <div role="button" tabIndex={0}
            onClick={onClick}
            className={cn(
                "p-3 rounded-lg border bg-white cursor-pointer transition-all",
                isDragging ? "shadow-lg rotate-2 border-primary" : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
                order.hasProblems && "border-l-4 border-l-rose-500",
                order.priority === "urgent" && !order.hasProblems && "border-l-4 border-l-orange-500",
                className
            )}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            {/* Хедер */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {order.priority !== "normal" && (
                        <span className={priorityConfig.color}>{priorityConfig.icon}</span>
                    )}
                    <span className="font-mono font-bold text-sm text-slate-900 truncate">
                        #{order.number}
                    </span>
                </div>
                <span className="text-sm font-bold text-slate-900 shrink-0">
                    {formatPrice(order.totalAmount)}
                </span>
            </div>

            {/* Клиент */}
            <p className="text-xs text-slate-600 truncate mb-2">
                {order.customer.company || order.customer.name}
            </p>

            {/* Футер */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Package className="w-3 h-3" />
                    <span>{order.totalItems}</span>
                </div>

                {deadlineUrgency && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs",
                            deadlineUrgency.isOverdue && "text-rose-600",
                            deadlineUrgency.isUrgent && !deadlineUrgency.isOverdue && "text-orange-600",
                            !deadlineUrgency.isOverdue && !deadlineUrgency.isUrgent && "text-slate-400"
                        )}
                    >
                        {(deadlineUrgency.isOverdue || deadlineUrgency.isUrgent) && (
                            <Flame className="w-3 h-3" />
                        )}
                        <span>{format(order.deadline!, "d MMM", { locale: ru })}</span>
                    </div>
                )}

                {order.hasProblems && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                )}
            </div>
        </div>
    );
}
