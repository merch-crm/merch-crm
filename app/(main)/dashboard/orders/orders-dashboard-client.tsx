"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Plus,
  ShoppingCart,
  Clock,
  CreditCard,
  Package,
  DollarSign,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StatCard,
  QuickActionCard,
  SectionHeader,
  EmptyWidget,
  SalesChart,
  OrdersByStatusChart,
} from "@/components/dashboard";
import { useIsClient } from "@/hooks/use-is-client";
import type {
  OrdersStats,
  OrdersByStatus,
  SalesDataPoint,
  RecentOrder,
  OrderRequiringAction,
} from "./actions/orders-dashboard-actions";

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "Новый", color: "bg-gray-500" },
  in_work: { label: "В работе", color: "bg-purple-500" },
  shipped: { label: "Отправлен", color: "bg-blue-500" },
  completed: { label: "Завершён", color: "bg-green-600" },
  cancelled: { label: "Отменён", color: "bg-red-500" },
};

interface OrdersDashboardClientProps {
  stats: OrdersStats | null;
  ordersByStatus: OrdersByStatus[];
  salesData: SalesDataPoint[];
  recentOrders: RecentOrder[];
  ordersRequiringAction: OrderRequiringAction[];
}

export function OrdersDashboardClient({
  stats,
  ordersByStatus,
  salesData,
  recentOrders,
  ordersRequiringAction,
}: OrdersDashboardClientProps) {
  const isClient = useIsClient();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Unused: const _salesChartData = salesData.map((d) => d.sales);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-muted-foreground">
            Обзор и управление заказами
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать заказ
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Всего заказов" value={stats.total} icon={ShoppingCart} iconColor="text-blue-600" />
          <StatCard title="В работе" value={stats.inWork} icon={Clock} iconColor="text-purple-600" />
          <StatCard title="Отправлено" value={stats.shipped} icon={Package} iconColor="text-blue-600" />
          <StatCard title="Завершено" value={stats.completed} icon={CreditCard} iconColor="text-green-600" />
        </div>
      )}

      {/* Sales Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard title="Продажи сегодня" value={formatCurrency(stats.todaySales)} icon={DollarSign} iconColor="text-green-600" />
          <StatCard title="Заказы сегодня" value={stats.today} icon={Receipt} iconColor="text-indigo-600" />
          <StatCard title="Средний чек" value={formatCurrency(stats.averageCheck)} icon={Receipt} iconColor="text-indigo-600" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SalesChart data={salesData} title="Динамика продаж (7 дней)" />
        <OrdersByStatusChart data={ordersByStatus} title="Распределение по статусам" />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Быстрые действия" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionCard title="Создать заказ" description="Новый заказ клиента" icon={Plus} href="/dashboard/orders/new" iconColor="text-green-600" iconBgColor="bg-green-100" />
          <QuickActionCard title="Все заказы" description={`${stats?.total || 0} заказов`} icon={ShoppingCart} href="/dashboard/orders/list" iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <QuickActionCard title="В работе" description={`${stats?.inWork || 0} заказов`} icon={Clock} href="/dashboard/orders/list?status=in_work" iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          <QuickActionCard title="Отправлено" description={`${stats?.shipped || 0} заказов`} icon={Package} href="/dashboard/orders/list?status=shipped" iconColor="text-blue-600" iconBgColor="bg-blue-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader title="Последние заказы" href="/dashboard/orders/list" className="mb-0" />
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyWidget title="Нет заказов" description="Заказы появятся здесь" action={{ label: "Создать заказ", href: "/dashboard/orders/new", }} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Заказ</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:underline">
                          #{order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {order.itemsCount} поз.
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[order.status]?.color || "bg-gray-500"} text-white`} color="neutral">
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Orders Requiring Action */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader title="Требуют внимания" href="/dashboard/orders/list?filter=action_required" className="mb-0" />
          </CardHeader>
          <CardContent>
            {ordersRequiringAction.length === 0 ? (
              <EmptyWidget icon={AlertTriangle} title="Всё в порядке" description="Нет заказов требующих внимания" />
            ) : (
              <div className="space-y-3">
                {ordersRequiringAction.slice(0, 5).map((order) => (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${order.reason === "Просрочен"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                          }`}
                      >
                        <AlertTriangle className={`h-4 w-4 ${order.reason === "Просрочен" ? "text-red-600" : "text-yellow-600" }`} />
                      </div>
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isClient ? formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        }) : "..."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      {ordersByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {ordersByStatus.map((item) => (
                <div key={item.status} className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold ${statusConfig[item.status]?.color || "bg-gray-500"
                      }`}
                  >
                    {item.count}
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {statusConfig[item.status]?.label || item.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
