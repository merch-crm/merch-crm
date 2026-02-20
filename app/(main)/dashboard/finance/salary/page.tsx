import { getSalaryStats } from "../actions";;
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { redirect } from "next/navigation";
import { SalaryClient } from "../salary-client";

export const dynamic = "force-dynamic";

export default async function SalaryPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ from?: string; to?: string; range?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { department: true, role: true }
    });

    const isAllowed = user?.role?.name === "Администратор" || ["Руководство"].includes(user?.department?.name || "");
    if (!isAllowed) return redirect("/dashboard/finance");

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

    const res = await getSalaryStats(fromDate, toDate);
    const data = res.success ? (res.data || { totalBudget: 0, employeePayments: [] }) : { totalBudget: 0, employeePayments: [] };

    return <SalaryClient salaryData={data} />;
}
