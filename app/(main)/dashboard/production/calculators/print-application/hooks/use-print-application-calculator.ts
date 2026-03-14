import { useMemo } from 'react'
import {
  PrintItem,
  PrintApplicationInput,
  PrintApplicationResult,
  PRINT_TYPES,
  PRINT_SIZES,
  APPLICATION_POSITIONS,
  PRINT_APPLICATION_QUANTITY_DISCOUNTS,
  DEFAULT_PRINT_APPLICATION_PARAMS,
} from '../../types'

interface UsePrintApplicationCalculatorProps {
  prints: PrintItem[]
  orders: PrintApplicationInput[]
  includeGarments: boolean
  isRush: boolean
}

export function usePrintApplicationCalculator({
  prints,
  orders,
  includeGarments,
  isRush,
}: UsePrintApplicationCalculatorProps): PrintApplicationResult | null {
  return useMemo(() => {
    // Фильтруем заказы с нанесениями
    const validOrders = (orders || []).filter(
      order => order.quantity > 0 && order.applications.length > 0
    )

    if (validOrders.length === 0) {
      return null
    }

    let totalGarmentsCost = 0
    let totalPrintsCost = 0
    let totalWorkCost = 0
    let totalSetupTime = 0
    let totalApplicationTime = 0
    let totalItems = 0
    let totalApplications = 0

    const breakdown: PrintApplicationResult['breakdown'] = []

    // Отслеживаем уникальные типы принтов для расчёта настройки
    const uniquePrintTypes = new Set<string>()

    for (const order of validOrders) {
      const garmentPrice = order.garmentPrice || 0
      const quantity = order.quantity
      
      totalItems += quantity
      
      const orderGarmentCost = includeGarments ? garmentPrice * quantity : 0
      totalGarmentsCost += orderGarmentCost

      const applicationDetails: PrintApplicationResult['breakdown'][0]['applications'] = []

      for (const app of order.applications) {
        totalApplications += quantity

        // Находим информацию о типе принта
        const printType = PRINT_TYPES.find(pt => pt.id === app.printType)
        const printSize = PRINT_SIZES.find(ps => ps.id === app.sizeId)
        const position = APPLICATION_POSITIONS.find(pos => pos.id === app.positionId)

        if (!printType || !printSize || !position) continue

        // Стоимость принтов
        const printCostPerItem = app.printPrice * quantity
        totalPrintsCost += printCostPerItem

        // Стоимость работы
        const baseWorkPrice = printType.baseWorkPrice
        const sizeMultiplier = printSize.priceMultiplier
        const difficultyMultiplier = position.difficultyMultiplier
        
        const workPricePerItem = baseWorkPrice * sizeMultiplier * difficultyMultiplier
        const workCostTotal = workPricePerItem * quantity
        totalWorkCost += workCostTotal

        // Время
        if (!uniquePrintTypes.has(printType.id)) {
          totalSetupTime += printType.setupTime
          uniquePrintTypes.add(printType.id)
        }
        totalApplicationTime += printType.applicationTime * quantity

        applicationDetails.push({
          position: position.name,
          printName: app.printName || 'Принт',
          printType: printType.name,
          printCost: app.printPrice,
          workCost: workPricePerItem,
        })
      }

      breakdown.push({
        garmentName: order.garmentName || 'Изделие',
        quantity,
        garmentTotal: orderGarmentCost,
        applications: applicationDetails,
        itemTotal: orderGarmentCost + 
          applicationDetails.reduce((sum, a) => sum + (a.printCost + a.workCost) * quantity, 0),
      })
    }

    // Стоимость настройки (фиксированная за заказ)
    const setupCost = uniquePrintTypes.size > 0 ? DEFAULT_PRINT_APPLICATION_PARAMS.setupFee : 0

    // Скидка за объём
    const discountTier = PRINT_APPLICATION_QUANTITY_DISCOUNTS.find(
      d => totalItems >= d.minQuantity && (d.maxQuantity === null || totalItems <= d.maxQuantity)
    ) || PRINT_APPLICATION_QUANTITY_DISCOUNTS[0]

    const subtotal = totalGarmentsCost + totalPrintsCost + totalWorkCost + setupCost
    const quantityDiscount = Math.round(subtotal * discountTier.discount / 100)
    
    // Итого до срочности
    let totalBeforeRush = subtotal - quantityDiscount
    
    // Множитель срочности
    if (isRush) {
      totalBeforeRush = Math.round(totalBeforeRush * DEFAULT_PRINT_APPLICATION_PARAMS.rushMultiplier)
    }

    // Минимальная сумма заказа
    const totalCost = Math.max(totalBeforeRush, DEFAULT_PRINT_APPLICATION_PARAMS.minOrderAmount)

    // Время в минутах
    const estimatedTime = totalSetupTime + totalApplicationTime

    return {
      totalCost,
      costPerItem: totalItems > 0 ? Math.round(totalCost / totalItems) : 0,
      
      garmentsCost: totalGarmentsCost,
      printsCost: totalPrintsCost,
      workCost: totalWorkCost,
      setupCost,
      
      quantityDiscount,
      discountPercent: discountTier.discount,
      
      totalItems,
      totalPrints: prints.length,
      totalApplications,
      
      estimatedTime,
      
      breakdown,
    }
  }, [prints, orders, includeGarments, isRush])
}
