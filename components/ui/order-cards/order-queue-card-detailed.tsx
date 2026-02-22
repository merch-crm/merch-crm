"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import { User, Package, Phone, Truck, MapPin, Copy, Printer, Edit, Timer, AlertTriangle, CheckCircle } from "lucide-react";
import { OrderStatus } from "@/lib/types";
import { OrderData, STATUS_CONFIG, PRIORITY_CONFIG } from "./types";
import { formatPrice, getDeadlineUrgency } from "./utils";

export interface OrderQueueCardDetailedProps {
    order: OrderData;
    onEdit?: () => void;
    onPrint?: () => void;
    onCopy?: () => void;
    onStatusChange?: (status: OrderStatus) => void;
    className?: string;
}

export function OrderQueueCardDetailed({
    order,
    onEdit,
    onPrint,
    onCopy,
    className,
}: OrderQueueCardDetailedProps) {
    const statusConfig = STATUS_CONFIG[order.status];
    const priorityConfig = PRIORITY_CONFIG[order.priority];
    const deadlineUrgency = order.deadline ? getDeadlineUrgency(order.deadline) : null;

    const isPaid = order.paidAmount && order.paidAmount >= order.totalAmount;
    const paidPercent = order.paidAmount ? (order.paidAmount / order.totalAmount) * 100 : 0;

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            {/* Хедер */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            {order.priority !== "normal" && (
                                <div className={cn(priorityConfig.color)}>{priorityConfig.icon}</div>
                            )}
                            <h3 className="text-lg font-bold text-slate-900">Заказ #{order.number}</h3>
                            {order.customer.isVip && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">
                                    VIP
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            от {format(order.createdAt, "d MMMM yyyy, HH:mm", { locale: ru })}
                        </p>
                    </div>

                    {/* Действия */}
                    <div className="flex items-center gap-2">
                        {onCopy && (
                            <button
                                type="button"
                                onClick={onCopy}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Копировать"
                            >
                                <Copy className="w-4 h-4 text-slate-500" />
                            </button>
                        )}
                        {onPrint && (
                            <button
                                type="button"
                                onClick={onPrint}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Печать"
                            >
                                <Printer className="w-4 h-4 text-slate-500" />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Редактировать"
                            >
                                <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Статус */}
                <div className="mt-4 flex items-center gap-3">
                    <div className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5", statusConfig.bgColor)}>
                        {statusConfig.icon}
                        <span className={cn("text-sm font-bold", statusConfig.color)}>
                            {statusConfig.label}
                        </span>
                    </div>

                    {order.deadline && (
                        <div
                            className={cn(
                                "px-3 py-1.5 rounded-lg flex items-center gap-1.5",
                                deadlineUrgency?.isOverdue && "bg-rose-100",
                                deadlineUrgency?.isUrgent && !deadlineUrgency.isOverdue && "bg-orange-100",
                                deadlineUrgency?.isSoon && "bg-amber-100",
                                !deadlineUrgency?.isOverdue && !deadlineUrgency?.isUrgent && !deadlineUrgency?.isSoon && "bg-slate-100"
                            )}
                        >
                            <Timer className={cn(
                                "w-4 h-4",
                                deadlineUrgency?.isOverdue && "text-rose-600",
                                deadlineUrgency?.isUrgent && !deadlineUrgency.isOverdue && "text-orange-600",
                                deadlineUrgency?.isSoon && "text-amber-600",
                                !deadlineUrgency?.isOverdue && !deadlineUrgency?.isUrgent && !deadlineUrgency?.isSoon && "text-slate-600"
                            )} />
                            <span className={cn(
                                "text-sm font-medium",
                                deadlineUrgency?.isOverdue && "text-rose-700",
                                deadlineUrgency?.isUrgent && !deadlineUrgency.isOverdue && "text-orange-700",
                                deadlineUrgency?.isSoon && "text-amber-700",
                                !deadlineUrgency?.isOverdue && !deadlineUrgency?.isUrgent && !deadlineUrgency?.isSoon && "text-slate-700"
                            )}>
                                {format(order.deadline, "d MMM, HH:mm", { locale: ru })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Проблема */}
                {order.hasProblems && order.problemDescription && (
                    <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700">{order.problemDescription}</p>
                    </div>
                )}
            </div>

            {/* Клиент */}
            <div className="p-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-3">Клиент</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{order.customer.name}</span>
                    </div>
                    {order.customer.company && (
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{order.customer.company}</span>
                        </div>
                    )}
                    {order.customer.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${order.customer.phone}`} className="text-sm text-primary hover:underline">
                                {order.customer.phone}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Товары */}
            <div className="p-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-3">
                    Товары ({order.totalItems})
                </p>
                <div className="space-y-2">
                    {(order.items || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
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
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                            </div>
                            <span className="text-sm text-slate-500 shrink-0">×{item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Доставка */}
            {(order.deliveryMethod || order.deliveryCity) && (
                <div className="p-4 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-3">Доставка</p>
                    <div className="space-y-2">
                        {order.deliveryMethod && (
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{order.deliveryMethod}</span>
                            </div>
                        )}
                        {order.deliveryCity && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{order.deliveryCity}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Исполнитель */}
            {order.assignee && (
                <div className="p-4 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-3">Исполнитель</p>
                    <div className="flex items-center gap-3">
                        {order.assignee.avatar ? (
                            <Image
                                src={order.assignee.avatar}
                                alt={order.assignee.name}
                                className="w-8 h-8 rounded-full object-cover"
                                width={32}
                                height={32}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        )}
                        <span className="text-sm font-medium text-slate-900">{order.assignee.name}</span>
                    </div>
                </div>
            )}

            {/* Оплата */}
            <div className="p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Сумма заказа</span>
                    <span className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                </div>

                {order.paidAmount !== undefined && (
                    <>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    isPaid ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                style={{ width: `${Math.min(paidPercent, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                                {isPaid ? "Оплачено полностью" : `Оплачено ${formatPrice(order.paidAmount)}`}
                            </span>
                            {isPaid ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <span className="text-amber-600 font-medium">
                                    Остаток: {formatPrice(order.totalAmount - order.paidAmount)}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
