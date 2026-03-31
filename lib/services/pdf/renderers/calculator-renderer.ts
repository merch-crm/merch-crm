import { jsPDF } from 'jspdf';
import {
  CalculationHistoryItem,
  CalculationResult,
} from '@/lib/types/calculators';
import { formatCurrency, formatNumber } from '../pdf-utils';

/**
 * Отрисовывает основную информацию о расчёте
 */
export function renderMainInfo(
  doc: jsPDF,
  startY: number,
  historyItem: CalculationHistoryItem,
  result: CalculationResult
): number {
  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(14);
  doc.text('Детали расчёта', 20, startY);

  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  const info = [
    ['Тип производства:', result.calculatorType],
    ['Количество:', `${formatNumber(result.quantity)} шт.`],
    ['Клиент:', historyItem.clientName || 'Не указан'],
  ];

  let currentY = startY + 10;
  info.forEach(([label, value]) => {
    doc.text(label, 20, currentY);
    doc.text(String(value), 60, currentY);
    currentY += 7;
  });

  return currentY + 5;
}

/**
 * Отрисовывает таблицу расходников
 */
export function renderConsumablesTable(
  doc: jsPDF,
  startY: number,
  result: CalculationResult
): number {
  if (!result.consumables || result.consumables.length === 0) return startY;

  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Материалы и расходники', 20, startY);

  let currentY = startY + 8;
  
  // Header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, currentY, 170, 8, 'F');
  doc.setFontSize(9);
  doc.text('Наименование', 22, currentY + 5);
  doc.text('Расход', 100, currentY + 5);
  doc.text('Цена ед.', 130, currentY + 5);
  doc.text('Сумма', 165, currentY + 5);

  currentY += 8;
  doc.setFont('Roboto-Regular', 'normal');

  result.consumables.forEach((item) => {
    doc.text(item.name, 22, currentY + 5);
    doc.text(`${formatNumber(item.consumption)} ${item.unit}`, 100, currentY + 5);
    doc.text(formatCurrency(item.pricePerUnit), 130, currentY + 5);
    doc.text(formatCurrency(item.cost), 165, currentY + 5);
    currentY += 7;
  });

  return currentY + 5;
}

/**
 * Отрисовывает таблицу нанесений
 */
export function renderPlacementsTable(
  doc: jsPDF,
  startY: number,
  result: CalculationResult
): number {
  if (!result.placements || result.placements.length === 0) return startY;

  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(12);
  doc.text('Зоны нанесения', 20, startY);

  let currentY = startY + 8;

  // Header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, currentY, 170, 8, 'F');
  doc.setFontSize(9);
  doc.text('Изделие / Зона', 22, currentY + 5);
  doc.text('Кол-во', 100, currentY + 5);
  doc.text('Цена ед.', 130, currentY + 5);
  doc.text('Сумма', 165, currentY + 5);

  currentY += 8;
  doc.setFont('Roboto-Regular', 'normal');

  result.placements.forEach((item) => {
    doc.text(`${item.productName} (${item.areaName})`, 22, currentY + 5);
    doc.text(`${formatNumber(item.quantity)} шт.`, 100, currentY + 5);
    doc.text(formatCurrency(item.pricePerUnit), 130, currentY + 5);
    doc.text(formatCurrency(item.cost), 165, currentY + 5);
    currentY += 7;
  });

  return currentY + 5;
}

/**
 * Отрисовывает итоговый блок расчёта
 */
export function renderTotalBlock(
  doc: jsPDF,
  startY: number,
  result: CalculationResult
): number {
  let currentY = startY + 10;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, currentY, 190, currentY);
  currentY += 10;

  doc.setFont('Roboto-Bold', 'bold');
  doc.setFontSize(12);
  doc.text('ИТОГО:', 120, currentY);
  
  doc.setFontSize(14);
  const totalText = formatCurrency(result.sellingPrice);
  const totalWidth = doc.getTextWidth(totalText);
  doc.text(totalText, 190 - totalWidth, currentY);

  currentY += 7;
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Цена за единицу: ${formatCurrency(result.pricePerItem)}`, 120, currentY);

  return currentY + 10;
}
