/**
 * @fileoverview Хук для работы с конфигурацией расходников
 * @module calculators/hooks/use-consumables-config
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import {
 CalculatorType,
 ConsumablesConfig,
 DEFAULT_CONSUMABLES,
} from '@/lib/types/calculators';
import {
 getConsumablesConfig,
 saveConsumablesConfig,
} from '@/lib/actions/calculators/consumables';
import { isSuccess } from '@/lib/types/common';

/**
 * Состояние хука конфигурации расходников
 */
interface UseConsumablesConfigReturn {
 /** Текущая конфигурация */
 config: ConsumablesConfig;
 /** Состояние загрузки */
 isLoading: boolean;
 /** Состояние сохранения */
 isSaving: boolean;
 /** Ошибка */
 error: string | null;
 /** Обновить конфигурацию локально */
 updateConfig: (newConfig: ConsumablesConfig) => void;
 /** Сохранить конфигурацию на сервер */
 saveConfig: (config: ConsumablesConfig) => Promise<boolean>;
 /** Перезагрузить конфигурацию с сервера */
 reloadConfig: () => Promise<void>;
 /** Сбросить к значениям по умолчанию (локально) */
 resetToDefaults: () => void;
}

/**
 * Хук для управления конфигурацией расходников калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Состояние и методы управления конфигурацией
 */
export function useConsumablesConfig(
 calculatorType: CalculatorType
): UseConsumablesConfigReturn {
 const { toast } = useToast();
 const [config, setConfig] = useState<ConsumablesConfig>(
  DEFAULT_CONSUMABLES[calculatorType]
 );
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);

 /**
  * Загрузка конфигурации с сервера
  */
 const loadConfig = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
   const result = await getConsumablesConfig(calculatorType);
   if (isSuccess(result)) {
    setConfig(result.data);
   } else {
    setError(result.error);
    // Используем значения по умолчанию при ошибке
    setConfig(DEFAULT_CONSUMABLES[calculatorType]);
   }
  } catch (_err) {
   setError('Не удалось загрузить настройки');
   setConfig(DEFAULT_CONSUMABLES[calculatorType]);
  } finally {
   setIsLoading(false);
  }
 }, [calculatorType]);

 // Загружаем конфигурацию при монтировании
 useEffect(() => {
  loadConfig();
 }, [loadConfig]);

 /**
  * Обновление конфигурации локально
  */
 const updateConfig = useCallback((newConfig: ConsumablesConfig) => {
  setConfig(newConfig);
 }, []);

 /**
  * Сохранение конфигурации на сервер
  */
 const saveConfig = useCallback(
  async (configToSave: ConsumablesConfig): Promise<boolean> => {
   setIsSaving(true);
   setError(null);

   try {
    const result = await saveConsumablesConfig(calculatorType, configToSave);
    if (isSuccess(result)) {
     setConfig(result.data);
     toast("Настройки расходников обновлены", "success");
     return true;
    } else {
     setError(result.error);
     toast(result.error, "error");
     return false;
    }
   } catch (_err) {
    setError('Не удалось сохранить настройки');
    toast('Не удалось сохранить настройки', "error");
    return false;
   } finally {
    setIsSaving(false);
   }
  },
  [calculatorType, toast]
 );

 /**
  * Перезагрузка конфигурации с сервера
  */
 const reloadConfig = useCallback(async () => {
  await loadConfig();
 }, [loadConfig]);

 /**
  * Сброс к значениям по умолчанию (локально)
  */
 const resetToDefaults = useCallback(() => {
  setConfig(DEFAULT_CONSUMABLES[calculatorType]);
 }, [calculatorType]);

 return {
  config,
  isLoading,
  isSaving,
  error,
  updateConfig,
  saveConfig,
  reloadConfig,
  resetToDefaults,
 };
}

export default useConsumablesConfig;
