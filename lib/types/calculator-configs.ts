// lib/types/calculator-configs.ts

import type { CalculatorType } from './calculators';

/**
 * Базовые параметры калькулятора
 */
export interface BaseCalculatorParams {
  /** Количество изделий */
  quantity: number;
  /** Процент маржи */
  marginPercent: number;
  /** Срочный заказ */
  isUrgent: boolean;
  /** Процент наценки за срочность */
  urgencySurchargePercent: number;
  /** ID клиента (из базы) */
  clientId?: string;
  /** Имя клиента (для отображения) */
  clientName?: string;
}

/**
 * Параметры DTF калькулятора
 */
export interface DTFCalculatorParams extends BaseCalculatorParams {
  /** Тип плёнки */
  filmType: 'matte' | 'glossy' | 'glitter';
  /** Ширина рулона (мм) */
  rollWidth: 300 | 600 | 1200;
  /** Отступ от края (мм) */
  edgeMargin: number;
  /** Зазор между дизайнами (мм) */
  gap: number;
  /** Разрешать поворот */
  allowRotation: boolean;
}

/**
 * Параметры UV DTF калькулятора
 */
export interface UVDTFCalculatorParams extends BaseCalculatorParams {
  /** Тип плёнки */
  filmType: 'a_film' | 'b_film' | 'ab_film';
  /** Тип финиша */
  finishType: 'matte' | 'glossy' | 'soft_touch' | 'holographic';
  /** Ширина рулона (мм) */
  rollWidth: 300 | 600;
  /** Отступ от края (мм) */
  edgeMargin: number;
  /** Зазор между дизайнами (мм) */
  gap: number;
  /** Разрешать поворот */
  allowRotation: boolean;
  /** Ламинация */
  withLamination: boolean;
}

/**
 * Параметры DTG калькулятора
 */
export interface DTGCalculatorParams extends BaseCalculatorParams {
  /** Тип предобработки */
  pretreatmentType: 'none' | 'light' | 'dark';
  /** Разрешение печати (dpi) */
  printResolution: 720 | 1440;
  /** Тип чернил */
  inkType: 'pigment' | 'reactive';
  /** Белая подложка */
  whiteUnderbase: boolean;
  /** Количество проходов белого */
  whitePassCount: 1 | 2 | 3;
  /** Цвет изделия */
  garmentColor: 'light' | 'dark';
}

/**
 * Параметры калькулятора вышивки
 */
export interface EmbroideryCalculatorParams extends BaseCalculatorParams {
  /** Тип ткани */
  fabricType: 'cotton' | 'polyester' | 'denim' | 'leather' | 'knit';
  /** Плотность стежков (стежков/см²) */
  stitchDensity: number;
  /** Тип стабилизатора */
  stabilizerType: 'tearaway' | 'cutaway' | 'washaway' | 'none';
  /** Количество голов машины */
  machineHeads: 1 | 2 | 4 | 6 | 8 | 12;
}

/**
 * Параметры калькулятора шелкографии
 */
export interface SilkscreenCalculatorParams extends BaseCalculatorParams {
  /** Количество цветов */
  colorCount: number;
  /** Тип краски */
  inkType: 'plastisol' | 'water_based' | 'discharge' | 'specialty';
  /** Размер сетки (mesh) */
  meshSize: 110 | 156 | 200 | 230 | 305;
  /** Тип подложки */
  substrateType: 'light' | 'dark';
  /** Нужна ли белая подложка */
  needsWhiteBase: boolean;
}

/**
 * Параметры калькулятора сублимации
 */
export interface SublimationCalculatorParams extends BaseCalculatorParams {
  /** Тип носителя */
  substrateType: 'polyester' | 'coated' | 'hardsubstrate';
  /** Тип бумаги */
  paperType: 'standard' | 'premium' | 'tacky';
  /** Ширина рулона (мм) */
  rollWidth: 610 | 1118 | 1620;
}

/**
 * Параметры калькулятора термотрансфера
 */
export interface ThermotransferCalculatorParams extends BaseCalculatorParams {
  /** Тип трансфера */
  transferType: 'vinyl' | 'flex' | 'flock' | 'glitter' | 'holographic' | 'reflective';
  /** Ширина рулона (мм) */
  rollWidth: 500 | 1000;
  /** Режущий плоттер */
  usePlotter: boolean;
}

/**
 * Объединённый тип параметров калькуляторов
 */
export type CalculatorParams =
  | DTFCalculatorParams
  | UVDTFCalculatorParams
  | DTGCalculatorParams
  | EmbroideryCalculatorParams
  | SilkscreenCalculatorParams
  | SublimationCalculatorParams
  | ThermotransferCalculatorParams;

/**
 * Маппинг типа калькулятора к типу параметров
 */
export type CalculatorParamsMap = {
  dtf: DTFCalculatorParams;
  'uv-dtf': UVDTFCalculatorParams;
  dtg: DTGCalculatorParams;
  embroidery: EmbroideryCalculatorParams;
  silkscreen: SilkscreenCalculatorParams;
  sublimation: SublimationCalculatorParams;
  thermotransfer: ThermotransferCalculatorParams;
};

/**
 * Дефолтные параметры для каждого типа калькулятора
 */
export const DEFAULT_CALCULATOR_PARAMS: {
  [K in CalculatorType]: CalculatorParamsMap[K];
} = {
  dtf: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    filmType: 'matte',
    rollWidth: 600,
    edgeMargin: 5,
    gap: 3,
    allowRotation: true,
  },
  'uv-dtf': {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    filmType: 'ab_film',
    finishType: 'glossy',
    rollWidth: 600,
    edgeMargin: 5,
    gap: 3,
    allowRotation: true,
    withLamination: true,
  },
  dtg: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    pretreatmentType: 'none',
    printResolution: 720,
    inkType: 'pigment',
    whiteUnderbase: false,
    whitePassCount: 1,
    garmentColor: 'light',
  },
  embroidery: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    fabricType: 'cotton',
    stitchDensity: 4.5,
    stabilizerType: 'tearaway',
    machineHeads: 1,
  },
  silkscreen: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    colorCount: 1,
    inkType: 'plastisol',
    meshSize: 156,
    substrateType: 'light',
    needsWhiteBase: false,
  },
  sublimation: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    substrateType: 'polyester',
    paperType: 'standard',
    rollWidth: 610,
  },
  thermotransfer: {
    quantity: 1,
    marginPercent: 30,
    isUrgent: false,
    urgencySurchargePercent: 50,
    clientId: undefined,
    clientName: undefined,
    transferType: 'vinyl',
    rollWidth: 500,
    usePlotter: true,
  },
};
