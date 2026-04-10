'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { printCalculations, printCalculationGroups } from '@/lib/schema/calculators'
import { revalidatePath } from 'next/cache'
import { getSession } from "@/lib/session";
import { logError } from '@/lib/error-logger'
import { eq } from 'drizzle-orm'
import { type ActionResult } from '@/lib/types'

const embroideryDesignSchema = z.object({
 id: z.string(),
 name: z.string(),
 stitchCount: z.number(),
 threadType: z.string(),
 density: z.string(),
 hasDigitizing: z.boolean(),
 colorsCount: z.number(),
})

const embroideryOrderSchema = z.object({
 id: z.string(),
 garmentId: z.string(),
 quantity: z.number(),
 positions: z.array(z.object({
  positionId: z.string(),
  designId: z.string(),
 })),
})

const embroideryCalculationSchema = z.object({
 designs: z.array(embroideryDesignSchema),
 orders: z.array(embroideryOrderSchema),
 result: z.object({
  totalCost: z.number(),
  avgCostPerItem: z.number(),
  totalDigitizingCost: z.number(),
  totalEmbroideryCost: z.number(),
  totalGarmentCost: z.number(),
  totalSetupCost: z.number(),
  totalExtraColorsCost: z.number(),
  discountAmount: z.number(),
  discountPercent: z.number(),
  totalQuantity: z.number(),
  totalStitches: z.number(),
  threadConsumption: z.object({
   totalThreadMeters: z.number(),
  }).optional(),
  materials: z.array(z.any()).optional(),
  materialsCost: z.number().optional(),
 }),
 notes: z.string().optional(),
})

export type EmbroideryCalculationInput = z.infer<typeof embroideryCalculationSchema>

// Генерация номера расчёта
async function generateEmbroideryCalculationNumber(): Promise<string> {
 const today = new Date()
 const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
 
 const existingCount = await db
  .select()
  .from(printCalculations)
  .where(eq(printCalculations.applicationType, 'embroidery'))
  .then(rows => rows?.filter(r => 
   r.calculationNumber.includes(dateStr)
  ).length || 0)
 
 const sequence = String(existingCount + 1).padStart(3, '0')
 return `EMB-${dateStr}-${sequence}`
}

export async function saveEmbroideryCalculation(
 data: EmbroideryCalculationInput
): Promise<ActionResult<{ id: string; calculationNumber: string }>> {
 try {
  const session = await getSession()
  if (!session) {
   return { success: false, error: 'Не авторизован' }
  }

  const validated = embroideryCalculationSchema.parse(data)
  const calculationNumber = await generateEmbroideryCalculationNumber()

  const result = await db.transaction(async (tx) => {
   // Создаём основной расчёт
   const rows = await tx
    .insert(printCalculations)
    .values({
     calculationNumber,
     applicationType: 'embroidery',
     rollWidthMm: 0,
     edgeMarginMm: 0,
     printGapMm: 0,
     totalPrints: validated.result.totalQuantity,
     totalLengthM: "0",
     totalAreaM2: "0",
     printsAreaM2: "0",
     efficiencyPercent: String(validated.result.discountPercent),
     pricePerMeter: "0",
     printCost: String(validated.result.totalEmbroideryCost),
     placementCost: String(validated.result.totalSetupCost),
     materialsCost: String(validated.result.totalDigitizingCost),
     totalCost: String(validated.result.totalCost),
     avgCostPerPrint: String(validated.result.avgCostPerItem),
     minCostPerPrint: String(validated.result.avgCostPerItem),
     maxCostPerPrint: String(validated.result.avgCostPerItem),
     consumptionData: {
      items: [], 
      totalMaterialsCost: validated.result.totalDigitizingCost,
      threadConsumption: validated.result.threadConsumption,
      extraColorsCost: validated.result.totalExtraColorsCost,
      discountAmount: validated.result.discountAmount,
      designs: validated.designs,
      materials: validated.result.materials,
      materialsCost: validated.result.materialsCost
     },
     createdBy: session.id
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
    
    await tx.insert(printCalculationGroups).values({
     calculationId: calculation.id,
     name: order.garmentId,
     widthMm: validated.result.totalStitches, 
     heightMm: order.positions.length,
     quantity: order.quantity,
     printsPerRow: 0,
     rowsCount: 0,
     sectionLengthMm: 0,
     sectionAreaM2: "0",
     sectionCost: "0",
     costPerPrint: String(validated.result.avgCostPerItem),
     color: '#db2777', // Rose/Pink for embroidery
     sortOrder: i
    })
   }

   return calculation
  })

  revalidatePath('/dashboard/production/calculators/embroidery')
  revalidatePath('/dashboard/production/calculators')
  
  return {
   success: true,
   data: {
    id: result.id,
    calculationNumber: result.calculationNumber
   }
  }
 } catch (error) {
  const err = error as Error
  logError({ error, details: { context: 'saveEmbroideryCalculation' } })
  return { success: false, error: 'Ошибка сохранения расчёта: ' + err.message }
 }
}

export async function getEmbroideryCalculation(id: string) {
 try {
  const session = await getSession()
  if (!session) {
   return { success: false, error: 'Не авторизован' }
  }

  const calculation = await db.query.printCalculations.findFirst({
   where: (calc, { and, eq }) => and(
    eq(calc.id, id),
    eq(calc.applicationType, 'embroidery')
   ),
   with: {
    groups: true,
    createdByUser: {
     columns: {
      name: true,
      email: true,
     },
    },
   },
  })

  if (!calculation) {
   return { success: false, error: 'Расчёт не найден' }
  }

  return { success: true, data: calculation }
 } catch (error) {
  const err = error as Error
  logError({ error, details: { context: 'getEmbroideryCalculation' } })
  return { success: false, error: 'Ошибка загрузки расчёта: ' + err.message }
 }
}
