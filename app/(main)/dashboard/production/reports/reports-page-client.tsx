"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    FileText,
    Download,
    RefreshCw,
    Package,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { ProductionNav } from "../components/production-nav";
import { cn } from "@/lib/utils";

// Серверные действия
import {
    getProductionReportData,
    getDefectAnalytics,
    getStaffPerformance,
    getMaterialConsumptionReport,
    exportReportToPDF,
    exportReportToExcel,
} from "../actions/reports-actions";

// ТИПЫ ДАННЫХ ДЛЯ ОТЧЁТОВ

/**
 * Период отчёта
 */
interface ReportPeriod {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
}

/**
 * Основные метрики производства
 */
interface ProductionMetrics {
    totalCompleted: number;
    totalInProgress: number;
    totalDefects: number;
    defectRate: number;
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
    trend: number;
}

/**
 * Ежедневная выработка
 */
interface DailyOutput {
    date: string;
    completed: number;
    defects: number;
    target: number;
}

/**
 * Топ сотрудников по эффективности
 */
interface TopPerformer {
    id: string;
    name: string;
    avatar: string | null;
    completedTasks: number;
    efficiency: number;
    defectRate: number;
}

/**
 * Расход материалов
 */
interface MaterialUsage {
    id: string;
    name: string;
    consumed: number;
    unit: string;
    cost: number;
    trend: number;
}

/**
 * Брак по типам
 */
interface DefectByType {
    type: string;
    count: number;
    percentage: number;
    color: string;
}

const PERIOD_OPTIONS: ReportPeriod[] = [
    {
        id: "today",
        label: "Сегодня",
        startDate: new Date(),
        endDate: new Date(),
    },
    {
        id: "week",
        label: "Неделя",
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
    },
    {
        id: "month",
        label: "Месяц",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
    },
    {
        id: "quarter",
        label: "Квартал",
        startDate: subMonths(startOfMonth(new Date()), 2),
        endDate: new Date(),
    },
];

