"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

export interface SilkscreenSettings {
 quantity: number;
 colors: number;
 printLocations: number; // количество мест печати
 size: "small" | "medium" | "large" | "xlarge";
 inkType: "plastisol" | "waterbase" | "discharge" | "specialty";
 meshCount: "low" | "medium" | "high";
 urgency: "normal" | "express" | "urgent";
}

export interface SilkscreenPricing {
 basePrice: number;
 colorPrice: number;
 locationPrice: number;
 sizePrices: Record<string, number>;
 inkPrices: Record<string, number>;
 meshMultipliers: Record<string, number>;
 screenFee: number; // за каждый экран
 setupFee: number;
 urgencyMultipliers: Record<string, number>;
 minOrderQuantity: number;
 minOrderFee: number;
}

export interface CalculationResult {
 perItem: number;
 total: number;
 materialsCost: number;
 printCost: number;
 screensCost: number;
 setupCost: number;
 discount: number;
 screensNeeded: number;
 breakdown: {
  label: string;
  value: number;
  type: "cost" | "fee" | "discount";
 }[];
}

const DEFAULT_PRICING: SilkscreenPricing = {
 basePrice: 30,
 colorPrice: 25,
 locationPrice: 40,
 sizePrices: {
  small: 0,
  medium: 10,
  large: 25,
  xlarge: 40,
 },
 inkPrices: {
  plastisol: 0,
  waterbase: 15,
  discharge: 30,
  specialty: 50,
 },
 meshMultipliers: {
  low: 0.9,
  medium: 1,
  high: 1.2,
 },
 screenFee: 800, // стоимость изготовления одного экрана
 setupFee: 500,
 urgencyMultipliers: {
  normal: 1,
  express: 1.3,
  urgent: 1.6,
 },
 minOrderQuantity: 20,
 minOrderFee: 2000,
};

const QUANTITY_DISCOUNTS = [
 { min: 1000, discount: 0.25 },
 { min: 500, discount: 0.2 },
 { min: 200, discount: 0.15 },
 { min: 100, discount: 0.1 },
 { min: 50, discount: 0.05 },
];

export function useSilkscreenCalculator() {
 const [settings, setSettings] = useState<SilkscreenSettings>({
  quantity: 50,
  colors: 2,
  printLocations: 1,
  size: "medium",
  inkType: "plastisol",
  meshCount: "medium",
  urgency: "normal",
 });
 const [materials, setMaterials] = useState<SelectedMaterial[]>([]);
 const [pricing, setPricing] = useState<SilkscreenPricing>(DEFAULT_PRICING);
 const [margin, setMargin] = useState(30);

 const updateSettings = useCallback((updates: Partial<SilkscreenSettings>) => {
  setSettings((prev) => ({ ...prev, ...updates }));
 }, []);

 const materialsCost = useMemo(() => {
  return materials.reduce((sum, m) => sum + m.price * m.quantity, 0);
 }, [materials]);

 const calculation = useMemo((): CalculationResult => {
  const { quantity, colors, printLocations, size, inkType, meshCount, urgency } = settings;

  // Количество экранов
  const screensNeeded = colors * printLocations;

  // Базовая стоимость печати за единицу
  const sizePrice = pricing.sizePrices[size];
  const inkPrice = pricing.inkPrices[inkType];
  const meshMult = pricing.meshMultipliers[meshCount];

  let printCostPerItem = pricing.basePrice;
  printCostPerItem += colors * pricing.colorPrice;
  printCostPerItem += (printLocations - 1) * pricing.locationPrice;
  printCostPerItem += sizePrice;
  printCostPerItem += inkPrice;
  printCostPerItem *= meshMult;

  // Срочность
  const urgencyMult = pricing.urgencyMultipliers[urgency];
  printCostPerItem *= urgencyMult;

  // Стоимость экранов (единоразово)
  const screensCost = screensNeeded * pricing.screenFee;

  // Материалы на единицу
  const materialsPerItem = quantity > 0 ? materialsCost / quantity : 0;
  const costPerItem = printCostPerItem + materialsPerItem;

  // Скидка за объём
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
  let total = pricePerItem * quantity + screensCost + pricing.setupFee;

  // Минимальный заказ
  if (quantity < pricing.minOrderQuantity) {
   total = Math.max(total, pricing.minOrderFee);
  }

  // Breakdown
  const breakdown: CalculationResult["breakdown"] = [
   { label: "Базовая печать", value: pricing.basePrice * quantity, type: "cost" },
   { label: `Цвета (${colors})`, value: colors * pricing.colorPrice * quantity, type: "cost" },
  ];

  if (printLocations > 1) {
   breakdown.push({
    label: `Доп. места печати (${printLocations - 1})`,
    value: (printLocations - 1) * pricing.locationPrice * quantity,
    type: "cost",
   });
  }

  if (sizePrice > 0) {
   breakdown.push({ label: "Размер принта", value: sizePrice * quantity, type: "cost" });
  }

  if (inkPrice > 0) {
   breakdown.push({ label: "Тип краски", value: inkPrice * quantity, type: "cost" });
  }

  breakdown.push({
   label: `Изготовление экранов (${screensNeeded})`,
   value: screensCost,
   type: "fee",
  });

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
   printCost: Math.round(printCostPerItem * quantity),
   screensCost,
   setupCost: pricing.setupFee,
   discount: Math.round(discount * 100),
   screensNeeded,
   breakdown,
  };
 }, [settings, materialsCost, pricing, margin]);

 const reset = useCallback(() => {
  setSettings({
   quantity: 50,
   colors: 2,
   printLocations: 1,
   size: "medium",
   inkType: "plastisol",
   meshCount: "medium",
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
