import { OrdersTable } from "./orders-table";
import { OrdersWidgets } from "./orders-widgets";
import { OrdersToolbar } from "./orders-toolbar";
import { getOrders, getOrderStats } from "./actions/core.actions";;
import type { Order } from "@/lib/types";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { PageContainer } from "@/components/ui/page-container";

export default async function OrdersPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ range?: string; from?: string; to?: string; page?: string; archived?: string; search?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const range = searchParams.range || "all";
    const fromParam = searchParams.from;
    const toParam = searchParams.to;
    const page = Number(searchParams.page) || 1;
    const showArchived = searchParams.archived === "true";
    const search = searchParams.search || "";

    let from: Date | undefined;
    let to: Date | undefined;

    const now = new Date();

    if (fromParam && toParam) {
        from = startOfDay(new Date(fromParam));
        to = endOfDay(new Date(toParam));
    } else if (range === "today") {
        from = startOfDay(now);
        to = endOfDay(now);
    } else if (range === "yesterday") {
        from = startOfDay(subDays(now, 1));
        to = endOfDay(subDays(now, 1));
    } else if (range === "7d") {
        from = startOfDay(subDays(now, 6));
        to = endOfDay(now);
    } else if (range === "30d") {
        from = startOfDay(subDays(now, 29));
        to = endOfDay(now);
    }

    const ordersRes = await getOrders(from, to, page, 10, showArchived, search);
    const allOrders = ordersRes.success && ordersRes.data ? (ordersRes.data.orders as unknown as Order[]) : [];
    const total = ordersRes.success && ordersRes.data ? ordersRes.data.total : 0;
    const error = ordersRes.success ? undefined : ordersRes.error;

    const session = await getSession();
    const user = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true }
    }) : null;

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    const statsRes = await getOrderStats(from, to);
    const stats = statsRes.success && statsRes.data ? statsRes.data : { total: 0, new: 0, inProduction: 0, completed: 0, revenue: 0 };

    return (
        <PageContainer>
            {/* Header Area */}
            <div className="flex flex-row items-center justify-between gap-4 px-1">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none truncate">Заказы</h1>
                    <p className="hidden sm:block text-slate-400 text-sm font-medium mt-3">Управление производственным циклом и логистикой</p>
                </div>
            </div>

            <OrdersToolbar />

            {/* Bento Grid Widgets */}
            <OrdersWidgets stats={stats} showFinancials={showFinancials} />

            {/* Main Content Area */}
            <div className="space-y-4">
                <OrdersTable
                    orders={allOrders}
                    error={error}
                    isAdmin={user?.role?.name === "Администратор"}
                    showFinancials={showFinancials}
                    showArchived={showArchived}
                />

                <Pagination
                    totalItems={total}
                    pageSize={10}
                    currentPage={page}
                    itemNames={['заказ', 'заказа', 'заказов']}
                />
            </div>
        </PageContainer>
    );
}
