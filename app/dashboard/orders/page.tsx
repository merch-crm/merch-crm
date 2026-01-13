import { CreateOrderDialog } from "./create-order-dialog";
import { OrdersTable, Order } from "./orders-table";
import { OrderStats } from "./order-stats";
import { DateRangeFilter } from "./date-range-filter";
import { getOrders } from "./actions";
import { startOfDay, endOfDay, subDays } from "date-fns";

export default async function OrdersPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const range = searchParams.range || "all";
    const fromParam = searchParams.from;
    const toParam = searchParams.to;

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

    const { data: allOrdersResponse = [], error } = await getOrders(from, to) as { data: Order[], error?: string };
    const allOrders = allOrdersResponse;

    const stats = {
        total: allOrders.length,
        new: allOrders.filter((o: Order) => o.status === "new").length,
        inProduction: allOrders.filter((o: Order) => ["layout_pending", "layout_approved", "in_printing"].includes(o.status)).length,
        completed: allOrders.filter((o: Order) => o.status === "done").length,
        revenue: allOrders.reduce((acc: number, o: Order) => acc + Number(o.totalAmount || 0), 0)
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Заказы</h1>
                    <p className="text-sm text-slate-500 mt-1">Управление и мониторинг всех заказов компании</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <CreateOrderDialog />
                </div>
            </div>

            <DateRangeFilter />

            <OrderStats stats={stats} />

            <OrdersTable orders={allOrders} error={error} />
        </div>
    );
}
