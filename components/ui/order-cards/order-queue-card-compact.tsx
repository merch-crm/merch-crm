"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { OrderData, STATUS_CONFIG, PRIORITY_CONFIG } from "./types";
import { formatPrice, getDeadlineUrgency } from "./utils";

export interface OrderQueueCardCompactProps {
    order: OrderData;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function OrderQueueCardCompact({
    order,
    selected = false,
    onClick,
    className,
}: OrderQueueCardCompactProps) {
    const statusConfig = STATUS_CONFIG[order.status];
    const priorityConfig = PRIORITY_CONFIG[order.priority];
    const deadlineUrgency = order.deadline ? getDeadlineUrgency(order.deadline) : null;

    return (
        <div role="button" tabIndex={0}
            onClick={onClick}
            className={cn(
                "p-3 rounded-lg border bg-white transition-all cursor-pointer",
                selected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300",
                order.hasProblems && "border-l-4 border-l-rose-500",
                className
            )}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            <div className="flex items-center gap-3">
                {/* Приоритет */}
                {order.priority !== "normal" && (
                    <div className={cn("shrink-0", priorityConfig.color)}>
                        {priorityConfig.icon}
                    </div>
                )}

                {/* Основная информация */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">#{order.number}</span>
                        {order.customer.isVip && (
                            <span className="px-1 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">
                                VIP
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                        {order.customer.company || order.customer.name}
                    </p>
                </div>

                {/* Сумма */}
                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-slate-400">{order.totalItems} поз.</p>
                </div>

                {/* Статус */}
                <div className={cn("w-2 h-8 rounded-full shrink-0", statusConfig.bgColor.replace("100", "400"))} />
            </div>

            {/* Дедлайн */}
            {deadlineUrgency && (deadlineUrgency.isOverdue || deadlineUrgency.isUrgent) && (
                <div className={cn(
                    "mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-xs",
                    deadlineUrgency.isOverdue ? "text-rose-600" : "text-orange-600"
                )}>
                    <Flame className="w-3 h-3" />
                    <span className="font-medium">
                        {deadlineUrgency.isOverdue ? "Просрочен" : "Срочно"}
                    </span>
                </div>
            )}
        </div>
    );
}
