'use client'

import { useMemo } from 'react'
import {
  calculateAllGroupsLayout,
  calculateEfficiency
} from '../../lib/layout-utils'
import {
  getPricePerMeter,
  calculateCostStats
} from '../../lib/pricing-utils'
import {
  calculateConsumption,
  calculateMaterialsCost
} from '../../lib/consumption-utils'
import {
  type PrintGroupInput,
  type CalculatorParams,
  type MeterPriceTierData,
  type PlacementData,
  type ConsumablesConfigData,
  type CalculationResult,
  type CalculatedSection,
  PRINT_GROUP_COLORS,
  SUBLIMATION_PRODUCTS,
  SUBLIMATION_FABRIC_PRICES
} from '../../types'

interface UseSublimationCalculatorParams {
  groups: PrintGroupInput[]
  params: CalculatorParams
  meterPricing: MeterPriceTierData[]
  placements: PlacementData[]
  consumablesConfig: ConsumablesConfigData | null
  calculationMode: 'products' | 'custom' | 'fabric'
  fabricParams?: {
    fabricType: string
    widthM: number
    lengthM: number
    quantity: number
  }
}

export function useSublimationCalculator({
  groups,
  params,
  meterPricing,
  placements,
  consumablesConfig,
  calculationMode,
  fabricParams
}: UseSublimationCalculatorParams): CalculationResult | null {
  return useMemo(() => {
    // 1. Фильтруем заполненные группы
    const filledGroups = groups.filter(
      g => g.widthMm > 0 && g.heightMm > 0 && g.quantity > 0
    )

    if (filledGroups.length === 0) {
      return null
    }

    // 2. Рассчитываем раскладку
    const layoutDetails = calculateAllGroupsLayout(filledGroups, params)
    const totalLengthM = layoutDetails.totalLengthMm / 1000
    
    // 3. Получаем цену за метр бумаги
    const pricePerMeter = getPricePerMeter(
      meterPricing,
      params.rollWidthMm,
      totalLengthM
    )

    // 4. Стоимость печати (метраж бумаги)
    const printCostTotal = totalLengthM * pricePerMeter

    // 5. Рассчитываем секции с детализацией стоимости
    const sections: CalculatedSection[] = layoutDetails.sections.map((layoutSection, index) => {
      const group = filledGroups[index]
      
      // Находим продукт если есть
      const product = group.productId 
        ? SUBLIMATION_PRODUCTS.find(p => p.id === group.productId)
        : undefined

      const placement = group.placementId 
        ? placements.find(p => p.id === group.placementId)
        : undefined

      // Стоимость нанесения
      const placementCost = (placement?.workPrice || 0) * group.quantity
      
      // Стоимость метража для этой секции
      const sectionPrintCost = (layoutSection.sectionLengthMm / 1000) * pricePerMeter

      // Стоимость заготовки (для продуктов)
      const blankCostPerUnit = product?.pricePerUnit || group.productPrice || 0
      const totalBlankCost = blankCostPerUnit * group.quantity

      return {
        ...layoutSection,
        groupId: group.id,
        name: group.name || product?.name || `Группа ${index + 1}`,
        color: group.color || PRINT_GROUP_COLORS[index % PRINT_GROUP_COLORS.length],
        widthMm: group.widthMm,
        heightMm: group.heightMm,
        quantity: group.quantity,
        placementId: group.placementId,
        placementName: placement?.name,
        placementCost: placement?.workPrice || 0,
        printCost: sectionPrintCost,
        workCost: placementCost,
        blankCost: totalBlankCost,
        sectionCost: sectionPrintCost + placementCost + totalBlankCost,
        costPerPrint: (sectionPrintCost + placementCost + totalBlankCost) / group.quantity,
        sortOrder: index
      }
    })

    // 6. Общие итоги стоимости
    const totalPlacementCost = sections.reduce((sum, s) => sum + s.workCost, 0)
    const totalBlanksCost = sections.reduce((sum, s) => sum + (s.blankCost || 0), 0)
    const totalPrints = filledGroups.reduce((sum, g) => sum + g.quantity, 0)

    // 7. Расход материалов
    const consumption = calculateConsumption(
      layoutDetails.printsAreaM2,
      layoutDetails.totalAreaM2,
      consumablesConfig || { applicationType: 'sublimation' } as ConsumablesConfigData,
      'sublimation'
    )

    // 8. Стоимость материалов (чернила + бумага)
    const materialsCost = calculateMaterialsCost(consumption)

    // 9. Специфично для режима ткани: стоимость самой ткани
    let fabricBaseCost = 0
    if (calculationMode === 'fabric' && fabricParams) {
        const fabricPriceM2 = SUBLIMATION_FABRIC_PRICES[fabricParams.fabricType] || 0
        fabricBaseCost = (fabricParams.widthM * fabricParams.lengthM * fabricParams.quantity) * fabricPriceM2
        
        // Добавляем ткань в расход
        consumption.push({
            key: 'fabric',
            name: 'Ткань',
            value: fabricParams.widthM * fabricParams.lengthM * fabricParams.quantity,
            unit: 'м²',
        })
    }

    // 10. Итоговая сумма
    const totalCost = printCostTotal + totalPlacementCost + materialsCost + totalBlanksCost + fabricBaseCost

    // 11. Статистика цен за принт
    const costStats = calculateCostStats(sections)

    // 12. Эффективность использования бумаги
    const efficiencyPercent = calculateEfficiency(
      layoutDetails.printsAreaM2,
      layoutDetails.totalAreaM2
    )

    return {
      sections,
      totalPrints: totalPrints,
      totalLengthM: totalLengthM,
      totalAreaM2: layoutDetails.totalAreaM2,
      printsAreaM2: layoutDetails.printsAreaM2,
      efficiencyPercent,
      pricePerMeter,
      printCost: printCostTotal,
      placementCost: totalPlacementCost,
      materialsCost: materialsCost + fabricBaseCost, // Ткань входит в материалы
      blanksCost: totalBlanksCost,
      totalCost,
      avgCostPerPrint: costStats.avgCostPerPrint,
      minCostPerPrint: costStats.minCostPerPrint,
      maxCostPerPrint: costStats.maxCostPerPrint,
      consumption
    }
  }, [groups, params, meterPricing, placements, consumablesConfig, calculationMode, fabricParams])
}
