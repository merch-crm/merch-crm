import React from"react";
import { Layers, Building2, Package, PackageCheck, Clock, Archive } from"lucide-react";
import { SummaryStatCard } from"@/components/ui/summary-stat-card";

interface StatsOverviewProps {
    totalStorages: number;
    totalItems: number;
    totalQuantity: number;
    totalCategories: number;
    totalReserved: number;
    archivedCount: number;
}

export const StatsOverview = React.memo(({
    totalStorages,
    totalItems,
    totalQuantity,
    totalCategories,
    totalReserved,
    archivedCount
}: StatsOverviewProps) => {
    return (
        <div
            className="col-span-12 md:col-span-6 lg:col-span-5 crm-card shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between bg-white h-full"
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

            {/* Content */}
            <div className="flex-1 mt-5 grid grid-cols-2 gap-3">
                <SummaryStatCard
                    icon={Building2}
                    iconColor="text-blue-600"
                    label="Всего складов"
                    value={totalStorages}
                />

                <SummaryStatCard
                    icon={Package}
                    iconColor="text-indigo-500"
                    label="Всего SKU"
                    value={totalItems}
                />

                <SummaryStatCard
                    icon={PackageCheck}
                    iconColor="text-emerald-500"
                    label="Всего товаров"
                    value={totalQuantity}
                />

                <SummaryStatCard
                    icon={Layers}
                    iconColor="text-blue-500"
                    label="Всего категорий"
                    value={totalCategories}
                />

                <SummaryStatCard
                    icon={Clock}
                    iconColor="text-orange-500"
                    label="В резерве"
                    value={totalReserved}
                />

                <SummaryStatCard
                    icon={Archive}
                    iconColor="text-slate-400"
                    label="Архив"
                    value={archivedCount}
                />
            </div>
        </div>
    );
});

StatsOverview.displayName ="StatsOverview";
