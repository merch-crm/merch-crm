import type { CalculationHistoryItem } from '@/lib/types/calculators';
import type { PDFCalculationData } from '@/lib/types/pdf';

/**
 * Преобразует элемент истории в данные для PDF
 */
export function mapHistoryToPDFData(item: CalculationHistoryItem): PDFCalculationData {
  const params = item.parameters;
  
  // Маппинг расходников
  const consumablesList = Array.isArray(params.consumables) 
    ? params.consumables 
    : params.consumables?.items || [];
    
  const consumables = consumablesList.map((c: { name: string; pricePerUnit: number; consumptionPerUnit: number; consumptionUnit: string }) => ({
    name: c.name,
    pricePerUnit: c.pricePerUnit,
    consumptionPerUnit: c.consumptionPerUnit,
    unit: c.consumptionUnit,
    cost: c.pricePerUnit * c.consumptionPerUnit,
  }));

  // Маппинг нанесений
  const placements = params.placements?.map(p => ({
    productName: p.productName,
    zoneName: p.areaName,
    quantity: p.count,
    pricePerUnit: p.workPrice,
    cost: p.workPrice * p.count,
  })) || [];

  // Маппинг файлов дизайна
  const designFiles = item.designFiles?.map(f => ({
    name: f.originalName,
    dimensions: f.userDimensions 
      ? `${f.userDimensions.widthMm} × ${f.userDimensions.heightMm} мм` 
      : f.dimensions 
        ? `${f.dimensions.width} × ${f.dimensions.height} мм`
        : 'Не указано',
    quantity: f.quantity,
    thumbnail: f.thumbnailUrl,
  })) || [];

  return {
    number: item.calculationNumber,
    name: item.name,
    calculatorType: item.calculatorType as PDFCalculationData['calculatorType'],
    date: item.createdAt,
    clientName: item.clientName || undefined,
    parameters: {
      quantity: item.quantity,
      width: (params.specificParams?.widthMm as number) || (params.specificParams?.width as number),
      height: (params.specificParams?.heightMm as number) || (params.specificParams?.height as number),
      printArea: params.specificParams?.totalAreaM2 as number,
      filmLength: item.rollVisualization?.totalLengthM,
      stitchCount: params.specificParams?.stitchCount as number,
      colorCount: params.specificParams?.colorCount as number,
      filmType: params.specificParams?.filmType as string,
      finishType: params.specificParams?.finishType as string,
      isUrgent: params.urgency?.level === 'urgent',
      urgencySurcharge: params.urgency?.urgentSurcharge || params.urgency?.surcharge || 0,
    },
    consumables,
    placements,
    designFiles,
    totals: {
      costPrice: item.totalCost,
      marginPercent: item.marginPercent,
      sellingPrice: item.sellingPrice,
      pricePerItem: item.pricePerItem,
      consumablesCost: params.costBreakdown?.materials || 0,
      placementsCost: params.costBreakdown?.placements || 0,
      urgencySurcharge: params.urgency?.surcharge || params.urgency?.urgentSurcharge || 0,
    },
    layoutSvg: item.rollVisualization?.imageUrl,
    comment: item.comment || undefined,
  };
}
