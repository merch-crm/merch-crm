/**
 * @fileoverview Карточка заказа для мобильного отображения
 * @module components/dashboard/orders/order-card
 */

"use client";

import { memo } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";
import StatusBadge from "@/app/(main)/dashboard/orders/status-badge";
import PriorityBadge from "@/app/(main)/dashboard/orders/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OrderWithRelations } from "@/lib/types/orders";

/**
 * Пропсы компонента OrderCard
 *
 * @property order - Данные заказа с загруженными связями
 * @property onStatusChange - Колбэк при изменении статуса (опционально)
 * @property showClient - Показывать информацию о клиенте (по умолчанию true)
 */
interface OrderCardProps {
  order: OrderWithRelations;
  showClient?: boolean;
}

/**
 * Карточка заказа для мобильного и компактного отображения
 *
 * @description
 * Используется в `ResponsiveDataView` для отображения заказов
 * на мобильных устройствах вместо таблицы.
 *
 * Отображает:
 * - Номер заказа (ссылка на детальную страницу)
 * - Статус и приоритет
 * - Информацию о клиенте
 * - Сумму заказа
 * - Дату создания
 *
 * @example
 * ```tsx
 * <OrderCard * order={order} * />
 * ```
 *
 * @example
 * ```tsx
 * // В ResponsiveDataView
 * <ResponsiveDataView * data={orders} * columns={columns} * renderCard={(order) => (
 *     <OrderCard key={order.id} order={order} />
 *   )}
 * />
 * ```
 */
export const OrderCard = memo(function OrderCard({
  order,
  showClient = true,
}: OrderCardProps) {
  /**
   * Рассчитывает сумму оплаченных платежей
   */
   const payments = order.payments || [];
   const paidAmount = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );

  /**
   * Определяет статус оплаты
   */
  const paymentStatus =
    paidAmount >= parseFloat(order.totalAmount || "0")
      ? "paid"
      : paidAmount > 0
        ? "partial"
        : "unpaid";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:text-primary transition-colors">
            {order.orderNumber}
          </Link>
          <div className="flex items-center gap-2">
            {order.isUrgent && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Срочно
              </span>
            )}
            <PriorityBadge priority={order.priority || "normal"} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Клиент */}
        {showClient && order.client && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {order.client.name?.charAt(0) || "К"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {order.client.name || "Без имени"}
              </p>
              {order.client.company && (
                <p className="text-xs text-muted-foreground truncate">
                  {order.client.company}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Статус и сумма */}
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          <div className="text-right">
            <span className="text-secondary-foreground font-medium">
            {formatCurrency(Number(order.totalAmount || 0))} ₸
          </span>
            {paymentStatus === "partial" && (
              <p className="text-xs text-muted-foreground">
                Оплачено: {formatCurrency(paidAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Дата и позиции */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(order.createdAt)}</span>
          <span>{(order.items || []).length} поз.</span>
        </div>
      </CardContent>
    </Card>
  );
});
