/**
 * @fileoverview Сервис для работы с расходниками калькуляторов
 * @module lib/services/calculators/consumables-service
 * @requires @/lib/types/calculators
 * @audit Обновлён 2026-03-27: Добавлена нормализация цен и исправление единиц
 */

import {
  CalculatorType,
  ConsumablesConfig,
  DEFAULT_CONSUMABLES,
} from '@/lib/types/calculators';

/**
 * Расчёт стоимости расходников для заданной площади/количества
 */
export interface ConsumablesCostResult {
  /** Стоимость по каждому расходнику */
  items: Array<{
    id: string;
    name: string;
    consumption: number;
    cost: number;
    unit: string;
  }>;
  /** Общая стоимость расходников */
  totalCost: number;
}

/**
 * Рассчитывает стоимость расходников для печати
 * @param config - Конфигурация расходников
 * @param area - Площадь печати в м²
 * @returns Результат расчёта
 */
export function calculatePrintConsumablesCost(
  config: ConsumablesConfig,
  area: number,
  quantity: number
): ConsumablesCostResult {
  const items = (config?.items || []).map((item) => {
    let consumption = 0;
    const unit = (item.consumptionUnit || '').toLowerCase();

    if (unit === 'шт' || unit === 'изделие' || unit === 'принт') {
      consumption = item.consumptionPerUnit * quantity;
    } else {
      // По умолчанию считаем, что расход зависит от площади (м²)
      consumption = item.consumptionPerUnit * area;
    }
    
    // ВАЖНО: Нормализуем цену (л -> мл, кг -> г)
    const normalizedPrice = normalizePrice(item.pricePerUnit, item.priceUnit, item.unit);
    const cost = consumption * normalizedPrice;

    return {
      id: item.id,
      name: item.name,
      consumption: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      unit: item.unit,
    };
  });

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return {
    items,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Нормализует цену за единицу в соответствии с базовой единицей расхода
 * Например, если цена за литр (₽/л), а расход в мл — делит на 1000.
 */
function normalizePrice(price: number, priceUnit: string, baseUnit: string): number {
  const pUnit = priceUnit.toLowerCase();
  const bUnit = baseUnit.toLowerCase();

  // Объем: л -> мл
  if (pUnit.includes('/л') && bUnit === 'мл') return price / 1000;
  
  // Вес: кг -> г
  if (pUnit.includes('/кг') && bUnit === 'г') return price / 1000;
  
  // Длина: бобина -> м (базовая оценка, если не указано иное)
  if (pUnit.includes('/бобина') && bUnit === 'м') return price / 5000; // средняя намотка 5000м

  // Если единицы совпадают или не распознаны — возвращаем как есть
  return price;
}

/**
 * Рассчитывает стоимость расходников для вышивки
 * @param config - Конфигурация расходников
 * @param stitchCount - Количество стежков
 * @param areaM2 - Площадь стабилизатора в м²
 * @returns Результат расчёта
 */
export function calculateEmbroideryConsumablesCost(
  config: ConsumablesConfig,
  stitchCount: number,
  areaM2: number,
  quantity: number
): ConsumablesCostResult {
  const items = (config?.items || []).map((item) => {
    let consumption = 0;
    const unit = (item.consumptionUnit || '').toLowerCase();

    // Для нитей расход зависит от количества стежков (классические ID)
    if (item.id === 'upper_thread' || item.id === 'lower_thread' || unit.includes('1000 ст')) {
      consumption = (item.consumptionPerUnit * stitchCount) / 1000;
    }
    // Для стабилизатора расход зависит от площади общей плёнки
    else if (item.id === 'stabilizer' || unit === 'м²' || unit === 'm2') {
      consumption = item.consumptionPerUnit * areaM2;
    }
    // Если расходник штучный (на изделие/принт)
    else if (unit === 'шт' || unit === 'изделие' || unit === 'принт') {
      consumption = item.consumptionPerUnit * quantity;
    } 
    // Фолбек
    else {
      consumption = item.consumptionPerUnit * quantity;
    }

    const normalizedPrice = normalizePrice(item.pricePerUnit, item.priceUnit, item.unit);
    const cost = consumption * normalizedPrice;

    return {
      id: item.id,
      name: item.name,
      consumption: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      unit: item.unit,
    };
  });

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return {
    items,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Рассчитывает стоимость расходников для шелкографии
 * @param config - Конфигурация расходников
 * @param area - Площадь печати в м²
 * @param colorCount - Количество цветов
 * @param printCount - Тираж
 * @returns Результат расчёта
 */
export function calculateSilkscreenConsumablesCost(
  config: ConsumablesConfig,
  area: number,
  colorCount: number,
  printCount: number
): ConsumablesCostResult {
  const items = (config?.items || []).map((item) => {
    let consumption = 0;
    const unit = (item.consumptionUnit || '').toLowerCase();

    // Краска — расход на (площадь * тираж). colorCount НЕ множим, если area — суммарная площадь оттисков
    if (item.id === 'plastisol_ink' || item.id.includes('ink') || unit === 'м²' || unit === 'm2') {
      consumption = item.consumptionPerUnit * area * printCount;
    }
    // Сетка (рамы) — фиксированно 1 штука на каждый цвет (не зависит от тиража)
    else if (item.id === 'mesh_frame' || unit === 'pcs' || unit === 'шт' || unit === 'рамка') {
      consumption = colorCount;
    }
    // Эмульсия — расход на подготовку каждого кадра (colorCount), не зависит от тиража
    else if (item.id === 'emulsion' || unit === 'g/screen') {
      consumption = item.consumptionPerUnit * colorCount;
    }
    // Прочее на единицу тиража (обработка и т.д.)
    else if (unit === 'шт' || unit === 'изделие' || unit === 'принт') {
      consumption = item.consumptionPerUnit * printCount;
    }
    // Дефолт — на тираж
    else {
      consumption = item.consumptionPerUnit * printCount;
    }

    const normalizedPrice = normalizePrice(item.pricePerUnit, item.priceUnit, item.unit);
    const cost = consumption * normalizedPrice;

    return {
      id: item.id,
      name: item.name,
      consumption: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      unit: item.unit,
    };
  });

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return {
    items,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Получает конфигурацию по умолчанию для калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Конфигурация по умолчанию
 */
export function getDefaultConsumablesConfig(
  calculatorType: CalculatorType
): ConsumablesConfig {
  return DEFAULT_CONSUMABLES[calculatorType];
}

/**
 * Валидирует конфигурацию расходников
 * @param config - Конфигурация для проверки
 * @returns Объект с результатом валидации
 */
export function validateConsumablesConfig(config: ConsumablesConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const items = config?.items;
  if (!items) return { isValid: false, errors: ['Конфигурация не загружена'] };

  if (items.length === 0) {
    errors.push('Конфигурация должна содержать хотя бы один расходник');
  } else {
    items.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Расходник #${index + 1}: отсутствует название`);
      }
      if (item.pricePerUnit < 0) {
        errors.push(`${item.name}: цена не может быть отрицательной`);
      }
      if (item.consumptionPerUnit < 0) {
        errors.push(`${item.name}: расход не может быть отрицательным`);
      }
      if (item.source === 'warehouse' && !item.warehouseItemId) {
        errors.push(`${item.name}: не выбран материал со склада`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
