import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { ClientAnalyticsDashboard } from "./analytics-dashboard-client";
import {
    getClientAnalyticsOverview,
    getFunnelAnalytics,
    getClientGrowthData,
    getRevenueByRFMSegment,
    getManagerPerformance,
    getTopClients,
    getAcquisitionSourceStats,
    getLoyaltyDistribution,
    getRFMDistribution,
} from "../actions/analytics.actions";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions/branding.actions";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Аналитика клиентов | CRM",
    description: "Дашборд клиентской аналитики",
};

export const dynamic = "force-dynamic";

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
}

export default async function ClientAnalyticsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true },
    });

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    // Загружаем все данные параллельно
    const [
        overviewRes,
        funnelRes,
        growthRes,
        rfmRevenueRes,
        managersRes,
        topClientsRes,
        sourcesRes,
        loyaltyRes,
        rfmDistRes,
        branding,
    ] = await Promise.all([
        getClientAnalyticsOverview(),
        getFunnelAnalytics(),
        getClientGrowthData(12),
        getRevenueByRFMSegment(),
        getManagerPerformance(),
        getTopClients(10),
        getAcquisitionSourceStats(),
        getLoyaltyDistribution(),
        getRFMDistribution(),
        getBrandingSettings(),
    ]);

    const currencySymbol = branding?.currencySymbol || "₽";

    // Обработка данных для дашборда
    const overview = overviewRes.success ? overviewRes.data : undefined;
    const funnelData = funnelRes.success ? funnelRes.data : [];
    const growthData = growthRes.success ? growthRes.data : [];
    const rfmRevenueData = rfmRevenueRes.success ? rfmRevenueRes.data : [];
    const managersData = managersRes.success ? managersRes.data : [];
    const topClients = topClientsRes.success ? topClientsRes.data : [];
    const sourcesData = sourcesRes.success ? sourcesRes.data : [];
    const loyaltyData = loyaltyRes.success ? loyaltyRes.data : [];
    const rfmDistribution = rfmDistRes.success ? rfmDistRes.data : [];

    return (
        <div className="space-y-3">
            <PageHeader
                title="Аналитика клиентов"
                description="Ключевые метрики и показатели клиентской базы"
                className="px-1"
            />

            <Suspense fallback={<LoadingSpinner />}>
                <ClientAnalyticsDashboard
                    overview={overview}
                    funnelData={funnelData}
                    growthData={growthData}
                    rfmRevenueData={rfmRevenueData}
                    managersData={managersData}
                    topClients={topClients}
                    sourcesData={sourcesData}
                    loyaltyData={loyaltyData}
                    rfmDistribution={rfmDistribution}
                    currencySymbol={currencySymbol}
                    showFinancials={showFinancials}
                />
            </Suspense>
        </div>
    );
}
