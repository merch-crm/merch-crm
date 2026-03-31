/**
 * @fileoverview Утилиты для работы с размерами файлов и DPI
 * @module lib/utils/file-dimensions
 */

import { DEFAULT_DPI } from '@/lib/types/calculators';

/**
 * Пересчитывает пиксели в миллиметры
 * @param px - Размер в пикселях
 * @param dpi - Разрешение (по умолчанию 300)
 * @returns Размер в миллиметрах (округленный)
 */
export function calculateMmFromPx(px: number, dpi: number = DEFAULT_DPI): number {
  if (!px || px <= 0) return 0;
  return Math.round((px / dpi) * 25.4);
}

/**
 * Пересчитывает миллиметры в пиксели
 * @param mm - Размер в миллиметрах
 * @param dpi - Разрешение (по умолчанию 300)
 * @returns Размер в пикселях (округленный)
 */
export function calculatePxFromMm(mm: number, dpi: number = DEFAULT_DPI): number {
  if (!mm || mm <= 0) return 0;
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Рассчитывает DPI на основе пикселей и миллиметров
 * @param px - Размер в пикселях
 * @param mm - Размер в миллиметрах
 * @returns DPI (округленный)
 */
export function calculateDpi(px: number, mm: number): number | null {
  if (!px || !mm || mm <= 0) return null;
  return Math.round((px / mm) * 25.4);
}
