'use client'

import { useMemo } from 'react'
import {
  EMBROIDERY_GARMENTS,
  EMBROIDERY_POSITIONS,
  EMBROIDERY_STITCH_PRICING,
  EMBROIDERY_DIGITIZING_PRICING,
  EMBROIDERY_QUANTITY_DISCOUNTS,
  estimateThreadConsumption,
  type EmbroideryDesign,
  type EmbroideryPrintInput,
  type EmbroideryCalculationResult
} from '../../types'

export function useEmbroideryCalculator(
  designs: EmbroideryDesign[],
  orders: EmbroideryPrintInput[]
) {
  const result = useMemo((): EmbroideryCalculationResult => {
    if ((orders || []).length === 0) {
      return {
        orders: [],
        totalGarmentCost: 0,
        totalEmbroideryCost: 0,
        totalDigitizingCost: 0,
        totalSetupCost: 0,
        totalExtraColorsCost: 0,
        totalThreadConsumption: 0,
        totalStitches: 0,
        totalQuantity: 0,
        discountPercent: 0,
        discountAmount: 0,
        totalCostBeforeDiscount: 0,
        totalCost: 0,
        avgCostPerItem: 0
      }
    }

    // 1. Расчет стоимости дигитайзинга
    let totalDigitizingCost = 0
    const processedDesigns = new Set<string>();
    
    (orders || []).forEach((order: EmbroideryPrintInput) => {
      order.positions.forEach((pos) => {
        const design = designs.find(d => d.id === pos.designId)
        if (design && design.hasDigitizing && !processedDesigns.has(design.id)) {
          const pricing = [...EMBROIDERY_DIGITIZING_PRICING]
            .sort((a, b) => a.maxStitches - b.maxStitches)
            .find(p => design.stitchCount <= p.maxStitches)
          
          totalDigitizingCost += pricing ? pricing.price : EMBROIDERY_DIGITIZING_PRICING[EMBROIDERY_DIGITIZING_PRICING.length - 1].price
          processedDesigns.add(design.id)
        }
      })
    })

    // 2. Расчет по каждому заказу
    let totalGarmentCost = 0
    let totalEmbroideryCost = 0
    let totalSetupCost = 0
    let totalExtraColorsCost = 0
    let totalThreadConsumption = 0
    let totalStitches = 0
    let totalQuantity = 0

    const orderResults = (orders || []).map(order => {
      const garment = EMBROIDERY_GARMENTS.find(g => g.id === order.garmentId)!
      const quantity = order.quantity
      totalQuantity += quantity

      const orderGarmentCost = garment.basePrice * quantity
      let orderTotalEmbroideryPrice = 0
      let orderTotalSetupPrice = 0
      let orderExtraColorsCost = 0
      let orderStitches = 0
      let orderThreadConsumption = 0
      let orderTotalColors = 0

      const positionResults = order.positions.map(pos => {
        const position = EMBROIDERY_POSITIONS.find(p => p.id === pos.positionId)!
        const design = designs.find(d => d.id === pos.designId)!

        if (!design) {
           return null
        }

        const pricing = [...EMBROIDERY_STITCH_PRICING]
          .sort((a, b) => b.minStitches - a.minStitches)
          .find(p => design.stitchCount >= p.minStitches)
        
        const basePricePer1000 = pricing ? pricing.pricePerThousand : EMBROIDERY_STITCH_PRICING[0].pricePerThousand
        
        const densityFactor = design.density === 'light' ? 0.9 : 
                             design.density === 'medium' ? 1.0 :
                             design.density === 'heavy' ? 1.2 : 1.4
        
        const threadFactor = design.threadType === 'metallic' ? 1.5 :
                            design.threadType === 'glow' ? 1.8 : 1.0

        const pricePerItem = (design.stitchCount / 1000) * basePricePer1000 * densityFactor * threadFactor
        const totalEmbroideryPrice = pricePerItem * quantity

        orderTotalEmbroideryPrice += totalEmbroideryPrice
        orderTotalSetupPrice += position.setupPrice
        orderStitches += design.stitchCount * quantity
        orderThreadConsumption += estimateThreadConsumption(design.stitchCount) * quantity
        orderTotalColors += design.colorsCount

        return {
          position,
          design,
          setupCost: position.setupPrice,
          embroideryPricePerItem: pricePerItem,
          totalEmbroideryPrice
        }
      }).filter((p): p is NonNullable<typeof p> => p !== null)

      // Доплата за цвета
      const extraColorsCount = Math.max(0, orderTotalColors - garment.maxColors)
      if (extraColorsCount > 0) {
        orderExtraColorsCost = extraColorsCount * 50 * quantity
      }

      const orderTotalCost = orderGarmentCost + orderTotalEmbroideryPrice + orderTotalSetupPrice + orderExtraColorsCost

      totalGarmentCost += orderGarmentCost
      totalEmbroideryCost += orderTotalEmbroideryPrice
      totalSetupCost += orderTotalSetupPrice
      totalExtraColorsCost += orderExtraColorsCost
      totalStitches += orderStitches
      totalThreadConsumption += orderThreadConsumption

      return {
        garment,
        quantity,
        positions: positionResults,
        garmentCost: orderGarmentCost,
        totalEmbroideryPrice: orderTotalEmbroideryPrice,
        totalSetupPrice: orderTotalSetupPrice,
        extraColorsCost: orderExtraColorsCost,
        totalCost: orderTotalCost,
        costPerItem: orderTotalCost / quantity
      }
    })

    const totalCostBeforeDiscount = totalGarmentCost + totalEmbroideryCost + totalSetupCost + totalExtraColorsCost + totalDigitizingCost

    const discountTier = [...EMBROIDERY_QUANTITY_DISCOUNTS]
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find(d => totalQuantity >= d.minQuantity)
    
    const discountPercent = discountTier ? discountTier.discount : 0
    const discountAmount = totalCostBeforeDiscount * (discountPercent / 100)
    const totalCost = totalCostBeforeDiscount - discountAmount

    return {
      orders: orderResults,
      totalQuantity,
      totalStitches,
      totalDigitizingCost,
      totalGarmentCost,
      totalSetupCost,
      totalEmbroideryCost,
      totalExtraColorsCost,
      totalThreadConsumption,
      discountPercent,
      discountAmount,
      totalCostBeforeDiscount,
      totalCost,
      avgCostPerItem: totalQuantity > 0 ? totalCost / totalQuantity : 0
    }
  }, [designs, orders])

  return result
}
