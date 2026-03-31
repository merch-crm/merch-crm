/**
 * @fileoverview Утилиты форматирования
 * @module lib/utils/format
 * @audit Создан 2026-03-25
 */

/**
 * Форматирует число как валюту (рубли)
 * @param value - Числовое значение
 * @param currency - Код валюты (по умолчанию RUB)
 * @returns Отформатированная строка
 */
export function formatCurrency(
  value: number,
  currency: string = 'RUB'
): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Форматирует число с разделителями разрядов
 * @param value - Числовое значение
 * @returns Отформатированная строка
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

/**
 * Склоняет слово в зависимости от числа
 * @param count - Число
 * @param one - Форма для 1 (файл)
 * @param few - Форма для 2-4 (файла)
 * @param many - Форма для 5+ (файлов)
 * @returns Строка с числом и словом
 */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;

  if (n > 10 && n < 20) {
    return `${count} ${many}`;
  }
  if (n1 > 1 && n1 < 5) {
    return `${count} ${few}`;
  }
  if (n1 === 1) {
    return `${count} ${one}`;
  }
  return `${count} ${many}`;
}

/**
 * Форматирует размер файла
 * @param bytes - Размер в байтах
 * @returns Отформатированная строка (КБ, МБ)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * Форматирует размеры (ширина × высота)
 * @param width - Ширина в мм
 * @param height - Высота в мм
 * @param unit - Единица измерения (мм или см)
 * @returns Отформатированная строка
 */
export function formatDimensions(
  width: number,
  height: number,
  unit: 'mm' | 'cm' = 'mm'
): string {
  if (unit === 'cm') {
    return `${(width / 10).toFixed(1)} × ${(height / 10).toFixed(1)} см`;
  }
  return `${width} × ${height} мм`;
}
