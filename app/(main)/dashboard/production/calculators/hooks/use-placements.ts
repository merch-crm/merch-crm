/**
 * @fileoverview Хук для управления выбранными нанесениями в калькуляторах
 * @module placements/hooks/use-placements
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
 SelectedPlacement, 
 PlacementProduct, 
 PlacementsCostResult 
} from '@/lib/types/placements';
import { PlacementsService } from '@/lib/services/calculators/placements-service';
import { getPlacementProducts } from '@/lib/actions/calculators/placements';
import { toast } from 'sonner';

/**
 * Хук для работы с нанесениями
 * @param totalQuantity - Общий тираж для расчета стоимости
 */
export function usePlacements(totalQuantity: number) {
 const [availableProducts, setAvailableProducts] = useState<PlacementProduct[]>([]);
 const [selectedPlacements, setSelectedPlacements] = useState<SelectedPlacement[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 // Загрузка доступных продуктов при инициализации
 useEffect(() => {
  async function loadProducts() {
   try {
    const products = await getPlacementProducts();
    setAvailableProducts(products);
   } catch (error) {
    console.error('Failed to load placement products:', error);
    toast.error('Не удалось загрузить список изделий');
   } finally {
    setIsLoading(false);
   }
  }
  loadProducts();
 }, []);

 /**
  * Добавляет или обновляет количество для конкретной зоны
  */
 const togglePlacement = useCallback((
  product: PlacementProduct,
  areaId: string,
  count: number = 1
 ) => {
  const area = product.areas.find(a => a.id === areaId);
  if (!area) return;

  setSelectedPlacements(prev => {
   const existing = prev.find(p => p.areaId === areaId);
   
   if (existing) {
    // Если количество 0 или меньше, удаляем
    if (count <= 0) {
     return prev.filter(p => p.areaId !== areaId);
    }
    // Иначе обновляем количество
    return prev.map(p => p.areaId === areaId ? { ...p, count } : p);
   } else if (count > 0) {
    // Добавляем новое
    return [
     ...prev,
     {
      areaId: area.id,
      productId: product.id,
      productName: product.name,
      areaName: area.name,
      workPrice: area.workPrice,
      count
     }
    ];
   }
   return prev;
  });
 }, []);

 /**
  * Очищает все выбранные нанесения
  */
 const clearPlacements = useCallback(() => {
  setSelectedPlacements([]);
 }, []);

 /**
  * Результаты расчета стоимости (мемоизировано)
  */
 const costResults = useMemo((): PlacementsCostResult => {
  return PlacementsService.calculateTotalCost(selectedPlacements, totalQuantity);
 }, [selectedPlacements, totalQuantity]);

 return {
  availableProducts,
  selectedPlacements,
  costResults,
  isLoading,
  togglePlacement,
  clearPlacements,
  setSelectedPlacements
 };
}
