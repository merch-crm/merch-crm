// app/(main)/dashboard/production/calculators/hooks/use-calculator.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/toast';
import { CalculationEngine, type CalculationInput } from '@/lib/services/calculators/calculation-engine';
import { useDesignFiles } from './use-design-files';
import { useLayoutOptimizer } from './use-layout-optimizer';
import { useCalculatorSettings } from './use-calculator-settings';
import { usePlacements } from './use-placements';
import { saveCalculation } from '@/lib/actions/calculators/history';
import type { CalculatorType, CalculationResult } from '@/lib/types/calculators';
import { 
  DEFAULT_CALCULATOR_PARAMS, 
  BaseCalculatorParams, 
  CalculatorParamsMap 
} from '@/lib/types/calculator-configs';
import type { PDFCalculationData } from '@/lib/types/pdf';

/**
 * Состояние калькулятора
 */
interface CalculatorState<T extends CalculatorType> {
  /** Параметры калькулятора */
  params: CalculatorParamsMap[T];
  /** Результат расчёта */
  result: CalculationResult | null;
  /** Расчёт в процессе */
  isCalculating: boolean;
  /** Сохранение в процессе */
  isSaving: boolean;
  /** Ошибка */
  error: string | null;
}

/**
 * Возвращаемое значение хука
 */
interface UseCalculatorReturn<T extends CalculatorType> {
  // Состояние
  state: CalculatorState<T>;
  
  // Параметры
  params: CalculatorParamsMap[T];
  updateParams: (updates: Partial<CalculatorParamsMap[T]>) => void;
  resetParams: () => void;
  
  // Файлы дизайна
  designFiles: ReturnType<typeof useDesignFiles>;
  
  // Раскладка
  layout: ReturnType<typeof useLayoutOptimizer>;
  
  // Глобальные настройки
  globalSettings: ReturnType<typeof useCalculatorSettings>;
  
  // Размещения
  placements: ReturnType<typeof usePlacements>;
  
  // Результат
  result: CalculationResult | null;
  
  // Действия
  calculate: () => void;
  save: (name: string, clientName?: string, comment?: string, clientId?: string) => Promise<boolean>;
  
  // PDF
  getPDFData: () => PDFCalculationData | null;
  
  // Валидация
  canCalculate: boolean;
  validationErrors: string[];
}

/**
 * Универсальный хук для калькуляторов
 * @param calculatorType - Тип калькулятора
 * @returns Состояние и методы калькулятора
 */
