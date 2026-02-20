import { getFinanceTransactions } from "../actions";;
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionsClient } from "../transactions-client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
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

    const [paymentsRes, expensesRes] = await Promise.all([
        getFinanceTransactions('payment', fromDate, toDate),
        getFinanceTransactions('expense', fromDate, toDate)
    ]);

    type PaymentData = Parameters<typeof TransactionsClient>[0]['initialPayments'][number];
    type ExpenseData = Parameters<typeof TransactionsClient>[0]['initialExpenses'][number];

    return (
        <TransactionsClient
            initialPayments={(paymentsRes.success && paymentsRes.data ? paymentsRes.data : []) as PaymentData[]}
            initialExpenses={(expensesRes.success && expensesRes.data ? expensesRes.data : []) as ExpenseData[]}
        />
    );
}
