'use server';

/**
 * @fileoverview Серверные действия для модуля нанесений
 * @module lib/actions/calculators/placements
 */

import { db } from '@/lib/db';
import { placementItems, placementAreas } from '@/lib/schema/placement-items';
import { eq, and, isNull, asc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/session';
import { withAuth, ROLES, ForbiddenError } from '@/lib/action-helpers';
import { withCsrf } from '@/lib/auth/csrf';
import { ActionResult } from '@/lib/types';
import { 
  PlacementProduct, 
  PlacementProductFormData 
} from '@/lib/types/placements';

/**
 * Получает список всех активных продуктов с их зонами
 */
export async function getPlacementProducts(): Promise<PlacementProduct[]> {
  const records = await db.query.placementItems.findMany({
    where: isNull(placementItems.deletedAt),
    orderBy: [asc(placementItems.sortOrder), asc(placementItems.name)],
    with: {
      areas: {
        where: isNull(placementAreas.deletedAt),
        orderBy: [asc(placementAreas.sortOrder)],
      },
    },
    limit: 100,
  });

  return records.map(record => ({
    id: record.id,
    type: record.type as PlacementProduct['type'],
    name: record.name,
    description: record.description || undefined,
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    areas: record.areas.map(area => ({
      id: area.id,
      productId: area.productId,
      name: area.name,
      code: area.code,
      maxWidthMm: area.maxWidthMm,
      maxHeightMm: area.maxHeightMm,
      workPrice: parseFloat(area.workPrice),
      isActive: area.isActive,
      sortOrder: area.sortOrder,
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    })),
  }));
}

/**
 * Создаёт новый продукт с зонами
 */
export const createPlacementProduct = withCsrf(
  async (data: PlacementProductFormData): Promise<ActionResult<PlacementProduct>> => {
    return withAuth(
      async (_session) => {
        const user = await getCurrentUser();
        if (!user) throw ForbiddenError();

        // Транзакция для создания продукта и зон
        const result = await db.transaction(async (tx) => {
          // Получаем макс. sortOrder
          const maxSort = await tx
            .select({ val: sql<number>`max(${placementItems.sortOrder})` })
            .from(placementItems)
            .where(isNull(placementItems.deletedAt));
          
          const newSortOrder = (maxSort[0]?.val || 0) + 10;

          // Создаём продукт
          const [product] = await tx
            .insert(placementItems)
            .values({
              type: data.type,
              name: data.name,
              description: data.description || null,
              isActive: data.isActive,
              sortOrder: newSortOrder,
              createdBy: user.id,
            })
            .returning();

          // Создаём зоны
          if (data.areas.length > 0) {
            await tx.insert(placementAreas).values(
              data.areas.map((area, index) => ({
                productId: product.id,
                name: area.name,
                code: area.code,
                maxWidthMm: area.maxWidthMm,
                maxHeightMm: area.maxHeightMm,
                workPrice: area.workPrice.toString(),
                isActive: area.isActive,
                sortOrder: area.sortOrder || index,
                createdBy: user.id,
              }))
            );
          }

          return product.id;
        });

        revalidatePath('/dashboard/production/calculator/placements');
        
        // Возвращаем созданный объект (через повторный запрос для полноты данных)
        const products = await getPlacementProducts();
        const created = products.find(p => p.id === result);
        
        if (!created) return { success: false, error: 'Ошибка при создании продукта' };
        return { success: true, data: created };
      },
      { roles: [ROLES.ADMIN, ROLES.MANAGEMENT] }
    );
  }
);

/**
 * Обновляет существующий продукт и его зоны
 */
export const updatePlacementProduct = withCsrf(
  async (id: string, data: PlacementProductFormData): Promise<ActionResult<PlacementProduct>> => {
    return withAuth(
      async () => {
        const user = await getCurrentUser();
        if (!user) throw ForbiddenError();

        await db.transaction(async (tx) => {
          // Обновляем продукт
          await tx
            .update(placementItems)
            .set({
              type: data.type,
              name: data.name,
              description: data.description || null,
              isActive: data.isActive,
              updatedAt: new Date(),
            })
            .where(eq(placementItems.id, id));

          // Получаем текущие зоны
          const existingAreas = await tx
            .select()
            .from(placementAreas)
            .where(and(eq(placementAreas.productId, id), isNull(placementAreas.deletedAt)));

          const existingIds = existingAreas.map(a => a.id);
          const incomingIds = data.areas.filter(a => a.id).map(a => a.id as string);

          // 1. Мягкое удаление зон, которых нет в новом списке
          const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
          if (toDelete.length > 0) {
            await tx
              .update(placementAreas)
              .set({ 
                deletedAt: new Date(),
                deletedBy: user.id,
                isActive: false 
              })
              .where(sql`${placementAreas.id} IN ${toDelete}`);
          }

          // 2. Обновление существующих зон
          for (const area of data.areas.filter(a => a.id)) {
            await tx
              .update(placementAreas)
              .set({
                name: area.name,
                code: area.code,
                maxWidthMm: area.maxWidthMm,
                maxHeightMm: area.maxHeightMm,
                workPrice: area.workPrice.toString(),
                isActive: area.isActive,
                sortOrder: area.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(placementAreas.id, area.id!));
          }

          // 3. Создание новых зон
          const toCreate = data.areas.filter(a => !a.id);
          if (toCreate.length > 0) {
            await tx.insert(placementAreas).values(
              toCreate.map(area => ({
                productId: id,
                name: area.name,
                code: area.code,
                maxWidthMm: area.maxWidthMm,
                maxHeightMm: area.maxHeightMm,
                workPrice: area.workPrice.toString(),
                isActive: area.isActive,
                sortOrder: area.sortOrder,
                createdBy: user.id,
              }))
            );
          }
        });

        revalidatePath('/dashboard/production/calculator/placements');
        
        const products = await getPlacementProducts();
        const updated = products.find(p => p.id === id);
        
        if (!updated) return { success: false, error: 'Продукт не найден' };
        return { success: true, data: updated };
      },
      { roles: [ROLES.ADMIN, ROLES.MANAGEMENT] }
    );
  }
);

/**
 * Удаляет продукт (мягкое удаление)
 */
export const deletePlacementProduct = withCsrf(
  async (id: string): Promise<ActionResult<void>> => {
    return withAuth(
      async () => {
        const user = await getCurrentUser();
        if (!user) throw ForbiddenError();

        await db.transaction(async (tx) => {
          const now = new Date();
          
          // Удаляем продукт
          await tx
            .update(placementItems)
            .set({ 
              deletedAt: now,
              deletedBy: user.id,
              isActive: false
            })
            .where(eq(placementItems.id, id));

          // Удаляем все зоны продукта
          await tx
            .update(placementAreas)
            .set({ 
              deletedAt: now,
              deletedBy: user.id,
              isActive: false
            })
            .where(eq(placementAreas.productId, id));
        });

        revalidatePath('/dashboard/production/calculator/placements');
        return { success: true, data: undefined };
      },
      { roles: [ROLES.ADMIN, ROLES.MANAGEMENT] }
    );
  }
);

/**
 * Обновляет порядок сортировки продуктов
 */
export const updatePlacementProductsOrder = withCsrf(
  async (orderedIds: string[]): Promise<ActionResult<void>> => {
    return withAuth(
      async () => {
        await db.transaction(async (tx) => {
          for (let i = 0; i < orderedIds.length; i++) {
            await tx
              .update(placementItems)
              .set({ sortOrder: i * 10, updatedAt: new Date() })
              .where(eq(placementItems.id, orderedIds[i]));
          }
        });

        revalidatePath('/dashboard/production/calculators/placements');
        return { success: true, data: undefined };
      },
      { roles: [ROLES.ADMIN, ROLES.MANAGEMENT] }
    );
  }
);
