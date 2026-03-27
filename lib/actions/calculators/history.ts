/**
 * @fileoverview Server Actions для работы с историей расчётов
 * @module lib/actions/calculators/history
 * @requires drizzle
 * @audit Создан 2026-03-26
 */

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { calculationHistory } from '@/lib/schema/calculation-history';
import { users } from '@/lib/schema/users';
import { eq, and, isNull, desc, asc, like, or, sql, inArray, gte, lte } from 'drizzle-orm';
import { createSafeAction, createSafeQuery } from '@/lib/action-helpers';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';
import {
  CalculatorType,
  UploadedDesignFile,
  CalculationHistoryItem,
  HistoryPaginatedResult,
  CalculationParameters,
  PAGINATION_LIMITS,
} from '@/lib/types/calculators';

// ============================================================================
// SCHEMAS
// ============================================================================

const historyFiltersSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(PAGINATION_LIMITS.historyPerPage),
  search: z.string().optional(),
  calculatorType: z.string().optional(),
  dateFrom: z.union([z.string(), z.date()]).optional(),
  dateTo: z.union([z.string(), z.date()]).optional(),
  sortBy: z.enum(['createdAt', 'sellingPrice', 'name', 'totalCost']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const saveCalculationSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  calculatorType: z.string(),
  clientName: z.string().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  comment: z.string().optional().nullable(),
  totalCost: z.number(),
  sellingPrice: z.number(),
  quantity: z.number(),
  pricePerItem: z.number(),
  marginPercent: z.number(),
  parameters: z.any(), // JSON
  designFiles: z.array(z.any()).optional().default([]),
  rollVisualization: z.any().optional().nullable(),
});

const updateCalculationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  clientName: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Генерация номера расчёта (CALC-YYYY-XXXXX)
 */
