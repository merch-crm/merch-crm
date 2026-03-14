'use client'

import { useMemo } from 'react'
import {
  type DtgPrintInput,
  type DtgCalculationResult,
  type ConsumablesConfigData,
  type ConsumptionItem,
  DTG_GARMENTS,
  DTG_PRINT_POSITIONS,
  DTG_PRICE_LEVELS,
  DTG_INK_CONSUMPTION
} from '../../types'

interface UseDtgCalculatorParams {
  orders: DtgPrintInput[]
  _consumablesConfig?: ConsumablesConfigData
}

// Получение цены за см² в зависимости от площади
function getPricePerCm2(areaCm2: number, isDark: boolean): number {
  const level = DTG_PRICE_LEVELS.find(l => 
    areaCm2 >= l.minAreaCm2 && (l.maxAreaCm2 === null || areaCm2 < l.maxAreaCm2)
  )
  
  if (!level) {
    const lastLevel = DTG_PRICE_LEVELS[DTG_PRICE_LEVELS.length - 1]
    return isDark ? lastLevel.pricePerCm2Dark : lastLevel.pricePerCm2Light
  }
  
  return isDark ? level.pricePerCm2Dark : level.pricePerCm2Light
}

export function useDtgCalculator({
  orders,
  _consumablesConfig: _consumablesConfig
}: UseDtgCalculatorParams): DtgCalculationResult | null {
  return useMemo(() => {
    // Фильтруем валидные заказы
    const validOrders = (orders || []).filter(o => 
      o.positions.length > 0 && o.quantity > 0
    )

    if (validOrders.length === 0) {
      return null
    }

    let totalInkCmyk = 0
    let totalInkWhite = 0
    let totalPrimer = 0

    const items = validOrders.map(order => {
      const garment = DTG_GARMENTS.find(g => g.id === order.garmentId)
      if (!garment) return null

      const isDark = order.garmentColor === 'dark'

      // Расчёт позиций
      const positionResults = order.positions.map(pos => {
        const position = DTG_PRINT_POSITIONS.find(p => p.id === pos.positionId)
        if (!position) return null

        const areaCm2 = (pos.widthMm * pos.heightMm) / 100
        const areaM2 = areaCm2 / 10000

        // Цена печати за площадь
        const pricePerCm2 = getPricePerCm2(areaCm2, isDark)
        const printCost = areaCm2 * pricePerCm2

        // Стоимость работы
        const workCost = position.workPrice

        // Расход чернил
        const fillPercent = (pos.fillPercent || 60) / 100
        totalInkCmyk += areaM2 * DTG_INK_CONSUMPTION.cmyk * fillPercent * order.quantity
        
        if (isDark) {
          totalInkWhite += areaM2 * DTG_INK_CONSUMPTION.white * fillPercent * order.quantity
          totalPrimer += areaM2 * DTG_INK_CONSUMPTION.primer * order.quantity
        }

        return {
          position,
          areaCm2,
          printCost,
          workCost
        }
      }).filter((p): p is NonNullable<typeof p> => p !== null)

      // Суммарные стоимости по заказу
      const totalPrintCost = positionResults.reduce((sum, p) => sum + p.printCost, 0) * order.quantity
      const totalWorkCost = positionResults.reduce((sum, p) => sum + p.workCost, 0) * order.quantity
      const garmentCost = garment.basePrice * order.quantity
      
      // Праймер для тёмных тканей
      const totalAreaM2 = positionResults.reduce((sum, p) => sum + p.areaCm2 / 10000, 0)
      const primerCost = isDark ? totalAreaM2 * 50 * order.quantity : 0 // 50₽ за м² праймера

      const totalCost = garmentCost + totalPrintCost + totalWorkCost + primerCost
      const costPerItem = totalCost / order.quantity

      return {
        garment,
        garmentColor: order.garmentColor,
        quantity: order.quantity,
        positions: positionResults,
        garmentCost,
        printCost: totalPrintCost,
        workCost: totalWorkCost,
        primerCost,
        totalCost,
        costPerItem
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    // Итоговые суммы
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalGarmentCost = items.reduce((sum, item) => sum + item.garmentCost, 0)
    const totalPrintCost = items.reduce((sum, item) => sum + item.printCost, 0)
    const totalWorkCost = items.reduce((sum, item) => sum + item.workCost, 0)
    const totalPrimerCost = items.reduce((sum, item) => sum + item.primerCost, 0)
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
    const avgCostPerItem = totalCost / totalQuantity

    // Формируем расход материалов
    const consumption: ConsumptionItem[] = [
      {
        key: 'ink_cmyk',
        name: 'Чернила CMYK',
        value: totalInkCmyk,
        unit: 'мл',
        color: '#8b5cf6'
      }
    ]

    if (totalInkWhite > 0) {
      consumption.push({
        key: 'ink_white', // Исправлено type -> key для соответствия интерфейсу
        name: 'Чернила белые',
        value: totalInkWhite,
        unit: 'мл',
        color: '#e2e8f0'
      })
    }

    if (totalPrimer > 0) {
      consumption.push({
        key: 'primer',
        name: 'Праймер',
        value: totalPrimer,
        unit: 'мл',
        color: '#f59e0b'
      })
    }

    return {
      items,
      totalQuantity,
      totalGarmentCost,
      totalPrintCost,
      totalWorkCost,
      totalPrimerCost,
      totalCost,
      avgCostPerItem,
      consumption
    }
  }, [orders])
}
