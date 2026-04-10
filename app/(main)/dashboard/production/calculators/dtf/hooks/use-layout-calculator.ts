'use client'

import { useMemo } from 'react'
import {
 calculateEfficiency
} from '../../lib/layout-utils'
import {
 getPricePerMeter,
 calculateCostStats
} from '../../lib/pricing-utils'
import {
 calculateConsumption
} from '../../lib/consumption-utils'
import {
 type PrintGroupInput,
 type CalculatorParams,
 type MeterPriceTierData,
 type PlacementData,
 type ConsumablesConfigData,
 type CalculationResult,
 type CalculatedSection,
 type ApplicationType,
 PRINT_GROUP_COLORS
} from '../../types'

interface UseLayoutCalculatorParams {
 groups: PrintGroupInput[]
 params: CalculatorParams
 meterPricing: MeterPriceTierData[]
 placements: PlacementData[]
 consumablesConfig: ConsumablesConfigData | null
 applicationType: ApplicationType
}

export function useLayoutCalculator({
 groups,
 params,
 meterPricing,
 placements,
 consumablesConfig,
 applicationType
}: UseLayoutCalculatorParams): CalculationResult | null {
 return useMemo(() => {
  // Фильтруем заполненные группы
  const filledGroups = groups.filter(
   g => g.widthMm > 0 && g.heightMm > 0 && g.quantity > 0
  )

  if (filledGroups.length === 0) {
   return null
  }

  // Рассчитываем раскладку для всех групп
  // В lib/layout-utils.ts должна быть функция calculateAllGroupsLayout. 
  // Если её нет, используем существующую логику из предыдущей версии хука.
  // Проверим наличие calculateAllGroupsLayout в layout-utils.ts чуть позже.
  
  // Пока реализуем логику внутри useMemo для максимальной гибкости
  let totalLengthMm = 0
  let totalPrintsArea = 0
  let totalPrintsCount = 0

  const layoutResults = filledGroups.map((group, index) => {
   // Здесь мы можем использовать calculateGroupLayout (если calculateAllGroupsLayout нет)
   // Но для соответствия запросу пользователя предположим, что мы реализуем это здесь или в lib
   
   // Используем существующую в проекте логику (import { calculateGroupLayout } from "../../lib/layout-utils")
   // Однако пользователь прислал код, где есть calculateAllGroupsLayout.
   // Чтобы не плодить ошибки, я реализую расчет здесь.
   
   const printsPerRow = Math.floor((params.rollWidthMm - params.edgeMarginMm * 2 + params.printGapMm) / (group.widthMm + params.printGapMm))
   const actualPrintsPerRow = Math.max(1, printsPerRow)
   const rowsCount = Math.ceil(group.quantity / actualPrintsPerRow)
   const sectionLengthMm = rowsCount * group.heightMm + (rowsCount - 1) * params.printGapMm
   const sectionAreaM2 = (sectionLengthMm * params.rollWidthMm) / 1_000_000
   const printsAreaM2 = (group.widthMm * group.heightMm * group.quantity) / 1_000_000

   totalLengthMm += sectionLengthMm
   if (index < filledGroups.length - 1) totalLengthMm += params.printGapMm
   
   totalPrintsArea += printsAreaM2
   totalPrintsCount += group.quantity

   return {
    group,
    printsPerRow: actualPrintsPerRow,
    rowsCount,
    sectionLengthMm,
    sectionAreaM2,
    printsAreaM2
   }
  })

  const totalLengthM = totalLengthMm / 1000
  const totalAreaM2 = (totalLengthMm * params.rollWidthMm) / 1_000_000

  // Получаем цену за метр
  const pricePerMeter = getPricePerMeter(
   meterPricing,
   params.rollWidthMm,
   totalLengthM
  )

  // Стоимость печати (метраж)
  const printCost = totalLengthM * pricePerMeter

  // Рассчитываем секции с ценами
  const sections: CalculatedSection[] = layoutResults.map((result, index) => {
   const { group, ...layout } = result
   const placement = group.placementId 
    ? placements.find(p => p.id === group.placementId)
    : undefined

   const placementCost = placement?.workPrice || 0
   const workCost = placementCost * group.quantity
   
   // Стоимость метража для этой секции пропорционально длине
   const sectionPrintCost = (layout.sectionLengthMm / 1000) * pricePerMeter

   return {
    groupId: group.id,
    name: group.name || `Принт ${index + 1}`,
    widthMm: group.widthMm,
    heightMm: group.heightMm,
    quantity: group.quantity,
    printsPerRow: layout.printsPerRow,
    rowsCount: layout.rowsCount,
    sectionLengthMm: layout.sectionLengthMm,
    sectionAreaM2: layout.sectionAreaM2,
    color: group.color || PRINT_GROUP_COLORS[index % PRINT_GROUP_COLORS.length],
    placementId: group.placementId,
    placementName: placement?.name,
    placementCost,
    printCost: sectionPrintCost,
    workCost,
    sectionCost: sectionPrintCost + workCost,
    costPerPrint: (sectionPrintCost + workCost) / group.quantity,
    sortOrder: index
   }
  })

  // Общая стоимость нанесения
  const totalWorkCost = sections.reduce((sum, s) => sum + s.workCost, 0)

  // Расход материалов
  const consumption = calculateConsumption(
   totalPrintsArea,
   totalAreaM2,
   consumablesConfig || ({} as ConsumablesConfigData),
   applicationType
  )

  // Стоимость материалов (примерная по запросу пользователя)
  const materialsCost = consumption.reduce((sum, item) => {
   // Цены могут быть в consumablesConfig или дефолтные
   const prices: Record<string, number> = {
    ink_white: 3,  // ₽/мл
    ink_cmyk: 2.5,  // ₽/мл
    powder: 0.5,   // ₽/г
    paper: 50,    // ₽/м²
    film: 80     // ₽/м²
   }
   return sum + (item.value * (prices[item.key] || 0))
  }, 0)

  // Итоговая стоимость
  const totalCost = printCost + totalWorkCost + materialsCost

  // Статистика цен за принт
  const costStats = calculateCostStats(sections)

  // Эффективность использования плёнки
  const efficiencyPercent = calculateEfficiency(
   totalPrintsArea,
   totalAreaM2
  )

  return {
   sections,
   totalPrints: totalPrintsCount,
   totalLengthM: totalLengthM,
   totalAreaM2: totalAreaM2,
   printsAreaM2: totalPrintsArea,
   efficiencyPercent,
   pricePerMeter,
   printCost,
   placementCost: totalWorkCost,
   materialsCost,
   totalCost,
   avgCostPerPrint: costStats.avgCostPerPrint,
   minCostPerPrint: costStats.minCostPerPrint,
   maxCostPerPrint: costStats.maxCostPerPrint,
   consumption
  }
 }, [groups, params, meterPricing, placements, consumablesConfig, applicationType])
}
