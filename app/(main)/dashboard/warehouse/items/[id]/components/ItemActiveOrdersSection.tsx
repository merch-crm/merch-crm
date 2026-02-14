"use client";

import React from "react";
import {
    ShoppingBag,
    ChevronRight,
    User,
    Calendar,
} from "lucide-react";
import { ActiveOrderItem } from "../../../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";

interface ItemActiveOrdersSectionProps {
    orders: ActiveOrderItem[];
}

export function ItemActiveOrdersSection({ orders }: ItemActiveOrdersSectionProps) {
    if (orders.length === 0) {
        return (
            <div className="table-empty py-12">
                <ShoppingBag />
                <p>Нет заказов</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orders.map((item, idx) => {
                if (!item.order) return null;

                const clientName = item.order.client
                    ? `${item.order.client.firstName} ${item.order.client.lastName}`.trim()
                    : "Частное лицо";

                return (
                    <Link
                        key={item.id}
                        href={`/dashboard/orders/${item.order.id}`}
                        className="group relative overflow-hidden p-5 rounded-2xl bg-muted/50 hover:bg-card border border-border hover:shadow-crm-md transition-all duration-300 flex flex-col justify-between h-full"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Status Batch */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-7 px-3 rounded-full bg-card border border-border shadow-sm flex items-center gap-2 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-bold text-foreground whitespace-nowrap">
                                    Заказ #{item.order.orderNumber}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-primary tabular-nums">
                                {item.quantity} шт
                            </span>
                        </div>

                        {/* Middle Content */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">Клиент</p>
                                    <p className="text-[12px] font-bold text-foreground truncate">
                                        {item.order.client?.company || clientName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                                <span>
                                    {(() => {
                                        const d = new Date(item.order.createdAt);
                                        return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy", { locale: ru });
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary/60 group-hover:text-primary transition-colors">
                                <span>Открыть</span>
                                <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>

                        {/* Subtle background glow on hover */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                );
            })}
        </div>
    );
}
