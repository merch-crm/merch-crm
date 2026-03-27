/**
 * @fileoverview Хук для управления всеми настройками калькулятора (Глобальные настройки)
 * @module calculators/hooks/use-calculator-settings
 * @audit Обновлён 2026-03-27: Переведен на GlobalCalculatorSettings
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import {
  CalculatorType,
  GlobalCalculatorSettings,
  getDefaultGlobalSettings,
} from '@/lib/types/calculators';
import {
  getGlobalSettings,
  saveGlobalSettings,
  resetGlobalSettings,
} from '@/lib/actions/calculators/settings';
import { isSuccess } from '@/lib/types/common';

/**
 * Состояние настроек калькулятора
 */
interface UseCalculatorSettingsReturn {
  /** Все настройки (расходники, срочность, маржа, печать) */
  settings: GlobalCalculatorSettings;
  /** Загрузка */
  isLoading: boolean;
  /** Сохранение */
  isSaving: boolean;
  /** Ошибка */
  error: string | null;

  // Методы управления полным конфигом
  updateSettings: (updates: Partial<Omit<GlobalCalculatorSettings, 'calculatorType'>>) => void;
  saveSettings: (newSettings?: Omit<GlobalCalculatorSettings, 'calculatorType'>) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;

  // Модальные окна
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

/**
 * Хук для управления всеми настройками калькулятора
 * Загружает из БД единый GlobalCalculatorSettings (consumables, urgency, margin, print)
 * @param calculatorType - Тип калькулятора
 */
export function useCalculatorSettings(
  calculatorType: CalculatorType
): UseCalculatorSettingsReturn {
  const { toast } = useToast();

  const [settings, setSettings] = useState<GlobalCalculatorSettings>(
    getDefaultGlobalSettings(calculatorType)
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно настроек
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  /**
   * Загрузка конфигурации с сервера
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getGlobalSettings(calculatorType);
      if (isSuccess(result)) {
        setSettings(result.data);
      } else {
        setError(result.error);
        setSettings(getDefaultGlobalSettings(calculatorType));
      }
    } catch (_err) {
      setError('Не удалось загрузить глобальные настройки');
      setSettings(getDefaultGlobalSettings(calculatorType));
    } finally {
      setIsLoading(false);
    }
  }, [calculatorType]);

  // Загружаем при монтировании
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Локальное обновление конфигурации
   */
  const updateSettings = useCallback((updates: Partial<Omit<GlobalCalculatorSettings, 'calculatorType'>>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Сохранение конфигурации на сервер
   */
  const saveSettings = useCallback(
    async (newSettings?: Omit<GlobalCalculatorSettings, 'calculatorType'>): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      const configToSave = newSettings || settings;

      try {
        const result = await saveGlobalSettings(calculatorType, configToSave);
        if (isSuccess(result)) {
          setSettings(result.data);
          toast('Настройки калькулятора сохранены', 'success');
          return true;
        } else {
          setError(result.error);
          toast(result.error, 'error');
          return false;
        }
      } catch (_err) {
        setError('Не удалось сохранить настройки');
        toast('Ошибка при сохранении настроек', 'error');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [calculatorType, settings, toast]
  );

  /**
   * Сброс к значениям по умолчанию (на сервере и локально)
   */
  const resetSettings = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await resetGlobalSettings(calculatorType);
      if (isSuccess(result)) {
        setSettings(result.data);
        toast('Настройки сброшены по умолчанию', 'success');
        return true;
      } else {
        setError(result.error);
        toast(result.error, 'error');
        return false;
      }
    } catch (_err) {
      setError('Не удалось сбросить настройки');
      toast('Ошибка при сбросе настроек', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [calculatorType, toast]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    saveSettings,
    resetSettings,

    isSettingsModalOpen,
    openSettingsModal: () => setIsSettingsModalOpen(true),
    closeSettingsModal: () => setIsSettingsModalOpen(false),
  };
}

export default useCalculatorSettings;
