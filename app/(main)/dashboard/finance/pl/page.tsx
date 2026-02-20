import { getPLReport } from "../actions";;
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PLClient } from "../pl-client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PLPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ from?: string; to?: string; range?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const session = await getSession();
    if (!session) redirect("/login");

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

    const res = await getPLReport(fromDate, toDate);
    const data = res.success ? (res.data || { totalRevenue: 0, totalCOGS: 0, grossProfit: 0, totalOverhead: 0, netProfit: 0, margin: 0 }) : { totalRevenue: 0, totalCOGS: 0, grossProfit: 0, totalOverhead: 0, netProfit: 0, margin: 0 };

    return <PLClient plReport={data} />;
}
