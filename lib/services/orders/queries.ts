/**
 * @fileoverview Запросы для получения данных заказов
 * @module services/orders/queries
 */

"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, desc, and, gte, lte, or, ilike, sql } from "drizzle-orm";
import type { GetOrdersParams, GetOrdersResult, OrderWithRelations } from "@/lib/types/orders";

/**
 * Получает список заказов с фильтрацией и пагинацией
 *
 * @description
 * Оптимизированный запрос с предзагрузкой связей (без N+1).
 * Поддерживает полнотекстовый поиск по номеру заказа и имени клиента.
 *
 * @param params - Параметры фильтрации и пагинации
 * @returns Список заказов и информация о пагинации
 *
 * @example
 * ```typescript
 * // Получить первую страницу новых заказов
 * const { orders, pagination } = await getOrders({
 *   status: "new",
 *   page: 1,
 *   limit: 20
 * });
 *
 * // Поиск заказов клиента
 * const { orders } = await getOrders({
 *   search: "Иванов",
 *   dateFrom: new Date("2024-01-01"),
 *   dateTo: new Date("2024-12-31")
 * });
 * ```
 */
export async function getOrders(params: GetOrdersParams = {}): Promise<GetOrdersResult> {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    dateFrom,
    dateTo,
    clientId,
    isArchived = false,
  } = params;

  const result = await db.query.orders.findMany({
    where: and(
      eq(orders.isArchived, isArchived),
      status ? eq(orders.status, status) : undefined,
      clientId ? eq(orders.clientId, clientId) : undefined,
      dateFrom ? gte(orders.createdAt, dateFrom) : undefined,
      dateTo ? lte(orders.createdAt, dateTo) : undefined,
      search
        ? or(
            ilike(orders.orderNumber, `%${search}%`),
            sql`${orders.clientId} IN (
              SELECT id FROM clients 
              WHERE name ILIKE ${`%${search}%`}
            )`
          )
        : undefined
    ),
    with: {
      client: {
        columns: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          clientType: true,
          company: true,
          email: true,
          telegram: true,
          instagram: true,
          address: true,
        },
      },
      items: {
        with: {
          inventory: {
            columns: {
              id: true,
              name: true,
            }
          }
        }
      },
      creator: {
        columns: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      payments: true,
      attachments: true,
    },
    orderBy: [desc(orders.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.isArchived, isArchived));

  return {
    orders: (result as unknown) as OrderWithRelations[],
    pagination: {
      page,
      limit,
      total: Number(countResult.count),
      totalPages: Math.ceil(Number(countResult.count) / limit),
    },
  };
}

/**
 * Получает детальную информацию о заказе
 *
 * @description
 * Загружает заказ со всеми связанными данными:
 * - Клиент с менеджером
 * - Позиции с информацией о товарах
 * - История платежей
 * - Прикреплённые файлы
 * - Связанные задачи
 *
 * @param orderId - UUID заказа
 * @returns Заказ со всеми связями или null
 *
 * @example
 * ```typescript
 * const order = await getOrderById("550e8400-e29b-41d4-a716-446655440000");
 *
 * if (order) {
 *   console.log(`Заказ ${order.orderNumber} для ${order.client.name}`);
 *   console.log(`Позиций: ${(order.items || []).length}`);
 *   console.log(`Оплачено: ${(order.payments || []).reduce((s, p) => s + +p.amount, 0)}`);
 * }
 * ```
 */
export async function getOrderById(orderId: string): Promise<OrderWithRelations | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      client: {
        with: {
          manager: {
            columns: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      items: {
        with: {
          inventory: {
            columns: {
              id: true,
              name: true,
              sku: true,
              image: true,
            },
          },
        },
      },
      creator: {
        columns: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      attachments: {
        orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
      },
      payments: {
        orderBy: (payments, { desc }) => [desc(payments.createdAt)],
      },
      tasks: {
        with: {
          assignees: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      promocode: true,
    },
  });

  return (order as unknown) as OrderWithRelations | null;
}

/**
 * Получает статистику заказов для дашборда
 *
 * @description
 * Возвращает агрегированные данные за указанный период:
 * - Общее количество заказов
 * - Количество по статусам
 * - Общая сумма
 * - Средний чек
 *
 * @param params - Период для статистики
 * @returns Агрегированная статистика
 *
 * @example
 * ```typescript
 * const stats = await getOrderStats({
 *   dateFrom: startOfMonth(new Date()),
 *   dateTo: endOfMonth(new Date())
 * });
 *
 * console.log(`Заказов за месяц: ${stats.total}`);
 * console.log(`Выручка: ${stats.totalAmount} ₽`);
 * ```
 */
export async function getOrderStats(params: { dateFrom?: Date; dateTo?: Date } = {}) {
  const { dateFrom, dateTo } = params;

  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      totalNew: sql<number>`count(*) filter (where ${orders.status} = 'new')`,
      totalProduction: sql<number>`count(*) filter (where ${orders.status} = 'production')`,
      totalDone: sql<number>`count(*) filter (where ${orders.status} = 'done')`,
      totalShipped: sql<number>`count(*) filter (where ${orders.status} = 'shipped')`,
      totalCancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')`,
      totalAmount: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      averageCheck: sql<number>`coalesce(avg(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.isArchived, false),
        dateFrom ? gte(orders.createdAt, dateFrom) : undefined,
        dateTo ? lte(orders.createdAt, dateTo) : undefined
      )
    );

  return {
    total: Number(stats.total),
    byStatus: {
      new: Number(stats.totalNew),
      production: Number(stats.totalProduction),
      done: Number(stats.totalDone),
      shipped: Number(stats.totalShipped),
      cancelled: Number(stats.totalCancelled),
    },
    totalAmount: Number(stats.totalAmount),
    averageCheck: Number(stats.averageCheck),
  };
}
