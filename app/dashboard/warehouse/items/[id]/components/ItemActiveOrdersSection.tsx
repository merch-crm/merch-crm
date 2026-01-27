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
            <div className="py-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/50">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 border border-slate-100">
                    <ShoppingBag className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400">Нет заказов</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((item, idx) => {
                if (!item.order) return null;

                const clientName = item.order.client
                    ? `${item.order.client.firstName} ${item.order.client.lastName}`.trim()
                    : "Частное лицо";

                return (
                    <Link
                        key={item.id}
                        href={`/dashboard/orders/${item.order.id}`}
                        className="group relative overflow-hidden p-5 rounded-2xl bg-[#F8FAFC]/50 hover:bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between h-full"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Status Batch */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-7 px-3 rounded-full bg-white border border-slate-100 shadow-sm flex items-center gap-2 group-hover:border-primary/20 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black text-slate-900 whitespace-nowrap">
                                    Заказ #{item.order.orderNumber}
                                </span>
                            </div>
                            <span className="text-sm font-black text-primary tabular-nums">
                                {item.quantity} шт
                            </span>
                        </div>

                        {/* Middle Content */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 mb-0.5">Клиент</p>
                                    <p className="text-[12px] font-bold text-slate-710 truncate">
                                        {item.order.client?.company || clientName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-slate-100/60 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                <span>{format(new Date(item.order.createdAt), "dd MMM yyyy", { locale: ru })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-primary/60 group-hover:text-primary uppercase tracking-widest transition-colors">
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
