'use server'

import { db } from '@/lib/db'
import { printCalculations, printCalculationGroups } from '@/lib/schema/calculators'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/error-logger'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { type ActionResult } from '@/lib/types'

// Схема валидации
const silkscreenCalculationSchema = z.object({
  orders: z.array(z.object({
    garmentId: z.string(),
    quantity: z.number().min(1),
    isDarkGarment: z.boolean(),
    positions: z.array(z.object({
      positionId: z.string(),
      sizeId: z.string(),
      colors: z.array(z.object({
        inkType: z.string(),
        isUnderbase: z.boolean()
      }))
    }))
  })),
  includeScreens: z.boolean(),
  result: z.object({
    quantity: z.number(),
    garmentCost: z.number(),
    totalScreensCost: z.number(),
    totalSetupCost: z.number(),
    printCostBeforeDiscount: z.number(),
    quantityDiscount: z.number(),
    discountPercent: z.number(),
    totalPrintCost: z.number(),
    totalCost: z.number(),
    costPerItem: z.number()
  })
})

// Генерация номера расчёта
async function generateSilkscreenCalculationNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  
  const existingCount = await db
    .select()
    .from(printCalculations)
    .where(eq(printCalculations.applicationType, 'silkscreen'))
    .then(rows => (rows || []).filter(r => 
      r.calculationNumber.includes(dateStr)
    ).length)
  
  const sequence = String(existingCount + 1).padStart(3, '0')
  return `SILK-${dateStr}-${sequence}`
}

export async function saveSilkscreenCalculation(
  data: z.infer<typeof silkscreenCalculationSchema>
): Promise<ActionResult<{ id: string; calculationNumber: string }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Не авторизован' }
    }

    const validated = silkscreenCalculationSchema.parse(data)
    const calculationNumber = await generateSilkscreenCalculationNumber()

    const result = await db.transaction(async (tx) => {
      // Создаём основной расчёт
      const rows = await tx
        .insert(printCalculations)
        .values({
          calculationNumber,
          applicationType: 'silkscreen',
          rollWidthMm: 0,
          edgeMarginMm: 0,
          printGapMm: 0,
          totalPrints: validated.result.quantity,
          totalLengthM: "0",
          totalAreaM2: "0",
          printsAreaM2: "0",
          efficiencyPercent: String(validated.result.discountPercent),
          pricePerMeter: "0",
          printCost: String(validated.result.totalPrintCost),
          placementCost: String(validated.result.totalSetupCost),
          materialsCost: String(validated.result.totalScreensCost),
          totalCost: String(validated.result.totalCost),
          avgCostPerPrint: String(validated.result.costPerItem),
          minCostPerPrint: String(validated.result.costPerItem),
          maxCostPerPrint: String(validated.result.costPerItem),
          consumptionData: {
            items: [], // Можно заполнить позже если нужно
            totalMaterialsCost: validated.result.totalScreensCost
          },
        })
        .returning()

      const calculation = rows[0]
      if (!calculation) {
        throw new Error('Не удалось создать расчёт')
      }

      // Сохраняем группы (заказы)
      for (let i = 0; i < (validated.orders?.length || 0); i++) {
        const order = validated.orders[i]
        if (!order) continue
        const colorsCount = order.positions.reduce((sum, pos) => sum + pos.colors.length, 0)
        
        await tx.insert(printCalculationGroups).values({
          calculationId: calculation.id,
          name: order.garmentId,
          widthMm: colorsCount, // Используем для хранения количества цветов
          heightMm: order.positions.length, // Количество позиций
          quantity: order.quantity,
          printsPerRow: 0,
          rowsCount: 0,
          sectionLengthMm: 0,
          sectionAreaM2: "0",
          sectionCost: "0",
          costPerPrint: String(validated.result.costPerItem),
          color: order.isDarkGarment ? '#1e293b' : '#f97316',
          sortOrder: i
        })
      }

      return calculation
    })

    revalidatePath('/dashboard/production/calculators')
    
    return {
      success: true,
      data: {
        id: result.id,
        calculationNumber: result.calculationNumber
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    logError({ error, details: { context: 'saveSilkscreenCalculation' } })
    return { success: false, error: 'Ошибка сохранения расчёта: ' + errorMessage }
  }
}
