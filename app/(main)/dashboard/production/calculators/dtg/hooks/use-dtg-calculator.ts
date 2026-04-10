"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

export interface DTGSettings {
 quantity: number;
 width: number;
 height: number;
 fabricColor: "white" | "light" | "dark" | "black";
 printQuality: "standard" | "high" | "photo";
 pretreatment: boolean;
 fixation: "standard" | "enhanced";
 urgency: "normal" | "express" | "urgent";
}

export interface DTGPricing {
 pricePerSqCm: number;
 fabricColorMultipliers: Record<string, number>;
 qualityMultipliers: Record<string, number>;
 pretreatmentPrice: number;
 fixationPrices: Record<string, number>;
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
 pretreatmentCost: number;
 setupCost: number;
 discount: number;
 breakdown: {
  label: string;
  value: number;
  type: "cost" | "fee" | "discount";
 }[];
}

const DEFAULT_PRICING: DTGPricing = {
 pricePerSqCm: 1.2,
 fabricColorMultipliers: {
  white: 1,
  light: 1.1,
  dark: 1.5,
  black: 1.6,
 },
 qualityMultipliers: {
  standard: 1,
  high: 1.3,
  photo: 1.6,
 },
 pretreatmentPrice: 50,
 fixationPrices: {
  standard: 0,
  enhanced: 30,
 },
 urgencyMultipliers: {
  normal: 1,
  express: 1.3,
  urgent: 1.5,
 },
 setupFee: 300,
 minOrderFee: 500,
 minAreaSqCm: 50,
};

const QUANTITY_DISCOUNTS = [
 { min: 100, discount: 0.15 },
 { min: 50, discount: 0.1 },
 { min: 20, discount: 0.07 },
 { min: 10, discount: 0.05 },
];

export function useDTGCalculator() {
 const [settings, setSettings] = useState<DTGSettings>({
  quantity: 1,
  width: 20,
  height: 25,
  fabricColor: "white",
  printQuality: "standard",
  pretreatment: false,
  fixation: "standard",
  urgency: "normal",
 });
 const [materials, setMaterials] = useState<SelectedMaterial[]>([]);
 const [pricing, setPricing] = useState<DTGPricing>(DEFAULT_PRICING);
 const [margin, setMargin] = useState(30);

 const updateSettings = useCallback((updates: Partial<DTGSettings>) => {
  setSettings((prev) => {
   const newSettings = { ...prev, ...updates };
   // Автоматически включаем претрит для тёмных тканей
   if (updates.fabricColor && (updates.fabricColor === "dark" || updates.fabricColor === "black")) {
    newSettings.pretreatment = true;
   }
   return newSettings;
  });
 }, []);

 const materialsCost = useMemo(() => {
  return materials.reduce((sum, m) => sum + m.price * m.quantity, 0);
 }, [materials]);

 const calculation = useMemo((): CalculationResult => {
  const { quantity, width, height, fabricColor, printQuality, pretreatment, fixation, urgency } = settings;

  const areaSqCm = Math.max(width * height, pricing.minAreaSqCm);

  // Базовая стоимость печати
  const fabricMult = pricing.fabricColorMultipliers[fabricColor];
  const qualityMult = pricing.qualityMultipliers[printQuality];
  let printCostPerItem = areaSqCm * pricing.pricePerSqCm * fabricMult * qualityMult;

  // Претрит
  const pretreatmentCost = pretreatment ? pricing.pretreatmentPrice : 0;
  printCostPerItem += pretreatmentCost;

  // Фиксация
  printCostPerItem += pricing.fixationPrices[fixation];

  // Срочность
  const urgencyMult = pricing.urgencyMultipliers[urgency];
  printCostPerItem *= urgencyMult;

  // Материалы
  const materialsPerItem = quantity > 0 ? materialsCost / quantity : 0;
  const costPerItem = printCostPerItem + materialsPerItem;

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
   { label: `Печать (${areaSqCm.toFixed(0)} см²)`, value: areaSqCm * pricing.pricePerSqCm * quantity, type: "cost" },
  ];

  if (fabricMult > 1) {
   const fabricExtra = areaSqCm * pricing.pricePerSqCm * (fabricMult - 1) * quantity;
   breakdown.push({ label: "Тёмная ткань", value: fabricExtra, type: "cost" });
  }

  if (qualityMult > 1) {
   const qualityExtra = areaSqCm * pricing.pricePerSqCm * fabricMult * (qualityMult - 1) * quantity;
   breakdown.push({ label: "Повышенное качество", value: qualityExtra, type: "cost" });
  }

  if (pretreatmentCost > 0) {
   breakdown.push({ label: "Претрит", value: pretreatmentCost * quantity, type: "cost" });
  }

  if (pricing.fixationPrices[fixation] > 0) {
   breakdown.push({ label: "Усиленная фиксация", value: pricing.fixationPrices[fixation] * quantity, type: "cost" });
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
   areaSqCm,
   materialsCost: Math.round(materialsCost),
   printCost: Math.round(printCostPerItem * quantity),
   pretreatmentCost: Math.round(pretreatmentCost * quantity),
   setupCost: pricing.setupFee,
   discount: Math.round(discount * 100),
   breakdown,
  };
 }, [settings, materialsCost, pricing, margin]);

 const reset = useCallback(() => {
  setSettings({
   quantity: 1,
   width: 20,
   height: 25,
   fabricColor: "white",
   printQuality: "standard",
   pretreatment: false,
   fixation: "standard",
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
