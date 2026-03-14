'use server'

import { db } from '@/lib/db'
import { printCalculations, printCalculationGroups } from '@/lib/schema/calculators'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/error-logger'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { type ActionResult } from '@/lib/types'

// Схема валидации для DTG
const dtgCalculationSchema = z.object({
  items: z.array(z.object({
    garmentId: z.string(),
    garmentColor: z.enum(['light', 'dark']),
    quantity: z.number().min(1),
    positions: z.array(z.object({
      positionId: z.string(),
      widthMm: z.number().min(1),
      heightMm: z.number().min(1),
      fillPercent: z.number().optional()
    }))
  })),
  totalQuantity: z.number(),
  totalGarmentCost: z.number(),
  totalPrintCost: z.number(),
  totalWorkCost: z.number(),
  totalPrimerCost: z.number(),
  totalCost: z.number(),
  avgCostPerItem: z.number(),
  consumption: z.array(z.object({
    key: z.string(),
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    color: z.string()
  }))
})

// Генерация номера расчёта
async function generateDtgCalculationNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  
  const existingCount = await db
    .select()
    .from(printCalculations)
    .where(eq(printCalculations.applicationType, 'dtg'))
    .then(rows => rows?.length || 0)
  
  const sequence = String(existingCount + 1).padStart(3, '0')
  return `DTG-${dateStr}-${sequence}`
}

export async function saveDtgCalculation(
  data: z.infer<typeof dtgCalculationSchema>
): Promise<ActionResult<{ id: string; calculationNumber: string }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Не авторизован' }
    }

    const validated = dtgCalculationSchema.parse(data)
    const calculationNumber = await generateDtgCalculationNumber()

    const result = await db.transaction(async (tx) => {
      // Создаём основной расчёт
      const rows = await tx
        .insert(printCalculations)
        .values({
          calculationNumber,
          applicationType: 'dtg',
          rollWidthMm: 0,
          edgeMarginMm: 0,
          printGapMm: 0,
          totalPrints: validated.totalQuantity,
          totalLengthM: "0",
          totalAreaM2: "0",
          printsAreaM2: "0",
          efficiencyPercent: "0",
          pricePerMeter: "0",
          printCost: String(validated.totalPrintCost),
          placementCost: String(validated.totalWorkCost),
          materialsCost: String(validated.totalPrimerCost),
          totalCost: String(validated.totalCost),
          avgCostPerPrint: String(validated.avgCostPerItem || validated.totalCost / (validated.totalQuantity || 1)),
          minCostPerPrint: String(validated.avgCostPerItem || 0),
          maxCostPerPrint: String(validated.avgCostPerItem || 0),
          consumptionData: {
            items: [
              ...(validated.items || []).map(item => ({
                key: 'garment',
                name: `Изделие (${item.garmentColor})`,
                value: item.quantity,
                unit: 'шт' as const,
                unitPrice: 0,
                totalPrice: 0
              })),
              ...validated.consumption.map(c => ({
                key: c.key,
                name: c.name,
                value: c.value,
                unit: c.unit as "мл" | "г" | "м²" | "шт" | "м",
                unitPrice: 0,
                totalPrice: 0
              }))
            ]
          },
          createdBy: session.id
        })
        .returning()

      const calculation = rows[0]
      if (!calculation) {
        throw new Error('Не удалось создать расчёт')
      }

      // Сохраняем группы (изделия)
      for (let i = 0; i < (validated.items?.length || 0); i++) {
        const item = validated.items[i]
        if (!item) continue
        
        await tx.insert(printCalculationGroups).values({
          calculationId: calculation.id,
          name: item.garmentId,
          widthMm: 0,
          heightMm: 0,
          quantity: item.quantity,
          printsPerRow: 0,
          rowsCount: 0,
          sectionLengthMm: 0,
          sectionAreaM2: "0",
          sectionCost: "0",
          costPerPrint: String(validated.avgCostPerItem),
          color: item.garmentColor === 'dark' ? '#1e293b' : '#fbbf24',
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
    logError({ error, details: { context: 'saveDtgCalculation' } })
    return { success: false, error: 'Ошибка сохранения расчёта: ' + errorMessage }
  }
}
