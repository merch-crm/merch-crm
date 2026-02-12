"use client";

import { AlertTriangle, TrendingUp, Package, Layers, ArrowUpRight, ArrowDownRight, Activity, Clock, ArrowLeftRight, Trash2, Loader2 } from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

interface WarehouseWidgetsProps {
    stats: {
        totalStock: number;
        totalReserved: number;
        archivedCount: number;
        criticalItems: Array<{ id: string; name: string; quantity: number; unit: string }>;
        activity: {
            ins: number;
            usage: number;
            waste: number;
            transfers: number;
        };
    };
}

export function WarehouseWidgets({ stats }: WarehouseWidgetsProps) {
    if (!stats) return null;

    const {
        totalStock = 0,
        totalReserved = 0,
        archivedCount = 0,
        criticalItems = [],
        activity = { ins: 0, usage: 0, waste: 0, transfers: 0 }
    } = stats;

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Row: Combined Stats & Expanded Deficit */}
            <div className="grid grid-cols-12 gap-[var(--crm-grid-gap)]">
                {/* Combined Stats Block */}
                <div className="col-span-12 md:col-span-5 lg:col-span-4 crm-card shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between p-0 overflow-hidden bg-white">
                    <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h4 className="text-[17px] font-bold text-slate-900 leading-tight">Общая статистика</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-1">Сводка по складу</p>
                        </div>
                        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
                            <Layers className="w-6 h-6 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="flex-1 p-6 grid grid-cols-1 gap-3">
                        <div className="group flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-transform">
                                    <Package className="w-4.5 h-4.5 text-indigo-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-600 transition-colors">всего позиций</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums shrink-0">{totalStock}</div>
                        </div>

                        <div className="group flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-transform">
                                    <Clock className="w-4.5 h-4.5 text-orange-500" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-600 transition-colors">В резерве</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums shrink-0">{totalReserved}</div>
                        </div>

                        <div className="group flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-transform">
                                    <Package className="w-4.5 h-4.5 text-slate-400" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-600 transition-colors">Архив</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 tabular-nums shrink-0">{archivedCount}</div>
                        </div>
                    </div>
                </div>

                {/* Expanded Deficit (Replenishment) */}
                <div className={cn(
                    "col-span-12 md:col-span-7 lg:col-span-8 crm-card flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 p-0 bg-white",
                    criticalItems.length > 0 ? "ring-1 ring-rose-500/10" : ""
                )}>
                    <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-[14px] flex items-center justify-center shadow-lg text-white shrink-0",
                                criticalItems.length > 0
                                    ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25"
                                    : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
                            )}>
                                {criticalItems.length > 0 ? (
                                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                                ) : (
                                    <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                                )}
                            </div>
                            <div>
                                <h4 className={cn(
                                    "text-[17px] font-bold leading-tight mb-1",
                                    criticalItems.length > 0 ? "text-rose-600" : "text-emerald-700"
                                )}>
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

                    <div className="flex-1 p-6 relative">
                        {criticalItems.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto max-h-[260px] custom-scrollbar px-2 pb-10 pt-2 -mx-2">
                                {criticalItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/dashboard/warehouse/items/${item.id}`}
                                        className="group flex items-center justify-between p-3.5 rounded-[12px] bg-white border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-10 h-10 rounded-[10px] bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0 transition-transform">
                                                <Package className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">{item.name}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 rounded-md border border-slate-100">Остаток</span>
                                                    <span className="text-[11px] font-black text-rose-500 tabular-nums">{item.quantity} {item.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 p-6 pt-4 flex flex-col items-center justify-center text-center bg-emerald-50/20 rounded-[16px] border border-dashed border-emerald-100/50">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 mb-4 animate-bounce-slow">
                                    <TrendingUp className="w-7 h-7 text-emerald-500" />
                                </div>
                                <p className="text-[15px] font-bold text-slate-700 mb-1">Дефицита товаров не обнаружено</p>
                                <p className="text-[12px] font-medium text-slate-400 max-w-[250px] leading-relaxed">Система автоматически отслеживает минимальные остатки и уведомит вас</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Trend - Ultra Compact Status Bar */}
            <div className="crm-card flex flex-col sm:flex-row items-center gap-6 md:justify-between py-4 px-6 transition-all shadow-sm hover:shadow-md bg-white border border-slate-100">
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-500/25 shrink-0">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight whitespace-nowrap">Активность за 30 дней</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Система активна</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:w-auto">
                    <div className="flex flex-col items-center sm:items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default">
                        <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-emerald-500 transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Поставки</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 tabular-nums">{activity.ins}</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default">
                        <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Отгрузки</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 tabular-nums">{activity.usage}</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default">
                        <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-rose-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Списания</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 tabular-nums">{activity.waste}</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default">
                        <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-indigo-500 transition-colors">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Перемещения</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 tabular-nums">{activity.transfers}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WarehouseWidgetsSkeleton() {
    return (
        <div className="space-y-5 animate-pulse px-1">
            {/* Top Row Skeleton */}
            <div className="grid grid-cols-12 gap-[var(--crm-grid-gap)]">
                {/* Stats Skeleton */}
                <div className="col-span-12 md:col-span-5 lg:col-span-4 crm-card shadow-sm p-0 overflow-hidden bg-white border border-slate-100">
                    <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-slate-100 rounded" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                        <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Layers className="w-6 h-6 text-indigo-200" />
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-[12px] bg-slate-50/50 border border-slate-100">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-[10px] bg-white border border-slate-100" />
                                    <div className="h-3 w-24 bg-slate-100 rounded" />
                                </div>
                                <div className="h-6 w-8 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Replenishment Skeleton */}
                <div className="col-span-12 md:col-span-7 lg:col-span-8 crm-card flex flex-col shadow-sm p-0 overflow-hidden bg-white border border-slate-100">
                    <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-slate-100 rounded" />
                                <div className="h-3 w-32 bg-slate-50 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-5">
                        <div className="h-full flex flex-col items-center justify-center p-8 border border-dashed border-slate-100 rounded-[16px]">
                            <div className="w-14 h-14 bg-slate-50 rounded-full mb-4" />
                            <div className="h-4 w-48 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-32 bg-slate-50 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Skeleton */}
            <div className="crm-card flex flex-col sm:flex-row items-center gap-6 md:justify-between py-4 px-6 shadow-sm bg-white border border-slate-100">
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-2 w-20 bg-slate-50 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:w-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-2 w-16 bg-slate-50 rounded" />
                            <div className="h-6 w-10 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
