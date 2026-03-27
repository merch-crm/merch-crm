/**
 * @fileoverview Хук для расчёта стоимости DTF-печати с поддержкой нескольких файлов и раскладки
 * @module calculators/dtf/hooks/use-dtf-calculator
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";
import { useCalculator } from "../../hooks/use-calculator";
import { CalculatorType, PrintOption } from "@/lib/types/calculators";
import { useLayoutOptimizer } from "../../hooks/use-layout-optimizer";

// ============================================
// ТИПЫ
// ============================================

export interface DTFSettings {
  filmType: "standard" | "premium" | "glitter" | "glow" | "metallic";
  printQuality: "draft" | "standard" | "high";
  whiteLayerMode: "none" | "auto" | "full";
  cutting: "none" | "contour" | "rectangle";
  urgency: "normal" | "express" | "urgent";
}

export interface DTFPricing {
  /** Цена за погонный метр печати (при ширине 60см) */
  pricePerLinearMeter: number;
  filmPrices: Record<string, number>;
  qualityMultipliers: Record<string, number>;
  whiteLayerPrices: Record<string, number>;
  cuttingPrices: Record<string, number>;
  urgencyMultipliers: Record<string, number>;
  setupFee: number;
  minOrderFee: number;
}

export interface CalculationResult {
  perItem: number;
  total: number;
  totalLengthMm: number;
  efficiency: number;
  materialsCost: number;
  printCost: number;
  filmCost: number;
  cuttingCost: number;
  setupCost: number;
  discount: number;
  breakdown: {
    label: string;
    value: number;
    type: "cost" | "fee" | "discount";
  }[];
}



/**
 * Хук калькулятора DTF-печати
 */
