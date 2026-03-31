/**
 * @fileoverview Хук для автосохранения черновика настроек расходников
 * @module calculators/hooks/use-consumables-draft
 * @audit Создан 2026-03-26
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CalculatorType, ConsumablesConfig } from '@/lib/types/calculators';

/**
 * Ключ для localStorage
 */
const getDraftKey = (calculatorType: CalculatorType) =>
  `consumables-draft-${calculatorType}`;

/**
 * Интервал автосохранения (мс)
 */
const AUTOSAVE_INTERVAL = 5000;

/**
 * Возвращаемое значение хука
 */
interface UseConsumablesDraftReturn {
  /** Загрузить черновик */
  loadDraft: () => ConsumablesConfig | null;
  /** Сохранить черновик */
  saveDraft: (config: ConsumablesConfig) => void;
  /** Очистить черновик */
  clearDraft: () => void;
  /** Есть ли сохранённый черновик */
  hasDraft: boolean;
  /** Время последнего сохранения */
  lastSaved: Date | null;
}

/**
 * Хук для автосохранения черновика настроек расходников
 * @param calculatorType - Тип калькулятора
 * @param config - Текущая конфигурация
 * @param enabled - Включено ли автосохранение
 */
export function useConsumablesDraft(
  calculatorType: CalculatorType,
  config: ConsumablesConfig | null,
  enabled: boolean = true
): UseConsumablesDraftReturn {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const draftKey = getDraftKey(calculatorType);

  /**
   * Проверка наличия черновика при монтировании
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const draft = localStorage.getItem(draftKey);
    setHasDraft(!!draft);

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.savedAt) {
          setLastSaved(new Date(parsed.savedAt));
        }
      } catch (_e) {
        // Игнорируем ошибки парсинга
      }
    }
  }, [draftKey]);

  /**
   * Автосохранение черновика
   */
  useEffect(() => {
    if (!enabled || !config || typeof window === 'undefined') return;

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      const draftData = {
        config,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setHasDraft(true);
      setLastSaved(new Date());
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config, draftKey, enabled]);

  /**
   * Загрузить черновик
   */
  const loadDraft = useCallback((): ConsumablesConfig | null => {
    if (typeof window === 'undefined') return null;

    const draft = localStorage.getItem(draftKey);
    if (!draft) return null;

    try {
      const parsed = JSON.parse(draft);
      return parsed.config || null;
    } catch (e) {
      console.error('Ошибка загрузки черновика:', e);
      return null;
    }
  }, [draftKey]);

  /**
   * Сохранить черновик вручную
   */
  const saveDraft = useCallback(
    (config: ConsumablesConfig) => {
      if (typeof window === 'undefined') return;

      const draftData = {
        config,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setHasDraft(true);
      setLastSaved(new Date());
    },
    [draftKey]
  );

  /**
   * Очистить черновик
   */
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(draftKey);
    setHasDraft(false);
    setLastSaved(null);
  }, [draftKey]);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    hasDraft,
    lastSaved,
  };
}

export default useConsumablesDraft;
