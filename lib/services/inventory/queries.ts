/**
 * Оптимизированные запросы для складского учёта
 */

import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { inventoryStocks } from "@/lib/schema/warehouse/stock";
import { storageLocations } from "@/lib/schema/storage";
import { eq, and, sql, or, ilike, inArray } from "drizzle-orm";

interface GetInventoryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isArchived?: boolean;
}

/**
 * Получение товаров с остатками по всем складам
 */
export async function getInventoryItems(params: GetInventoryParams = {}) {
  const {
    page = 1,
    limit = 20,
    categoryId,
    search,
    isArchived = false,
  } = params;

  return db.query.inventoryItems.findMany({
    where: and(
      eq(inventoryItems.isArchived, isArchived),
      categoryId ? eq(inventoryItems.categoryId, categoryId) : undefined,
      search
        ? or(
            ilike(inventoryItems.name, `%${search}%`),
            ilike(inventoryItems.sku, `%${search}%`)
          )
        : undefined
    ),
    with: {
      category: true,
      stocks: {
        with: {
          storageLocation: true,
        },
      },
    },
    limit,
    offset: (page - 1) * limit,
  });
}

/**
 * Статистика склада — один оптимизированный запрос с агрегацией
 */
export async function getInventoryStats() {
  const [stats] = await db
    .select({
      totalItems: sql<number>`count(*)`,
      totalQuantity: sql<number>`coalesce(sum(${inventoryItems.quantity}), 0)`,
      lowStockCount: sql<number>`count(*) filter (where ${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold})`,
      totalValue: sql<number>`coalesce(sum(${inventoryItems.quantity} * ${inventoryItems.costPrice}), 0)`,
    })
    .from(inventoryItems)
    .where(eq(inventoryItems.isArchived, false));

  return {
    totalItems: Number(stats.totalItems),
    totalQuantity: Number(stats.totalQuantity),
    lowStockCount: Number(stats.lowStockCount),
    totalValue: Number(stats.totalValue),
  };
}

/**
 * Пакетная загрузка остатков для списка товаров
 */
export async function getStocksByItemIds(itemIds: string[]) {
  if (itemIds.length === 0) return new Map();

  const stocks = await db
    .select({
      itemId: inventoryStocks.itemId,
      locationName: storageLocations.name,
      quantity: inventoryStocks.quantity,
    })
    .from(inventoryStocks)
    .innerJoin(
      storageLocations,
      eq(inventoryStocks.storageLocationId, storageLocations.id)
    )
    .where(inArray(inventoryStocks.itemId, itemIds));

  type StockResult = typeof stocks[number];
  const stocksByItem = new Map<string, StockResult[]>();
  for (const stock of stocks) {
    const existing = stocksByItem.get(stock.itemId) || [];
    existing.push(stock);
    stocksByItem.set(stock.itemId, existing);
  }

  return stocksByItem;
}
