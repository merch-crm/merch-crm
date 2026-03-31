/**
 * @fileoverview Сервис для расчета стоимости нанесений
 * @module lib/services/calculators/placements-service
 */

import { 
  SelectedPlacement, 
  PlacementsCostResult, 
  PlacementProduct,
  PRODUCT_TYPES
} from '@/lib/types/placements';

/**
 * Класс для работы с логикой нанесений
 */
export class PlacementsService {
  /**
   * Рассчитывает общую стоимость выбранных нанесений
   * 
   * @param placements - Список выбранных нанесений
   * @param totalQuantity - Общий тираж
   * @returns Результат расчета стоимости
   */
  static calculateTotalCost(
    placements: SelectedPlacement[],
    totalQuantity: number
  ): PlacementsCostResult {
    const items = placements.map((p) => {
      const subtotal = p.workPrice * p.count;
      return {
        areaId: p.areaId,
        productName: p.productName,
        areaName: p.areaName,
        workPrice: p.workPrice,
        count: p.count,
        subtotal,
      };
    });

    const costPerUnit = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCost = costPerUnit * totalQuantity;

    return {
      items,
      costPerUnit,
      totalCost,
    };
  }

  /**
   * Форматирует список нанесений для сохранения в истории расчетов
   * @param placements - Выбранные нанесения
   */
  static serializeForHistory(placements: SelectedPlacement[]) {
    return placements.map(p => ({
      areaId: p.areaId,
      productId: p.productId,
      count: p.count,
      workPrice: p.workPrice,
    }));
  }

  /**
   * Получает иконку для типа продукта
   * @param type - Тип продукта
   */
  static getProductIcon(type: string): string {
    const config = PRODUCT_TYPES[type as keyof typeof PRODUCT_TYPES];
    return config?.icon || '📦';
  }

  /**
   * Группирует продукты по категориям (для UI)
   * @param products - Список продуктов
   */
  static groupByCategory(products: PlacementProduct[]) {
    return products.reduce((acc, product) => {
      const type = product.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(product);
      return acc;
    }, {} as Record<string, PlacementProduct[]>);
  }
}
