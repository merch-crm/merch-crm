import { jsPDF } from 'jspdf';
import { CalculationHistoryItem, CalculationResult } from '@/lib/types/calculators';
import { formatCurrency } from '../pdf-utils';

/**
 * Отрисовывает позицию в коммерческом предложении
 */
export function renderQuoteItem(
  doc: jsPDF,
  startY: number,
  historyItem: CalculationHistoryItem,
  result: CalculationResult
): number {
  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(12);
  doc.text(historyItem.name, 20, startY);
  
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(10);
  doc.text(`Тип: ${result.calculatorType}`, 20, startY + 6);
  doc.text(`Количество: ${result.quantity} шт.`, 20, startY + 11);
  
  doc.setFont('Roboto-Bold', 'bold');
  const priceText = formatCurrency(result.sellingPrice);
  const priceWidth = doc.getTextWidth(priceText);
  doc.text(priceText, 190 - priceWidth, startY + 11);
  
  doc.setDrawColor(230, 230, 230);
  doc.line(20, startY + 15, 190, startY + 15);
  
  return startY + 20;
}

/**
 * Отрисовывает итоговый блок КП
 */
export function renderQuoteTotal(doc: jsPDF, startY: number, totalAmount: number): void {
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(120, startY, 70, 25, 3, 3, 'F');
  
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(10);
  doc.text('Итого к оплате:', 125, startY + 10);
  
  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(16);
  const totalText = formatCurrency(totalAmount);
  const totalWidth = doc.getTextWidth(totalText);
  doc.text(totalText, 185 - totalWidth, startY + 18);
}
