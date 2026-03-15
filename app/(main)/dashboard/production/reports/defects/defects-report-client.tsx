"use client";

import { useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDefectsByCategory } from "../../actions/defect-actions";
import { DEFECT_CATEGORIES } from "../../types/bento-dashboard-types";

type DefectCategoryData = {
    category: string;
    count: number;
    percentage: number;
    color: string;
};

type Period = "day" | "week" | "month";

interface DefectsReportClientProps {
    initialData: DefectCategoryData[];
    initialTotal: number;
}

const PERIOD_LABELS: Record<Period, string> = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
};

export function DefectsReportClient({ initialData, initialTotal }: DefectsReportClientProps) {
    const [data, setData] = useState<DefectCategoryData[]>(initialData);
    const [total, setTotal] = useState(initialTotal);
    const [period, setPeriod] = useState<Period>("week");
    const [loading, setLoading] = useState(false);

    const handlePeriodChange = async (newPeriod: Period) => {
        setLoading(true);
        setPeriod(newPeriod);
        try {
            const result = await getDefectsByCategory(newPeriod);
            if (result.success) {
                setData(result.data ?? []);
                setTotal(result.total ?? 0);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3 p-6 max-w-5xl mx-auto">
            {/* Хэдер */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/production"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Производство</span>
                </Link>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Отчёт по браку</h1>
                        <p className="text-sm text-muted-foreground">Статистика и аналитика по категориям</p>
                    </div>
                </div>

                {/* Период */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                        <button
                            type="button"
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-md transition-all",
                                period === p
                                    ? "bg-background text-foreground shadow-sm font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Сводка */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="crm-card">
                    <div className="text-sm text-muted-foreground mb-1">Всего брака</div>
                    <div className="text-3xl font-bold text-foreground">{total.toLocaleString("ru-RU")}</div>
                    <div className="text-xs text-muted-foreground mt-1">единиц</div>
                </div>
                {DEFECT_CATEGORIES.map((cat) => {
                    const match = (data || []).find((d) => d.category === cat.label);
                    const count = match?.count ?? 0;
                    const pct = match?.percentage ?? 0;
                    return (
                        <div key={cat.id} className="crm-card">
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-sm text-muted-foreground">{cat.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">{count}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{pct}% от общего</div>
                        </div>
                    );
                })}
            </div>

            {/* Прогресс-бары */}
            <div className="crm-card space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Распределение по категориям</h2>
                    {loading && (
                        <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                </div>

                {(data?.length || 0) === 0 || total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                            <AlertTriangle className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Брак не зафиксирован</p>
                        <p className="text-slate-400 text-sm mt-1">за выбранный период</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {DEFECT_CATEGORIES.map((cat) => {
                            const match = (data || []).find((d) => d.category === cat.label);
                            const count = match?.count ?? 0;
                            const pct = match?.percentage ?? 0;
                            return (
                                <div key={cat.id}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span className="text-sm font-medium text-foreground">{cat.label}</span>
                                            <span className="text-xs text-muted-foreground hidden sm:inline">{cat.description}</span>
                                        </div>
                                        <div className="text-sm font-medium text-foreground">
                                            {count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: cat.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
