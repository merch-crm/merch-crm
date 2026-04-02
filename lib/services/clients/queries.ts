/**
 * Оптимизированные запросы для клиентов
 */

import { db } from "@/lib/db";
import { clients } from "@/lib/schema/clients/main";
import { orders } from "@/lib/schema/orders";
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";

interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  clientType?: "b2b" | "b2c";
  managerId?: string;
  isArchived?: boolean;
}

/**
 * Получение списка клиентов с использованием денормализованных полей
 */
export async function getClients(params: GetClientsParams = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    clientType,
    managerId,
    isArchived = false,
  } = params;

  const result = await db.query.clients.findMany({
    where: and(
      eq(clients.isArchived, isArchived),
      clientType ? eq(clients.clientType, clientType) : undefined,
      managerId ? eq(clients.managerId, managerId) : undefined,
      search
        ? or(
            ilike(clients.name, `%${search}%`),
            ilike(clients.phone, `%${search}%`),
            ilike(clients.company, `%${search}%`)
          )
        : undefined
    ),
    with: {
      manager: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: [desc(clients.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(eq(clients.isArchived, isArchived));

  return {
    clients: result,
    pagination: {
      page,
      limit,
      total: Number(countResult.count),
      totalPages: Math.ceil(Number(countResult.count) / limit),
    },
  };
}

/**
 * Детальная информация о клиенте
 */
export async function getClientDetails(clientId: string) {
  const [client, recentOrders] = await Promise.all([
    db.query.clients.findFirst({
      where: eq(clients.id, clientId),
      with: {
        manager: true,
        contacts: true,
        loyaltyLevel: true,
      },
    }),

    // Последние заказы отдельным запросом с лимитом
    db.query.orders.findMany({
      where: eq(orders.clientId, clientId),
      with: {
        items: true,
        payments: true,
      },
      orderBy: [desc(orders.createdAt)],
      limit: 10,
    }),
  ]);

  if (!client) return null;

  return {
    ...client,
    recentOrders,
  };
}
