import { CalculatorType, ConsumableSource } from './base';
import { ConsumablesConfig, DEFAULT_CONSUMABLES } from './items';

/**
 * Настройки срочности по умолчанию
 */
export interface UrgencyConfig {
  /** Процент наценки за Экспресс */
  expressMarkup: number;
  /** Процент наценки за Срочно */
  urgentMarkup: number;
}

/**
 * Настройки маржинальности
 */
export interface MarginConfig {
  /** Маржа по умолчанию (%) */
  defaultMargin: number;
}

/**
 * Вариант пленки или спец. настройки для печати (Унифицирован с расходниками)
 */
export interface PrintOption {
  id: string;
  name: string;
  /** Цена за единицу (погонный метр или штуку) */
  pricePerUnit: number;
  /** Единица измерения (м.п., м2, шт) */
  unit: string;
  /** Доплата к базовой цене (если используется как опция) */
  priceAddition: number; 
  /** Источник цены */
  source: ConsumableSource;
  /** Флаг по умолчанию */
  isDefault?: boolean;
  /** ID позиции на складе */
  warehouseItemId?: string;
  /** Название позиции на складе */
  warehouseItemName?: string;
}

/**
 * Общие специфичные настройки (цены оборудования, опции пленок)
 */
export interface PrintConfig {
  /** Цена за метр (DTF) или принт */
  basePrice?: number;
  /** Цена за настройку оборудования / подготовку */
  setupFee?: number;
  /** Минимальная стоимость заказа */
  minOrderFee?: number;
  /** Доступные типы пленок или материалов */
  filmTypes?: PrintOption[];
  /** Опции белого слоя (DTF/UV) */
  whiteLayerOptions?: PrintOption[];
  /** Опции резки */
  cuttingOptions?: PrintOption[];
  
}

/**
 * Полный объект настроек калькулятора (Global Settings)
 */
export interface GlobalCalculatorSettings {
  calculatorType: CalculatorType;
  consumablesConfig: ConsumablesConfig;
  urgencyConfig: UrgencyConfig;
  marginConfig: MarginConfig;
  printConfig: PrintConfig;
}

/**
 * Значения по умолчанию для разных типов
 */
export const DEFAULT_GLOBAL_SETTINGS: Record<CalculatorType, Omit<GlobalCalculatorSettings, 'calculatorType' | 'consumablesConfig'>> = {
  dtf: {
    urgencyConfig: { expressMarkup: 30, urgentMarkup: 50 },
    marginConfig: { defaultMargin: 30 },
    printConfig: {
      basePrice: 1200,
      setupFee: 200,
      minOrderFee: 300,
      filmTypes: [
        { id: 'standard', name: 'Стандартная (Корея)', pricePerUnit: 150, unit: 'м²', priceAddition: 0, source: 'manual', isDefault: true },
        { id: 'premium', name: 'Премиум', pricePerUnit: 300, unit: 'м²', priceAddition: 150, source: 'manual' },
        { id: 'glow', name: 'Светонакопительная', pricePerUnit: 650, unit: 'м²', priceAddition: 500, source: 'manual' },
        { id: 'uv', name: 'UV-трансфер', pricePerUnit: 950, unit: 'м²', priceAddition: 800, source: 'manual' },
      ],
      whiteLayerOptions: [
        { id: 'none', name: 'Без белого', pricePerUnit: 0, unit: 'м²', priceAddition: 0, source: 'manual' },
        { id: 'auto', name: 'Авто (под цвет)', pricePerUnit: 100, unit: 'м²', priceAddition: 100, source: 'manual', isDefault: true },
        { id: 'full', name: 'Полная заливка', pricePerUnit: 200, unit: 'м²', priceAddition: 200, source: 'manual' },
      ]
    }
  },
  'uv-dtf': {
    urgencyConfig: { expressMarkup: 30, urgentMarkup: 50 },
    marginConfig: { defaultMargin: 40 },
    printConfig: {
      basePrice: 2000,
      setupFee: 300,
      minOrderFee: 500,
      filmTypes: [
        { id: 'standard_ab', name: 'Стандартная AB', pricePerUnit: 200, unit: 'м²', priceAddition: 0, source: 'manual', isDefault: true }
      ]
    }
  },
  dtg: {
    urgencyConfig: { expressMarkup: 30, urgentMarkup: 50 },
    marginConfig: { defaultMargin: 40 },
    printConfig: {
      setupFee: 100,
      minOrderFee: 0,
    }
  },
  sublimation: {
    urgencyConfig: { expressMarkup: 20, urgentMarkup: 40 },
    marginConfig: { defaultMargin: 30 },
    printConfig: {}
  },
  embroidery: {
    urgencyConfig: { expressMarkup: 40, urgentMarkup: 70 },
    marginConfig: { defaultMargin: 50 },
    printConfig: {
      basePrice: 15, // за 1000 стежков
      setupFee: 500,
      minOrderFee: 500,
    }
  },
  silkscreen: {
    urgencyConfig: { expressMarkup: 30, urgentMarkup: 60 },
    marginConfig: { defaultMargin: 40 },
    printConfig: {
      setupFee: 500, // за матрицу
    }
  },
  thermotransfer: {
    urgencyConfig: { expressMarkup: 30, urgentMarkup: 50 },
    marginConfig: { defaultMargin: 30 },
    printConfig: {
      filmTypes: [
        { id: 'pu', name: 'Полиуретан (PU)', pricePerUnit: 400, unit: 'м²', priceAddition: 0, source: 'manual', isDefault: true },
        { id: 'flock', name: 'Флок', pricePerUnit: 600, unit: 'м²', priceAddition: 200, source: 'manual' },
        { id: 'reflex', name: 'Светоотражающая', pricePerUnit: 750, unit: 'м²', priceAddition: 350, source: 'manual' },
      ]
    }
  }
};

/**
 * Хелпер для получения полного дефолтного конфига
 */
export function getDefaultGlobalSettings(calculatorType: CalculatorType): GlobalCalculatorSettings {
  return {
    calculatorType,
    consumablesConfig: DEFAULT_CONSUMABLES[calculatorType],
    ...DEFAULT_GLOBAL_SETTINGS[calculatorType]
  };
}
