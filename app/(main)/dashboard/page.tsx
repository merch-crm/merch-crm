import { getDashboardStatsByPeriod } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/api/auth/logout");
    }

    const { period = "month" } = await searchParams;

    const statsData = await getDashboardStatsByPeriod(period);

    // Use session name directly or refactor to raw SQL if needed
    // const userData = null; // Removed failing query

    return (
        <DashboardClient
            initialStats={statsData}
            period={period}
            userName={session.name || "Пользователь"}
        />
    );
}
