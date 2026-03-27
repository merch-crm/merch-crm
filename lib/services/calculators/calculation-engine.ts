// lib/services/calculators/calculation-engine.ts

import type {
  CalculatorType,
  ConsumablesConfig,
  CalculationResult,
} from '@/lib/types/calculators';
import type { SelectedPlacement } from '@/lib/types/placements';
import { PlacementsService } from './placements-service';
import {
  calculatePrintConsumablesCost,
  calculateEmbroideryConsumablesCost,
  calculateSilkscreenConsumablesCost,
} from './consumables-service';

/**
 * Входные данные для расчёта
 */
export interface CalculationInput {
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Количество изделий */
  quantity: number;
  /** Площадь печати на единицу (м²) */
  printAreaPerItem: number;
  /** Общая площадь плёнки (м²) */
  totalFilmArea: number;
  /** Длина плёнки (м) */
  filmLength: number;
  /** Количество стежков (для вышивки) */
  stitchCount?: number;
  /** Количество цветов */
  colorCount?: number;
  /** Количество прогонов (для шелкографии) */
  printRuns?: number;
  /** Конфигурация расходников */
  consumablesConfig: ConsumablesConfig;
  /** Выбранные размещения */
  placements: SelectedPlacement[];
  /** Процент маржи */
  marginPercent: number;
  /** Срочный заказ */
  isUrgent: boolean;
  /** Процент наценки за срочность */
  urgencySurchargePercent: number;
}

/**
 * Движок расчёта стоимости производства
 * ...
 */
export class CalculationEngine {
  /**
   * Выполняет полный расчёт стоимости
   * @param input - Входные данные расчёта
   * @returns Результат расчёта
   */
  static calculate(input: CalculationInput): CalculationResult {
    // 1. Расчёт стоимости расходников
    const consumablesResult = this.calculateConsumables(input);

    // 2. Расчёт стоимости размещений
    const placementsResult = PlacementsService.calculateTotalCost(input.placements, input.quantity);

    // 3. Себестоимость
    const totalCost = consumablesResult.totalCost + placementsResult.totalCost;

    // 4. Маржа
    const marginAmount = totalCost * (input.marginPercent / 100);

    // 5. Наценка за срочность
    let urgencySurcharge = 0;
    if (input.isUrgent && input.urgencySurchargePercent > 0) {
      urgencySurcharge = (totalCost + marginAmount) * (input.urgencySurchargePercent / 100);
    }

    // 6. Итоговая цена
    const sellingPrice = totalCost + marginAmount + urgencySurcharge;
    const pricePerItem = input.quantity > 0 ? sellingPrice / input.quantity : 0;

    return {
      calculatorType: input.calculatorType,
      costBreakdown: {
        print: 0,
        materials: consumablesResult.totalCost,
        placements: placementsResult.totalCost,
        total: totalCost,
      },
      consumables: (consumablesResult?.items || []).map(item => {
        const configItem = (input?.consumablesConfig?.items || []).find(c => c.id === item.id);
        return {
          name: item.name,
          pricePerUnit: configItem ? configItem.pricePerUnit : 0,
          consumption: item.consumption,
          unit: item.unit,
          cost: item.cost,
        };
      }),
      placements: (placementsResult.items || []).map(item => ({
        productName: item.productName || 'Неизвестно',
        areaName: item.areaName || 'Зона',
        quantity: item.count || 0,
        pricePerUnit: item.workPrice || 0,
        cost: item.subtotal || 0
      })),
      totalCost,
      marginPercent: input.marginPercent,
      marginAmount,
      urgency: {
        level: input.isUrgent ? 'urgent' : 'normal',
        surcharge: urgencySurcharge,
        urgentSurcharge: input.urgencySurchargePercent,
      },
      sellingPrice,
      quantity: input.quantity,
      pricePerItem,
    };
  }

  /**
   * Расчёт стоимости расходников в зависимости от типа калькулятора
   */
  private static calculateConsumables(input: CalculationInput): {
    totalCost: number;
    items: Array<{
      id: string;
      name: string;
      consumption: number;
      cost: number;
      unit: string;
    }>;
  } {
    const { calculatorType, consumablesConfig } = input;

    switch (calculatorType) {
      case 'dtf':
      case 'uv-dtf':
      case 'dtg':
      case 'sublimation':
      case 'thermotransfer':
        return calculatePrintConsumablesCost(
          consumablesConfig,
          input.totalFilmArea,
          input.quantity
        );

      case 'embroidery':
        return calculateEmbroideryConsumablesCost(
          consumablesConfig,
          input.stitchCount || 0,
          input.totalFilmArea,
          input.quantity
        );

      case 'silkscreen':
        return calculateSilkscreenConsumablesCost(
          consumablesConfig,
          input.totalFilmArea,
          input.colorCount || 1,
          input.printRuns || input.quantity,
          input.quantity
        );

      default:
        return { totalCost: 0, items: [] };
    }
  }

  /**
   * Пересчитывает цену продажи при изменении маржи
   */
  static recalculateSellingPrice(
    costPrice: number,
    marginPercent: number,
    isUrgent: boolean,
    urgencySurchargePercent: number
  ): number {
    const marginAmount = costPrice * (marginPercent / 100);
    let sellingPrice = costPrice + marginAmount;

    if (isUrgent && urgencySurchargePercent > 0) {
      sellingPrice += sellingPrice * (urgencySurchargePercent / 100);
    }

    return sellingPrice;
  }

  /**
   * Вычисляет маржу из цены продажи
   */
  static calculateMarginFromPrice(
    costPrice: number,
    sellingPrice: number,
    isUrgent: boolean,
    urgencySurchargePercent: number
  ): number {
    if (costPrice <= 0) return 0;

    let effectivePrice = sellingPrice;

    // Убираем наценку за срочность
    if (isUrgent && urgencySurchargePercent > 0) {
      effectivePrice = sellingPrice / (1 + urgencySurchargePercent / 100);
    }

    const marginAmount = effectivePrice - costPrice;
    return (marginAmount / costPrice) * 100;
  }
}
