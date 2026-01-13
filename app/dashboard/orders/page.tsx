import { CreateOrderDialog } from "./create-order-dialog";
import { OrdersTable, Order } from "./orders-table";
import { OrderStats } from "./order-stats";
import { DateRangeFilter } from "./date-range-filter";
import { getOrders, getOrderStats } from "./actions";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { getSession } from "@/lib/auth";

export default async function OrdersPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ range?: string; from?: string; to?: string; page?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const range = searchParams.range || "all";
    const fromParam = searchParams.from;
    const toParam = searchParams.to;
    const page = Number(searchParams.page) || 1;

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

    const { data: allOrdersResponse = [], total = 0, error } = await getOrders(from, to, page) as { data: Order[], total?: number, error?: string };
    const allOrders = allOrdersResponse;

    const stats = await getOrderStats(from, to);

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Заказы</h1>
                    <p className="text-sm text-slate-500 mt-1">Управление и мониторинг всех заказов компании</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <DateRangeFilter />
                <CreateOrderDialog />
            </div>

            <OrderStats stats={stats} />

            <OrdersTable
                orders={allOrders}
                error={error}
                isAdmin={(await getSession())?.roleName === "administrator"}
            />

            <Pagination
                totalItems={total}
                pageSize={20}
                currentPage={page}
                itemName="заказов"
            />
        </div>
    );
}
