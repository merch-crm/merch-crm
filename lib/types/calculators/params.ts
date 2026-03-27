import { UrgencySettings } from './specific';
import { LayoutSettings } from './layout';
import { CostBreakdown } from './results';

/**
 * Параметры расчёта (полный снимок для истории)
 */
export interface CalculationParameters {
  /** Процент маржи */
  marginPercent: number;
  /** Настройки срочности */
  urgency: UrgencySettings;
  /** Конфигурация расходников */
  consumables?: {
    items: Array<{
      name: string;
      pricePerUnit: number;
      consumptionPerUnit: number;
      consumptionUnit: string;
    }>;
  };
  /** Выбранные нанесения */
  placements?: Array<{
    areaId: string;
    productName: string;
    areaName: string;
    workPrice: number;
    count: number;
  }>;
  /** Детализация себестоимости */
  costBreakdown: CostBreakdown;
  /** Настройки раскладки (если есть) */
  layoutSettings?: LayoutSettings;
  /** Специфичные параметры по типу калькулятора */
  specificParams?: Record<string, unknown>;
  /** Общие параметры (для истории и PDF) */
  width?: number;
  height?: number;
  printArea?: number;
  filmLength?: number;
  stitchCount?: number;
  colorCount?: number;
  filmType?: string;
  finishType?: string;
  garmentColor?: string;
  pretreatmentType?: string;
  printResolution?: string | number;
  whiteUnderbase?: boolean;
  whitePassCount?: number;
  /** Тренды/Опции (опционально) */
  urgencyLevel?: string;
  surcharge?: number;
}
