"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    UserCheck,
    AlertTriangle,
    CreditCard,
    TrendingUp,
    BarChart3,
    Building2,
    User,
    RefreshCw,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AnalyticsStatCard } from "./components/analytics-stat-card";
import { FunnelChart } from "./components/funnel-chart";
import { ClientGrowthChart } from "./components/client-growth-chart";
import { TopClientsTable } from "./components/top-clients-table";
import { ManagerPerformanceCard } from "./components/manager-performance-card";
import { RFMDistributionChart } from "./components/rfm-distribution-chart";
import { AcquisitionSourcesChart } from "./components/acquisition-sources-chart";
import type {
    ClientAnalyticsOverview,
    FunnelAnalyticsData,
    ClientGrowthData,
    RevenueBySegmentData,
    ManagerPerformanceData,
    TopClientData,
    AcquisitionSourceData,
    LoyaltyDistributionData,
    RFMDistributionData,
} from "../actions/analytics.actions";
import { cn } from "@/lib/utils";

interface ClientAnalyticsDashboardProps {
    overview?: ClientAnalyticsOverview;
    funnelData: FunnelAnalyticsData[];
    growthData: ClientGrowthData[];
    rfmRevenueData: RevenueBySegmentData[];
    managersData: ManagerPerformanceData[];
    topClients: TopClientData[];
    sourcesData: AcquisitionSourceData[];
    loyaltyData: LoyaltyDistributionData[];
    rfmDistribution: RFMDistributionData[];
    currencySymbol: string;
    showFinancials: boolean;
}

type PeriodOption = "week" | "month" | "quarter" | "year" | "all";

const periodOptions: { id: PeriodOption; title: string }[] = [
    { id: "week", title: "Неделя" },
    { id: "month", title: "Месяц" },
    { id: "quarter", title: "Квартал" },
    { id: "year", title: "Год" },
    { id: "all", title: "Всё время" },
];

