"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

import type { Order, ClientProfileOrder } from "@/lib/types";

interface OrderHistoryTableProps {
    orders: (Order | ClientProfileOrder)[];
    currencySymbol: string;
}

function isClientProfileOrder(order: Order | ClientProfileOrder): order is ClientProfileOrder {
    return 'orderNumber' in order && 'totalPrice' in order;
}

export function OrderHistoryTable({ orders, currencySymbol }: OrderHistoryTableProps) {
    const safeOrders = orders || [];
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center">
                    <Package className="w-5 h-5 mr-3 text-primary" />
                    История заказов
                </h3>
            </div>
            {safeOrders.length > 0 ? (
                <ResponsiveDataView
                    data={safeOrders}
                    renderTable={() => (
                        <table className="crm-table">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th">Номер</th>
                                    <th className="crm-th">Дата</th>
                                    <th className="crm-th">Статус</th>
                                    <th className="crm-th crm-td-number">Сумма</th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {safeOrders.map((order) => {
                                    const isProfileOrder = isClientProfileOrder(order);
                                    const orderNum = isProfileOrder ? order.orderNumber : (order as Order).number || order.id;
                                    const amount = isProfileOrder ? order.totalPrice : ((order as Order).total || Number((order as Order).totalAmount) || 0);

                                    const statusColors: Record<string, string> = {
                                        'new': 'bg-blue-50 text-blue-600 border-blue-100',
                                        'design': 'bg-purple-50 text-purple-600 border-purple-100',
                                        'production': 'bg-orange-50 text-orange-600 border-orange-100',
                                        'ready': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                        'completed': 'bg-slate-50 text-slate-600 border-slate-100',
                                        'cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
                                    };

                                    return (
                                        <tr key={order.id} className="crm-tr group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/orders/${order.id}`}>
                                            <td className="crm-td font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                ORD-{orderNum?.split('-')[2] || order.id.slice(0, 6)}
                                            </td>
                                            <td className="crm-td text-slate-500 font-medium">
                                                {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                                            </td>
                                            <td className="crm-td">
                                                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${statusColors[order.status || ''] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {order.status || "—"}
                                                </span>
                                            </td>
                                            <td className="crm-td crm-td-number font-black text-slate-900">
                                                {amount.toLocaleString()} {currencySymbol}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    renderCard={(order) => {
                        const isProfileOrder = isClientProfileOrder(order);
                        const orderNum = isProfileOrder ? order.orderNumber : (order as Order).number || order.id;
                        const amount = isProfileOrder ? order.totalPrice : ((order as Order).total || Number((order as Order).totalAmount) || 0);

                        return (
                            <Link
                                key={order.id}
                                href={`/dashboard/orders/${order.id}`}
                                className="block p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">
                                            ORD-{orderNum?.split('-')[2] || order.id.slice(0, 6)}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 tracking-tight">
                                            {format(new Date(order.createdAt), "d MMMM yyyy", { locale: ru })}
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-slate-50 text-xs font-bold text-slate-500 border border-slate-100">
                                        {order.status || "—"}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-lg font-bold text-primary">
                                        {amount.toLocaleString()} {currencySymbol}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </div>
                            </Link>
                        );
                    }}
                    mobileGridClassName="grid grid-cols-1 gap-3 p-4 bg-slate-50/30"
                />
            ) : (
                <div className="p-12 text-center text-slate-500">
                    История заказов пуста
                </div>
            )}
        </div>
    );
}
