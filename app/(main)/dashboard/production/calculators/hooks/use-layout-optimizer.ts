/**
 * @fileoverview Хук для управления состоянием и расчётом раскладки
 * @module calculators/hooks/use-layout-optimizer
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
 UploadedDesignFile,
 LayoutSettings,
 LayoutResult,
 DesignItem,
} from '@/lib/types/calculators';
import {
 optimizeLayout,
} from '@/lib/utils/layout-optimizer';

/**
 * Опции хука
 */
interface UseLayoutOptimizerOptions {
 /** Начальные настройки */
 initialSettings?: Partial<LayoutSettings>;
 /** Файлы дизайнов */
 files: UploadedDesignFile[];
 /** Колбэк при изменении настроек */
 onSettingsChange?: (settings: LayoutSettings) => void;
}

/**
 * Хук для реактивного расчёта раскладки на основе файлов и настроек
 */
export function useLayoutOptimizer({
 files,
 initialSettings,
 onSettingsChange,
}: UseLayoutOptimizerOptions) {
 // Состояние настроек
 const [settings, setSettings] = useState<LayoutSettings>({
  rollWidthMm: 300,
  edgeMarginMm: 10,
  gapMm: 5,
  allowRotation: true,
  ...initialSettings,
 });

 // Синхронизация с внешними настройками при их изменении
 useEffect(() => {
  if (initialSettings) {
   setSettings(prev => ({ ...prev, ...initialSettings }));
  }
 }, [initialSettings]);

 // Преобразуем файлы в айтемы для алгоритма
 const designItems = useMemo<DesignItem[]>(() => {
  return files.map((file, index) => ({
   id: file.id,
   name: file.originalName,
   widthMm: file.userDimensions?.widthMm || (file.dimensions?.width ? Math.round((file.dimensions.width / 300) * 25.4) : 100),
   heightMm: file.userDimensions?.heightMm || (file.dimensions?.height ? Math.round((file.dimensions.height / 300) * 25.4) : 100),
   quantity: file.quantity || 1,
   colorIndex: index,
   thumbnailUrl: file.thumbnailUrl || file.fileUrl,
  }));
 }, [files]);

 // Вычисляем раскладку
 const layoutResult = useMemo<LayoutResult>(() => {
  return optimizeLayout(designItems, settings);
 }, [designItems, settings]);

 /**
  * Обновление настроек
  */
 const updateSettings = useCallback((updates: Partial<LayoutSettings>) => {
  setSettings(prev => {
   const next = { ...prev, ...updates };
   if (onSettingsChange) onSettingsChange(next);
   return next;
  });
 }, [onSettingsChange]);

 /**
  * Сброс настроек
  */
 const resetSettings = useCallback(() => {
  setSettings({
   rollWidthMm: 300,
   edgeMarginMm: 10,
   gapMm: 5,
   allowRotation: true,
   ...initialSettings,
  });
 }, [initialSettings]);

 return {
  settings,
  layoutResult,
  designItems,
  updateSettings,
  resetSettings,
  // Удобные стэты для UI
  stats: layoutResult.stats,
  efficiency: layoutResult.stats.efficiency,
  totalLengthMm: layoutResult.stats.totalLengthMm,
 };
}

export default useLayoutOptimizer;
