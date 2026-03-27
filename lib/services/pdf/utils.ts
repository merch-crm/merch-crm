import { PDFGenerator } from './pdf-generator';
import type { 
  PDFCalculationData, 
  PDFGenerationOptions
} from '@/lib/types/pdf';
import type { CalculationHistoryItem } from '@/lib/types/calculators';
import { getBrandingSettings } from '@/lib/actions/branding';
import { toast } from 'sonner';

/**
 * Преобразует элемент истории в данные для PDF
 */
export function mapHistoryItemToPDFData(item: CalculationHistoryItem): PDFCalculationData {
  return {
    number: item.calculationNumber || item.number,
    name: item.name,
    calculatorType: item.calculatorType,
    date: new Date(item.createdAt),
    clientName: item.clientName || undefined,
    comment: item.comment || undefined,
    layoutSvg: item.layoutSvg || undefined,
    parameters: {
      quantity: item.quantity,
      width: item.parameters.width,
      height: item.parameters.height,
      printArea: item.parameters.printArea,
      filmLength: item.parameters.filmLength,
      stitchCount: item.parameters.stitchCount,
      colorCount: item.parameters.colorCount,
      filmType: item.parameters.filmType,
      finishType: item.parameters.finishType,
      isUrgent: item.parameters.urgency?.level === 'urgent',
      urgencySurcharge: item.parameters.urgency?.surcharge,
      garmentColor: item.parameters.garmentColor,
      pretreatmentType: item.parameters.pretreatmentType,
      printResolution: item.parameters.printResolution?.toString(),
      whiteUnderbase: item.parameters.whiteUnderbase,
    },
    consumables: (item.consumables || []).map(c => ({
      name: c.name,
      pricePerUnit: c.pricePerUnit,
      consumptionPerUnit: c.consumptionPerUnit,
      unit: c.unit,
      cost: c.cost,
    })),
    placements: (item.placements || []).map(p => ({
      productName: p.productName,
      zoneName: p.zoneName,
      quantity: p.quantity,
      pricePerUnit: p.pricePerUnit,
      cost: p.cost,
    })),
    designFiles: (item.designFiles || []).map(f => ({
      name: f.originalName,
      dimensions: f.userDimensions 
        ? `${f.userDimensions.widthMm}×${f.userDimensions.heightMm} мм`
        : f.dimensions ? `${f.dimensions.width}×${f.dimensions.height} мм` : '—',
      quantity: f.quantity,
      thumbnail: f.thumbnailUrl,
    })),
    totals: {
      costPrice: item.costPrice || item.totalCost,
      sellingPrice: item.sellingPrice,
      marginPercent: item.marginPercent,
      pricePerItem: item.pricePerItem,
      consumablesCost: item.consumablesCost || 0,
      placementsCost: item.placementsCost || 0,
      urgencySurcharge: item.urgencySurcharge || 0,
    }
  };
}

/**
 * Генерирует PDF и инициирует скачивание в браузере
 */
export async function generateAndDownloadPDF(
  data: PDFCalculationData,
  options: Partial<PDFGenerationOptions> = {}
) {
  try {
    // 1. Получаем настройки брендинга
    const brandingResult = await getBrandingSettings();
    
    if (!brandingResult.success || !brandingResult.data) {
      toast.error('Не удалось загрузить настройки брендинга');
      return;
    }

    // 2. Создаем генератор
    const generator = new PDFGenerator(brandingResult.data, options);

    // 3. Генерируем
    toast.loading('Генерация PDF...', { id: 'pdf-gen' });
    const result = await generator.generate(data);
    
    if (!result.success || !result.blob) {
      toast.error(result.error || 'Ошибка при генерации PDF', { id: 'pdf-gen' });
      return;
    }

    // 4. Скачиваем
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename || `calculation-${data.number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('PDF успешно скачан', { id: 'pdf-gen' });
  } catch (error) {
    console.error('Ошибка при генерации/скачивании PDF:', error);
    toast.error('Произошла непредвиденная ошибка', { id: 'pdf-gen' });
  }
}
