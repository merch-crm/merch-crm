"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import { User, Package, MessageSquare, AlertTriangle, CheckCircle, Flame, Timer, Calendar } from "lucide-react";
import { OrderStatus } from "@/lib/types";
import { OrderData, STATUS_CONFIG, PRIORITY_CONFIG } from "./types";
import { formatPrice, getDeadlineUrgency } from "./utils";
import { OrderQueueCardCompact } from "./order-queue-card-compact";

export interface OrderQueueCardProps {
    order: OrderData;
    variant?: "default" | "compact" | "detailed";
    selected?: boolean;
    dragging?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
    onStatusChange?: (status: OrderStatus) => void;
    onAssign?: () => void;
    actions?: React.ReactNode;
    className?: string;
}

export function OrderQueueCard({
    order,
    variant = "default",
    selected = false,
    dragging = false,
    onClick,
    onDoubleClick,
    onContextMenu,
    actions,
    className,
}: OrderQueueCardProps) {
    const statusConfig = STATUS_CONFIG[order.status];
    const priorityConfig = PRIORITY_CONFIG[order.priority];
    const deadlineUrgency = order.deadline ? getDeadlineUrgency(order.deadline) : null;

    const isPaid = order.paidAmount && order.paidAmount >= order.totalAmount;
    const isPartiallyPaid = order.paidAmount && order.paidAmount > 0 && order.paidAmount < order.totalAmount;

    if (variant === "compact") {
        return (
            <OrderQueueCardCompact
                order={order}
                selected={selected}
                onClick={onClick}
                className={className}
            />
        );
    }

    return (
        <div role="button" tabIndex={0}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            className={cn(
                "rounded-xl border bg-white transition-all cursor-pointer group",
                selected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300",
                dragging && "shadow-xl rotate-2 opacity-90",
                order.hasProblems && "border-l-4 border-l-rose-500",
                order.priority === "urgent" && !order.hasProblems && "border-l-4 border-l-orange-500",
                className
            )}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            {/* Хедер */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        {/* Приоритет */}
                        {order.priority !== "normal" && (
                            <div className={cn("shrink-0", priorityConfig.color)}>
                                {priorityConfig.icon}
                            </div>
                        )}

                        {/* Номер заказа */}
                        <span className="font-mono font-bold text-slate-900 truncate">
                            #{order.number}
                        </span>

                        {/* VIP */}
                        {order.customer.isVip && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">
                                VIP
                            </span>
                        )}
                    </div>

                    {/* Статус */}
                    <div className={cn("shrink-0 px-2 py-1 rounded-md flex items-center gap-1", statusConfig.bgColor)}>
                        {statusConfig.icon}
                        <span className={cn("text-xs font-bold", statusConfig.color)}>
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                {/* Клиент */}
                <div className="mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">
                        {order.customer.company || order.customer.name}
                    </span>
                </div>
            </div>

            {/* Товары */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2">
                    {order.items.slice(0, 3).map((item) => (
                        <div
                            key={item.id}
                            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0"
                            title={item.name}
                        >
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    width={40}
                                    height={40}
                                />
                            ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                    ))}
                    {order.totalItems > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-slate-500">
                                +{order.totalItems - 3}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0 ml-2">
                        <p className="text-xs text-slate-500 truncate">
                            {order.totalItems} {order.totalItems === 1 ? "позиция" : "позиций"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Прогресс (если в производстве) */}
            {order.progress !== undefined && order.status === "in_production" && (
                <div className="px-4 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${order.progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{order.progress}%</span>
                    </div>
                </div>
            )}

            {/* Футер */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {/* Сумма и оплата */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                        {formatPrice(order.totalAmount)}
                    </span>
                    {isPaid && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                    {isPartiallyPaid && (
                        <span className="text-xs text-amber-600 font-medium">
                            (частично)
                        </span>
                    )}
                </div>

                {/* Дедлайн / Дата */}
                <div className="flex items-center gap-3 text-xs">
                    {order.deadline ? (
                        <div
                            className={cn(
                                "flex items-center gap-1",
                                deadlineUrgency?.isOverdue && "text-rose-600",
                                deadlineUrgency?.isUrgent && !deadlineUrgency.isOverdue && "text-orange-600",
                                deadlineUrgency?.isSoon && "text-amber-600",
                                !deadlineUrgency?.isOverdue && !deadlineUrgency?.isUrgent && !deadlineUrgency?.isSoon && "text-slate-500"
                            )}
                        >
                            {deadlineUrgency?.isOverdue || deadlineUrgency?.isUrgent ? (
                                <Flame className="w-3.5 h-3.5" />
                            ) : (
                                <Timer className="w-3.5 h-3.5" />
                            )}
                            <span className="font-medium">
                                {deadlineUrgency?.isOverdue
                                    ? "Просрочен"
                                    : formatDistanceToNow(order.deadline, { addSuffix: false, locale: ru })}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(order.createdAt, "d MMM", { locale: ru })}</span>
                        </div>
                    )}

                    {/* Индикаторы */}
                    <div className="flex items-center gap-1">
                        {order.hasComments && (
                            <div className="flex items-center gap-0.5 text-slate-400" title="Есть комментарии">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {order.commentsCount && order.commentsCount > 0 && (
                                    <span className="text-xs">{order.commentsCount}</span>
                                )}
                            </div>
                        )}
                        {order.hasProblems && (
                            <div title={order.problemDescription}>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Кастомные действия */}
            {actions && (
                <div className="px-4 py-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions}
                </div>
            )}
        </div>
    );
}
