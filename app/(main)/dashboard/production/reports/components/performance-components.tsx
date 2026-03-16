"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopPerformer {
    id: string;
    name: string;
    avatar: string | null;
    completedTasks: number;
    efficiency: number;
    defectRate: number;
}

interface MaterialUsage {
    id: string;
    name: string;
    consumed: number;
    unit: string;
    cost: number;
    trend: number;
}

/**
 * Топ сотрудников с показателями эффективности
 */
export function TopPerformersTable({ data = [] }: { data: TopPerformer[] }) {
    const safeData = data || [];
    if (!safeData.length) {
        return (
            <div className="py-12 text-center text-slate-400">
                Нет данных о сотрудниках
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {safeData.map((performer, index) => (
                <div
                    key={performer.id}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-slate-900">{performer.name}</p>
                        <p className="text-xs text-slate-500">
                            {performer.completedTasks} задач выполнено
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-emerald-600">
                            {performer.efficiency.toFixed(0)}%
                        </p>
                        <p className="text-xs text-slate-400">эффективность</p>
                    </div>
                    <Badge
                        variant={performer.defectRate < 2 ? "secondary" : "destructive"}
                        className="ml-2"
                    >
                        {performer.defectRate.toFixed(1)}% брака
                    </Badge>
                </div>
            ))}
        </div>
    );
}

/**
 * Расход материалов и оценка стоимости
 */
export function MaterialUsageTable({ data = [] }: { data: MaterialUsage[] }) {
    const safeData = data || [];
    if (!safeData.length) {
        return (
            <div className="py-12 text-center text-slate-400">
                Нет данных о расходе материалов
            </div>
        );
    }

    const totalCost = safeData.reduce((sum, m) => sum + m.cost, 0);

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {safeData.map((material) => (
                    <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                        <div className="flex-1">
                            <p className="font-medium text-slate-900">{material.name}</p>
                            <p className="text-xs text-slate-500">
                                Израсходовано: {material.consumed.toLocaleString()}{" "}
                                {material.unit}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">
                                {material.cost.toLocaleString()} ₽
                            </p>
                            {material.trend !== 0 && (
                                <Badge
                                    className={cn(
                                        "text-xs",
                                        material.trend > 0
                                            ? "bg-rose-100 text-rose-700"
                                            : "bg-emerald-100 text-emerald-700"
                                    )}
                                >
                                    {material.trend > 0 ? "+" : ""}
                                    {material.trend.toFixed(0)}%
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="font-medium text-slate-600">Итого расход:</span>
                <span className="text-xl font-bold text-slate-900">
                    {totalCost.toLocaleString()} ₽
                </span>
            </div>
        </div>
    );
}
