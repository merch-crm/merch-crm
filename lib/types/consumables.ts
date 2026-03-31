/**
 * @fileoverview Расширенные типы для расходников
 * @module lib/types/consumables
 * @audit Создан 2026-03-26
 */

import { CalculatorType } from './calculators';

/**
 * Категории расходников для связи со складом
 */
export const CONSUMABLE_CATEGORIES = {
  // DTF
  ink_white: { label: 'Белые чернила', unit: 'мл' },
  ink_cmyk: { label: 'CMYK чернила', unit: 'мл' },
  glue_powder: { label: 'Клеевой порошок', unit: 'г' },
  pet_film: { label: 'PET плёнка', unit: 'м²' },
  
  // UV DTF
  uv_varnish: { label: 'UV лак', unit: 'мл' },
  ab_film: { label: 'AB плёнка', unit: 'м²' },
  
  // DTG
  dtg_primer: { label: 'Праймер DTG', unit: 'мл' },
  
  // Сублимация
  sublimation_ink: { label: 'Сублимационные чернила', unit: 'мл' },
  sublimation_paper: { label: 'Сублимационная бумага', unit: 'м²' },
  
  // Вышивка
  thread_upper: { label: 'Верхняя нить', unit: 'м' },
  thread_lower: { label: 'Нижняя нить', unit: 'м' },
  stabilizer: { label: 'Стабилизатор', unit: 'м²' },
  
  // Шелкография
  plastisol_ink: { label: 'Пластизольная краска', unit: 'г' },
  mesh_frame: { label: 'Сетка/рама', unit: 'шт' },
  emulsion: { label: 'Эмульсия', unit: 'г' },
  
  // Термотрансфер
  transfer_film: { label: 'Термоплёнка', unit: 'м²' },
} as const;

export type ConsumableCategory = keyof typeof CONSUMABLE_CATEGORIES;

/**
 * Маппинг категорий расходников по типам калькуляторов
 */
export const CALCULATOR_CONSUMABLE_CATEGORIES: Record<CalculatorType, ConsumableCategory[]> = {
  dtf: ['ink_white', 'ink_cmyk', 'glue_powder', 'pet_film'],
  'uv-dtf': ['ink_white', 'ink_cmyk', 'uv_varnish', 'ab_film'],
  dtg: ['ink_white', 'ink_cmyk', 'dtg_primer'],
  sublimation: ['sublimation_ink', 'sublimation_paper'],
  embroidery: ['thread_upper', 'thread_lower', 'stabilizer'],
  silkscreen: ['plastisol_ink', 'mesh_frame', 'emulsion'],
  thermotransfer: ['transfer_film'],
};

/**
 * Информация о расходе для подсказок
 */
export interface ConsumptionInfo {
  /** Описание расхода */
  description: string;
  /** Типичный диапазон */
  typicalRange: string;
  /** Единица измерения расхода */
  consumptionUnit: string;
}

/**
 * Подсказки по расходу для каждого типа расходника
 */
export const CONSUMPTION_HINTS: Record<string, ConsumptionInfo> = {
  // DTF
  dtf_white_ink: {
    description: 'Расход белых чернил на квадратный метр печати',
    typicalRange: '12-15 мл/м²',
    consumptionUnit: 'мл/м²',
  },
  dtf_cmyk_ink: {
    description: 'Расход цветных чернил CMYK на квадратный метр',
    typicalRange: '8-10 мл/м²',
    consumptionUnit: 'мл/м²',
  },
  dtf_glue_powder: {
    description: 'Расход клеевого порошка на квадратный метр',
    typicalRange: '15-20 г/м²',
    consumptionUnit: 'г/м²',
  },
  dtf_pet_film: {
    description: 'Коэффициент расхода плёнки (с учётом отступов)',
    typicalRange: '1.1-1.2 м²/м²',
    consumptionUnit: 'м²/м²',
  },
  
  // UV DTF
  uv_dtf_white_ink: {
    description: 'Расход белых UV чернил',
    typicalRange: '2-3 мл/м²',
    consumptionUnit: 'мл/м²',
  },
  uv_dtf_cmyk_ink: {
    description: 'Расход цветных UV чернил',
    typicalRange: '1.5-2.5 мл/м²',
    consumptionUnit: 'мл/м²',
  },
  uv_dtf_varnish: {
    description: 'Расход UV лака',
    typicalRange: '1-2 мл/м²',
    consumptionUnit: 'мл/м²',
  },
  uv_dtf_ab_film: {
    description: 'Коэффициент расхода AB плёнки',
    typicalRange: '1.1-1.15 м²/м²',
    consumptionUnit: 'м²/м²',
  },
  
  // Вышивка
  embroidery_upper_thread: {
    description: 'Расход верхней нити на 1000 стежков',
    typicalRange: '5-7 м/1000 ст.',
    consumptionUnit: 'м/1000 ст.',
  },
  embroidery_lower_thread: {
    description: 'Расход нижней (челночной) нити на 1000 стежков',
    typicalRange: '2-3 м/1000 ст.',
    consumptionUnit: 'м/1000 ст.',
  },
  embroidery_stabilizer: {
    description: 'Расход стабилизатора на квадратный метр вышивки',
    typicalRange: '1.0-1.2 м²/м²',
    consumptionUnit: 'м²/м²',
  },
  
  // Шелкография
  silkscreen_plastisol: {
    description: 'Расход пластизольной краски на квадратный метр',
    typicalRange: '30-50 г/м²',
    consumptionUnit: 'г/м²',
  },
  silkscreen_emulsion: {
    description: 'Расход эмульсии на один кадр',
    typicalRange: '10-15 г/кадр',
    consumptionUnit: 'г/кадр',
  },
  
  // Термотрансфер
  thermotransfer_film: {
    description: 'Коэффициент расхода плёнки (с учётом отходов)',
    typicalRange: '1.15-1.25 м²/м²',
    consumptionUnit: 'м²/м²',
  },
};