async function generateNumber(): Promise<string> {
  console.log('[DEBUG] generateNumber started');
  const year = new Date().getFullYear();
  const prefix = `CALC-${year}-`;
  
  try {
    const [lastRecord] = await db
      .select({ calculationNumber: calculationHistory.calculationNumber })
      .from(calculationHistory)
      .where(like(calculationHistory.calculationNumber, `${prefix}%`))
      .orderBy(desc(calculationHistory.calculationNumber))
      .limit(1);

    console.log('[DEBUG] lastRecord found:', lastRecord);

    let sequence = 1;
    if (lastRecord) {
      const parts = lastRecord.calculationNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const result = `${prefix}${String(sequence).padStart(5, '0')}`;
    console.log('[DEBUG] generateNumber result:', result);
    return result;
  } catch (error) {
    console.error('[DEBUG] generateNumber error:', error);
    throw error;
  }
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Получение истории расчётов с фильтрацией и пагинацией
 * @requires auth
 */
export const getCalculationHistory = createSafeQuery(
  historyFiltersSchema,
  async (filters): Promise<HistoryPaginatedResult> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const page = filters.page ?? 1;
    const limit = filters.limit ?? PAGINATION_LIMITS.historyPerPage;
    const offset = (page - 1) * limit;
    
    // Условия фильтрации
    const conditions = [isNull(calculationHistory.deletedAt)];

    if (filters.search) {
      conditions.push(
        or(
          like(calculationHistory.name, `%${filters.search}%`),
          like(calculationHistory.calculationNumber, `%${filters.search}%`),
          like(calculationHistory.clientName, `%${filters.search}%`)
        )!
      );
    }

    if (filters.calculatorType && filters.calculatorType !== 'all') {
      conditions.push(eq(calculationHistory.calculatorType, filters.calculatorType));
    }

    if (filters.dateFrom) {
      conditions.push(gte(calculationHistory.createdAt, new Date(filters.dateFrom)));
    }

    if (filters.dateTo) {
      conditions.push(lte(calculationHistory.createdAt, new Date(filters.dateTo)));
    }

    // Сортировка
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? asc : desc;
    
    // Безопасный выбор колонки для сортировки
    const sortColumns: Record<string, import('drizzle-orm').Column> = {
      createdAt: calculationHistory.createdAt,
      sellingPrice: calculationHistory.sellingPrice,
      name: calculationHistory.name,
      totalCost: calculationHistory.totalCost,
    };
    
    const column = sortColumns[sortBy] || calculationHistory.createdAt;
    const orderBy = sortOrder(column);

    // Выполнение запроса
    const [items, totalRes] = await Promise.all([
      db.select({
        id: calculationHistory.id,
        calculationNumber: calculationHistory.calculationNumber,
        name: calculationHistory.name,
        calculatorType: calculationHistory.calculatorType,
        totalCost: calculationHistory.totalCost,
        sellingPrice: calculationHistory.sellingPrice,
        quantity: calculationHistory.quantity,
        pricePerItem: calculationHistory.pricePerItem,
        marginPercent: calculationHistory.marginPercent,
        parameters: calculationHistory.parameters,
        designFiles: calculationHistory.designFiles,
        rollVisualization: calculationHistory.rollVisualization,
        clientName: calculationHistory.clientName,
        clientId: calculationHistory.clientId,
        comment: calculationHistory.comment,
        createdAt: calculationHistory.createdAt,
        createdBy: calculationHistory.createdBy,
        createdByName: users.name,
      })
      .from(calculationHistory)
      .leftJoin(users, eq(calculationHistory.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
      
      db.select({ count: sql<number>`count(*)` })
        .from(calculationHistory)
        .where(and(...conditions))
    ]);

    const totalCount = Number(totalRes[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: (items || []).map(item => ({
        ...item,
        number: item.calculationNumber,
        totalCost: Number(item.totalCost),
        sellingPrice: Number(item.sellingPrice),
        quantity: Number(item.quantity),
        pricePerItem: Number(item.pricePerItem),
        marginPercent: Number(item.marginPercent),
        calculatorType: item.calculatorType as CalculatorType,
        parameters: item.parameters as CalculationParameters,
        designFiles: item.designFiles as UploadedDesignFile[],
        rollVisualization: item.rollVisualization as CalculationHistoryItem['rollVisualization'],
        createdByName: item.createdByName || 'Система',
      }) as CalculationHistoryItem),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
);

/**
 * Сохранение нового расчёта в историю
 * @requires auth
 */
export const saveCalculation = createSafeAction(
  saveCalculationSchema,
  async (data) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const calculationNumber = await generateNumber();

    const [result] = await db
      .insert(calculationHistory)
      .values({
        name: data.name,
        calculatorType: data.calculatorType,
        clientName: data.clientName,
        clientId: data.clientId,
        comment: data.comment,
        calculationNumber,
        totalCost: data.totalCost.toString(),
        sellingPrice: data.sellingPrice.toString(),
        quantity: data.quantity.toString(),
        pricePerItem: data.pricePerItem.toString(),
        marginPercent: data.marginPercent.toString(),
        parameters: data.parameters,
        designFiles: data.designFiles,
        rollVisualization: data.rollVisualization,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/dashboard/production/calculators/history');
    return result;
  }
);

/**
 * Обновление основной информации о расчёте
 */
export const updateCalculation = createSafeAction(
  updateCalculationSchema,
  async ({ id, ...data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const [result] = await db
      .update(calculationHistory)
      .set({
        ...data,
        // Можно добавить updatedAt если нужно в схеме
      })
      .where(and(eq(calculationHistory.id, id), eq(calculationHistory.createdBy, user.id)))
      .returning();

    if (!result) throw new Error('Запись не найдена или нет прав');

    revalidatePath('/dashboard/production/calculators/history');
    return result;
  }
);

/**
 * Мягкое удаление расчёта
 */
export const deleteCalculation = createSafeAction(
  idSchema,
  async ({ id }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    await db
      .update(calculationHistory)
      .set({
        deletedAt: new Date(),
        deletedBy: user.id,
      })
      .where(eq(calculationHistory.id, id));

    revalidatePath('/dashboard/production/calculators/history');
    return { success: true };
  }
);

/**
 * Массовое мягкое удаление
 */
export const bulkDeleteCalculations = createSafeAction(
  bulkDeleteSchema,
  async ({ ids }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    await db.transaction(async (tx) => {
      await tx
        .update(calculationHistory)
        .set({
          deletedAt: new Date(),
          deletedBy: user.id,
        })
        .where(inArray(calculationHistory.id, ids));
    });

    revalidatePath('/dashboard/production/calculators/history');
    return { success: true };
  }
);

/**
 * Очистка всей истории текущего пользователя
 */
export const clearAllHistory = createSafeAction(
  z.object({}),
  async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    await db.transaction(async (tx) => {
      await tx
        .update(calculationHistory)
        .set({
          deletedAt: new Date(),
          deletedBy: user.id,
        })
        .where(and(eq(calculationHistory.createdBy, user.id), isNull(calculationHistory.deletedAt)));
    });

    revalidatePath('/dashboard/production/calculators/history');
    return { success: true };
  }
);

/**
 * Дублирование расчёта
 */
export const duplicateCalculation = createSafeAction(
  idSchema,
  async ({ id }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const [source] = await db
      .select()
      .from(calculationHistory)
      .where(eq(calculationHistory.id, id))
      .limit(1);

    if (!source) throw new Error('Исходный расчёт не найден');

    const calculationNumber = await generateNumber();

    const [result] = await db
      .insert(calculationHistory)
      .values({
        ...source,
        id: undefined, // Генерируется базой
        calculationNumber,
        name: `${source.name} (Копия)`,
        createdAt: new Date(),
        createdBy: user.id,
        deletedAt: null,
        deletedBy: null,
      })
      .returning();

    revalidatePath('/dashboard/production/calculators/history');
    return result;
  }
);

/**
 * Получение истории расчётов конкретного клиента
 */
export const getClientCalculations = createSafeQuery(
  z.object({ clientId: z.string().uuid() }),
  async ({ clientId }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const items = await db.select({
      id: calculationHistory.id,
      calculationNumber: calculationHistory.calculationNumber,
      name: calculationHistory.name,
      calculatorType: calculationHistory.calculatorType,
      totalCost: calculationHistory.totalCost,
      sellingPrice: calculationHistory.sellingPrice,
      quantity: calculationHistory.quantity,
      pricePerItem: calculationHistory.pricePerItem,
      marginPercent: calculationHistory.marginPercent,
      createdAt: calculationHistory.createdAt,
    })
    .from(calculationHistory)
    .where(and(eq(calculationHistory.clientId, clientId), isNull(calculationHistory.deletedAt)))
    .orderBy(desc(calculationHistory.createdAt))
    .limit(100);

    return (items || []).map(item => ({
      ...item,
      totalCost: Number(item.totalCost),
      sellingPrice: Number(item.sellingPrice),
      quantity: Number(item.quantity),
      pricePerItem: Number(item.pricePerItem),
      marginPercent: Number(item.marginPercent),
    }));
  }
);
