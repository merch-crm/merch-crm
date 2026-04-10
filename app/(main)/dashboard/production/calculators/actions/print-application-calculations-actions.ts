'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { printCalculations, printCalculationGroups } from '@/lib/schema/calculators'
import { revalidatePath } from 'next/cache'
import { getSession } from "@/lib/session";
import { logAction } from '@/lib/audit'
import { eq, and, like, asc } from 'drizzle-orm'
import { type ActionResult } from '@/lib/types'

// Схема валидации
const printItemSchema = z.object({
 id: z.string(),
 name: z.string(),
 type: z.string(),
 sizeId: z.string(),
 purchasePrice: z.number(),
})

const applicationSchema = z.object({
 positionId: z.string(),
 positionName: z.string().optional(),
 printId: z.string(),
 printName: z.string().optional(),
 printType: z.string(),
 printPrice: z.number(),
 sizeId: z.string(),
})

const orderSchema = z.object({
 id: z.string(),
 garmentId: z.string(),
 garmentName: z.string().optional(),
 garmentPrice: z.number().optional(),
 quantity: z.number().min(1),
 applications: z.array(applicationSchema),
})

const settingsSchema = z.object({
 includeGarments: z.boolean(),
 isRush: z.boolean(),
})

const resultSchema = z.object({
 totalCost: z.number(),
 costPerItem: z.number(),
 garmentsCost: z.number(),
 printsCost: z.number(),
 workCost: z.number(),
 setupCost: z.number(),
 quantityDiscount: z.number(),
 discountPercent: z.number(),
 totalItems: z.number(),
 totalPrints: z.number(),
 totalApplications: z.number(),
 estimatedTime: z.number(),
 breakdown: z.array(z.record(z.string(), z.unknown())),
})

const printApplicationCalculationSchema = z.object({
 prints: z.array(printItemSchema),
 orders: z.array(orderSchema),
 settings: settingsSchema,
 result: resultSchema,
 notes: z.string().optional(),
})

export type PrintApplicationCalculationInput = z.infer<typeof printApplicationCalculationSchema>

// Генерация номера расчёта
async function generatePrintApplicationNumber(): Promise<string> {
 const today = new Date()
 const year = today.getFullYear()
 const month = String(today.getMonth() + 1).padStart(2, '0')
 const day = String(today.getDate()).padStart(2, '0')
 const dateStr = `${year}${month}${day}`
 
 const existingCalcs = await db
  .select({ id: printCalculations.id })
  .from(printCalculations)
  .where(
   and(
    like(printCalculations.calculationNumber, `PRNT-${dateStr}%`),
    eq(printCalculations.applicationType, 'print-application')
   )
  )
 
 const seqNum = String(existingCalcs.length + 1).padStart(3, '0')
 return `PRNT-${dateStr}-${seqNum}`
}

export async function savePrintApplicationCalculation(
 data: PrintApplicationCalculationInput
): Promise<ActionResult<{ id: string; calculationNumber: string }>> {
 try {
  const session = await getSession()
  if (!session) {
   return { success: false, error: 'Не авторизован' }
  }

  const validated = printApplicationCalculationSchema.parse(data)
  const calculationNumber = await generatePrintApplicationNumber()

  const result = await db.transaction(async (tx) => {
   // Основной расчёт
   const rows = await tx.insert(printCalculations).values({
    calculationNumber,
    applicationType: 'print-application',
    rollWidthMm: 0,
    edgeMarginMm: 0,
    printGapMm: 0,
    totalPrints: validated.result.totalApplications,
    totalLengthM: "0",
    totalAreaM2: "0",
    printsAreaM2: "0",
    efficiencyPercent: String(validated.result.discountPercent),
    pricePerMeter: "0",
    printCost: String(validated.result.printsCost),
    placementCost: String(validated.result.workCost),
    materialsCost: String(validated.result.garmentsCost + validated.result.setupCost),
    totalCost: String(validated.result.totalCost),
    avgCostPerPrint: String(validated.result.costPerItem),
    minCostPerPrint: String(validated.result.costPerItem),
    maxCostPerPrint: String(validated.result.costPerItem),
    consumptionData: {
     items: [], 
     totalMaterialsCost: validated.result.garmentsCost + validated.result.setupCost,
     prints: validated.prints,
     settings: validated.settings,
     totalItems: validated.result.totalItems,
     totalApplications: validated.result.totalApplications,
     estimatedTime: validated.result.estimatedTime,
     breakdown: validated.result.breakdown
    },
    createdBy: session.id,
   }).returning()

   const calculation = rows[0]
   if (!calculation) {
    throw new Error('Не удалось создать расчёт')
   }

   // Позиции заказа (группы)
   const ordersToInsert = validated.orders || []
   if (ordersToInsert.length > 0) {
    await tx.insert(printCalculationGroups).values(
     ordersToInsert.map((order, index) => ({
      calculationId: calculation.id,
      name: order.garmentName || order.garmentId,
      widthMm: 0,
      heightMm: 0,
      quantity: order.quantity,
      printsPerRow: 0,
      rowsCount: 0,
      sectionLengthMm: 0,
      sectionAreaM2: "0",
      sectionCost: "0",
      costPerPrint: String(validated.result.costPerItem),
      color: '#6366f1', // Indigo for print application
      sortOrder: index,
     }))
    )
   }

   return calculation
  })

  await logAction("Сохранен расчет нанесения", "print_calculation", result.id, {
    calculationNumber: result.calculationNumber,
    totalCost: result.totalCost
  });

  revalidatePath('/dashboard/production/calculators/print-application')
  revalidatePath('/dashboard/production/calculators')

  return {
   success: true,
   data: {
    id: result.id,
    calculationNumber: result.calculationNumber,
   }
  }
 } catch (error) {
  console.error('Ошибка сохранения расчёта нанесения принта:', error)
  return { success: false, error: 'Ошибка сохранения в базу данных' }
 }
}

// Получение расчёта по ID
export async function getPrintApplicationCalculation(id: string) {
 try {
  const session = await getSession()
  if (!session) {
   return { success: false, error: 'Не авторизован' }
  }

  const calculation = await db.query.printCalculations.findFirst({
   where: and(
    eq(printCalculations.id, id),
    eq(printCalculations.applicationType, 'print-application')
   ),
   with: {
    groups: {
     orderBy: asc(printCalculationGroups.sortOrder),
    },
   },
  })

  if (!calculation) {
   return { success: false, error: 'Расчёт не найден' }
  }

  return { success: true, data: calculation }
 } catch (error) {
  console.error('Ошибка загрузки расчёта:', error)
  return { success: false, error: 'Ошибка загрузки' }
 }
}

// Удаление расчёта
export async function deletePrintApplicationCalculation(id: string) {
 try {
  const session = await getSession()
  if (!session) {
   return { success: false, error: 'Не авторизован' }
  }

  await db.transaction(async (tx) => {
   await tx.delete(printCalculationGroups).where(
    eq(printCalculationGroups.calculationId, id)
   )
   await tx.delete(printCalculations).where(
    eq(printCalculations.id, id)
   )
  })

  await logAction("Удален расчет нанесения", "print_calculation", id, { id });

  revalidatePath('/dashboard/production/calculators/print-application')
  revalidatePath('/dashboard/production/calculators')

  return { success: true }
 } catch (error) {
  console.error('Ошибка удаления расчёта:', error)
  return { success: false, error: 'Ошибка удаления' }
 }
}
