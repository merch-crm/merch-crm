/**
 * @fileoverview Хук для работы с заказами
 * @module hooks/use-orders
 */

"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOrders } from "@/lib/services/orders/queries";
import { createOrder, updateOrderStatus } from "@/lib/services/orders/mutations";
import type { GetOrdersParams, OrderWithRelations, CreateOrderInput, OrderStatus } from "@/lib/types/orders";

/**
 * Состояние списка заказов
 */
interface OrdersState {
  orders: OrderWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

/**
 * Хук для работы со списком заказов
 *
 * @description
 * Предоставляет функции для загрузки, фильтрации и мутации заказов.
 * Автоматически обрабатывает состояние загрузки и ошибки.
 *
 * @param initialParams - Начальные параметры фильтрации
 * @returns Состояние и функции для работы с заказами
 *
 * @example
 * ```tsx
 * function OrdersPage() {
 *   const {
 *     orders,
 *     pagination,
 *     isLoading,
 *     loadOrders,
 *     changeStatus
 *   } = useOrders({ status: "new" });
 *
 *   useEffect(() => {
 *     loadOrders();
 *   }, [loadOrders]);
 *
 *   return (
 *     <DataTable
 *       data={orders}
 *       isLoading={isLoading}
 *       pagination={pagination}
 *       onPageChange={(page) => loadOrders({ page })}
 *     />
 *   );
 * }
 * ```
 */
export function useOrders(initialParams: GetOrdersParams = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<OrdersState>({
    orders: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading: false,
    error: null,
  });

  const [params, setParams] = useState<GetOrdersParams>(initialParams);

  /**
   * Загружает список заказов с указанными параметрами
   *
   * @param newParams - Новые параметры (мержатся с текущими)
   */
  const loadOrders = useCallback(
    async (newParams?: Partial<GetOrdersParams>) => {
      const mergedParams = { ...params, ...newParams };
      setParams(mergedParams);

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await getOrders(mergedParams);
        setState({
          orders: result.orders,
          pagination: result.pagination,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ошибка загрузки";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        toast.error("Ошибка", {
          description: message,
        });
      }
    },
    [params]
  );

  /**
   * Изменяет статус заказа
   *
   * @param orderId - UUID заказа
   * @param status - Новый статус
   */
  const changeStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      startTransition(async () => {
        const result = await updateOrderStatus({ orderId, status });

        if (result.success) {
          toast.success("Статус обновлён", {
            description: `Заказ переведён в статус "${status}"`,
          });
          // Обновляем локальное состояние
          setState((prev) => ({
            ...prev,
            orders: (prev.orders || []).map((o) =>
              o.id === orderId ? { ...o, status: status as typeof o.status } : o
            ),
          }));
        } else {
          toast.error("Ошибка", {
            description: result.error,
          });
        }
      });
    },
    []
  );

  /**
   * Создаёт новый заказ и переходит на его страницу
   *
   * @param data - Данные для создания заказа
   */
  const create = useCallback(
    async (data: CreateOrderInput) => {
      startTransition(async () => {
        const result = await createOrder(data);

        if (result.success) {
          toast.success("Заказ создан", {
            description: `Создан заказ ${result.data.orderNumber}`,
          });
          router.push(`/dashboard/orders/${result.data.id}`);
        } else {
          toast.error("Ошибка создания", {
            description: result.error,
          });
        }
      });
    },
    [router]
  );

  return {
    /** Список заказов */
    orders: state.orders,
    /** Информация о пагинации */
    pagination: state.pagination,
    /** Флаг загрузки */
    isLoading: state.isLoading || isPending,
    /** Текст ошибки */
    error: state.error,
    /** Текущие параметры фильтрации */
    params,
    /** Загрузить/перезагрузить заказы */
    loadOrders,
    /** Изменить статус заказа */
    changeStatus,
    /** Создать новый заказ */
    create,
  };
}
