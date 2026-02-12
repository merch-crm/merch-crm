"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

interface Order {
    id: string;
    orderNumber?: string;
    createdAt: Date | string;
    status: string;
    totalAmount?: string | number | null;
}

interface OrderHistoryTableProps {
    orders: Order[];
    currencySymbol: string;
}

export function OrderHistoryTable({ orders, currencySymbol }: OrderHistoryTableProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center">
                    <Package className="w-5 h-5 mr-3 text-primary" />
                    История заказов
                </h3>
            </div>
            {orders && orders.length > 0 ? (
                <ResponsiveDataView
                    data={orders}
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
                                {orders.map((order) => (
                                    <tr key={order.id} className="crm-tr">
                                        <td className="crm-td font-bold text-slate-900">
                                            <Link href={`/dashboard/orders/${order.id}`} className="hover:text-primary underline decoration-primary/20 underline-offset-4">
                                                ORD-{order.orderNumber?.split('-')[2] || order.id.slice(0, 6)}
                                            </Link>
                                        </td>
                                        <td className="crm-td text-slate-500">
                                            {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                                        </td>
                                        <td className="crm-td">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 tracking-wider">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="crm-td crm-td-number font-bold text-slate-900">
                                            {Number(order.totalAmount).toLocaleString()} {currencySymbol}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    renderCard={(order) => (
                        <Link
                            key={order.id}
                            href={`/dashboard/orders/${order.id}`}
                            className="block p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">
                                        ORD-{order.orderNumber?.split('-')[2] || order.id.slice(0, 6)}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {format(new Date(order.createdAt), "d MMMM yyyy", { locale: ru })}
                                    </p>
                                </div>
                                <div className="px-2 py-1 rounded-md bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
                                    {order.status}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-lg font-bold text-primary">
                                    {Number(order.totalAmount).toLocaleString()} {currencySymbol}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </Link>
                    )}
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
