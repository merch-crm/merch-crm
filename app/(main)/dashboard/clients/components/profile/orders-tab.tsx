"use client";

import { ShoppingBag, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/formatters";
import type { ClientProfile } from "@/lib/types";

interface OrdersTabProps {
    client: ClientProfile;
    showFinancials: boolean;
    currencySymbol: string;
}

const safeFormat = (dateStr: string | null | undefined, formatStr: string) => {
    if (!dateStr) return "---";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "---";
        return formatDate(date, formatStr);
    } catch {
        return "---";
    }
};

export function OrdersTab({ client, showFinancials, currencySymbol }: OrdersTabProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold text-slate-400">Список последних заказов</h3>
                <Badge className="bg-slate-100 text-slate-600 border-none font-bold">{client.orders?.length || 0}</Badge>
            </div>
            {client.orders && client.orders.length > 0 ? (
                <div className="space-y-2">
                    {client.orders.map((order) => (
                        <a
                            key={order.id}
                            href={`/dashboard/orders/${order.id}`}
                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all group shadow-sm hover:bg-white hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-all">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Заказ #{order.orderNumber || order.id.slice(0, 8)}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                                        {safeFormat(order.createdAt?.toString(), "d MMM yyyy")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {showFinancials && (
                                    <span className="text-sm font-bold text-slate-900">{Math.round(order.totalPrice || 0)} {currencySymbol}</span>
                                )}
                                <Badge className="bg-primary/5 text-primary border-none font-bold text-xs px-2 py-0.5">{order.status}</Badge>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={ShoppingBag}
                    title="Нет завершенных заказов"
                    className="py-8"
                />
            )}
        </div>
    );
}
