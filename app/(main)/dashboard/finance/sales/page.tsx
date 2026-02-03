import { getFinancialStats } from "../actions";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { redirect } from "next/navigation";
import { SalesClient } from "../sales-client";

export const dynamic = "force-dynamic";

export default async function FinanceSalesPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ from?: string; to?: string; range?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const session = await getSession();
    if (!session) redirect("/login");

    // Проверка доступа
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { department: true, role: true }
    });

    const isAllowed =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    if (!isAllowed) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900">Доступ ограничен</h2>
                    <p className="text-slate-500 mt-2">У вас нет прав для просмотра финансовой аналитики.</p>
                </div>
            </div>
        );
    }

    const range = searchParams.range || "30d";
    let fromDate: Date | undefined;
    let toDate: Date | undefined;
    const now = new Date();

    if (searchParams.from && searchParams.to) {
        fromDate = startOfDay(new Date(searchParams.from));
        toDate = endOfDay(new Date(searchParams.to));
    } else if (range === "today") {
        fromDate = startOfDay(now); toDate = endOfDay(now);
    } else if (range === "7d") {
        fromDate = startOfDay(subDays(now, 6)); toDate = endOfDay(now);
    } else if (range === "30d") {
        fromDate = startOfDay(subDays(now, 29)); toDate = endOfDay(now);
    } else if (range === "365d") {
        fromDate = startOfDay(subDays(now, 364)); toDate = endOfDay(now);
    }

    const salesRes = await getFinancialStats(fromDate, toDate);

    if (salesRes.error) {
        return <div className="p-10 text-center text-rose-500">{salesRes.error}</div>;
    }

    return <SalesClient salesData={salesRes.data || {
        summary: { totalRevenue: 0, orderCount: 0, avgOrderValue: 0, netProfit: 0, averageCost: 0, writeOffs: 0 },
        chartData: [],
        categories: [],
        recentTransactions: []
    }} />;
}
