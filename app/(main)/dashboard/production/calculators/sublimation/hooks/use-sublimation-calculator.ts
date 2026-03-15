"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

export interface SublimationSettings {
  quantity: number;
  productType: "tshirt" | "mug" | "plate" | "pillow" | "mousepad" | "puzzle" | "custom";
  size: "small" | "medium" | "large" | "xlarge";
  coverage: number; // процент покрытия 0-100
  quality: "standard" | "premium";
  coating: "none" | "glossy" | "matte";
  urgency: "normal" | "express" | "urgent";
}

export interface SublimationPricing {
  productPrices: Record<string, Record<string, number>>;
  coverageMultiplier: number;
  qualityMultipliers: Record<string, number>;
  coatingPrices: Record<string, number>;
  urgencyMultipliers: Record<string, number>;
  setupFee: number;
  minOrderFee: number;
}

export interface CalculationResult {
  perItem: number;
  total: number;
  materialsCost: number;
  printCost: number;
  productCost: number;
  coatingCost: number;
  setupCost: number;
  discount: number;
  breakdown: {
    label: string;
    value: number;
    type: "cost" | "fee" | "discount";
  }[];
}

const DEFAULT_PRICING: SublimationPricing = {
  productPrices: {
    tshirt: { small: 250, medium: 300, large: 350, xlarge: 400 },
    mug: { small: 150, medium: 180, large: 220, xlarge: 280 },
    plate: { small: 200, medium: 280, large: 350, xlarge: 450 },
    pillow: { small: 350, medium: 450, large: 550, xlarge: 700 },
    mousepad: { small: 120, medium: 150, large: 200, xlarge: 250 },
    puzzle: { small: 300, medium: 400, large: 550, xlarge: 750 },
    custom: { small: 200, medium: 300, large: 400, xlarge: 500 },
  },
  coverageMultiplier: 0.005, // за каждый % покрытия
  qualityMultipliers: {
    standard: 1,
    premium: 1.3,
  },
  coatingPrices: {
    none: 0,
    glossy: 30,
    matte: 25,
  },
  urgencyMultipliers: {
    normal: 1,
    express: 1.25,
    urgent: 1.5,
  },
  setupFee: 150,
  minOrderFee: 500,
};

const QUANTITY_DISCOUNTS = [
  { min: 200, discount: 0.2 },
  { min: 100, discount: 0.15 },
  { min: 50, discount: 0.1 },
  { min: 20, discount: 0.05 },
];

export function useSublimationCalculator() {
  const [settings, setSettings] = useState<SublimationSettings>({
    quantity: 1,
    productType: "tshirt",
    size: "medium",
    coverage: 80,
    quality: "standard",
    coating: "none",
    urgency: "normal",
  });
  const [materials, setMaterials] = useState<SelectedMaterial[]>([]);
  const [pricing, setPricing] = useState<SublimationPricing>(DEFAULT_PRICING);
  const [margin, setMargin] = useState(30);

  const updateSettings = useCallback((updates: Partial<SublimationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const materialsCost = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.price * m.quantity, 0);
  }, [materials]);

  const calculation = useMemo((): CalculationResult => {
    const { quantity, productType, size, coverage, quality, coating, urgency } = settings;

    // Базовая стоимость продукта
    const productCost = pricing.productPrices[productType]?.[size] || 200;

    // Стоимость печати (зависит от покрытия)
    const coverageCost = productCost * (coverage / 100) * pricing.coverageMultiplier * 100;

    // Качество
    const qualityMult = pricing.qualityMultipliers[quality];

    // Покрытие
    const coatingCost = pricing.coatingPrices[coating];

    // Базовая себестоимость
    let costPerItem = (productCost + coverageCost) * qualityMult + coatingCost;

    // Срочность
    const urgencyMult = pricing.urgencyMultipliers[urgency];
    costPerItem *= urgencyMult;

    // Материалы
    const materialsPerItem = quantity > 0 ? materialsCost / quantity : 0;
    costPerItem += materialsPerItem;

    // Скидка
    let discount = 0;
    for (const tier of QUANTITY_DISCOUNTS) {
      if (quantity >= tier.min) {
        discount = tier.discount;
        break;
      }
    }

    // Цена с наценкой
    const pricePerItem = costPerItem * (1 + margin / 100) * (1 - discount);

    // Итого
    let total = pricePerItem * quantity + pricing.setupFee;
    if (total < pricing.minOrderFee) {
      total = pricing.minOrderFee;
    }

    // Breakdown
    const breakdown: CalculationResult["breakdown"] = [
      { label: "Заготовка", value: productCost * quantity, type: "cost" },
      { label: `Печать (${coverage}% покрытия)`, value: coverageCost * quantity, type: "cost" },
    ];

    if (coatingCost > 0) {
      breakdown.push({ label: "Покрытие", value: coatingCost * quantity, type: "cost" });
    }

    if (materialsCost > 0) {
      breakdown.push({ label: "Материалы со склада", value: materialsCost, type: "cost" });
    }

    breakdown.push({ label: "Настройка", value: pricing.setupFee, type: "fee" });

    if (discount > 0) {
      const discountValue = (pricePerItem * quantity * discount) / (1 - discount);
      breakdown.push({ label: `Скидка ${Math.round(discount * 100)}%`, value: -discountValue, type: "discount" });
    }

    return {
      perItem: Math.round(pricePerItem),
      total: Math.round(total),
      materialsCost: Math.round(materialsCost),
      printCost: Math.round(coverageCost * quantity),
      productCost: Math.round(productCost * quantity),
      coatingCost: Math.round(coatingCost * quantity),
      setupCost: pricing.setupFee,
      discount: Math.round(discount * 100),
      breakdown,
    };
  }, [settings, materialsCost, pricing, margin]);

  const reset = useCallback(() => {
    setSettings({
      quantity: 1,
      productType: "tshirt",
      size: "medium",
      coverage: 80,
      quality: "standard",
      coating: "none",
      urgency: "normal",
    });
    setMaterials([]);
    setMargin(30);
  }, []);

  return {
    settings,
    materials,
    pricing,
    margin,
    calculation,
    updateSettings,
    setMaterials,
    setPricing,
    setMargin,
    reset,
  };
}
