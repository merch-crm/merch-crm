"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

// ============================================
// ТИПЫ
// ============================================

export interface DTFDesign {
  id: string;
  name: string;
  width: number; // см
  height: number; // см
  colors: number;
  imageUrl?: string;
}

export interface DTFSettings {
  quantity: number;
  width: number;
  height: number;
  filmType: "standard" | "premium" | "glitter" | "glow" | "metallic";
  printQuality: "draft" | "standard" | "high";
  whiteLayerMode: "none" | "auto" | "full";
  cutting: "none" | "contour" | "rectangle";
  urgency: "normal" | "express" | "urgent";
}

export interface DTFPricing {
  pricePerSqCm: number;
  filmPrices: Record<string, number>;
  qualityMultipliers: Record<string, number>;
  whiteLayerPrices: Record<string, number>;
  cuttingPrices: Record<string, number>;
  urgencyMultipliers: Record<string, number>;
  setupFee: number;
  minOrderFee: number;
  minAreaSqCm: number;
}

export interface CalculationResult {
  perItem: number;
  total: number;
  areaSqCm: number;
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

// ============================================
// КОНСТАНТЫ
// ============================================

const DEFAULT_PRICING: DTFPricing = {
  pricePerSqCm: 0.8,
  filmPrices: {
    standard: 0,
    premium: 0.15,
    glitter: 0.4,
    glow: 0.5,
    metallic: 0.35,
  },
  qualityMultipliers: {
    draft: 0.7,
    standard: 1,
    high: 1.4,
  },
  whiteLayerPrices: {
    none: 0,
    auto: 0.2,
    full: 0.4,
  },
  cuttingPrices: {
    none: 0,
    contour: 15,
    rectangle: 5,
  },
  urgencyMultipliers: {
    normal: 1,
    express: 1.3,
    urgent: 1.5,
  },
  setupFee: 200,
  minOrderFee: 300,
  minAreaSqCm: 25,
};

const QUANTITY_DISCOUNTS = [
  { min: 500, discount: 0.2 },
  { min: 200, discount: 0.15 },
  { min: 100, discount: 0.1 },
  { min: 50, discount: 0.07 },
  { min: 20, discount: 0.05 },
];

// ============================================
// ХУК
// ============================================

export function useDTFCalculator() {
  const [design, setDesign] = useState<DTFDesign | null>(null);
  const [settings, setSettings] = useState<DTFSettings>({
    quantity: 1,
    width: 10,
    height: 10,
    filmType: "standard",
    printQuality: "standard",
    whiteLayerMode: "auto",
    cutting: "contour",
    urgency: "normal",
  });
  const [materials, setMaterials] = useState<SelectedMaterial[]>([]);
  const [pricing, setPricing] = useState<DTFPricing>(DEFAULT_PRICING);
  const [margin, setMargin] = useState(30);

  const updateSettings = useCallback((updates: Partial<DTFSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDesign = useCallback((newDesign: DTFDesign | null) => {
    setDesign(newDesign);
    if (newDesign) {
      setSettings((prev) => ({
        ...prev,
        width: newDesign.width,
        height: newDesign.height,
      }));
    }
  }, []);

  const materialsCost = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.price * m.quantity, 0);
  }, [materials]);

  const calculation = useMemo((): CalculationResult => {
    const { quantity, width, height, filmType, printQuality, whiteLayerMode, cutting, urgency } = settings;

    // Площадь в см²
    const areaSqCm = Math.max(width * height, pricing.minAreaSqCm);

    // Базовая стоимость печати
    const qualityMult = pricing.qualityMultipliers[printQuality];
    const printCostPerItem = areaSqCm * pricing.pricePerSqCm * qualityMult;

    // Стоимость плёнки
    const filmAddition = pricing.filmPrices[filmType];
    const filmCostPerItem = areaSqCm * filmAddition;

    // Белый слой
    const whiteLayerAddition = pricing.whiteLayerPrices[whiteLayerMode];
    const whiteLayerCost = areaSqCm * whiteLayerAddition;

    // Резка
    const cuttingCostPerItem = pricing.cuttingPrices[cutting];

    // Базовая себестоимость за единицу
    let costPerItem = printCostPerItem + filmCostPerItem + whiteLayerCost + cuttingCostPerItem;

    // Срочность
    const urgencyMult = pricing.urgencyMultipliers[urgency];
    costPerItem *= urgencyMult;

    // Материалы на единицу
    const materialsPerItem = quantity > 0 ? materialsCost / quantity : 0;
    costPerItem += materialsPerItem;

    // Скидка за объём
    let discount = 0;
    for (const tier of QUANTITY_DISCOUNTS) {
      if (quantity >= tier.min) {
        discount = tier.discount;
        break;
      }
    }

    // Цена с наценкой и скидкой
    const pricePerItem = costPerItem * (1 + margin / 100) * (1 - discount);

    // Общая стоимость
    let total = pricePerItem * quantity + pricing.setupFee;

    if (total < pricing.minOrderFee) {
      total = pricing.minOrderFee;
    }

    // Breakdown
    const breakdown: CalculationResult["breakdown"] = [
      { label: `Печать (${areaSqCm.toFixed(1)} см²)`, value: printCostPerItem * quantity, type: "cost" },
    ];

    if (filmCostPerItem > 0) {
      breakdown.push({ label: `Плёнка (${filmType})`, value: filmCostPerItem * quantity, type: "cost" });
    }

    if (whiteLayerCost > 0) {
      breakdown.push({ label: "Белый слой", value: whiteLayerCost * quantity, type: "cost" });
    }

    if (cuttingCostPerItem > 0) {
      breakdown.push({ label: "Резка", value: cuttingCostPerItem * quantity, type: "cost" });
    }

    if (materialsCost > 0) {
      breakdown.push({ label: "Материалы со склада", value: materialsCost, type: "cost" });
    }

    breakdown.push({ label: "Настройка", value: pricing.setupFee, type: "fee" });

    if (discount > 0) {
      const discountValue = (pricePerItem * quantity * discount) / (1 - discount);
      breakdown.push({ label: `Скидка ${Math.round(discount * 100)}%`, value: -discountValue, type: "discount" });
    }

    if (urgencyMult > 1) {
      const urgencyValue = (costPerItem / urgencyMult) * (urgencyMult - 1) * quantity;
      breakdown.push({ label: "Срочность", value: urgencyValue, type: "fee" });
    }

    return {
      perItem: Math.round(pricePerItem),
      total: Math.round(total),
      areaSqCm,
      materialsCost: Math.round(materialsCost),
      printCost: Math.round(printCostPerItem * quantity),
      filmCost: Math.round(filmCostPerItem * quantity),
      cuttingCost: Math.round(cuttingCostPerItem * quantity),
      setupCost: pricing.setupFee,
      discount: Math.round(discount * 100),
      breakdown,
    };
  }, [settings, materialsCost, pricing, margin]);

  const reset = useCallback(() => {
    setDesign(null);
    setSettings({
      quantity: 1,
      width: 10,
      height: 10,
      filmType: "standard",
      printQuality: "standard",
      whiteLayerMode: "auto",
      cutting: "contour",
      urgency: "normal",
    });
    setMaterials([]);
    setMargin(30);
  }, []);

  return {
    design,
    settings,
    materials,
    pricing,
    margin,
    calculation,
    updateDesign,
    updateSettings,
    setMaterials,
    setPricing,
    setMargin,
    reset,
  };
}
