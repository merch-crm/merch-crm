import { getFinancialStats, getPLReport } from "./actions";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { HubClient } from "./hub-client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { getNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceRootPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ from?: string; to?: string; range?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const session = await getSession();
    if (!session) redirect("/login");

    if (!["admin", "management"].includes(session.roleSlug)) {
        redirect("/dashboard/finance/sales");
    }

    const range = searchParams.range || "30d";
    let fromDate: Date | undefined;
    let toDate: Date | undefined;
    const now = getNow();

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

    const [statsRes, plRes] = await Promise.all([
        getFinancialStats(fromDate, toDate),
        getPLReport(fromDate, toDate)
    ]);

    if (!statsRes.success || !plRes.success) {
        // Fallback to minimal data if something fails
        return (
            <div className="p-6 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Не удалось загрузить данные</h3>
                <p className="text-slate-500 text-sm italic">Попробуйте обновить страницу или изменить период фильтрации.</p>
            </div>
        );
    }

    return (
        <HubClient 
            stats={statsRes.data!} 
            plReport={plRes.data!} 
        />
    );
}
