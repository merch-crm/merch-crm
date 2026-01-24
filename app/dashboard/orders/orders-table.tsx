"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusBadgeInteractive from "./status-badge-interactive";
import PriorityBadgeInteractive from "./priority-badge-interactive";
import { BulkActionsPanel } from "./bulk-actions-panel";
import { Zap, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateOrderField, toggleOrderArchived } from "./actions";
import { useToast } from "@/components/ui/toast";
import { GlassEmptyState } from "@/components/ui/glass-empty-state";
import { PackageOpen } from "lucide-react";

export interface Order {
    id: string;
    createdAt: string | Date;
    totalAmount: string;
    status: string;
    priority: string;
    client: { name: string };
    creator?: { name: string } | null;
    isUrgent?: boolean;
}

interface OrdersTableProps {
    orders: Order[];
    error?: string;
    isAdmin: boolean;
    showFinancials?: boolean;
    showArchived?: boolean;
    onToggleArchived?: () => void;
}

export function OrdersTable({ orders, error, isAdmin, showFinancials, showArchived }: OrdersTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleUpdateField = async (orderId: string, field: string, value: string | number | boolean) => {
        const res = await updateOrderField(orderId, field, value);
        if (res.error) {
            toast(res.error, "error");
        } else {
            toast("Заказ обновлен", "success");
        }
    };

    const isAllSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id));

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(orders.map(o => o.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (error) {
        return <div className="text-red-400 p-4 bg-red-50 rounded-[18px] border border-red-100">Ошибка загрузки заказов: {error}</div>;
    }

    return (
        <div className="glass-panel overflow-hidden bg-white/60">
            <table className="min-w-full divide-y divide-slate-100 table-fixed">
                <thead>
                    <tr className="bg-slate-50/40">
                        <th className="w-[60px] px-6 py-4 text-left">
                            <input
                                type="checkbox"
                                className="rounded-[var(--radius-sm)] border-slate-300 text-primary focus:ring-0 cursor-pointer h-4 w-4 transition-all"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="w-[160px] px-6 py-4 text-left text-xs font-bold text-slate-400">ID / Дата</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400">Клиент</th>
                        {showFinancials && (
                            <th className="w-[140px] px-6 py-4 text-left text-xs font-bold text-slate-400">Бюджет</th>
                        )}
                        <th className="w-[160px] px-6 py-4 text-left text-xs font-bold text-slate-400">Статус</th>
                        <th className="w-[140px] px-6 py-4 text-left text-xs font-bold text-slate-400">Приоритет</th>
                        <th className="w-[120px] px-6 py-4 text-right text-xs font-bold text-slate-400">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                            className={`group hover:bg-white/80 transition-all cursor-pointer ${selectedIds.includes(order.id) ? 'bg-primary/5' : ''}`}
                        >
                            <td className="px-6 py-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="rounded-[var(--radius-sm)] border-slate-300 text-primary focus:ring-0 cursor-pointer h-4 w-4 transition-all"
                                    checked={selectedIds.includes(order.id)}
                                    onChange={() => handleSelectRow(order.id)}
                                />
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900 mb-0.5">ORD-{order.id.slice(0, 6)}</div>
                                <div className="text-xs font-medium text-slate-400">{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900 mb-0.5">{order.client.name}</div>
                                <div className="text-xs font-medium text-slate-400">Отв: {order.creator?.name || "Система"}</div>
                            </td>
                            {showFinancials && (
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-[var(--radius-sm)]">
                                        {order.totalAmount} ₽
                                    </span>
                                </td>
                            )}
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateField(order.id, "isUrgent", !order.isUrgent);
                                        }}
                                        className={cn(
                                            "p-1.5 rounded-[18px] transition-all",
                                            order.isUrgent
                                                ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200"
                                                : "bg-slate-50 text-slate-400 hover:text-slate-600"
                                        )}
                                        title={order.isUrgent ? "Срочно" : "Обычный"}
                                    >
                                        <Zap className={cn("w-4 h-4", order.isUrgent && "fill-rose-600")} />
                                    </button>
                                    <StatusBadgeInteractive orderId={order.id} status={order.status} />
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                    <PriorityBadgeInteractive orderId={order.id} priority={order.priority} />
                                    {isAdmin && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const res = await toggleOrderArchived(order.id, !showArchived);
                                                if (res.success) {
                                                    toast(showArchived ? "Заказ восстановлен" : "Заказ архивирован", "success");
                                                    window.location.reload(); // Quick reach to re-fetch
                                                }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-[18px] transition-all"
                                            title={showArchived ? "Восстановить" : "Архивировать"}
                                        >
                                            {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                <a href={`/dashboard/orders/${order.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && (
                <GlassEmptyState
                    icon={PackageOpen}
                    title="Заказов пока нет"
                    description="Как только появятся новые заказы, они отобразятся здесь"
                />
            )}

            <BulkActionsPanel
                selectedIds={selectedIds}
                onClear={() => setSelectedIds([])}
                isAdmin={isAdmin}
            />
        </div>
    );
}
