// app/(main)/dashboard/production/calculators/sublimation-types.ts

import { CalculatorParams } from './types';

export interface SublimationProduct {
  id: string;
  name: string;
  type: "flat" | "cylindrical" | "fabric"; // Плоские, цилиндрические, ткань
  widthMm: number;
  heightMm: number;
  wrapAroundMm?: number; // Для кружек — периметр
  pressTime: number; // Время прессования в секундах
  temperature: number; // Температура в °C
  pricePerUnit: number; // Цена за изделие (заготовка)
}

export const SUBLIMATION_PRODUCTS: SublimationProduct[] = [
  {
    id: "mug-11oz",
    name: "Кружка 11oz",
    type: "cylindrical",
    widthMm: 95,
    heightMm: 200, // Высота развёртки
    wrapAroundMm: 240, // Периметр
    pressTime: 180,
    temperature: 200,
    pricePerUnit: 85,
  },
  {
    id: "mug-15oz",
    name: "Кружка 15oz",
    type: "cylindrical",
    widthMm: 100,
    heightMm: 220,
    wrapAroundMm: 260,
    pressTime: 200,
    temperature: 200,
    pricePerUnit: 120,
  },
  {
    id: "mousepad",
    name: "Коврик для мыши",
    type: "flat",
    widthMm: 240,
    heightMm: 200,
    pressTime: 60,
    temperature: 190,
    pricePerUnit: 45,
  },
  {
    id: "puzzle-a4",
    name: "Пазл A4",
    type: "flat",
    widthMm: 210,
    heightMm: 297,
    pressTime: 90,
    temperature: 200,
    pricePerUnit: 150,
  },
  {
    id: "puzzle-a3",
    name: "Пазл A3",
    type: "flat",
    widthMm: 297,
    heightMm: 420,
    pressTime: 120,
    temperature: 200,
    pricePerUnit: 280,
  },
  {
    id: "plate-20cm",
    name: "Тарелка 20 см",
    type: "flat",
    widthMm: 200,
    heightMm: 200,
    pressTime: 180,
    temperature: 200,
    pricePerUnit: 180,
  },
  {
    id: "pillow-40x40",
    name: "Подушка 40×40",
    type: "flat",
    widthMm: 400,
    heightMm: 400,
    pressTime: 45,
    temperature: 190,
    pricePerUnit: 250,
  },
  {
    id: "flag-small",
    name: "Флаг 60×90",
    type: "fabric",
    widthMm: 600,
    heightMm: 900,
    pressTime: 35,
    temperature: 200,
    pricePerUnit: 0,
  },
  {
    id: "flag-medium",
    name: "Флаг 90×135",
    type: "fabric",
    widthMm: 900,
    heightMm: 1350,
    pressTime: 35,
    temperature: 200,
    pricePerUnit: 0,
  },
  {
    id: "tshirt-full",
    name: "Футболка (полная)",
    type: "flat",
    widthMm: 400,
    heightMm: 500,
    pressTime: 45,
    temperature: 190,
    pricePerUnit: 350,
  },
  {
    id: "fabric-meter",
    name: "Ткань (за метр)",
    type: "fabric",
    widthMm: 1500,
    heightMm: 1000,
    pressTime: 30,
    temperature: 200,
    pricePerUnit: 0,
  },
];

// Стоимость ткани за м²
export const SUBLIMATION_FABRIC_PRICES: Record<string, number> = {
  "polyester-basic": 180, // Базовый полиэстер
  "polyester-premium": 350, // Премиум полиэстер
  "satin": 450, // Атлас
  "flag-fabric": 280, // Флаговая ткань
  "jersey": 400, // Трикотаж
};

export const DEFAULT_SUBLIMATION_PARAMS: Omit<CalculatorParams, "applicationType"> = {
  rollWidthMm: 610,
  edgeMarginMm: 5,
  printGapMm: 3,
};
