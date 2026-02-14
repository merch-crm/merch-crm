"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusBadgeInteractive from "./status-badge-interactive";
import PriorityBadgeInteractive from "./priority-badge-interactive";
import { BulkActionsPanel } from "./bulk-actions-panel";
import { Zap, Archive, ArchiveRestore, PackageOpen, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateOrderField, toggleOrderArchived } from "./actions";
import { useToast } from "@/components/ui/toast";
import { GlassEmptyState } from "@/components/ui/glass-empty-state";
import { exportToCSV } from "@/lib/export-utils";
import { playSound } from "@/lib/sounds";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { useBranding } from "@/components/branding-provider";
import { Button } from "@/components/ui/button";
import { PremiumCheckbox } from "@/components/ui/premium-checkbox";

export interface Order {
    id: string;
    createdAt: string | Date;
    totalAmount: string | null;
    status: string | null;
    priority: string | null;
    client: { name: string | null };
    creator?: {
        name: string;
        role?: { name: string } | null;
    } | null;
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
    const { currencySymbol } = useBranding();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleUpdateField = async (orderId: string, field: string, value: string | number | boolean) => {
        const res = await updateOrderField(orderId, field, value);
        if (res.error) {
            toast(res.error, "error");
            playSound("notification_error");
        } else {
            toast("Заказ обновлен", "success");
            playSound("notification_success");
        }
    };

    const isAllSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id));

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = () => {
        const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
        exportToCSV(selectedOrders, "orders_export", [
            { header: "ID", key: "id" },
            { header: "Дата", key: (o: Order) => new Date(o.createdAt) },
            { header: "Клиент", key: (o: Order) => o.client.name },
            { header: "Сумма", key: "totalAmount" },
            { header: "Статус", key: "status" },
            { header: "Приоритет", key: "priority" },
            { header: "Срочно", key: (o: Order) => o.isUrgent ? "Да" : "Нет" },
            { header: "Создал", key: (o: Order) => o.creator?.name || "Система" },
            { header: "Роль", key: (o: Order) => o.creator?.role?.name || (o.creator ? "Оператор" : "Система") }
        ]);
        toast("Экспорт завершен", "success");
        playSound("notification_success");
    };

    if (error) {
        return <div className="text-red-400 p-4 bg-red-50 rounded-2xl border border-red-100">Ошибка загрузки заказов: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <ResponsiveDataView
                data={orders}
                mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                desktopClassName="hidden md:block"
                renderTable={() => (
                    <div className="crm-card !p-0 overflow-hidden">
                        <table className="crm-table min-w-full table-fixed">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th crm-td-selection">
                                        <PremiumCheckbox
                                            checked={isAllSelected}
                                            onChange={(val) => {
                                                if (val) setSelectedIds(orders.map(o => o.id));
                                                else setSelectedIds([]);
                                            }}
                                        />
                                    </th>
                                    <th className="crm-th w-[160px]">ID / Дата</th>
                                    <th className="crm-th">Клиент</th>
                                    {showFinancials && (
                                        <th className="crm-th w-[140px] crm-td-number text-left">Бюджет</th>
                                    )}
                                    <th className="crm-th w-[160px]">Статус</th>
                                    <th className="crm-th w-[140px]">Приоритет</th>
                                    <th className="crm-th crm-td-actions">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                                        className={cn(
                                            "crm-tr group hover:bg-white/80 transition-all cursor-pointer",
                                            selectedIds.includes(order.id) && "crm-tr-selected"
                                        )}
                                    >
                                        <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
                                            <PremiumCheckbox
                                                checked={selectedIds.includes(order.id)}
                                                onChange={() => handleSelectRow(order.id)}
                                            />
                                        </td>
                                        <td className="crm-td">
                                            <div className="text-sm font-bold text-slate-900 mb-0.5">ORD-{order.id.slice(0, 6)}</div>
                                            <div className="text-xs font-medium text-slate-400">{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</div>
                                        </td>
                                        <td className="crm-td">
                                            <div className="text-sm font-bold text-slate-900 mb-0.5">{order.client.name}</div>
                                            <div className="text-xs font-medium text-slate-400">Отв: {order.creator?.name || "Система"}</div>
                                        </td>
                                        {showFinancials && (
                                            <td className="crm-td crm-td-number">
                                                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-[var(--radius-sm)]">
                                                    {Number(order.totalAmount).toLocaleString()} {currencySymbol}
                                                </span>
                                            </td>
                                        )}
                                        <td className="crm-td">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateField(order.id, "isUrgent", !order.isUrgent);
                                                    }}
                                                    className={cn(
                                                        "w-8 h-8 rounded-2xl transition-all",
                                                        order.isUrgent
                                                            ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200"
                                                            : "bg-slate-50 text-slate-400 hover:text-slate-600"
                                                    )}
                                                    title={order.isUrgent ? "Срочно" : "Обычный"}
                                                >
                                                    <Zap className={cn("w-4 h-4", order.isUrgent && "fill-rose-600")} />
                                                </Button>
                                                <StatusBadgeInteractive orderId={order.id} status={order.status ?? "new"} />
                                            </div>
                                        </td>
                                        <td className="crm-td">
                                            <div className="flex items-center gap-1">
                                                <PriorityBadgeInteractive orderId={order.id} priority={order.priority ?? "medium"} />
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const res = await toggleOrderArchived(order.id, !showArchived);
                                                            if (res.success) {
                                                                toast(showArchived ? "Заказ восстановлен" : "Заказ архивирован", "success");
                                                                playSound("notification_success");
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        className="w-8 h-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"
                                                        title={showArchived ? "Восстановить" : "Архивировать"}
                                                    >
                                                        {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="w-8 h-8 p-0 hover:bg-primary hover:text-white transition-all bg-slate-100 text-slate-400 rounded-[10px]"
                                            >
                                                <a href={`/dashboard/orders/${order.id}`}>
                                                    <ArrowRight className="w-4 h-4" />
                                                </a>
                                            </Button>
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
                    </div>
                )}
                renderCard={(order) => (
                    <div
                        key={order.id}
                        className={cn(
                            "group relative bg-white border-b border-slate-100 p-4 transition-all duration-300 active:bg-slate-50",
                            selectedIds.includes(order.id) ? "crm-tr-selected" : "bg-white"
                        )}
                        onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                    <PremiumCheckbox
                                        checked={selectedIds.includes(order.id)}
                                        onChange={() => handleSelectRow(order.id)}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-black text-slate-900 truncate">ORD-{order.id.slice(0, 6)}</span>
                                        {order.isUrgent && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full">
                                                <Zap className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter leading-none">Срочно</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-base font-bold text-slate-700 leading-tight truncate mb-1">
                                        {order.client.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <span className="truncate">Отв: {order.creator?.name || "Система"}</span>
                                        <span className="text-slate-200">•</span>
                                        <span>{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {showFinancials && (
                                    <div className="text-sm font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                        {Number(order.totalAmount).toLocaleString()} {currencySymbol}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <StatusBadgeInteractive orderId={order.id} status={order.status ?? "new"} />
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />

            <BulkActionsPanel
                selectedIds={selectedIds}
                onClear={() => setSelectedIds([])}
                isAdmin={isAdmin}
                onExport={handleExport}
            />
        </div>
    );
}
