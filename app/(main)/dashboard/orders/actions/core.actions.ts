"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, sql, and, or, ilike, desc, gte, lte, type SQL, InferSelectModel } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { 
  withAuth, 
  ROLE_GROUPS,
  NotFoundError,
  ValidationError,
} from "@/lib/action-helpers";
import { 
  ActionResult, 
  ok, 
  okVoid, 
} from "@/lib/types";
import { CreateOrderSchema, OrderIdSchema } from "../validation";
import { OrderService } from "@/lib/services/order.service";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
import { sendStaffNotifications } from "@/lib/notifications";
import { redisCache, CACHE_KEYS, CACHE_TTL, INVALIDATION_PATTERNS } from "@/lib/cache";
import type { OrderWithRelations, GetOrdersResult, GetOrdersParams } from "@/lib/types/orders";

const { orders, clients, inventoryItems } = schema;

// ═══════════════════════════════════════════════════════════
// Типы
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════

export async function getOrders(params: GetOrdersParams = {}): Promise<ActionResult<GetOrdersResult>> {
  const { from, to, page = 1, limit = 20, showArchived = false, search } = params;

  return withAuth(async (session) => {
    const offset = (page - 1) * limit;
    
    // Строим WHERE условие
    const conditions: (SQL | undefined)[] = [
      eq(orders.isArchived, showArchived)
    ];
    
    if (from) conditions.push(gte(orders.createdAt, from));
    if (to) conditions.push(lte(orders.createdAt, to));
    
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(or(
        ilike(orders.orderNumber, pattern),
        ilike(orders.clientName, pattern),
        ilike(orders.totalAmount, pattern)
      ));
    }

    const whereClause = and(...conditions);

    // Получаем общее количество
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause);
    
    const total = Number(totalResult[0]?.count || 0);

    // Получаем заказы
    const rawOrders = await db.query.orders.findMany({
      where: whereClause,
      with: {
        client: true,
        items: true,
        creator: {
          with: { role: true }
        },
        attachments: true,
      },
      orderBy: desc(orders.createdAt),
      limit,
      offset,
    });

    // Трансформируем данные
    const transformedOrders = (rawOrders || [])
      .map(order => {
        const client = order.client;
        if (!client) return null;
        
        let displayName = client.name || '';
        if (!displayName && (client.firstName || client.lastName)) {
          displayName = [client.lastName, client.firstName].filter(Boolean).join(' ');
        }
        displayName = displayName || 'Неизвестный клиент';

        const shouldHidePhone = ROLE_GROUPS.HIDE_CLIENT_PHONE.includes(session.roleName);

        return ({
          ...order,
          client: {
            ...client,
            name: displayName,
            phone: shouldHidePhone ? 'HIDDEN' : client.phone,
          },
        } as unknown) as OrderWithRelations;
      })
      .filter((o): o is OrderWithRelations => o !== null);

    return ok({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }, { 
    errorPath: '/dashboard/orders' 
  });
}

export async function getOrderById(id: string): Promise<ActionResult<OrderWithRelations>> {
  return withAuth(async (session) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        client: true,
        items: true,
        creator: {
          with: { role: true }
        },
        attachments: true,
        payments: true,
        promocode: true,
      },
    });

    if (!order) {
      throw NotFoundError('Заказ');
    }

    if (order.client) {
      const client = order.client;
      if (!client.name && (client.firstName || client.lastName)) {
        client.name = [client.lastName, client.firstName].filter(Boolean).join(' ');
      }
      client.name = client.name || 'Неизвестный клиент';

      if (ROLE_GROUPS.HIDE_CLIENT_PHONE.includes(session.roleName)) {
        client.phone = 'HIDDEN';
      }
    }

    return ok(order as unknown as OrderWithRelations);
  }, { 
    errorPath: `/dashboard/orders/${id}` 
  });
}

export async function createOrder(formData: FormData): Promise<ActionResult<{ orderId: string }>> {
  return withAuth(async (session) => {
    const rawData = Object.fromEntries(formData);
    const parsedItems = typeof rawData.items === 'string' ? JSON.parse(rawData.items) : [];

    const validation = CreateOrderSchema.safeParse({
      ...rawData,
      items: parsedItems,
    });

    if (!validation.success) {
      throw ValidationError(validation.error.issues[0].message);
    }

    const result = await OrderService.createOrder({
      ...validation.data,
      priority: validation.data.priority as "low" | "normal" | "medium" | "high" | "urgent",
      advanceAmount: validation.data.advanceAmount || 0,
      promocodeId: validation.data.promocodeId || undefined,
    }, session.id);

    const branding = await getBrandingSettings();
    await sendStaffNotifications({
      title: "Новый заказ",
      message: `Создан заказ #${result.orderNumber} на сумму ${validation.data.advanceAmount || 0} ${branding?.currencySymbol || "₽"}`,
      type: "success"
    });

    // Инвалидируем кеш статистики
    await redisCache.invalidateByPattern(INVALIDATION_PATTERNS.allOrders);

    revalidatePath("/dashboard/orders");
    return ok({ orderId: result.id });
  }, { 
    roles: ROLE_GROUPS.CAN_EDIT_ORDERS,
    errorPath: '/dashboard/orders/new' 
  });
}

