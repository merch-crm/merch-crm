import { getDashboardStatsByPeriod } from"./actions";
import { getSession } from "@/lib/session";
import { redirect } from"next/navigation";
import { DashboardClient } from"./dashboard-client";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions/branding.actions";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import Loading from "./loading";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    if (!session.roleName) {
        redirect("/login");
    }

    const { period ="month" } = await searchParams;

    const [statsData, branding] = await Promise.all([
        getDashboardStatsByPeriod(period),
        getBrandingSettings()
    ]);

    // Use session name directly or refactor to raw SQL if needed
    // const userData = null; // Removed failing query

    return (
        <ErrorBoundary moduleName="Главная">
            <Suspense fallback={<Loading />}>
                <DashboardClient
                    initialStats={statsData}
                    period={period}
                    userName={session.name || "Пользователь"}
                    branding={branding}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
