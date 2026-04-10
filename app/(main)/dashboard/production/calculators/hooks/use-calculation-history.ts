/**
 * @fileoverview Хук для работы с историей расчётов
 * @module app/(main)/dashboard/production/calculators/hooks/use-calculation-history
 * @audit Создан 2026-03-26
 */

import { useState } from 'react';
import { 
 deleteCalculation, 
 bulkDeleteCalculations, 
 clearAllHistory, 
 duplicateCalculation,
 updateCalculation
} from '@/lib/actions/calculators/history';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

/**
 * Хук для управления операциями над историей расчётов
 */
export function useCalculationHistory() {
 const [isLoading, setIsLoading] = useState(false);
 const router = useRouter();
 const { toast } = useToast();

 /**
  * Удаление одной записи
  */
 const remove = async (id: string) => {
  try {
   setIsLoading(true);
   const res = await deleteCalculation({ id });
   
   if (res.success) {
    toast('Расчёт удалён в корзину', 'success');
    router.refresh();
   } else {
    toast(res.error || 'Ошибка удаления', 'error');
   }
  } catch (_error) {
   toast('Критическая ошибка: Не удалось удалить расчёт', 'error');
  } finally {
   setIsLoading(false);
  }
 };

 /**
  * Массовое удаление
  */
 const bulkRemove = async (ids: string[]) => {
  if (ids.length === 0) return;
  
  try {
   setIsLoading(true);
   const res = await bulkDeleteCalculations({ ids });
   
   if (res.success) {
    toast(`Удалено ${ids.length} расчётов`, 'success');
    router.refresh();
   } else {
    toast(res.error || 'Ошибка массового удаления', 'error');
   }
  } catch (_error) {
   toast('Критическая ошибка: Не удалось выполнить массовое удаление', 'error');
  } finally {
   setIsLoading(false);
  }
 };

 /**
  * Очистка всей истории
  */
 const clear = async () => {
  try {
   setIsLoading(true);
   const res = await clearAllHistory({});
   
   if (res.success) {
    toast('История расчётов очищена', 'success');
    router.refresh();
   } else {
    toast(res.error || 'Ошибка очистки', 'error');
   }
  } catch (_error) {
   toast('Критическая ошибка: Не удалось очистить историю', 'error');
  } finally {
   setIsLoading(false);
  }
 };

 /**
  * Дублирование расчёта
  */
 const duplicate = async (id: string) => {
  try {
   setIsLoading(true);
   const res = await duplicateCalculation({ id });
   
   if (res.success) {
    toast('Расчёт продублирован', 'success');
    router.refresh();
   } else {
    toast(res.error || 'Ошибка дублирования', 'error');
   }
  } catch (_error) {
   toast('Критическая ошибка: Не удалось продублировать расчёт', 'error');
  } finally {
   setIsLoading(false);
  }
 };

 /**
  * Обновление данных расчёта
  */
 const update = async (id: string, data: { name?: string; clientName?: string | null; comment?: string | null }) => {
  try {
   setIsLoading(true);
   const res = await updateCalculation({ id, ...data });
   
   if (res.success) {
    toast('Данные обновлены', 'success');
    router.refresh();
   } else {
    toast(res.error || 'Ошибка обновления', 'error');
   }
  } catch (_error) {
   toast('Критическая ошибка: Не удалось обновить данные', 'error');
  } finally {
   setIsLoading(false);
  }
 };

 return {
  isLoading,
  remove,
  bulkRemove,
  clear,
  duplicate,
  update,
 };
}
