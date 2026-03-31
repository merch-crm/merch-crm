"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    BarChart3,
    FileText,
    Download,
    RefreshCw,
    Package,
    Users,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Константы и типы
import { PERIOD_OPTIONS } from "./constants";
import type { 
    ProductionMetrics, 
    DailyOutput, 
    TopPerformer, 
    MaterialUsage, 
    DefectByType 
} from "./types";

// Компоненты
import { MetricCard } from "./components/metric-card";
import { DailyOutputChart, CompletionRateChart } from "./components/production-charts";
import { DefectsByTypeChart, DefectsTable } from "./components/defect-analysis-components";
import { TopPerformersTable, MaterialUsageTable } from "./components/performance-components";

export function ReportsPageClient() {
    const { setCustomTrail } = useBreadcrumbs();

    // Состояние интерфейса и данных
    const [state, setState] = useState({
        selectedPeriod: "week",
        activeTab: "overview",
        isLoading: true,
        isExporting: false,
        metrics: null as ProductionMetrics | null,
        dailyOutput: [] as DailyOutput[],
        topPerformers: [] as TopPerformer[],
        materialUsage: [] as MaterialUsage[],
        defectsByType: [] as DefectByType[],
    });

    const {
        selectedPeriod,
        activeTab,
        isLoading,
        isExporting,
        metrics,
        dailyOutput,
        topPerformers,
        materialUsage,
        defectsByType,
    } = state;

    const setSelectedPeriod = (val: string) => setState(s => ({ ...s, selectedPeriod: val }));
    const setActiveTab = (val: string) => setState(s => ({ ...s, activeTab: val }));
    const setIsLoading = (val: boolean) => setState(s => ({ ...s, isLoading: val }));
    const setIsExporting = (val: boolean) => setState(s => ({ ...s, isExporting: val }));
    const setMetrics = (val: ProductionMetrics | null) => setState(s => ({ ...s, metrics: val }));
    const setDailyOutput = (val: DailyOutput[]) => setState(s => ({ ...s, dailyOutput: val }));
    const setTopPerformers = (val: TopPerformer[]) => setState(s => ({ ...s, topPerformers: val }));
    const setMaterialUsage = (val: MaterialUsage[]) => setState(s => ({ ...s, materialUsage: val }));
    const setDefectsByType = (val: DefectByType[]) => setState(s => ({ ...s, defectsByType: val }));

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