export function ClientAnalyticsDashboard({
    overview,
    funnelData,
    growthData,
    managersData,
    topClients,
    sourcesData,
    loyaltyData,
    rfmDistribution,
    currencySymbol,
    showFinancials,
}: ClientAnalyticsDashboardProps) {
    const [period, setPeriod] = useState<PeriodOption>("all");
    const [showCumulative, setShowCumulative] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // В реальном приложении здесь будет вызов router.refresh()
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    if (!overview) {
        return (
            <div className="text-center py-12 text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Не удалось загрузить данные аналитики</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Select
                        value={period}
                        onChange={(v) => setPeriod(v as PeriodOption)}
                        options={periodOptions}
                        placeholder="Период"
                        className="w-36"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        <span className="hidden sm:inline ml-2">Обновить</span>
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Экспорт</span>
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                <AnalyticsStatCard
                    title="Всего клиентов"
                    value={overview.totalClients.toLocaleString()}
                    icon={Users}
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-50"
                    trend={overview.newClientsGrowth}
                    trendLabel="vs прошлый месяц"
                />
                <AnalyticsStatCard
                    title="Активные"
                    value={overview.activeClients.toLocaleString()}
                    subtitle={`${overview.totalClients > 0 ? Math.round((overview.activeClients / overview.totalClients) * 100) : 0}% от всех`}
                    icon={UserCheck}
                    iconColor="text-emerald-500"
                    iconBgColor="bg-emerald-50"
                />
                <AnalyticsStatCard
                    title="В зоне риска"
                    value={overview.atRiskClients.toLocaleString()}
                    subtitle="90+ дней без заказов"
                    icon={AlertTriangle}
                    iconColor="text-amber-500"
                    iconBgColor="bg-amber-50"
                />
                <AnalyticsStatCard
                    title="Новых за месяц"
                    value={overview.newClientsThisMonth.toLocaleString()}
                    icon={UserPlus}
                    iconColor="text-violet-500"
                    iconBgColor="bg-violet-50"
                    trend={overview.newClientsGrowth}
                />
                {showFinancials && (
                    <AnalyticsStatCard
                        title="Средний LTV"
                        value={`${overview.averageLTV.toLocaleString()} ${currencySymbol}`}
                        icon={TrendingUp}
                        iconColor="text-pink-500"
                        iconBgColor="bg-pink-50"
                    />
                )}
            </div>

            {/* Secondary Stats (Financials) */}
            {showFinancials && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <AnalyticsStatCard
                        title="Общая выручка"
                        value={`${overview.totalRevenue.toLocaleString()} ${currencySymbol}`}
                        icon={BarChart3}
                        iconColor="text-green-500"
                        iconBgColor="bg-green-50"
                    />
                    <AnalyticsStatCard
                        title="Средний чек"
                        value={`${overview.averageCheck.toLocaleString()} ${currencySymbol}`}
                        icon={CreditCard}
                        iconColor="text-slate-500"
                        iconBgColor="bg-slate-100"
                    />
                    <AnalyticsStatCard
                        title="B2C клиенты"
                        value={overview.b2cCount.toLocaleString()}
                        subtitle={`${overview.totalClients > 0 ? Math.round((overview.b2cCount / overview.totalClients) * 100) : 0}%`}
                        icon={User}
                        iconColor="text-blue-500"
                        iconBgColor="bg-blue-50"
                    />
                    <AnalyticsStatCard
                        title="B2B клиенты"
                        value={overview.b2bCount.toLocaleString()}
                        subtitle={`${overview.totalClients > 0 ? Math.round((overview.b2bCount / overview.totalClients) * 100) : 0}%`}
                        icon={Building2}
                        iconColor="text-purple-500"
                        iconBgColor="bg-purple-50"
                    />
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="crm-card p-6 bg-white"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Воронка продаж
                    </h3>
                    <FunnelChart data={funnelData} />
                </motion.div>

                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="crm-card p-6 bg-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">
                            Динамика роста
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCumulative(!showCumulative)}
                            className="text-xs"
                        >
                            {showCumulative ? "Новые" : "Накопительно"}
                        </Button>
                    </div>
                    <ClientGrowthChart
                        data={growthData}
                        showCumulative={showCumulative}
                    />
                </motion.div>
            </div>

            {/* RFM & Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* RFM Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="crm-card p-6 bg-white"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        RFM-сегментация
                    </h3>
                    <RFMDistributionChart
                        data={rfmDistribution}
                        currencySymbol={currencySymbol}
                    />
                </motion.div>

                {/* Acquisition Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="crm-card p-6 bg-white"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Источники привлечения
                    </h3>
                    <AcquisitionSourcesChart
                        data={sourcesData}
                        currencySymbol={currencySymbol}
                    />
                </motion.div>
            </div>

            {/* Top Clients & Managers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Top Clients */}
                {showFinancials && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="crm-card p-6 bg-white"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Топ-10 клиентов
                        </h3>
                        <TopClientsTable
                            clients={topClients}
                            currencySymbol={currencySymbol}
                        />
                    </motion.div>
                )}

                {/* Manager Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="crm-card p-6 bg-white"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Эффективность менеджеров
                    </h3>
                    <ManagerPerformanceCard
                        managers={managersData}
                        currencySymbol={currencySymbol}
                    />
                </motion.div>
            </div>

            {/* Loyalty Distribution (Optional) */}
            {loyaltyData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="crm-card p-6 bg-white"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Распределение по лояльности
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {loyaltyData.map((level, index) => (
                            <motion.div
                                key={level.levelId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="p-4 rounded-xl"
                                style={{ backgroundColor: `${level.color}10` }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: level.color }}
                                    />
                                    <span className="font-semibold text-slate-900">
                                        {level.levelName}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {level.count}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {level.percentage}% • {level.totalRevenue.toLocaleString()} {currencySymbol}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
