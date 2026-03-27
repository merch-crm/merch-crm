/**
 * @fileoverview Хук для управления настройками срочности
 * @module calculators/hooks/use-urgency-settings
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useCallback } from 'react';
import { UrgencyLevel, UrgencySettings } from '@/lib/types/calculators';

/**
 * Настройки по умолчанию
 */
const DEFAULT_URGENCY_SETTINGS: UrgencySettings = {
  level: 'normal',
  surcharge: 0,
  urgentSurcharge: 1000, // 1000 ₽ по умолчанию
};

/**
 * Состояние хука срочности
 */
interface UseUrgencySettingsReturn {
  /** Текущий уровень срочности */
  level: UrgencyLevel;
  /** Настройки срочности */
  settings: UrgencySettings;
  /** Наценка за срочность (0 если обычный) */
  surcharge: number;
  /** Установить уровень срочности */
  setLevel: (level: UrgencyLevel) => void;
  /** Обновить настройки */
  updateSettings: (settings: UrgencySettings) => void;
  /** Переключить срочность */
  toggleUrgency: () => void;
}

/**
 * Хук для управления срочностью заказа
 * @param initialSettings - Начальные настройки (опционально)
 * @returns Состояние и методы управления срочностью
 */
export function useUrgencySettings(
  initialSettings?: Partial<UrgencySettings>
): UseUrgencySettingsReturn {
  const [level, setLevel] = useState<UrgencyLevel>('normal');
  const [settings, setSettings] = useState<UrgencySettings>({
    ...DEFAULT_URGENCY_SETTINGS,
    ...initialSettings,
  });

  /**
   * Расчёт наценки
   */
  const surcharge = level === 'urgent' ? settings.urgentSurcharge : 0;

  /**
   * Обновление настроек
   */
  const updateSettings = useCallback((newSettings: UrgencySettings) => {
    setSettings(newSettings);
  }, []);

  /**
   * Переключение срочности
   */
  const toggleUrgency = useCallback(() => {
    setLevel((prev) => {
      const newLevel = prev === 'normal' ? 'urgent' : 'normal';
      // Обновляем и в объекте настроек для консистентности
      setSettings(curr => ({
        ...curr,
        level: newLevel,
        surcharge: newLevel === 'urgent' ? curr.urgentSurcharge : 0
      }));
      return newLevel;
    });
  }, []);

  return {
    level,
    settings,
    surcharge,
    setLevel,
    updateSettings,
    toggleUrgency,
  };
}

export default useUrgencySettings;