export function ReportsPageClient() {
    const { setCustomTrail } = useBreadcrumbs();

    // Состояние интерфейса
    const [selectedPeriod, setSelectedPeriod] = useState<string>("week");
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Состояние данных
    const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
    const [dailyOutput, setDailyOutput] = useState<DailyOutput[]>([]);
    const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
    const [materialUsage, setMaterialUsage] = useState<MaterialUsage[]>([]);
    const [defectsByType, setDefectsByType] = useState<DefectByType[]>([]);

    /**
     * Загрузка всех данных отчёта параллельно
     */
    const loadReportData = useCallback(async () => {
        setIsLoading(true);
        try {
            const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod);
            if (!period) return;

            const [
                reportResult,
                defectsResult,
                staffResult,
                materialsResult,
            ] = await Promise.all([
                getProductionReportData({
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                }),
                getDefectAnalytics({
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                }),
                getStaffPerformance({
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                    limit: 5,
                }),
                getMaterialConsumptionReport({
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                }),
            ]);

            if (reportResult.success && reportResult.data) {
                setMetrics(reportResult.data.metrics);
                setDailyOutput(reportResult.data.dailyOutput);
            }

            if (defectsResult.success && defectsResult.data) {
                setDefectsByType(defectsResult.data.byType);
            }

            if (staffResult.success && staffResult.data) {
                setTopPerformers(staffResult.data);
            }

            if (materialsResult.success && materialsResult.data) {
                setMaterialUsage(materialsResult.data);
            }
        } catch (_error) {
            console.error("Failed to load report data:", _error);
            toast.error("Ошибка загрузки данных отчёта");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod]);

    // Настройка хлебных крошек
    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Отчёты", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    // Загрузка данных при смене периода
    useEffect(() => {
        loadReportData();
    }, [selectedPeriod, loadReportData]);

    /**
     * Экспорт в PDF
     */
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod);
            if (!period) return;

            const result = await exportReportToPDF({
                type: activeTab as "overview" | "defects" | "staff" | "materials",
                startDate: period.startDate.toISOString(),
                endDate: period.endDate.toISOString(),
            });

            if (result.success && result.data?.url) {
                window.open(result.data.url, "_blank");
                toast.success("PDF-отчёт сформирован");
            } else {
                toast.error("Ошибка формирования PDF");
            }
        } catch (_error) {
            toast.error("Ошибка экспорта");
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Экспорт в Excel
     */
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod);
            if (!period) return;

            const result = await exportReportToExcel({
                type: activeTab as "overview" | "defects" | "staff" | "materials",
                startDate: period.startDate.toISOString(),
                endDate: period.endDate.toISOString(),
            });

            if (result.success && result.data?.url) {
                const link = document.createElement("a");
                link.href = result.data.url;
                link.download = `production-report-${selectedPeriod}.xlsx`;
                link.click();
                toast.success("Excel-отчёт сформирован");
            } else {
                toast.error("Ошибка формирования Excel");
            }
        } catch (_error) {
            toast.error("Ошибка экспорта");
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Форматированная подпись текущего периода
     */
    const periodLabel = useMemo(() => {
        const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod);
        if (!period) return "";
        return `${format(period.startDate, "d MMM", { locale: ru })} — ${format(
            period.endDate,
            "d MMM yyyy",
            { locale: ru }
        )}`;
    }, [selectedPeriod]);

    return (
        <div className="flex flex-col gap-3">
            {/* Заголовок страницы */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/production">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Отчёты производства
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Аналитика и статистика за {periodLabel}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadReportData}
                        disabled={isLoading}
                        className="rounded-xl"
                    >
                        <RefreshCw
                            className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
                        />
                        Обновить
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="rounded-xl"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="rounded-xl"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                    </Button>
                </div>
            </div>

            <ProductionNav />

            {/* Селектор периода */}
            <div className="flex flex-wrap items-center gap-2">
                {PERIOD_OPTIONS.map((period) => (
                    <button
                        key={period.id}
                        type="button"
                        onClick={() => setSelectedPeriod(period.id)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            selectedPeriod === period.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {period.label}
                    </button>
                ))}
            </div>

            {/* Основные карточки метрик */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard
                        title="Выполнено"
                        value={metrics.totalCompleted}
                        suffix="шт"
                        icon={CheckCircle}
                        trend={metrics.trend}
                        color="emerald"
                    />
                    <MetricCard
                        title="В работе"
                        value={metrics.totalInProgress}
                        suffix="шт"
                        icon={Clock}
                        color="blue"
                    />
                    <MetricCard
                        title="Брак"
                        value={metrics.totalDefects}
                        suffix="шт"
                        icon={AlertTriangle}
                        trend={-metrics.defectRate}
                        color="rose"
                        invertTrend
                    />
                    <MetricCard
                        title="В срок"
                        value={metrics.onTimeDeliveryRate}
                        suffix="%"
                        icon={TrendingUp}
                        color="violet"
                    />
                </div>
            )}

            {/* Табы с детализацией */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Обзор
                    </TabsTrigger>
                    <TabsTrigger value="defects" className="rounded-lg">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Брак
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="rounded-lg">
                        <Users className="h-4 w-4 mr-2" />
                        Сотрудники
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-lg">
                        <Package className="h-4 w-4 mr-2" />
                        Материалы
                    </TabsTrigger>
                </TabsList>

                {/* Таб: Обзор */}
                <TabsContent value="overview" className="space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-slate-400" />
                                    Ежедневная выработка
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DailyOutputChart data={dailyOutput} />
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-slate-400" />
                                    Выполнение плана
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CompletionRateChart data={dailyOutput} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Таб: Брак */}
                <TabsContent value="defects" className="space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    Распределение брака по типам
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DefectsByTypeChart data={defectsByType} />
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    Детализация
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DefectsTable data={defectsByType} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Таб: Сотрудники */}
                <TabsContent value="staff" className="space-y-3">
                    <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-400" />
                                Топ сотрудников по эффективности
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TopPerformersTable data={topPerformers} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Таб: Материалы */}
                <TabsContent value="materials" className="space-y-3">
                    <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5 text-slate-400" />
                                Расход материалов
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MaterialUsageTable data={materialUsage} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// === ПОДКОМПОНЕНТЫ ===

interface MetricCardProps {
    title: string;
    value: number;
    suffix?: string;
    icon: React.ElementType;
    trend?: number;
    color: "emerald" | "blue" | "rose" | "violet" | "amber";
    invertTrend?: boolean;
}

