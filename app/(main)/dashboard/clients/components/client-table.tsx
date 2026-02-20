"use client";

import { memo } from "react";
import { Eye, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { useRouter } from "next/navigation";
import type { ClientSummary } from "@/lib/types";
import { ClientFilters } from "../actions";;

interface ClientTableProps {
    clients: ClientSummary[];
    selectedIds: string[];
    onSelectRow: (id: string) => void;
    onSelectAll: () => void;
    isAllSelected: boolean;
    filters: ClientFilters;
    setFilters: (filters: ClientFilters | ((prev: ClientFilters) => ClientFilters)) => void;
    managers: { id: string, name: string }[];
    onUpdateField: (clientId: string, field: string, value: string | number | boolean | null) => void;
    onEdit: (client: ClientSummary) => void;
    showFinancials: boolean;
    currencySymbol: string;
    userRoleName?: string;
    now: number;
}

export const ClientTable = memo(function ClientTable({
    clients,
    selectedIds,
    onSelectRow,
    onSelectAll,
    isAllSelected,
    filters,
    setFilters,
    managers,
    onUpdateField,
    onEdit,
    showFinancials,
    currencySymbol,
    userRoleName,
    now
}: ClientTableProps) {
    const router = useRouter();

    const renderClientInfo = (client: ClientSummary) => (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">{`${client.lastName} ${client.firstName}`}</span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]">
                {client.company || "Частное лицо"}
            </span>
            {client.acquisitionSource && (
                <span className="text-[11px] font-bold text-indigo-500 mt-1">
                    {client.acquisitionSource}
                </span>
            )}
        </div>
    );

    const renderContacts = (client: ClientSummary) => (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{client.email || "—"}</span>
            <span className="text-xs text-slate-400 font-medium">
                {["Печатник", "Дизайнер"].includes(userRoleName || "")
                    ? "HIDDEN"
                    : client.phone}
            </span>
        </div>
    );

    const renderActivity = (client: ClientSummary) => {
        if (!client.lastOrderDate) return <span className="text-xs text-slate-400">Нет заказов</span>;

        const lastDate = new Date(client.lastOrderDate);
        const diffDays = Math.floor((now - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const isLost = diffDays > 90;

        return (
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    {lastDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isLost && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-600">
                            Lost
                        </span>
                    )}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                    {diffDays} дн. назад
                </span>
            </div>
        );
    };

    return (
        <div className="crm-card !p-0 border-none overflow-hidden shadow-sm">
            <ResponsiveDataView
                data={clients}
                mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                desktopClassName="hidden md:block"
                renderTable={() => (
                    <div className="overflow-x-auto">
                        <table className="crm-table">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th crm-td-selection">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onChange={onSelectAll}
                                            aria-label="Выбрать всех"
                                        />
                                    </th>
                                    <th
                                        className="crm-th crm-th-sortable"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setFilters(prev => ({ ...prev, sortBy: "alphabet" }));
                                            }
                                        }}
                                        onClick={() => setFilters(prev => ({ ...prev, sortBy: "alphabet" }))}
                                    >
                                        Клиент
                                    </th>
                                    <th className="crm-th">Контакты</th>
                                    <th className="crm-th">Ответственный</th>
                                    <th
                                        className="crm-th crm-th-sortable"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setFilters(prev => ({ ...prev, sortBy: "order_count" }));
                                            }
                                        }}
                                        onClick={() => setFilters(prev => ({ ...prev, sortBy: "order_count" }))}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Заказы
                                            <ChevronDown className={cn("h-3 w-3 transition-all", filters.sortBy === "order_count" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100")} />
                                        </div>
                                    </th>
                                    <th
                                        className="crm-th crm-th-sortable"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setFilters(prev => ({ ...prev, sortBy: "last_order" }));
                                            }
                                        }}
                                        onClick={() => setFilters(prev => ({ ...prev, sortBy: "last_order" }))}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Активность
                                            <ChevronDown className={cn("h-3 w-3 transition-all", filters.sortBy === "last_order" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100")} />
                                        </div>
                                    </th>
                                    {showFinancials && (
                                        <th
                                            className="crm-th crm-th-sortable crm-td-number"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setFilters(prev => ({ ...prev, sortBy: "revenue" }));
                                                }
                                            }}
                                            onClick={() => setFilters(prev => ({ ...prev, sortBy: "revenue" }))}
                                        >
                                            <div className="flex items-center justify-end gap-1.5">
                                                LTV
                                                <ChevronDown className={cn("h-3 w-3 transition-all", filters.sortBy === "revenue" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100")} />
                                            </div>
                                        </th>
                                    )}
                                    <th className="crm-th crm-td-actions text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {clients?.map(client => (
                                    <tr
                                        key={client.id}
                                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                router.push(`/dashboard/clients/${client.id}`);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="link"
                                        aria-label={`Просмотреть клиента ${client.lastName} ${client.firstName}`}
                                        className={cn(
                                            "crm-tr-clickable focus:outline-none focus:bg-slate-50",
                                            selectedIds.includes(client.id) && "crm-tr-selected"
                                        )}
                                    >
                                        <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedIds.includes(client.id)}
                                                onChange={() => onSelectRow(client.id)}
                                            />
                                        </td>
                                        <td className="crm-td">{renderClientInfo(client)}</td>
                                        <td className="crm-td">{renderContacts(client)}</td>
                                        <td className="crm-td" onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={client.managerId || ""}
                                                onChange={(val: string) => onUpdateField(client.id, "managerId", val)}
                                                options={[
                                                    { id: "", title: "Общий" },
                                                    ...managers.map(m => ({ id: m.id, title: m.name }))
                                                ]}
                                                className="w-[140px]"
                                                triggerClassName="h-8 border-none bg-transparent hover:bg-slate-50"
                                            />
                                        </td>
                                        <td className="crm-td">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{client.totalOrders || 0}</span>
                                                <span className="text-[11px] text-slate-400 font-bold">{pluralize(client.totalOrders || 0, 'заказ', 'заказа', 'заказов')}</span>
                                            </div>
                                        </td>
                                        <td className="crm-td">{renderActivity(client)}</td>
                                        {showFinancials && (
                                            <td className="crm-td crm-td-number font-bold text-slate-900">
                                                {Math.round(Number(client.totalSpent) || 0).toLocaleString()} {currencySymbol}
                                            </td>
                                        )}
                                        <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(client)}
                                                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                renderCard={(client: ClientSummary) => (
                    <div
                        role="button"
                        tabIndex={0}
                        key={client.id}
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                router.push(`/dashboard/clients/${client.id}`);
                            }
                        }}
                        aria-label={`Просмотреть клиента ${client.lastName} ${client.firstName}`}
                        className={cn(
                            "group relative flex items-center justify-between p-4 transition-all duration-300 cursor-pointer active:bg-slate-50 focus:outline-none focus:bg-slate-50",
                            selectedIds.includes(client.id) ? "crm-tr-selected" : "bg-white"
                        )}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()} className="shrink-0">
                                <Checkbox
                                    checked={selectedIds.includes(client.id)}
                                    onChange={() => onSelectRow(client.id)}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-bold text-slate-900 truncate">
                                        {client.lastName} {client.firstName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                    <span className="truncate">{client.company || "Частное лицо"}</span>
                                    <span className="text-slate-200">•</span>
                                    <span className="bg-slate-50 px-1.5 py-0.5 rounded-[4px] shrink-0">
                                        {client.totalOrders || 0} {pluralize(client.totalOrders || 0, 'зак.', 'зак.', 'зак.')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors ml-2" />
                    </div>
                )}
            />
        </div>
    );
});
