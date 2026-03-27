import { CalculationHistoryItem } from '@/lib/types/calculators';

/**
 * Форматирует валюту для PDF
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматирует число для PDF
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}

/**
 * Получает название расчёта
 */
export function getCalculationName(historyItem: CalculationHistoryItem): string {
  return historyItem.name || `Расчёт #${historyItem.calculationNumber}`;
}

/**
 * Проверяет, нужно ли переносить контент на новую страницу
 */
export function shouldAddPage(currentY: number, neededHeight: number, limit: number = 270): boolean {
  return currentY + neededHeight > limit;
}
