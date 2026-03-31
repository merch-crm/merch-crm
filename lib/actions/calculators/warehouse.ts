/**
 * @fileoverview Server Actions для интеграции со складом
 * @module lib/actions/calculators/warehouse
 * @requires drizzle
 * @audit Создан 2026-03-25
 */

'use server';

import { db } from '@/lib/db';
import { inventoryCategories, inventoryItems, inventoryTransactions } from '@/lib/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { ActionResult, ok, err } from '@/lib/types/common';

/**
 * Материал со склада для калькулятора
 */
export interface WarehouseItemForCalculator {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  sku?: string;
}

/**
 * Категории материалов для калькуляторов (slugs из inventory_categories)
 */
const CALCULATOR_MATERIAL_CATEGORIES = {
  dtf: ['ink_cmyk', 'ink_white', 'glue_powder', 'pet_film'],
  'uv-dtf': ['ink_cmyk', 'ink_white', 'uv_varnish', 'ab_film'],
  dtg: ['ink_cmyk', 'ink_white', 'dtg_primer'],
  sublimation: ['sublimation_ink', 'sublimation_paper'],
  embroidery: ['embroidery_thread_upper', 'embroidery_thread_lower', 'stabilizer'],
  silkscreen: ['plastisol_ink', 'mesh_frame', 'emulsion'],
  thermotransfer: ['transfer_film'],
} as const;

/**
 * Получение материалов со склада для калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Список материалов
 */
export async function getWarehouseItemsForCalculator(
  calculatorType: keyof typeof CALCULATOR_MATERIAL_CATEGORIES
): Promise<ActionResult<WarehouseItemForCalculator[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return err('Пользователь не авторизован');
    }

    const categorySlugs = CALCULATOR_MATERIAL_CATEGORIES[calculatorType];

    // 1. Находим ID категорий по их слагам
    const categories = await db.query.inventoryCategories.findMany({
      where: (cats, { inArray }) => inArray(cats.slug, categorySlugs as unknown as string[]),
      limit: 100,
    });

    if (categories.length === 0) {
      return ok([]);
    }

    const categoryIds = categories.map(c => c.id);

    // 2. Получаем товары из этих категорий
    const items = await db.query.inventoryItems.findMany({
      where: (items, { and, eq, inArray }) =>
        and(
          inArray(items.categoryId, categoryIds),
          eq(items.isArchived, false)
        ),
      with: {
        category: true
      },
      orderBy: (items, { asc }) => [asc(items.name)],
      limit: 100,
    });

    const mappedItems: WarehouseItemForCalculator[] = (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.costPrice || 0),
      unit: item.unit,
      stock: Number(item.quantity),
      category: item.category?.slug || '',
      sku: item.sku || undefined,
    }));

    return ok(mappedItems);
  } catch (error) {
    console.error('Ошибка получения материалов со склада:', error);
    // Возвращаем пустой массив при ошибке, чтобы калькулятор мог работать в ручном режиме
    return ok([]);
  }
}

/**
 * Получение одного материала со склада по ID
 * @param itemId - ID материала
 * @returns Материал
 */
export async function getWarehouseItemById(
  itemId: string
): Promise<ActionResult<WarehouseItemForCalculator>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return err('Пользователь не авторизован');
    }

    const item = await db.query.inventoryItems.findFirst({
      where: (items, { eq }) => eq(items.id, itemId),
      with: {
        category: true
      }
    });

    if (!item) {
      return err('Материал не найден');
    }

    return ok({
      id: item.id,
      name: item.name,
      price: Number(item.costPrice || 0),
      unit: item.unit,
      stock: Number(item.quantity),
      category: item.category?.slug || '',
      sku: item.sku || undefined,
    });
  } catch (error) {
    console.error('Ошибка получения материала:', error);
    return err('Не удалось загрузить материал');
  }
}

/**
 * Создание материала со склада специально для калькулятора (из модалки)
 * @param data - Данные материала
 * @returns - Созданный материал
 */
export async function createWarehouseItemForCalculator(data: {
  name: string;
  categorySlug: string;
  price: number;
  unit: string;
  stock: number;
  sku?: string;
}): Promise<ActionResult<WarehouseItemForCalculator>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return err('Пользователь не авторизован');
    }

    return await db.transaction(async (tx) => {
      // 1. Найти категорию по slug
      let category = await tx.query.inventoryCategories.findFirst({
        where: (cats, { eq }) => eq(cats.slug, data.categorySlug)
      });

      // 2. Если категория не найдена, создадим ее
      if (!category) {
        const [newCat] = await tx.insert(inventoryCategories).values({
          name: data.categorySlug, // fallback name
          slug: data.categorySlug,
          isActive: true
        }).returning();
        category = newCat;
      }

      // 3. Создать товар
      const [item] = await tx.insert(inventoryItems).values({
        name: data.name,
        categoryId: category.id,
        costPrice: data.price.toString(),
        sellingPrice: data.price.toString(),
        unit: (data.unit as "шт." | "л" | "м" | "кг") || "шт.",
        quantity: data.stock,
        sku: data.sku || null,
        itemType: 'consumables',
        createdBy: user.id,
        lowStockThreshold: 10,
        criticalStockThreshold: 1,
        attributes: { category: data.categorySlug } // For backward compatibility
      }).returning();

      // 4. Если введен начальный остаток > 0 - запишем транзакцию поступления
      if (data.stock > 0) {
        await tx.insert(inventoryTransactions).values({
          itemId: item.id,
          type: "in",
          changeAmount: data.stock,
          reason: "Начальный ввод остатков из калькулятора",
          costPrice: data.price.toString(),
          createdBy: user.id
        });
      }

      return ok({
        id: item.id,
        name: item.name,
        price: data.price,
        unit: item.unit,
        stock: data.stock,
        category: category.slug || data.categorySlug,
        sku: item.sku || undefined
      });
    });
  } catch (error) {
    console.error('Ошибка создания материала:', error);
    return err('Не удалось создать материал');
  }
}
