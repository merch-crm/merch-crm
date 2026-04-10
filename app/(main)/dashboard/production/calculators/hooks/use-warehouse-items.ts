/**
 * @fileoverview Хук для получения материалов со склада
 * @module calculators/hooks/use-warehouse-items
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalculatorType } from '@/lib/types/calculators';
import {
 getWarehouseItemsForCalculator,
 WarehouseItemForCalculator,
} from '@/lib/actions/calculators/warehouse';
import { isSuccess } from '@/lib/types/common';

/**
 * Состояние хука материалов склада
 */
interface UseWarehouseItemsReturn {
 /** Список материалов */
 items: WarehouseItemForCalculator[];
 /** Состояние загрузки */
 isLoading: boolean;
 /** Ошибка */
 error: string | null;
 /** Перезагрузить список */
 reload: () => Promise<void>;
}

/**
 * Хук для получения материалов со склада для калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Список материалов и состояние
 */
export function useWarehouseItems(
 calculatorType: CalculatorType
): UseWarehouseItemsReturn {
 const [items, setItems] = useState<WarehouseItemForCalculator[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 /**
  * Загрузка материалов
  */
 const loadItems = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
   const result = await getWarehouseItemsForCalculator(calculatorType);
   if (isSuccess(result)) {
    setItems(result.data);
   } else {
    setError(result.error);
    setItems([]);
   }
  } catch (_err) {
   setError('Не удалось загрузить материалы со склада');
   setItems([]);
  } finally {
   setIsLoading(false);
  }
 }, [calculatorType]);

 // Загружаем при монтировании
 useEffect(() => {
  loadItems();
 }, [loadItems]);

 return {
  items,
  isLoading,
  error,
  reload: loadItems,
 };
}

export default useWarehouseItems;
