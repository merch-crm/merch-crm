'use client'

import { useMemo } from 'react'
import {
  type SilkscreenPrintInput,
  type SilkscreenCalculationResult,
  type InkType,
  SILKSCREEN_GARMENTS,
  SILKSCREEN_POSITIONS,
  SILKSCREEN_PRINT_SIZES,
  SILKSCREEN_INK_TYPES,
  SILKSCREEN_SCREEN_PRICING,
  SILKSCREEN_QUANTITY_DISCOUNTS
} from '../../types'

interface UseSilkscreenCalculatorParams {
  orders: SilkscreenPrintInput[]
  includeScreens: boolean
}

export function useSilkscreenCalculator({
  orders,
  includeScreens
}: UseSilkscreenCalculatorParams): SilkscreenCalculationResult | null {
  return useMemo(() => {
    // Фильтруем валидные заказы
    const validOrders = (orders || []).filter(o => 
      o.positions.length > 0 && o.quantity > 0
    )

    if (validOrders.length === 0) {
      return null
    }

    // Общее количество изделий
    const totalQuantity = validOrders.reduce((sum, o) => sum + o.quantity, 0)

    // Находим скидку за тираж
    const quantityDiscountInfo = SILKSCREEN_QUANTITY_DISCOUNTS.find(d => 
      totalQuantity >= d.minQuantity && (d.maxQuantity === null || totalQuantity <= d.maxQuantity)
    )
    const discountPercent = quantityDiscountInfo?.discount || 0

    // Общее количество цветов для ценообразования трафаретов
    const totalColorsCount = validOrders.reduce((sum, order) => 
      sum + order.positions.reduce((pSum, pos) => pSum + pos.colors.length, 0), 0
    )

    // Получаем цены трафаретов в зависимости от количества цветов
    const screenPricing = SILKSCREEN_SCREEN_PRICING.find(sp => sp.colorCount >= totalColorsCount) 
      || SILKSCREEN_SCREEN_PRICING[SILKSCREEN_SCREEN_PRICING.length - 1]
    
    if (!screenPricing) return null

    // Расчёт по позициям (аккумулируем для всех заказов)
    const positionsMap = new Map<string, {
      positionId: string
      positionName: string
      sizeId: string
      sizeName: string
      colorsCount: number
      colors: Array<{
        inkType: InkType
        inkName: string
        isUnderbase: boolean
        screenCost: number
        setupCost: number
        printCostPerItem: number
        totalPrintCost: number
      }>
      totalScreensCost: number
      totalSetupCost: number
      printCostPerItem: number
      totalPrintCost: number
    }>()

    let totalGarmentCost = 0
    let totalScreensCost = 0
    let totalSetupCost = 0
    let totalPrintCostBeforeDiscount = 0

    validOrders.forEach(order => {
      const garment = SILKSCREEN_GARMENTS.find(g => g.id === order.garmentId)
      if (!garment) return

      // Стоимость заготовок
      totalGarmentCost += garment.basePrice * order.quantity

      order.positions.forEach(pos => {
        const position = SILKSCREEN_POSITIONS.find(p => p.id === pos.positionId)
        const size = SILKSCREEN_PRINT_SIZES.find(s => s.id === pos.sizeId)
        if (!position || !size) return

        const posKey = `${pos.positionId}-${pos.sizeId}`

        // Расчёт по цветам
        const colorsResult = pos.colors.map(color => {
          const inkInfo = SILKSCREEN_INK_TYPES.find(i => i.id === color.inkType)
          const priceMultiplier = inkInfo?.priceMultiplier || 1

          // Стоимость трафарета (один раз на весь тираж)
          const screenCost = includeScreens ? screenPricing.screenPrice : 0
          
          // Приладка
          const setupCost = screenPricing.setupPrice + size.setupPrice
          
          // Стоимость печати за изделие
          const printCostPerItem = size.basePrice * priceMultiplier
          
          // Общая стоимость печати этого цвета
          const totalPrintCost = printCostPerItem * order.quantity

          return {
            inkType: color.inkType,
            inkName: inkInfo?.name || color.inkType,
            isUnderbase: color.isUnderbase,
            screenCost,
            setupCost,
            printCostPerItem,
            totalPrintCost
          }
        })

        // Аккумулируем или создаём позицию
        const existingPos = positionsMap.get(posKey)
        
        if (existingPos) {
          // Добавляем к существующей
          existingPos.colors.push(...colorsResult)
          existingPos.colorsCount += colorsResult.length
          existingPos.totalScreensCost += colorsResult.reduce((s, c) => s + c.screenCost, 0)
          existingPos.totalSetupCost += colorsResult.reduce((s, c) => s + c.setupCost, 0)
          existingPos.totalPrintCost += colorsResult.reduce((s, c) => s + c.totalPrintCost, 0)
          existingPos.printCostPerItem = existingPos.totalPrintCost / totalQuantity
        } else {
          positionsMap.set(posKey, {
            positionId: pos.positionId,
            positionName: position.name,
            sizeId: pos.sizeId,
            sizeName: size.name,
            colorsCount: colorsResult.length,
            colors: colorsResult,
            totalScreensCost: colorsResult.reduce((s, c) => s + c.screenCost, 0),
            totalSetupCost: colorsResult.reduce((s, c) => s + c.setupCost, 0),
            printCostPerItem: colorsResult.reduce((s, c) => s + c.printCostPerItem, 0),
            totalPrintCost: colorsResult.reduce((s, c) => s + c.totalPrintCost, 0)
          })
        }

        // Накапливаем общие суммы
        totalScreensCost += colorsResult.reduce((s, c) => s + c.screenCost, 0)
        totalSetupCost += colorsResult.reduce((s, c) => s + c.setupCost, 0)
        totalPrintCostBeforeDiscount += colorsResult.reduce((s, c) => s + c.totalPrintCost, 0)
      })
    })

    const positions = Array.from(positionsMap.values())

    // Применяем скидку к печати
    const discountAmount = (totalPrintCostBeforeDiscount * discountPercent) / 100
    const totalPrintCost = totalPrintCostBeforeDiscount - discountAmount

    // Итоговая стоимость
    const totalCost = totalGarmentCost + totalScreensCost + totalSetupCost + totalPrintCost
    const costPerItem = totalCost / totalQuantity

    return {
      positions,
      quantity: totalQuantity,
      garmentCost: totalGarmentCost,
      totalScreensCost,
      totalSetupCost,
      printCostBeforeDiscount: totalPrintCostBeforeDiscount,
      quantityDiscount: discountAmount,
      discountPercent,
      totalPrintCost,
      totalCost,
      costPerItem,
      breakdown: {
        garments: totalGarmentCost,
        screens: totalScreensCost,
        setup: totalSetupCost,
        printing: totalPrintCost,
        discount: discountAmount,
        total: totalCost
      }
    }
  }, [orders, includeScreens])
}
