"use client";

import { useMemo } from "react";
import {
 type EmbroideryDesign,
 type EmbroideryPrintInput,
 type EmbroideryCalculationResult,
 EMBROIDERY_STITCH_PRICING,
 EMBROIDERY_DIGITIZING_PRICING,
 EMBROIDERY_QUANTITY_DISCOUNTS,
 EMBROIDERY_GARMENTS,
 EMBROIDERY_POSITIONS,
 EMBROIDERY_THREAD_TYPES,
 EMBROIDERY_DENSITIES,
 estimateThreadConsumption
} from "../../embroidery-types";

export function useEmbroideryCalculator(
 designs: EmbroideryDesign[],
 orders: EmbroideryPrintInput[]
): EmbroideryCalculationResult | null {
 return useMemo(() => {
  if (!designs?.length || !orders?.length) return null;

  let totalGarmentCost = 0;
  let totalEmbroideryCost = 0;
  let totalDigitizingCost = 0;
  let totalSetupCost = 0;
  let totalExtraColorsCost = 0;
  let totalStitches = 0;
  let totalQuantity = 0;

  // Сначала считаем общую статистику
  (orders || []).forEach(order => {
   const garment = EMBROIDERY_GARMENTS.find(g => g.id === order.garmentId);
   if (!garment) return;

   totalQuantity += order.quantity;
   totalGarmentCost += garment.basePrice * order.quantity;

   order.positions.forEach(pos => {
    const design = designs.find(d => d.id === pos.designId);
    const position = EMBROIDERY_POSITIONS.find(p => p.id === pos.positionId);
    if (!design || !position) return;

    const stitchesCount = design.stitchCount;
    totalStitches += stitchesCount * order.quantity;

    // Цена за стежки (прогрессивная)
    const pricingTier = EMBROIDERY_STITCH_PRICING.find(
     t => stitchesCount >= t.minStitches && (t.maxStitches === null || stitchesCount < t.maxStitches)
    );
    const pricePerThousand = pricingTier?.pricePerThousand || 25;
    let embroideryCost = (stitchesCount / 1000) * pricePerThousand;

    // Учёт типа ниток
    const threadType = EMBROIDERY_THREAD_TYPES.find(t => t.id === design.threadType);
    embroideryCost *= (threadType?.priceMultiplier || 1);

    // Учёт плотности
    const density = EMBROIDERY_DENSITIES.find(d => d.id === design.density);
    embroideryCost *= (density?.priceMultiplier || 1);

    totalEmbroideryCost += embroideryCost * order.quantity;

    // Доп. цвета
    if (design.colorsCount > garment.maxColors) {
     const extraColors = design.colorsCount - garment.maxColors;
     const extraCost = extraColors * 20; // Условно 20р за доп цвет
     totalExtraColorsCost += extraCost * order.quantity;
    }

    // Приладка (setup)
    totalSetupCost += position.setupPrice;
   });
  });

  // Дигитайзинг (считаем один раз для каждого уникального дизайна в заказе)
  const uniqueDesignIds = new Set<string>();
  (orders || []).forEach(o => o.positions.forEach(p => uniqueDesignIds.add(p.designId)));

  uniqueDesignIds.forEach(id => {
   const design = designs.find(d => d.id === id);
   if (design?.hasDigitizing) {
    const digiTier = EMBROIDERY_DIGITIZING_PRICING.find(
     t => design.stitchCount <= t.maxStitches
    ) || EMBROIDERY_DIGITIZING_PRICING[EMBROIDERY_DIGITIZING_PRICING.length - 1];
    totalDigitizingCost += digiTier.price;
   }
  });

  const totalCostBeforeDiscount = totalGarmentCost + totalEmbroideryCost + totalDigitizingCost + totalSetupCost + totalExtraColorsCost;

  // Скидка за тираж
  const discountTier = [...EMBROIDERY_QUANTITY_DISCOUNTS]
   .sort((a, b) => (b.minQuantity || 0) - (a.minQuantity || 0))
   .find(d => totalQuantity >= (d.minQuantity || 0));
  
  const discountPercent = discountTier?.discount || 0;
  const discountAmount = (totalEmbroideryCost + totalExtraColorsCost) * (discountPercent / 100);

  const totalCost = totalCostBeforeDiscount - discountAmount;
  const avgCostPerItem = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  const totalThreadConsumption = estimateThreadConsumption(totalStitches);

  return {
   orders,
   totalCost: Math.round(totalCost),
   avgCostPerItem: Math.round(avgCostPerItem),
   totalDigitizingCost: Math.round(totalDigitizingCost),
   totalEmbroideryCost: Math.round(totalEmbroideryCost),
   totalGarmentCost: Math.round(totalGarmentCost),
   totalSetupCost: Math.round(totalSetupCost),
   totalExtraColorsCost: Math.round(totalExtraColorsCost),
   totalCostBeforeDiscount: Math.round(totalCostBeforeDiscount),
   discountAmount: Math.round(discountAmount),
   discountPercent,
   totalQuantity,
   totalStitches,
   totalThreadConsumption: Math.round(totalThreadConsumption),
   threadConsumption: {
    totalThreadMeters: Math.round(totalThreadConsumption)
   }
  };
 }, [designs, orders]);
}
