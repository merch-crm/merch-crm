"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

export interface PrintApplicationSettings {
 quantity: number;
 printType: "flex" | "flock" | "reflective" | "glitter" | "neons" | "transfer";
 applicationType: "thermal" | "sew-on" | "patch";
 size: "small" | "medium" | "large" | "xlarge";
 complexCutting: boolean;
 weedComplexity: "simple" | "medium" | "complex";
 urgency: "normal" | "express" | "urgent";
}

export interface PrintApplicationPricing {
 printPrices: Record<string, number>;
 applicationPrices: Record<string, number>;
 sizePrices: Record<string, number>;
 cuttingPrice: number;
 weedPrices: Record<string, number>;
 urgencyMultipliers: Record<string, number>;
 setupFee: number;
 minOrderFee: number;
}

export interface CalculationResult {
 perItem: number;
 total: number;
 materialsCost: number;
 printCost: number;
 applicationCost: number;
 cuttingFee: number;
 setupCost: number;
 discount: number;
 breakdown: {
  label: string;
  value: number;
  type: "cost" | "fee" | "discount";
 }[];
}

const DEFAULT_PRICING: PrintApplicationPricing = {
 printPrices: {
  flex: 120,
  flock: 180,
  reflective: 250,
  glitter: 220,
  neons: 150,
  transfer: 100,
 },
 applicationPrices: {
  thermal: 40,
  "sew-on": 120,
  patch: 80,
 },
 sizePrices: {
  small: 1,
  medium: 1.5,
  large: 2.2,
  xlarge: 3,
 },
 cuttingPrice: 30,
 weedPrices: {
  simple: 0,
  medium: 40,
  complex: 80,
 },
 urgencyMultipliers: {
  normal: 1,
  express: 1.3,
  urgent: 1.5,
 },
 setupFee: 200,
 minOrderFee: 400,
};

const QUANTITY_DISCOUNTS = [
 { min: 100, discount: 0.15 },
 { min: 50, discount: 0.1 },
 { min: 20, discount: 0.05 },
];

export function usePrintApplicationCalculator() {
 const [settings, setSettings] = useState<PrintApplicationSettings>({
  quantity: 1,
  printType: "flex",
  applicationType: "thermal",
  size: "medium",
  complexCutting: false,
  weedComplexity: "simple",
  urgency: "normal",
 });
 const [materials, setMaterials] = useState<SelectedMaterial[]>([]);
 const [pricing, setPricing] = useState<PrintApplicationPricing>(DEFAULT_PRICING);
 const [margin, setMargin] = useState(30);

 const updateSettings = useCallback((updates: Partial<PrintApplicationSettings>) => {
  setSettings((prev) => ({ ...prev, ...updates }));
 }, []);

 const materialsCost = useMemo(() => {
  return materials.reduce((sum, m) => sum + m.price * m.quantity, 0);
 }, [materials]);

 const calculation = useMemo((): CalculationResult => {
  const { quantity, printType, applicationType, size, complexCutting, weedComplexity, urgency } = settings;

  const sizeMult = pricing.sizePrices[size];

  // Стоимость печати/материала
  const basePrintCost = pricing.printPrices[printType] * sizeMult;

  // Резка и выборка
  const cuttingCost = complexCutting ? pricing.cuttingPrice * sizeMult : 0;
  const weedCost = pricing.weedPrices[weedComplexity] * sizeMult;

  // Стоимость нанесения
  const applicationCost = pricing.applicationPrices[applicationType];

  // Базовая себестоимость
  let costPerItem = basePrintCost + cuttingCost + weedCost + applicationCost;

  // Срочность
  const urgencyMult = pricing.urgencyMultipliers[urgency];
  costPerItem *= urgencyMult;

  // Материалы со склада
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
   { label: `Печать (${printType})`, value: basePrintCost * quantity, type: "cost" },
   { label: `Нанесение (${applicationType})`, value: applicationCost * quantity, type: "cost" },
  ];

  if (cuttingCost > 0) {
   breakdown.push({ label: "Сложная контурная резка", value: cuttingCost * quantity, type: "cost" });
  }

  if (weedCost > 0) {
   breakdown.push({ label: `Выборка пленки (${weedComplexity})`, value: weedCost * quantity, type: "cost" });
  }

  if (materialsCost > 0) {
   breakdown.push({ label: "Материалы со склада", value: materialsCost, type: "cost" });
  }

  breakdown.push({ label: "Настройка оборудования", value: pricing.setupFee, type: "fee" });

  if (discount > 0) {
   const discountValue = (pricePerItem * quantity * discount) / (1 - discount);
   breakdown.push({ label: `Скидка ${Math.round(discount * 100)}%`, value: -discountValue, type: "discount" });
  }

  return {
   perItem: Math.round(pricePerItem),
   total: Math.round(total),
   materialsCost: Math.round(materialsCost),
   printCost: Math.round(basePrintCost * quantity),
   applicationCost: Math.round(applicationCost * quantity),
   cuttingFee: Math.round(cuttingCost * quantity),
   setupCost: pricing.setupFee,
   discount: Math.round(discount * 100),
   breakdown,
  };
 }, [settings, materialsCost, pricing, margin]);

 const reset = useCallback(() => {
  setSettings({
   quantity: 1,
   printType: "flex",
   applicationType: "thermal",
   size: "medium",
   complexCutting: false,
   weedComplexity: "simple",
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