/**
 * Карточка метрики с индикатором тренда
 */
function MetricCard({
    title,
    value,
    suffix,
    icon: Icon,
    trend,
    color,
    invertTrend,
}: MetricCardProps) {
    const colorClasses = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        rose: "bg-rose-50 text-rose-600",
        violet: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-600",
    };

    const isPositive = invertTrend ? (trend || 0) < 0 : (trend || 0) > 0;

    return (
        <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
                <div
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        colorClasses[color]
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-tight">{title}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                    {value.toLocaleString("ru-RU")}
                </span>
                {suffix && (
                    <span className="text-slate-400 text-xs font-bold">{suffix}</span>
                )}
                {trend !== undefined && (
                    <Badge
                        className={cn(
                            "ml-auto",
                            isPositive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                        )}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(trend).toFixed(1)}%
                    </Badge>
                )}
            </div>
        </div>
    );
}

/**
 * График ежедневной выработки (Bar Chart)
 */
function DailyOutputChart({ data = [] }: { data: DailyOutput[] }) {
    if (!data.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Нет данных за выбранный период
            </div>
        );
    }

    const maxValue = Math.max(...data.map((d) => Math.max(d.completed, d.target)));

    return (
        <div className="h-64 flex items-end gap-1">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-0.5" style={{ height: "200px" }}>
                        <div
                            className="w-full bg-emerald-500 rounded-t transition-all"
                            style={{
                                height: `${(item.completed / maxValue) * 100}%`,
                            }}
                        />
                        {item.defects > 0 && (
                            <div
                                className="w-full bg-rose-400 rounded-b transition-all"
                                style={{
                                    height: `${(item.defects / maxValue) * 100}%`,
                                }}
                            />
                        )}
                    </div>
                    <span className="text-xs text-slate-400">
                        {format(new Date(item.date), "dd.MM", { locale: ru })}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Индикатор процента выполнения плана (Circular Chart)
 */
function CompletionRateChart({ data = [] }: { data: DailyOutput[] }) {
    if (!data.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Нет данных за выбранный период
            </div>
        );
    }

    const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
    const totalTarget = data.reduce((sum, d) => sum + d.target, 0);
    const completionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

    return (
        <div className="h-64 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={completionRate >= 100 ? "#10b981" : "#6366f1"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(completionRate / 100) * 440} 440`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                        {completionRate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400">выполнено</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                    {totalCompleted.toLocaleString()} из {totalTarget.toLocaleString()} шт
                </p>
            </div>
        </div>
    );
}

/**
 * Круговая диаграмма распределения брака
 */
function DefectsByTypeChart({ data = [] }: { data: DefectByType[] }) {
    if (!data.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Брак не зафиксирован
            </div>
        );
    }

    return (
        <div className="h-64 flex items-center justify-center">
            <div className="w-40 h-40 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {data.reduce(
                        (acc, item, index) => {
                            const startAngle = acc.offset;
                            const angle = (item.percentage / 100) * 360;
                            const endAngle = startAngle + angle;

                            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                            const largeArc = angle > 180 ? 1 : 0;

                            acc.paths.push(
                                <path
                                    key={index}
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={item.color}
                                    className="transition-all hover:opacity-80"
                                />
                            );
                            acc.offset = endAngle;
                            return acc;
                        },
                        { paths: [] as React.ReactNode[], offset: -90 }
                    ).paths}
                </svg>
            </div>
        </div>
    );
}

/**
 * Список брака по типам
 */
function DefectsTable({ data = [] }: { data: DefectByType[] }) {
    return (
        <div className="space-y-2">
            {data.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{item.count} шт</span>
                        <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Топ сотрудников с показателями эффективности
 */
function TopPerformersTable({ data = [] }: { data: TopPerformer[] }) {
    if (!data.length) {
        return (
            <div className="py-12 text-center text-slate-400">
                Нет данных о сотрудниках
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map((performer, index) => (
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
function MaterialUsageTable({ data = [] }: { data: MaterialUsage[] }) {
    if (!data.length) {
        return (
            <div className="py-12 text-center text-slate-400">
                Нет данных о расходе материалов
            </div>
        );
    }

    const totalCost = data.reduce((sum, m) => sum + m.cost, 0);

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {data.map((material) => (
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
