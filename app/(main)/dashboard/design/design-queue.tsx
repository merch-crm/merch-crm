"use client";

import { FileText, User, Calendar, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { pluralize } from "@/lib/pluralize";

import { Order } from "@/lib/types";

interface DesignQueueProps {
    orders: Order[];
}

export function DesignQueue({ orders }: DesignQueueProps) {
    return (
        <div className="crm-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Очередь дизайна</h2>
                    <p className="text-sm text-slate-400 mt-1">Заказы, ожидающие макетирования</p>
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">
                    {orders?.length || 0} {pluralize(orders?.length || 0, 'заказ', 'заказа', 'заказов')}
                </div>
            </div>

            <div className="space-y-3">
                {(!orders || orders?.length === 0) ? (
                    <div className="flex items-center justify-center h-48 text-slate-300">
                        <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Нет заказов в очереди</p>
                        </div>
                    </div>
                ) : (
                    orders?.map((order) => {
                        const isUrgent = order.priority === "high" || order.priority === "urgent";
                        const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                        return (
                            <Link
                                key={order.id}
                                href={`/dashboard/orders/${order.id}`}
                                className={cn(
                                    "block bg-white rounded-[var(--radius)] p-5 border transition-all hover:shadow-md group",
                                    isUrgent ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                {order.orderNumber}
                                            </span>
                                            {isUrgent && (
                                                <div className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-xs font-bold ">
                                                    Срочно
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="font-bold text-slate-900">
                                                {order.client?.name || "Без имени"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" />
                                        <span>{totalItems} {pluralize(totalItems, 'позиция', 'позиции', 'позиций')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>

                                {order.items && order.items?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {order.items[0]?.description}
                                            {(order.items?.length || 0) > 1 && ` +${(order.items?.length || 0) - 1} ${pluralize((order.items?.length || 0) - 1, 'позиция', 'позиции', 'позиций')} ещё`}
                                        </p>
                                    </div>
                                )}
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
