'use server'

import { db } from '@/lib/db'
import { printCalculations, printCalculationGroups } from '@/lib/schema/calculators'
import { users } from '@/lib/schema/users'
import { getSession } from '@/lib/auth'
import { logError } from '@/lib/error-logger'
import { eq, desc, and, gte, lte, sql, like, inArray } from 'drizzle-orm'
import { type ActionResult } from '@/lib/types'
import { type ApplicationType } from '../types'
import { z } from 'zod'

const historyFiltersSchema = z.object({
  applicationType: z.enum(['dtf', 'dtg', 'embroidery', 'silkscreen', 'sublimation', 'print-application']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional()
})

const idSchema = z.string().uuid()

export interface CalculationHistoryItem {
  id: string
  calculationNumber: string
  applicationType: ApplicationType
  totalPrints: number
  totalCost: number
  createdAt: Date
  userName?: string
  groupsCount: number
}

export interface CalculationHistoryFilters {
  applicationType?: ApplicationType
  dateFrom?: Date
  dateTo?: Date
  search?: string
  page?: number
  limit?: number
}

export interface CalculationHistoryResult {
  items: CalculationHistoryItem[]
  total: number
  page: number
  totalPages: number
}

export async function getCalculationsHistory(
  filters: CalculationHistoryFilters = {}
): Promise<ActionResult<CalculationHistoryResult>> {
  const validatedFilters = historyFiltersSchema.safeParse(filters)
  if (!validatedFilters.success) {
    return { success: false, error: 'Неверные фильтры' }
  }
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Не авторизован' }
    }

    const {
      applicationType,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 20
    } = filters

    const offset = (page - 1) * limit

    const conditions = []
    
    if (applicationType) {
      conditions.push(eq(printCalculations.applicationType, applicationType))
    }
    
    if (dateFrom) {
      conditions.push(gte(printCalculations.createdAt, dateFrom))
    }
    
    if (dateTo) {
      conditions.push(lte(printCalculations.createdAt, dateTo))
    }
    
    if (search) {
      conditions.push(like(printCalculations.calculationNumber, `%${search}%`))
    }

    const calculations = await db
      .select({
        id: printCalculations.id,
        calculationNumber: printCalculations.calculationNumber,
        applicationType: printCalculations.applicationType,
        totalPrints: printCalculations.totalPrints,
        totalCost: printCalculations.totalCost,
        createdAt: printCalculations.createdAt,
        createdBy: printCalculations.createdBy
      })
      .from(printCalculations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(printCalculations.createdAt))
      .limit(limit)
      .offset(offset)

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(printCalculations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const calculationIds = calculations.map(c => c.id)
    
    const groupsCounts = calculationIds.length > 0 
      ? await db
          .select({
            calculationId: printCalculationGroups.calculationId,
            count: sql<number>`count(*)`
          })
          .from(printCalculationGroups)
          .where(inArray(printCalculationGroups.calculationId, calculationIds))
          .groupBy(printCalculationGroups.calculationId)
      : []

    const groupsCountMap = new Map(
      groupsCounts.map(g => [g.calculationId, g.count])
    )

    const createdBy = [...new Set(calculations.map(c => c.createdBy).filter((id): id is string => !!id))]
    
    const usersData = createdBy.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, createdBy))
      : []

    const usersMap = new Map(usersData.map(u => [u.id, u.name]))

    const items: CalculationHistoryItem[] = calculations.map(calc => ({
      id: calc.id,
      calculationNumber: calc.calculationNumber,
      applicationType: calc.applicationType as ApplicationType,
      totalPrints: calc.totalPrints,
      totalCost: Number(calc.totalCost),
      createdAt: calc.createdAt,
      userName: calc.createdBy ? usersMap.get(calc.createdBy) || undefined : undefined,
      groupsCount: groupsCountMap.get(calc.id) || 0
    }))

    return {
      success: true,
      data: {
        items,
        total: Number(count),
        page,
        totalPages: Math.ceil(Number(count) / limit)
      }
    }
  } catch (error) {
    logError({ error, details: { context: 'getCalculationsHistory' } })
    return { success: false, error: 'Ошибка загрузки истории' }
  }
}

export async function getCalculationDetails(
  calculationId: string
): Promise<ActionResult<{
  calculation: typeof printCalculations.$inferSelect
  groups: Array<typeof printCalculationGroups.$inferSelect>
}>> {
  if (!idSchema.safeParse(calculationId).success) {
    return { success: false, error: 'Неверный ID' }
  }
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Не авторизован' }
    }

    const [calculation] = await db
      .select()
      .from(printCalculations)
      .where(eq(printCalculations.id, calculationId))
      .limit(1)

    if (!calculation) {
      return { success: false, error: 'Расчёт не найден' }
    }

    const groups = await db
      .select()
      .from(printCalculationGroups)
      .where(eq(printCalculationGroups.calculationId, calculationId))
      .orderBy(printCalculationGroups.sortOrder)

    return {
      success: true,
      data: { calculation, groups }
    }
  } catch (error) {
    logError({ error, details: { context: 'getCalculationDetails' } })
    return { success: false, error: 'Ошибка загрузки расчёта' }
  }
}

export async function deleteCalculation(
  calculationId: string
): Promise<ActionResult<void>> {
  if (!idSchema.safeParse(calculationId).success) {
    return { success: false, error: 'Неверный ID' }
  }
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Не авторизован' }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(printCalculationGroups)
        .where(eq(printCalculationGroups.calculationId, calculationId))

      await tx
        .delete(printCalculations)
        .where(eq(printCalculations.id, calculationId))
    })

    return { success: true, data: undefined }
  } catch (error) {
    logError({ error, details: { context: 'deleteCalculation' } })
    return { success: false, error: 'Ошибка удаления расчёта' }
  }
}
