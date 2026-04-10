import { OrdersTable } from"./orders-table";
import { OrdersWidgets } from"./orders-widgets";
import { OrdersToolbar } from"./orders-toolbar";
import { getOrders, getOrderStats } from"./actions/core.actions";;
import type { Order } from"@/lib/types";
import { startOfDay, endOfDay, subDays } from"date-fns";
import { Pagination } from"@/components/ui/pagination";
import { getSession } from "@/lib/session";
import { db } from"@/lib/db";
import { users } from "@/lib/schema/users";
import { eq } from"drizzle-orm";
import { PageContainer } from"@/components/ui/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { isAdmin } from "@/lib/roles";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import Loading from "./loading";

export default async function OrdersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; page?: string; archived?: string; search?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const range = searchParams.range ||"all";
  const fromParam = searchParams.from;
  const toParam = searchParams.to;
  const page = Number(searchParams.page) || 1;
  const showArchived = searchParams.archived ==="true";
  const search = searchParams.search ||"";

  let from: Date | undefined;
  let to: Date | undefined;

  const now = new Date(); // suppressHydrationWarning

  if (fromParam && toParam) {
    from = startOfDay(new Date(fromParam));
    to = endOfDay(new Date(toParam));
  } else if (range ==="today") {
    from = startOfDay(now);
    to = endOfDay(now);
  } else if (range ==="yesterday") {
    from = startOfDay(subDays(now, 1));
    to = endOfDay(subDays(now, 1));
  } else if (range ==="7d") {
    from = startOfDay(subDays(now, 6));
    to = endOfDay(now);
  } else if (range ==="30d") {
    from = startOfDay(subDays(now, 29));
    to = endOfDay(now);
  }

  const [ordersRes, session, statsRes] = await Promise.all([
    getOrders({ from, to, page, limit: 10, showArchived, search }),
    getSession(),
    getOrderStats(from, to)
  ]);
  
  let allOrders: Order[] = [];
  let total = 0;
  let error: string | undefined;

  if (ordersRes.success) {
    allOrders = ordersRes.data.orders as unknown as Order[];
    total = ordersRes.data.pagination.total;
  } else {
    error = ordersRes.error;
  }

  const user = session ? await db.query.users.findFirst({
    where: eq(users.id, session.id),
    with: { role: true, department: true }
  }) : null;

  const isSystemAdmin = isAdmin(user?.role?.name);

  const showFinancials =
    isSystemAdmin ||
    ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

  const stats = statsRes.success && statsRes.data ? statsRes.data : { total: 0, new: 0, inProduction: 0, completed: 0, revenue: 0 };

  return (
    <ErrorBoundary moduleName="Заказы">
      <Suspense fallback={<Loading />}>
        <PageContainer>
          {/* Header Area */}
          <PageHeader title="Заказы" description="Управление производственным циклом и логистикой" className="px-1" />

          <OrdersToolbar />

          {/* Bento Grid Widgets */}
          <OrdersWidgets stats={stats} showFinancials={showFinancials} />

          {/* Main Content Area */}
          <div className="space-y-3">
            <OrdersTable orders={allOrders} error={error} isAdmin={isSystemAdmin} showFinancials={showFinancials} showArchived={showArchived} />

            <Pagination totalItems={total} pageSize={10} currentPage={page} itemNames={['заказ', 'заказа', 'заказов']} />
          </div>
        </PageContainer>
      </Suspense>
    </ErrorBoundary>
  );
}