export function useCalculator<T extends CalculatorType>(
  calculatorType: T
): UseCalculatorReturn<T> {
  const { toast } = useToast();
  
  // Параметры калькулятора
  const [params, setParams] = useState<CalculatorParamsMap[T]>(
    DEFAULT_CALCULATOR_PARAMS[calculatorType] as CalculatorParamsMap[T]
  );
  
  // Результат расчёта
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Подключаем связанные хуки
  const designFiles = useDesignFiles({ calculatorType });
  
  // Безопасное извлечение параметров для оптимизатора раскладки
  const layoutSettings = useMemo(() => {
    if (calculatorType === 'dtf') {
      const dtfParams = params as CalculatorParamsMap['dtf'];
      return {
        rollWidthMm: dtfParams.rollWidth ?? 600,
        edgeMarginMm: dtfParams.edgeMargin ?? 5,
        gapMm: dtfParams.gap ?? 3,
        allowRotation: dtfParams.allowRotation ?? true,
      };
    }
    return {
      rollWidthMm: 600,
      edgeMarginMm: 5,
      gapMm: 3,
      allowRotation: true,
    };
  }, [calculatorType, params]);

  const layout = useLayoutOptimizer({
    files: designFiles.files,
    initialSettings: layoutSettings
  });
  const globalSettings = useCalculatorSettings(calculatorType);
  const placements = usePlacements((params as unknown as BaseCalculatorParams).quantity || 1);

  /**
   * Обновление параметров
   */
  const updateParams = useCallback((updates: Partial<CalculatorParamsMap[T]>) => {
    setParams((prev) => {
      const newParams = { ...prev, ...updates };
      
      // Сбрасываем результат только для параметров, требующих полного перерасчёта
      const softParams = ['marginPercent', 'isUrgent', 'urgencySurchargePercent'];
      const isSoftOnly = Object.keys(updates).every(key => softParams.includes(key));
      
      if (!isSoftOnly) {
        setResult(null);
      } else {
        // Тихо пересчитываем зависимые поля в result, если он есть
        setResult((prevResult) => {
          if (!prevResult) return null;
          
          const baseParams = newParams as unknown as BaseCalculatorParams;
          const newMarginPercent = baseParams.marginPercent || 0;
          const newMarginAmount = prevResult.totalCost * (newMarginPercent / 100);
          
          const isUrgent = baseParams.isUrgent || false;
          const urgencyPercent = baseParams.urgencySurchargePercent || 0;
          const urgencySurcharge = isUrgent ? (prevResult.totalCost + newMarginAmount) * (urgencyPercent / 100) : 0;
          
          const newSellingPrice = prevResult.totalCost + newMarginAmount + urgencySurcharge;
          
          return {
            ...prevResult,
            sellingPrice: newSellingPrice,
            pricePerItem: newSellingPrice / Math.max(1, baseParams.quantity || 1),
            marginPercent: newMarginPercent,
            marginAmount: newMarginAmount,
            urgency: {
              ...prevResult.urgency,
              isUrgent,
              surcharge: urgencySurcharge,
              urgentSurcharge: urgencyPercent
            }
          };
        });
      }
      
      return newParams;
    });
  }, []);

  /**
   * Сброс параметров к дефолтным
   */
  const resetParams = useCallback(() => {
    setParams(DEFAULT_CALCULATOR_PARAMS[calculatorType] as CalculatorParamsMap[T]);
    setResult(null);
  }, [calculatorType]);

  /**
   * Валидация перед расчётом
   */
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const base = params as unknown as BaseCalculatorParams;

    if (base.quantity < 1) {
      errors.push('Количество должно быть не менее 1');
    }

    if (designFiles.files.length === 0) {
      errors.push('Добавьте хотя бы один файл дизайна');
    }

    // Проверка для вышивки
    if (calculatorType === 'embroidery') {
      const hasStitchCount = designFiles.files.some(
        (f) => f.embroideryData?.stitchCount && f.embroideryData.stitchCount > 0
      );
      if (!hasStitchCount) {
        errors.push('Для вышивки необходимы DST файлы с количеством стежков');
      }
    }

    return errors;
  }, [params, designFiles.files, calculatorType]);

  const canCalculate = validationErrors.length === 0;

  /**
   * Выполнение расчёта
   */
  const calculate = useCallback(() => {
    const _base = params as unknown as BaseCalculatorParams;
    if (!canCalculate) {
      toast(String(validationErrors[0]), 'destructive');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Подготавливаем данные для расчёта
      const totalStitchCount = designFiles.files.reduce(
        (sum, f) => sum + (f.embroideryData?.stitchCount || 0) * f.quantity,
        0
      );

      const isDirectPrint = calculatorType === 'dtg' || calculatorType === 'silkscreen';
      const areaMm2 = isDirectPrint 
        ? layout.layoutResult.stats.usedAreaMm2 
        : layout.layoutResult.stats.totalAreaMm2;

      const filmAreaM2 = areaMm2 / 1000000;
      const filmLengthM = layout.layoutResult.stats.totalLengthMm / 1000;

      // Debug log убран (Правило 11)

      // Фильтруем расходники для DTG (белый цвет и праймер не нужны для белых футболок)
      const filteredConfig = { ...globalSettings.settings.consumablesConfig };
      if (calculatorType === 'dtg') {
        const dtgParams = params as unknown as CalculatorParamsMap['dtg'];
        const isLightGarment = dtgParams.garmentColor === 'light';
        const needsWhiteUnderbase = !!dtgParams.whiteUnderbase;
        
        filteredConfig.items = (filteredConfig.items || []).filter(item => {
          if (isLightGarment && (item.id === 'dtg_white_ink' || item.id === 'dtg_pretreatment')) {
            return false;
          }
          if (!needsWhiteUnderbase && item.id === 'dtg_white_ink') {
            return false;
          }
          return true;
        });
      }

      const baseParams = params as unknown as BaseCalculatorParams;
      const input: CalculationInput = {
        calculatorType,
        quantity: baseParams.quantity,
        printAreaPerItem: filmAreaM2 / baseParams.quantity,
        totalFilmArea: filmAreaM2,
        filmLength: filmLengthM,
        stitchCount: totalStitchCount,
        colorCount: 'colorCount' in params ? Number((params as unknown as Record<string, unknown>).colorCount) : undefined,
        printRuns: baseParams.quantity,
        consumablesConfig: filteredConfig,
        placements: placements.selectedPlacements,
        marginPercent: baseParams.marginPercent,
        isUrgent: baseParams.isUrgent,
        urgencySurchargePercent: baseParams.urgencySurchargePercent,
      };

      const calculationResult = CalculationEngine.calculate(input);
      setResult(calculationResult);

      toast(String(`Цена: ${calculationResult.sellingPrice.toLocaleString('ru-RU')} ₽`), 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка расчёта';
      setError(message);
      toast(message, 'destructive');
    } finally {
      setIsCalculating(false);
    }
  }, [
    canCalculate,
    validationErrors,
    calculatorType,
    params,
    layout.layoutResult,
    designFiles.files,
    globalSettings.settings.consumablesConfig,
    placements.selectedPlacements,
    toast,
  ]);

  /**
   * Сохранение расчёта
   */
  const save = useCallback(
    async (name: string, clientName?: string, comment?: string, clientId?: string): Promise<boolean> => {
      if (!result) {
        toast('Сначала выполните расчёт', 'destructive');
        return false;
      }

      setIsSaving(true);
      const isDirectPrint = calculatorType === 'dtg' || calculatorType === 'silkscreen';
      const areaMm2 = isDirectPrint 
        ? layout.layoutResult.stats.usedAreaMm2 
        : layout.layoutResult.stats.totalAreaMm2;

      const filmAreaM2 = areaMm2 / 1000000;
      const filmLengthM = layout.layoutResult.stats.totalLengthMm / 1000;

      try {
        const baseParams = params as unknown as BaseCalculatorParams;
        const typedParams = params as unknown as Record<string, unknown>;

        const saveResult = await saveCalculation({
          name,
          calculatorType,
          clientName: clientName || baseParams.clientName || null,
          clientId: clientId || baseParams.clientId || null,
          totalCost: result.totalCost,
          sellingPrice: result.sellingPrice,
          quantity: baseParams.quantity,
          pricePerItem: result.pricePerItem,
          marginPercent: baseParams.marginPercent,
          parameters: {
            marginPercent: baseParams.marginPercent,
            urgency: {
              level: baseParams.isUrgent ? 'urgent' : 'normal',
              surcharge: result.urgency.surcharge,
              urgentSurcharge: baseParams.urgencySurchargePercent
            },
            costBreakdown: result.costBreakdown,
            layoutSettings: layout.layoutResult.settings,
            width: designFiles.files[0]?.dimensions?.width,
            height: designFiles.files[0]?.dimensions?.height,
            printArea: filmAreaM2,
            filmLength: filmLengthM,
            stitchCount: designFiles.files.reduce(
              (sum, f) => sum + (f.embroideryData?.stitchCount || 0) * f.quantity,
              0
            ),
            colorCount: 'colorCount' in params ? Number(typedParams.colorCount) : undefined,
            filmType: 'filmType' in params ? String(typedParams.filmType) : undefined,
            finishType: 'finishType' in params ? String(typedParams.finishType) : undefined,
            garmentColor: 'garmentColor' in params ? String(typedParams.garmentColor) : undefined,
            pretreatmentType: 'pretreatmentType' in params ? String(typedParams.pretreatmentType) : undefined,
            printResolution: 'printResolution' in params ? (typedParams.printResolution as string | number) : undefined,
            whiteUnderbase: 'whiteUnderbase' in params ? Boolean(typedParams.whiteUnderbase) : undefined,
            whitePassCount: 'whitePassCount' in params ? Number(typedParams.whitePassCount) : undefined,
            specificParams: typedParams,
          },
          designFiles: designFiles.files.map((f) => ({
            name: f.originalName,
            dimensions: `${f.dimensions?.width} × ${f.dimensions?.height} мм`,
            quantity: f.quantity,
            thumbnail: f.thumbnailPath,
          })),
          comment: comment || null,
        });

        if (saveResult.success) {
          toast(String(`Расчёт ${saveResult.data?.calculationNumber} сохранён`), 'success');
          return true;
        } else {
          throw new Error(saveResult.error || 'Ошибка сохранения');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка сохранения';
        toast(String(message), 'destructive');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [result, calculatorType, params, designFiles.files, layout.layoutResult, toast]
  );

  /**
   * Подготовка данных для PDF
   */
  const getPDFData = useCallback((): PDFCalculationData | null => {
    if (!result) return null;

    const isDirectPrint = calculatorType === 'dtg' || calculatorType === 'silkscreen';
    const stats = layout.layoutResult?.stats;
    const baseParams = params as unknown as BaseCalculatorParams;
    
    let areaMm2 = 0;
    if (stats) {
      areaMm2 = isDirectPrint ? stats.usedAreaMm2 : stats.totalAreaMm2;
    }

    const filmAreaM2 = areaMm2 / 1000000;
    const filmLengthM = (stats?.totalLengthMm || 0) / 1000;

    const typedParams = params as unknown as Record<string, unknown>;
    return {
      number: 'DRAFT',
      name: 'Новый расчёт',
      calculatorType,
      date: new Date(),
      parameters: {
        quantity: baseParams.quantity,
        width: designFiles.files[0]?.dimensions?.width,
        height: designFiles.files[0]?.dimensions?.height,
        printArea: filmAreaM2,
        filmLength: filmLengthM,
        stitchCount: designFiles.files.reduce(
          (sum, f) => sum + (f.embroideryData?.stitchCount || 0) * f.quantity,
          0
        ),
        colorCount: 'colorCount' in params ? Number(typedParams.colorCount) : undefined,
        filmType: 'filmType' in params ? String(typedParams.filmType) : undefined,
        finishType: 'finishType' in params ? String(typedParams.finishType) : undefined,
        isUrgent: baseParams.isUrgent,
        urgencySurcharge: baseParams.urgencySurchargePercent,
        // DTG specific
        garmentColor: 'garmentColor' in params ? String(typedParams.garmentColor) : undefined,
        pretreatmentType: 'pretreatmentType' in params ? String(typedParams.pretreatmentType) : undefined,
        printResolution: 'printResolution' in params ? String(typedParams.printResolution) : undefined,
        whiteUnderbase: 'whiteUnderbase' in params ? Boolean(typedParams.whiteUnderbase) : undefined,
      },
      consumables: result.consumables.map(c => ({
        ...c,
        consumptionPerUnit: c.consumption / baseParams.quantity
      })),
      placements: result.placements.map(p => ({
        ...p,
        zoneName: p.areaName
      })),
      designFiles: designFiles.files.map((f) => ({
        name: f.originalName,
        dimensions: `${f.dimensions?.width} × ${f.dimensions?.height} мм`,
        quantity: f.quantity,
        thumbnail: f.thumbnailPath,
      })),
      totals: {
        costPrice: result.totalCost,
        marginPercent: baseParams.marginPercent,
        sellingPrice: result.sellingPrice,
        pricePerItem: result.pricePerItem,
        consumablesCost: result.costBreakdown.materials,
        placementsCost: result.costBreakdown.placements,
        urgencySurcharge: result.urgency.surcharge,
      },
      clientName: baseParams.clientName,
    };
  }, [result, calculatorType, params, designFiles.files, layout.layoutResult]);

  // Состояние
  const state: CalculatorState<T> = {
    params,
    result,
    isCalculating,
    isSaving,
    error,
  };

  return {
    state,
    params,
    updateParams,
    resetParams,
    designFiles,
    layout,
    globalSettings,
    placements,
    result,
    calculate,
    save,
    getPDFData,
    canCalculate,
    validationErrors,
  };
}
