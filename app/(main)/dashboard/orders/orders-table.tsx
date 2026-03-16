"use client";

import { useRouter } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { archiveOrder as toggleOrderArchived } from "./actions/core.actions";
import { useToast } from "@/components/ui/toast";
import { GlassEmptyState } from "@/components/ui/glass-empty-state";
import { playSound } from "@/lib/sounds";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { useBranding } from "@/components/branding-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsPanel } from "./bulk-actions-panel";

// Hooks
import { useOrderSelection } from "./hooks/use-order-selection";
import { useOrderActions } from "./hooks/use-order-operations";

// Components
import { OrderTableRow } from "./components/order-table-row";
import { OrderCard } from "./components/order-card";

import type { Order } from "@/lib/types/order";

export type { Order };

interface OrdersTableProps {
    orders: Order[];
    error?: string;
    isAdmin: boolean;
    showFinancials?: boolean;
    showArchived?: boolean;
    onToggleArchived?: () => void;
}

export function OrdersTable({ orders, error, isAdmin, showFinancials, showArchived }: OrdersTableProps) {
    const router = useRouter();
    const { currencySymbol } = useBranding();
    const { toast } = useToast();

    // Hooks for state and actions
    const { selectedIds, setSelectedIds, isAllSelected, handleSelectRow, toggleAll } = useOrderSelection(orders);
    const { handleUpdateField, handleExport } = useOrderActions();

    const onNavigate = (id: string) => router.push(`/dashboard/orders/${id}`);

    const onToggleArchivedAction = async (id: string, currentlyArchived: boolean) => {
        const res = await toggleOrderArchived(id, !currentlyArchived);
        if (res.success) {
            toast(currentlyArchived ? "Заказ восстановлен" : "Заказ архивирован", "success");
            playSound("notification_success");
            router.refresh();
        }
    };

    if (error) {
        return <div className="text-red-400 p-4 bg-red-50 rounded-2xl border border-red-100">Ошибка загрузки заказов: {error}</div>;
    }

    return (
        <div className="space-y-3" data-testid="orders-list">
            <ResponsiveDataView
                data={orders}
                mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                desktopClassName="hidden md:block"
                emptyState={
                    <GlassEmptyState
                        icon={PackageOpen}
                        title="Заказов пока нет"
                        description="Как только появятся новые заказы, они отобразятся здесь"
                    />
                }
                renderTable={() => (
                    <div className="crm-card !p-0 overflow-hidden">
                        <table className="crm-table min-w-full table-fixed">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th crm-td-selection">
                                        <Checkbox
                                            id="select-all-orders"
                                            aria-label="Выбрать все заказы"
                                            checked={isAllSelected}
                                            onChange={(val) => toggleAll(!!val)}
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
                                {orders?.map((order) => (
                                    <OrderTableRow
                                        key={order.id}
                                        order={order}
                                        config={{
                                            isSelected: selectedIds.includes(order.id),
                                            isAdmin: isAdmin,
                                            showFinancials: !!showFinancials,
                                            showArchived: !!showArchived,
                                            currencySymbol: currencySymbol || "₽",
                                        }}
                                        actions={{
                                            onSelect: handleSelectRow,
                                            onUpdateField: handleUpdateField,
                                            onToggleArchived: onToggleArchivedAction,
                                            onNavigate: onNavigate,
                                        }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                renderCard={(order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedIds.includes(order.id)}
                        showFinancials={!!showFinancials}
                        currencySymbol={currencySymbol || "₽"}
                        onSelect={handleSelectRow}
                        onNavigate={onNavigate}
                    />
                )}
            />

            <BulkActionsPanel
                selectedIds={selectedIds}
                onClear={() => setSelectedIds([])}
                isAdmin={isAdmin}
                onExport={() => handleExport(orders, selectedIds)}
            />
        </div>
    );
}
