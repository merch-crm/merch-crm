/** Стандартное разрешение для печати */
export const DEFAULT_DPI = 300;

/** Коэффициент пересчета пикселей в мм (при 300 DPI: 25.4 / 300) */
export const PX_TO_MM_RATIO = 25.4 / DEFAULT_DPI;

/**
 * Типы калькуляторов
 */
export type CalculatorType =
  | 'dtf'
  | 'uv-dtf'
  | 'dtg'
  | 'sublimation'
  | 'embroidery'
  | 'silkscreen'
  | 'thermotransfer';

/**
 * Источник цены расходника
 */
export type ConsumableSource = 'warehouse' | 'manual';

/**
 * Уровень срочности
 */
export type UrgencyLevel = 'normal' | 'urgent';

/**
 * Позиция логотипа в PDF-документах
 */
export type LogoPosition = 'top-left' | 'top-right' | 'bottom-center';

/** Константы позиций логотипа */
export const LOGO_POSITIONS: Record<string, LogoPosition> = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_CENTER: 'bottom-center',
};

/**
 * Тип PDF-отчёта
 */
export type PDFReportType = 'internal' | 'client';