export async function updateOrderField(
  orderId: string,
  field: string,
  value: unknown
): Promise<ActionResult<void>> {
  return withAuth(async (_session) => {
    await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({ where: eq(orders.id, orderId) });
      if (!order) throw NotFoundError('Заказ');

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      
      switch (field) {
        case 'isUrgent':
          updateData.isUrgent = Boolean(value);
          break;
        case 'priority':
          updateData.priority = value as string;
          break;
        case 'deadline':
          updateData.deadline = value ? new Date(value as string) : null;
          break;
        case 'status':
          updateData.status = value as string;
          break;
        default:
          throw ValidationError(`Неизвестное поле: ${field}`);
      }

      await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

      await logAction(
        `Изменение поля ${field}`,
        "order",
        orderId,
        { field, oldValue: (order as Record<string, unknown>)[field], newValue: value },
        tx
      );
    });

    revalidatePath("/dashboard/orders");
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.CAN_EDIT_ORDERS,
    errorPath: '/dashboard/orders' 
  });
}

export async function archiveOrder(
  orderId: string,
  archive: boolean = true
): Promise<ActionResult<void>> {
  const validated = OrderIdSchema.safeParse({ orderId });
  if (!validated.success) {
    throw ValidationError(validated.error.issues[0].message);
  }

  return withAuth(async (_session) => {
    await db.transaction(async (tx) => {
      await tx.update(orders)
        .set({ isArchived: archive, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await logAction(
        archive ? "Архивация заказа" : "Разархивация заказа",
        "order",
        orderId,
        { isArchived: archive },
        tx
      );
    });

    revalidatePath("/dashboard/orders");
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: '/dashboard/orders' 
  });
}

export async function deleteOrder(orderId: string): Promise<ActionResult<void>> {
  return withAuth(async (_session) => {
    await OrderService.deleteOrder(orderId);
    revalidatePath("/dashboard/orders");
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: `/dashboard/orders/${orderId}` 
  });
}

export async function getOrderStats(from?: Date, to?: Date): Promise<ActionResult<{
  total: number;
  new: number;
  inProduction: number;
  completed: number;
  revenue: number;
}>> {
  return withAuth(async () => {
    // Формируем ключ кеша
    const rangeKey = from && to 
      ? `${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}`
      : "all";
    const cacheKey = CACHE_KEYS.orderStats(rangeKey);

    // Используем cache-aside паттерн
    const { data, fromCache } = await redisCache.getOrSet(
      cacheKey,
      async () => {
        const conditions: (SQL | undefined)[] = [];
        if (from) conditions.push(gte(orders.createdAt, from));
        if (to) conditions.push(lte(orders.createdAt, to));

        const [stats] = await db
          .select({
            total: sql<number>`count(*)`,
            new: sql<number>`count(*) filter (where ${orders.status} = 'new')`,
            inProduction: sql<number>`count(*) filter (where ${orders.status} in ('design', 'production'))`,
            completed: sql<number>`count(*) filter (where ${orders.status} in ('done', 'shipped', 'completed'))`,
            revenue: sql<number>`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
          })
          .from(orders)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          total: Number(stats.total),
          new: Number(stats.new),
          inProduction: Number(stats.inProduction),
          completed: Number(stats.completed),
          revenue: Number(stats.revenue),
        };
      },
      { ttl: CACHE_TTL.ORDER_STATS, tags: ["orders"] }
    );

    if (process.env.NODE_ENV === "development" && fromCache) {
      console.log(`[Cache HIT] ${cacheKey}`);
    }

    return ok(data);
  }, { 
    errorPath: '/dashboard/orders/stats' 
  });
}

export async function getClientsForSelect(): Promise<ActionResult<{ id: string; name: string | null }[]>> {
  return withAuth(async () => {
    const data = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(eq(clients.isArchived, false))
      .limit(100);
    return ok(data);
  });
}

export async function getInventoryForSelect(): Promise<ActionResult<{ id: string; name: string | null; quantity: number | null }[]>> {
  return withAuth(async () => {
    const data = await db
      .select({ id: inventoryItems.id, name: inventoryItems.name, quantity: inventoryItems.quantity })
      .from(inventoryItems)
      .limit(100);
    return ok(data);
  });
}

export async function searchClients(query: string): Promise<ActionResult<Array<InferSelectModel<typeof clients>>>> {
  return withAuth(async () => {
    if (!query || query.length <= 2) return ok([]);
    
    const results = await db.query.clients.findMany({
      where: (c, { or, ilike }) => or(ilike(c.name, `%${query}%`), ilike(c.phone, `%${query}%`)),
      limit: 10
    });
    return ok(results as Array<InferSelectModel<typeof clients>>);
  });
}
