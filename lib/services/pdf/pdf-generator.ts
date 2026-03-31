import { jsPDF } from 'jspdf';
import {
  CalculationHistoryItem,
  CalculationResult,
} from '@/lib/types/calculators';
import { BrandingSettings } from '@/lib/types/branding';
import { PDFGenerationOptions, PDFCalculationData } from '@/lib/types/pdf';
import * as DrawUtils from './pdf-draw-utils';
import * as CalcRenderer from './renderers/calculator-renderer';
import * as BusinessRenderer from './renderers/business-renderer';
import { getCalculationName } from './pdf-utils';

/**
 * Сервис для генерации PDF-документов расчётов (полная версия)
 */
export class PDFGenerator {
  private doc: jsPDF;
  private settings: BrandingSettings;
  private options: Partial<PDFGenerationOptions>;

  constructor(settings: BrandingSettings, options: Partial<PDFGenerationOptions> = {}) {
    this.settings = settings;
    this.options = options;
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    DrawUtils.registerFonts(this.doc);
  }

  /**
   * Универсальный метод для генерации (совместимость с API)
   */
  async generate(data: PDFCalculationData): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
    try {
      // Для совместимости с API: используем данные напрямую если они соответствуют структуре
      // В реальном приложении здесь может быть дополнительная валидация
      const result = await this.generateCalculationPDF(data as unknown as CalculationHistoryItem, data.totals as unknown as CalculationResult);
      const filename = `Calculation_${data.number || '001'}.pdf`;
      
      return { success: true, blob: result, filename };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Генерирует PDF для результата расчёта
   */
  async generateCalculationPDF(
    historyItem: CalculationHistoryItem,
    result: CalculationResult
  ): Promise<Blob> {
    const { doc, settings } = this;
    const name = getCalculationName(historyItem);

    // 1. Заголовок и Брендинг
    DrawUtils.drawHeader(doc, settings, name, historyItem.calculationNumber || String(historyItem.id || ''));

    // 2. Основная информация
    let currentY = 60;
    currentY = CalcRenderer.renderMainInfo(doc, currentY, historyItem, result);

    // 3. Таблица расходников
    currentY = CalcRenderer.renderConsumablesTable(doc, currentY, result);

    // 4. Таблица нанесений
    currentY = CalcRenderer.renderPlacementsTable(doc, currentY, result);

    // 5. Итоговый блок
    CalcRenderer.renderTotalBlock(doc, currentY, result);

    // 6. Подвал
    DrawUtils.drawFooter(doc, settings);

    return doc.output('blob');
  }

  /**
   * Генерирует коммерческое предложение (КП)
   */
  async generateQuotePDF(
    items: Array<{ historyItem: CalculationHistoryItem; result: CalculationResult }>
  ): Promise<Blob> {
    const { doc, settings } = this;

    DrawUtils.drawHeader(doc, settings, 'Коммерческое предложение', `CP-${new Date().getFullYear()}`);

    let currentY = 60;

    for (const item of items) {
      if (currentY > 230) {
        doc.addPage();
        DrawUtils.drawHeader(doc, settings, 'Коммерческое предложение', '');
        currentY = 60;
      }

      currentY = BusinessRenderer.renderQuoteItem(doc, currentY, item.historyItem, item.result);
      currentY += 10;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.result.sellingPrice, 0);
    BusinessRenderer.renderQuoteTotal(doc, currentY, totalAmount);

    DrawUtils.drawFooter(doc, settings);

    return doc.output('blob');
  }
}
