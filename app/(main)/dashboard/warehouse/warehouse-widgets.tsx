import { AlertTriangle, TrendingUp, Package, Layers, ArrowUpRight, ArrowDownRight, Activity, Clock, ArrowLeftRight, Trash2 } from "lucide-react";

import Link from "next/link";
import { cn, formatUnit } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { PageContainer } from "@/components/ui/page-container";
import { SummaryStatCard } from "@/components/ui/summary-stat-card";

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

interface ActivityStatItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    hoverColor: string;
}

function ActivityStatItem({ icon: Icon, label, value, hoverColor }: ActivityStatItemProps) {
    return (
        <div
            className="flex flex-col items-center sm:items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default"
            aria-label={`${label}: ${value}`}
        >
            <div className={`flex items-center gap-2 text-slate-400 ${hoverColor} transition-colors`}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-xs font-bold">{label}</span>
            </div>
            <span className="text-xl font-black text-slate-800 tabular-nums">{value}</span>
        </div>
    );
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
        <PageContainer>
            {/* Top Row: Combined Stats & Expanded Deficit */}
            <div className="grid grid-cols-12 gap-3">
                {/* Combined Stats Block */}
                <div
                    className="col-span-12 md:col-span-5 lg:col-span-4 crm-card shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between bg-white"
                    role="region"
                    aria-label="Общая статистика склада"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white shrink-0">
                            <Layers className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                        <div>
                            <h4 className="text-[17px] font-bold text-slate-900 leading-tight">Общая статистика</h4>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Сводка по складу</p>
                        </div>
                    </div>

                    {/* Divider breaks out of card padding */}
                    <div className="card-breakout border-b border-slate-100 mt-6" />

                    {/* Content */}
                    <div className="flex-1 py-3 grid grid-cols-1 gap-0">
                        <SummaryStatCard
                            icon={Package}
                            iconColor="text-indigo-500"
                            label="Всего позиций"
                            value={totalStock}
                        />

                        <SummaryStatCard
                            icon={Clock}
                            iconColor="text-orange-500"
                            label="В резерве"
                            value={totalReserved}
                        />

                        <SummaryStatCard
                            icon={Package}
                            iconColor="text-slate-400"
                            label="Архив"
                            value={archivedCount}
                        />
                    </div>
                </div>

                {/* Expanded Deficit (Replenishment) */}
                <div
                    className={cn(
                        "col-span-12 md:col-span-7 lg:col-span-8 crm-card flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 bg-white",
                        criticalItems.length > 0 ? "ring-1 ring-rose-500/10" : ""
                    )}
                    role="region"
                    aria-label="Товары, требующие пополнения"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-white relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg text-white shrink-0",
                            criticalItems.length > 0
                                ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25"
                                : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
                        )}>
                            {criticalItems.length > 0 ? (
                                <AlertTriangle className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                            ) : (
                                <TrendingUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                            )}
                        </div>
                        <div>
                            <h4 className={cn(
                                "text-[17px] font-bold leading-tight mb-0.5",
                                criticalItems.length > 0 ? "text-rose-600" : "text-emerald-700"
                            )}>
                                {criticalItems.length > 0 ? "Требуют пополнения" : "Запасы в норме"}
                            </h4>
                            <p className="text-xs font-bold text-slate-400">
                                {criticalItems.length > 0
                                    ? `${criticalItems.length} ${pluralize(criticalItems.length, 'позиция', 'позиции', 'позиций')} ниже лимита`
                                    : 'Все позиции соответствуют норме остатка'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="card-breakout border-b border-slate-100 mt-6" />

                    <div className="flex-1 py-6 relative">
                        {criticalItems.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto max-h-[260px] custom-scrollbar pb-4 pt-1">
                                {criticalItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/dashboard/warehouse/items/${item.id}`}
                                        aria-label={`Товар: ${item.name}, Остаток: ${item.quantity} ${formatUnit(item.unit)}`}
                                        className="group flex items-center justify-between p-3.5 rounded-[12px] bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-10 h-10 rounded-[10px] bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0 transition-transform">
                                                <Package className="w-5 h-5 text-rose-500" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">{item.name}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">Остаток</span>
                                                    <span className="text-xs font-black text-rose-500 tabular-nums">{item.quantity} {formatUnit(item.unit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all">
                                            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-start justify-center text-left bg-emerald-50/20 rounded-[var(--radius-inner)] border border-dashed border-emerald-100/50 p-6 min-h-[160px]">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 mb-4 animate-bounce-slow">
                                    <TrendingUp className="w-7 h-7 text-emerald-500" aria-hidden="true" />
                                </div>
                                <p className="text-[15px] font-bold text-slate-700 mb-1">Дефицита товаров не обнаружено</p>
                                <p className="text-xs font-medium text-slate-400 max-w-[250px] leading-relaxed">Система автоматически отслеживает минимальные остатки и уведомит вас</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Trend */}
            <div
                className="col-span-12 crm-card shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row items-center gap-6 sm:justify-between bg-white mt-3"
                role="region"
                aria-label="Активность склада за 30 дней"
            >
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0">
                        <Activity className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight whitespace-nowrap">Активность за 30 дней</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-600">Система активна</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
                    {([
                        { icon: ArrowUpRight, label: "Поставки", value: activity.ins, hoverColor: "group-hover/item:text-emerald-500" },
                        { icon: ArrowDownRight, label: "Отгрузки", value: activity.usage, hoverColor: "group-hover/item:text-blue-500" },
                        { icon: Trash2, label: "Списания", value: activity.waste, hoverColor: "group-hover/item:text-rose-500" },
                        { icon: ArrowLeftRight, label: "Перемещения", value: activity.transfers, hoverColor: "group-hover/item:text-indigo-500" },
                    ] as ActivityStatItemProps[]).map((item) => (
                        <ActivityStatItem key={item.label} {...item} />
                    ))}
                </div>
            </div>
        </PageContainer>
    );
}

export function WarehouseWidgetsSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {/* Top Row Skeleton */}
            <div className="grid grid-cols-12 gap-3">
                {/* Stats Skeleton */}
                <div className="col-span-12 md:col-span-5 lg:col-span-4 crm-card shadow-sm bg-white border border-slate-100">
                    <div className="pb-4 border-b border-slate-100 card-breakout flex items-center justify-between pt-0">
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-slate-100 rounded" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                        <div className="w-10 h-10 rounded-[12px] bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-indigo-200" />
                        </div>
                    </div>
                    <div className="pt-4 grid grid-cols-1 gap-3">
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
                <div className="col-span-12 md:col-span-7 lg:col-span-8 crm-card flex flex-col shadow-sm bg-white border border-slate-100">
                    <div className="pb-4 card-breakout border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[14px] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-200" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-slate-100 rounded" />
                            <div className="h-3 w-32 bg-slate-50 rounded" />
                        </div>
                    </div>
                    <div className="flex-1 p-5">
                        <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-slate-100 rounded-[16px]">
                            <div className="w-14 h-14 bg-slate-50 rounded-full mb-4" />
                            <div className="h-4 w-48 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-32 bg-slate-50 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Skeleton */}
            <div className="crm-card flex flex-col sm:flex-row items-center gap-3 md:justify-between py-4 px-6 shadow-sm bg-white border border-slate-100">
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-2 w-20 bg-slate-50 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
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
