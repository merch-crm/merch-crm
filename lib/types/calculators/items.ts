import { CalculatorType, ConsumableSource } from './base';
import { PlacementArea } from '../placements';

/**
 * Изделие для нанесения
 */
export interface PlacementItem {
  /** Уникальный идентификатор */
  id: string;
  /** Название (Футболка, Худи, Кепка и т.д.) */
  name: string;
  /** Иконка (опционально) */
  icon?: string;
  /** Активность */
  isActive: boolean;
  /** Порядок сортировки */
  sortOrder: number;
  /** Области нанесения */
  areas: PlacementArea[];
}

/**
 * Расходный материал
 */
export interface ConsumableItem {
  /** Уникальный идентификатор */
  id: string;
  /** Название */
  name: string;
  /** Ключ (для идентификации в коде) */
  key: string;
  /** Категория (для сопоставления со складом) */
  category?: string;
  /** Расход на единицу */
  consumptionPerUnit: number;
  /** Единица расхода */
  consumptionUnit: string;
  /** Единица материала (кг, л, м) */
  unit: string;
  /** Цена за единицу материала */
  pricePerUnit: number;
  /** Единица цены (например, ₽/л) */
  priceUnit: string;
  /** Источник цены */
  source: ConsumableSource;
  /** ID позиции на складе (если source = 'warehouse') */
  warehouseItemId?: string;
  /** Название позиции на складе */
  warehouseItemName?: string;
}

/**
 * Конфигурация расходников для калькулятора
 */
export interface ConsumablesConfig {
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Расходники */
  items: ConsumableItem[];
}

/**
 * Дефолтные значения расходников по типам калькуляторов
 */
export const DEFAULT_CONSUMABLES: Record<CalculatorType, ConsumablesConfig> = {
  dtf: {
    calculatorType: 'dtf',
    items: [
      { id: 'ink_white', key: 'ink_white', name: 'Белые чернила', consumptionPerUnit: 12, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 8, priceUnit: '₽/мл', source: 'manual' },
      { id: 'ink_cmyk', key: 'ink_cmyk', name: 'CMYK чернила', consumptionPerUnit: 8, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 6, priceUnit: '₽/мл', source: 'manual' },
      { id: 'powder', key: 'powder', name: 'Клей-порошок', consumptionPerUnit: 15, consumptionUnit: 'г', unit: 'г', pricePerUnit: 3, priceUnit: '₽/г', source: 'manual' },
      { id: 'film', key: 'film', name: 'PET-плёнка', consumptionPerUnit: 1.1, consumptionUnit: 'м²', unit: 'м²', pricePerUnit: 150, priceUnit: '₽/м²', source: 'manual' },
    ],
  },
  'uv-dtf': {
    calculatorType: 'uv-dtf',
    items: [
      { id: 'ink_cmyk', key: 'ink_cmyk', name: 'CMYK чернила', consumptionPerUnit: 2, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 8, priceUnit: '₽/мл', source: 'manual' },
      { id: 'ink_white', key: 'ink_white', name: 'Белые чернила', consumptionPerUnit: 2.5, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 12, priceUnit: '₽/мл', source: 'manual' },
      { id: 'varnish', key: 'varnish', name: 'Лак (Varnish)', consumptionPerUnit: 1.5, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 10, priceUnit: '₽/мл', source: 'manual' },
      { id: 'film_ab', key: 'film_ab', name: 'Плёнка AB', consumptionPerUnit: 1.1, consumptionUnit: 'м²', unit: 'м²', pricePerUnit: 200, priceUnit: '₽/м²', source: 'manual' },
    ],
  },
  dtg: {
    calculatorType: 'dtg',
    items: [
      { id: 'dtg_cmyk_ink', key: 'dtg_cmyk_ink', name: 'Чернила CMYK', consumptionPerUnit: 80, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 4, priceUnit: '₽/мл', source: 'manual' },
      { id: 'dtg_white_ink', key: 'dtg_white_ink', name: 'Белые чернила', consumptionPerUnit: 150, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 6, priceUnit: '₽/мл', source: 'manual' },
      { id: 'dtg_pretreatment', key: 'dtg_pretreatment', name: 'Предобработка', consumptionPerUnit: 200, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 2.5, priceUnit: '₽/мл', source: 'manual' },
      { id: 'dtg_cleaning', key: 'dtg_cleaning', name: 'Жидкость для очистки', consumptionPerUnit: 1, consumptionUnit: 'принт', unit: 'мл', pricePerUnit: 1.5, priceUnit: '₽/мл', source: 'manual' },
    ],
  },
  sublimation: {
    calculatorType: 'sublimation',
    items: [
      { id: 'ink', key: 'ink', name: 'Сублимационные чернила', consumptionPerUnit: 15, consumptionUnit: 'м²', unit: 'мл', pricePerUnit: 5, priceUnit: '₽/мл', source: 'manual' },
      { id: 'paper', key: 'paper', name: 'Сублимационная бумага', consumptionPerUnit: 1.05, consumptionUnit: 'м²', unit: 'м²', pricePerUnit: 80, priceUnit: '₽/м²', source: 'manual' },
    ],
  },
  embroidery: {
    calculatorType: 'embroidery',
    items: [
      { id: 'upper_thread', key: 'thread_top', name: 'Верхняя нить', consumptionPerUnit: 6, consumptionUnit: '1000 ст.', unit: 'м', pricePerUnit: 0.06, priceUnit: '₽/м', source: 'manual' },
      { id: 'lower_thread', key: 'thread_bobbin', name: 'Нижняя нить', consumptionPerUnit: 2.3, consumptionUnit: '1000 ст.', unit: 'м', pricePerUnit: 0.04, priceUnit: '₽/м', source: 'manual' },
      { id: 'stabilizer', key: 'stabilizer', name: 'Стабилизатор', consumptionPerUnit: 50, consumptionUnit: 'м²', unit: 'г', pricePerUnit: 0.5, priceUnit: '₽/г', source: 'manual' },
    ],
  },
  silkscreen: {
    calculatorType: 'silkscreen',
    items: [
      { id: 'plastisol_ink', key: 'plastisol', name: 'Пластизоль', consumptionPerUnit: 40, consumptionUnit: 'м²', unit: 'г', pricePerUnit: 2, priceUnit: '₽/г', source: 'manual' },
      { id: 'mesh_frame', key: 'mesh', name: 'Сетка', consumptionPerUnit: 1, consumptionUnit: 'рамка', unit: 'шт', pricePerUnit: 500, priceUnit: '₽/шт', source: 'manual' },
      { id: 'emulsion', key: 'emulsion', name: 'Эмульсия', consumptionPerUnit: 12, consumptionUnit: 'рамка', unit: 'г', pricePerUnit: 3, priceUnit: '₽/г', source: 'manual' },
    ],
  },
  thermotransfer: {
    calculatorType: 'thermotransfer',
    items: [
      { id: 'film', key: 'film', name: 'Термотрансферная плёнка', consumptionPerUnit: 1.15, consumptionUnit: 'м²', unit: 'м²', pricePerUnit: 400, priceUnit: '₽/м²', source: 'manual' },
    ],
  },
};
