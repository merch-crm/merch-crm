"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusBadge from "./status-badge";
import PriorityBadge from "./priority-badge";
import { BulkActionsPanel } from "./bulk-actions-panel";

export interface Order {
    id: string;
    createdAt: string | Date;
    totalAmount: string;
    status: string;
    priority: string;
    client: { name: string };
    creator?: { name: string } | null;
}

interface OrdersTableProps {
    orders: Order[];
    error?: string;
    isAdmin: boolean;
}

export function OrdersTable({ orders, error, isAdmin }: OrdersTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        return <div className="text-red-400 p-4 bg-red-50 rounded-xl border border-red-100">Ошибка загрузки заказов: {error}</div>;
    }

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-[50px] px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="w-[140px] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID / Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Клиент</th>
                        <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Сумма</th>
                        <th className="w-[140px] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Статус</th>
                        <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Приоритет</th>
                        <th className="w-[100px] px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(order.id) ? 'bg-indigo-50/30' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                    checked={selectedIds.includes(order.id)}
                                    onChange={() => handleSelectRow(order.id)}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-900 font-mono">#{order.id.slice(0, 8)}</div>
                                <div className="text-xs text-slate-500">{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{order.client.name}</div>
                                <div className="text-xs text-slate-500">Создал: {order.creator?.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                                {order.totalAmount} ₽
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <PriorityBadge priority={order.priority} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href={`/dashboard/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">Открыть</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    Заказов пока нет.
                </div>
            )}

            <BulkActionsPanel
                selectedIds={selectedIds}
                onClear={() => setSelectedIds([])}
                isAdmin={isAdmin}
            />
        </div>
    );
}
