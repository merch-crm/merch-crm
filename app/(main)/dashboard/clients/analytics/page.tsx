import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
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
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
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

    return (
        <div className="space-y-3">
            <PageHeader
                title="Аналитика клиентов"
                description="Ключевые метрики и показатели клиентской базы"
                className="px-1"
            />

            <Suspense fallback={<LoadingSpinner />}>
                <ClientAnalyticsDashboard
                    overview={overviewRes.data}
                    funnelData={funnelRes.data || []}
                    growthData={growthRes.data || []}
                    rfmRevenueData={rfmRevenueRes.data || []}
                    managersData={managersRes.data || []}
                    topClients={topClientsRes.data || []}
                    sourcesData={sourcesRes.data || []}
                    loyaltyData={loyaltyRes.data || []}
                    rfmDistribution={rfmDistRes.data || []}
                    currencySymbol={currencySymbol}
                    showFinancials={showFinancials}
                />
            </Suspense>
        </div>
    );
}
