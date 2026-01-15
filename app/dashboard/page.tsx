import { getDashboardStatsByPeriod } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

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

    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.id),
    });

    return (
        <DashboardClient
            initialStats={statsData}
            period={period}
            userName={userData?.name || session.name}
        />
    );
}
