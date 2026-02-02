"use client";

import { AlertTriangle, TrendingUp, Package, Layers, ArrowUpRight, ArrowDownRight, Activity, Clock, ArrowLeftRight, Trash2 } from "lucide-react";
import { InventoryItem, Category } from "./types";
import { Transaction } from "./history-table";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

interface WarehouseWidgetsProps {
    items: InventoryItem[];
    archivedItems: InventoryItem[];
    categories: Category[];
    history: Transaction[];
}


export function WarehouseWidgets({ items, archivedItems, history }: WarehouseWidgetsProps) {
    const criticalItems = items.filter(item => item.quantity <= item.lowStockThreshold);

    // Stats calculations
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReserved = items.reduce((sum, item) => sum + (item.reservedQuantity || 0), 0);


    // Real activity metrics within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentTransactions = history.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);

    const recentIns = recentTransactions.filter(t => t.type === 'in').length;

    // Расход: все "out", которые не списание брака
    const recentUsage = recentTransactions.filter(t =>
        t.type === 'out' &&
        !t.reason?.toLowerCase().includes('брак') &&
        !t.reason?.toLowerCase().includes('списание')
    ).length;

    // Списание: "out" с пометкой брак или списание
    const recentWaste = recentTransactions.filter(t =>
        t.type === 'out' &&
        (t.reason?.toLowerCase().includes('брак') || t.reason?.toLowerCase().includes('списание'))
    ).length;

    // Перемещения: считаем пары за одну операцию (только записи об уходе)
    const recentTransfers = recentTransactions.filter(t => t.type === 'transfer' && t.changeAmount < 0).length;

    return (
        <div className="space-y-4">
            {/* Top Row: Combined Stats & Expanded Deficit */}
            <div className="grid grid-cols-12 gap-[var(--crm-grid-gap)]">
                {/* Combined Stats Block */}
                <div className="col-span-12 lg:col-span-4 glass-panel p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-slate-900">Общая статистика</h4>
                        <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Layers className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-[var(--radius-inner)] bg-slate-50/50 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">всего позиций на складе</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums">{totalItems}</div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-[var(--radius-inner)] bg-slate-50/50 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-orange-50 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Зарезервировано</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums">{totalReserved}</div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-[var(--radius-inner)] bg-slate-50/50 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Архив</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums">{archivedItems.length}</div>
                        </div>
                    </div>
                </div>

                {/* Expanded Deficit (Replenishment) */}
                <div className={cn(
                    "col-span-12 lg:col-span-8 glass-panel p-6 flex flex-col",
                    criticalItems.length > 0 ? "!border-rose-200 ring-1 ring-rose-500/10" : ""
                )}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center shadow-sm",
                                criticalItems.length > 0 ? "bg-rose-50 border border-rose-100" : "bg-emerald-50 border border-emerald-100"
                            )}>
                                {criticalItems.length > 0 ? (
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">
                                    {criticalItems.length > 0 ? "Требуют пополнения" : "Запасы в норме"}
                                </h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                    {criticalItems.length > 0
                                        ? `${criticalItems.length} ${pluralize(criticalItems.length, 'позиция', 'позиции', 'позиций')} ниже лимита`
                                        : 'Все позиции соответствуют норме остатка'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {criticalItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                                {criticalItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/dashboard/warehouse/items/${item.id}`}
                                        className="group flex items-center justify-between p-3 rounded-[var(--radius-inner)] bg-rose-50/30 border border-rose-100/50 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-white flex items-center justify-center border border-rose-100 shrink-0 transition-transform">
                                                <Package className="w-4 h-4 text-rose-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                                                <div className="text-[9px] font-black text-rose-400 mt-0.5 uppercase">Остаток: {item.quantity} {item.unit}</div>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-rose-500 transition-colors pl-2">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-[var(--radius-inner)] border border-dashed border-slate-200">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">Дефицита товаров не обнаружено</p>
                                <p className="text-[11px] font-medium text-slate-400 mt-1">Система автоматически отслеживает минимальные остатки</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Trend - Ultra Compact Status Bar */}
            <div className="glass-panel p-6 flex flex-col md:flex-row items-center gap-4 md:gap-10 transition-all">
                <div className="flex items-center gap-4 shrink-0">
                    <div className="w-9 h-9 rounded-[var(--radius-inner)] bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-200 shrink-0">
                        <Activity className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <h4 className="text-[14px] font-bold text-slate-900 tracking-tight whitespace-nowrap">Активность за 30 дней</h4>
                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 w-full md:w-auto">
                    <div className="flex items-center gap-2.5 group/item">
                        <div className="w-7 h-7 rounded-[var(--radius-inner)] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/30">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <div className="text-base font-bold text-slate-900 tabular-nums">{recentIns}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{pluralize(recentIns, 'поставка', 'поставки', 'поставок')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 group/item">
                        <div className="w-7 h-7 rounded-[var(--radius-inner)] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <div className="text-base font-bold text-slate-900 tabular-nums">{recentUsage}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">отгрузок</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 group/item">
                        <div className="w-7 h-7 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/30">
                            <Trash2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <div className="text-base font-bold text-slate-900 tabular-nums">{recentWaste}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{pluralize(recentWaste, 'списание', 'списания', 'списаний')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 group/item">
                        <div className="w-7 h-7 rounded-[var(--radius-inner)] bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200/50">
                            <ArrowLeftRight className="w-3 h-3" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <div className="text-base font-bold text-slate-900 tabular-nums">{recentTransfers}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{pluralize(recentTransfers, 'перемещение', 'перемещения', 'перемещений')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