export function useDTFCalculator() {
  const calculatorType: CalculatorType = 'dtf';

  // Управление всеми общими настройками (расходники, пленки, маржа, наценки)
  const calculator = useCalculator(calculatorType);
  const { globalSettings, params, updateParams, designFiles } = calculator;
  const { printConfig, urgencyConfig, marginConfig } = globalSettings.settings;

  const { 
  } = designFiles;

  // Настройки специфичные для DTF
  const [settings, setSettings] = useState<DTFSettings>({
    filmType: "standard",
    printQuality: "standard",
    whiteLayerMode: "auto",
    cutting: "contour",
    urgency: "normal",
  });


  // Управление раскладкой
  const { 
    layoutResult, 
    settings: layoutSettings, 
    updateSettings: updateLayoutSettings 
  } = useLayoutOptimizer({ 
    files: calculator.designFiles.files,
    initialSettings: { rollWidthMm: 600 } 
  });

  const [materials, setMaterials] = useState<SelectedMaterial[]>([]);

  const updateDtfSettings = useCallback((updates: Partial<DTFSettings>) => {
    setSettings((prev: DTFSettings) => ({ ...prev, ...updates }));
  }, []);

  const materialsCost = useMemo(() => {
    return materials.reduce((sum: number, m: SelectedMaterial) => sum + m.price * m.quantity, 0);
  }, [materials]);

  /**
   * Основной расчёт
   */
  const calculation = useMemo((): CalculationResult => {
    const { filmType, printQuality, whiteLayerMode, cutting } = settings;
    const { totalLengthMm, efficiency, printCount } = layoutResult.stats;

    // Длина в погонных метрах
    const lengthMeters = totalLengthMm / 1000;

    // 1. Базовая стоимость печати (берем из printConfig)
    const basePricePerMeter = printConfig.basePrice || 1200;
    
    // Множители качества (временно оставляем фиксированными или вынесем в конфиг позже)
    const qualityMultipliers: Record<string, number> = {
      draft: 0.7,
      standard: 1,
      high: 1.4,
    };
    const qualityMult = qualityMultipliers[printQuality] || 1;
    const basePrintCost = lengthMeters * basePricePerMeter * qualityMult;

    // 2. Стоимость плёнки (динамически ищем в конфиге пленок)
    const selectedFilm = printConfig.filmTypes?.find((f: PrintOption) => f.id === filmType);
    const filmAddition = selectedFilm?.priceAddition || 0;
    const filmCost = lengthMeters * filmAddition;

    // 3. Белый слой (динамически из конфига)
    const selectedWhite = printConfig.whiteLayerOptions?.find((w: PrintOption) => w.id === whiteLayerMode);
    const whiteLayerAddition = selectedWhite?.priceAddition || 0;
    const whiteLayerCost = lengthMeters * whiteLayerAddition;

    // 4. Резка (из конфига или фикс)
    const cuttingOptions: Record<string, number> = {
      none: 0,
      contour: 15,
      rectangle: 5,
    };
    const cuttingCost = printCount * (cuttingOptions[cutting] || 0);

    // Суммарная себестоимость производства
    let productionCost = basePrintCost + filmCost + whiteLayerCost + cuttingCost;

    // 5. Срочность (берем из параметров калькулятора, которые синхронизированы с UI)
    const isUrgent = !!params.isUrgent;
    const expressMarkup = urgencyConfig?.expressMarkup || 30; // %
    const urgencyMult = isUrgent ? (1 + expressMarkup / 100) : 1;
    
    productionCost *= urgencyMult;

    // Материалы со склада
    productionCost += materialsCost;

    // Нанесения (работа)
    productionCost += calculator.placements.costResults.totalCost;

    // Скидка за объём (от общей длины плёнки)
    let discount = 0;
    const QUANTITY_DISCOUNTS = [
      { min: 50, discount: 0.2 },
      { min: 20, discount: 0.15 },
      { min: 10, discount: 0.1 },
      { min: 5, discount: 0.05 },
    ];
    for (const tier of QUANTITY_DISCOUNTS) {
      if (lengthMeters >= tier.min / 10) {
        discount = tier.discount;
        break;
      }
    }

    // 6. Цена продажи с наценкой (маржа из конфига или стейта)
    const currentMargin = params.marginPercent ?? marginConfig?.defaultMargin ?? 30;
    const sellingPrice = productionCost * (1 + currentMargin / 100) * (1 - discount);

    // 7. Итоговая стоимость с учётом минимального заказа и настройки
    const setupFee = printConfig.setupFee || 200;
    const minOrderFee = printConfig.minOrderFee || 300;

    let total = sellingPrice + setupFee;
    if (total < minOrderFee && printCount > 0) {
      total = minOrderFee;
    }

    // Цена за единицу (усреднённая)
    const perItem = printCount > 0 ? total / printCount : 0;

    // Breakdown
    const breakdown: CalculationResult["breakdown"] = [
      { 
        label: `Печать (${(totalLengthMm / 10).toFixed(1)} см)`, 
        value: basePrintCost, 
        type: "cost" 
      },
    ];

    if (filmCost > 0) {
      const filmName = selectedFilm?.name || filmType;
      breakdown.push({ label: `Плёнка (${filmName})`, value: filmCost, type: "cost" });
    }

    if (whiteLayerCost > 0) {
      breakdown.push({ label: `Белый слой (${selectedWhite?.name})`, value: whiteLayerCost, type: "cost" });
    }

    if (cuttingCost > 0) {
      breakdown.push({ label: `Резка (${printCount} шт)`, value: cuttingCost, type: "cost" });
    }

    if (materialsCost > 0) {
      breakdown.push({ label: "Материалы со склада", value: materialsCost, type: "cost" });
    }

    if (calculator.placements.costResults.totalCost > 0) {
      breakdown.push({ label: "Нанесения", value: calculator.placements.costResults.totalCost, type: "cost" });
    }

    breakdown.push({ label: "Настройка оборудования", value: setupFee, type: "fee" });

    if (discount > 0) {
      const discountValue = (sellingPrice * discount) / (1 - discount);
      breakdown.push({ label: `Скидка ${Math.round(discount * 100)}%`, value: -discountValue, type: "discount" });
    }

    if (urgencyMult > 1) {
      const urgencyValue = (productionCost / urgencyMult) * (urgencyMult - 1);
      breakdown.push({ label: "Срочность", value: urgencyValue, type: "fee" });
    }

    return {
      perItem: Math.round(perItem),
      total: Math.round(total),
      totalLengthMm,
      efficiency,
      materialsCost: Math.round(materialsCost),
      printCost: Math.round(basePrintCost),
      filmCost: Math.round(filmCost),
      cuttingCost: Math.round(cuttingCost),
      setupCost: setupFee,
      discount: Math.round(discount * 100),
      breakdown,
    };
  }, [layoutResult, settings, materialsCost, printConfig, urgencyConfig, marginConfig, params, calculator.placements.costResults]);

  const reset = useCallback(() => {
    calculator.designFiles.clearAll();
    calculator.placements.clearPlacements();
    setSettings({
      filmType: "standard",
      printQuality: "standard",
      whiteLayerMode: "auto",
      cutting: "contour",
      urgency: "normal",
    });
    setMaterials([]);
    updateParams({ marginPercent: marginConfig?.defaultMargin ?? 30 });
    updateLayoutSettings({ rollWidthMm: 600 });
  }, [calculator, marginConfig, updateLayoutSettings, updateParams]);

  return {
    ...calculator,
    settings,
    updateSettings: updateDtfSettings,
    layoutSettings,
    layoutResult,
    materials,
    margin: params.marginPercent ?? marginConfig?.defaultMargin ?? 30,
    calculation,
    reset,
  };
}
