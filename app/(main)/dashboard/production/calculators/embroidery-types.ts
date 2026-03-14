// app/(main)/dashboard/production/calculators/embroidery-types.ts

import { QuantityDiscount } from './silkscreen-types'

// Типы ниток
export type ThreadType = 'polyester' | 'rayon' | 'metallic' | 'glow'

export interface ThreadTypeInfo {
  id: ThreadType
  name: string
  description: string
  priceMultiplier: number
  available: boolean
}

export const EMBROIDERY_THREAD_TYPES: ThreadTypeInfo[] = [
  {
    id: 'polyester',
    name: 'Полиэстер',
    description: 'Стандартная нить, прочная, устойчива к стирке',
    priceMultiplier: 1.0,
    available: true
  },
  {
    id: 'rayon',
    name: 'Вискоза (Rayon)',
    description: 'Шелковистый блеск, премиум вид',
    priceMultiplier: 1.3,
    available: true
  },
  {
    id: 'metallic',
    name: 'Металлик',
    description: 'Золото, серебро, медь — эффект металла',
    priceMultiplier: 2.0,
    available: true
  },
  {
    id: 'glow',
    name: 'Светящаяся',
    description: 'Светится в темноте',
    priceMultiplier: 2.5,
    available: true
  }
]

// Плотность вышивки
export type EmbroideryDensity = 'light' | 'medium' | 'heavy' | 'extra-heavy'

export interface DensityInfo {
  id: EmbroideryDensity
  name: string
  description: string
  stitchesPerCm2: number // Среднее количество стежков на см²
  priceMultiplier: number
}

export const EMBROIDERY_DENSITIES: DensityInfo[] = [
  {
    id: 'light',
    name: 'Лёгкая',
    description: 'Контуры, тонкие линии, текст',
    stitchesPerCm2: 50,
    priceMultiplier: 0.8
  },
  {
    id: 'medium',
    name: 'Средняя',
    description: 'Стандартная заливка, логотипы',
    stitchesPerCm2: 80,
    priceMultiplier: 1.0
  },
  {
    id: 'heavy',
    name: 'Плотная',
    description: 'Полная заливка, насыщенные цвета',
    stitchesPerCm2: 120,
    priceMultiplier: 1.2
  },
  {
    id: 'extra-heavy',
    name: 'Сверхплотная',
    description: '3D эффект, объёмная вышивка',
    stitchesPerCm2: 180,
    priceMultiplier: 1.5
  }
]

// Размеры вышивки
export interface EmbroiderySize {
  id: string
  name: string
  maxWidth: number
  maxHeight: number
  maxStitches: number // Примерный максимум стежков
  baseSetupPrice: number // Базовая приладка
}

export const EMBROIDERY_SIZES: EmbroiderySize[] = [
  { id: 'xs', name: 'XS (до 4×4 см)', maxWidth: 40, maxHeight: 40, maxStitches: 3000, baseSetupPrice: 150 },
  { id: 's', name: 'S (до 7×7 см)', maxWidth: 70, maxHeight: 70, maxStitches: 8000, baseSetupPrice: 200 },
  { id: 'm', name: 'M (до 10×10 см)', maxWidth: 100, maxHeight: 100, maxStitches: 15000, baseSetupPrice: 250 },
  { id: 'l', name: 'L (до 15×15 см)', maxWidth: 150, maxHeight: 150, maxStitches: 30000, baseSetupPrice: 300 },
  { id: 'xl', name: 'XL (до 20×20 см)', maxWidth: 200, maxHeight: 200, maxStitches: 50000, baseSetupPrice: 400 },
  { id: 'xxl', name: 'XXL (до 30×20 см)', maxWidth: 300, maxHeight: 200, maxStitches: 80000, baseSetupPrice: 500 }
]

// Позиции вышивки
export interface EmbroideryPosition {
  id: string
  name: string
  maxWidth: number
  maxHeight: number
  setupPrice: number
  difficulty: number // 1-3, влияет на время
}

export const EMBROIDERY_POSITIONS: EmbroideryPosition[] = [
  { id: 'left-chest', name: 'Левая грудь', maxWidth: 100, maxHeight: 100, setupPrice: 100, difficulty: 1 },
  { id: 'right-chest', name: 'Правая грудь', maxWidth: 100, maxHeight: 100, setupPrice: 100, difficulty: 1 },
  { id: 'center-chest', name: 'Центр груди', maxWidth: 200, maxHeight: 150, setupPrice: 150, difficulty: 1 },
  { id: 'back-full', name: 'Спина (полная)', maxWidth: 300, maxHeight: 200, setupPrice: 300, difficulty: 2 },
  { id: 'back-top', name: 'Спина (верх)', maxWidth: 200, maxHeight: 100, setupPrice: 200, difficulty: 1 },
  { id: 'left-sleeve', name: 'Левый рукав', maxWidth: 80, maxHeight: 80, setupPrice: 150, difficulty: 2 },
  { id: 'right-sleeve', name: 'Правый рукав', maxWidth: 80, maxHeight: 80, setupPrice: 150, difficulty: 2 },
  { id: 'collar', name: 'Воротник', maxWidth: 60, maxHeight: 30, setupPrice: 100, difficulty: 2 },
  { id: 'cap-front', name: 'Кепка (перед)', maxWidth: 100, maxHeight: 60, setupPrice: 200, difficulty: 3 },
  { id: 'cap-side', name: 'Кепка (бок)', maxWidth: 60, maxHeight: 40, setupPrice: 150, difficulty: 3 },
  { id: 'cap-back', name: 'Кепка (зад)', maxWidth: 80, maxHeight: 40, setupPrice: 150, difficulty: 2 }
]

// Цены за стежки (прогрессивная шкала)
export interface StitchPricing {
  minStitches: number
  maxStitches: number | null
  pricePerThousand: number // Цена за 1000 стежков
}

export const EMBROIDERY_STITCH_PRICING: StitchPricing[] = [
  { minStitches: 0, maxStitches: 5000, pricePerThousand: 25 },
  { minStitches: 5000, maxStitches: 10000, pricePerThousand: 22 },
  { minStitches: 10000, maxStitches: 20000, pricePerThousand: 18 },
  { minStitches: 20000, maxStitches: 50000, pricePerThousand: 15 },
  { minStitches: 50000, maxStitches: 100000, pricePerThousand: 12 },
  { minStitches: 100000, maxStitches: null, pricePerThousand: 10 }
]

// Цена дигитайзинга (оцифровки)
export interface DigitizingPricing {
  maxStitches: number
  price: number
}

export const EMBROIDERY_DIGITIZING_PRICING: DigitizingPricing[] = [
  { maxStitches: 5000, price: 1500 },
  { maxStitches: 10000, price: 2500 },
  { maxStitches: 20000, price: 3500 },
  { maxStitches: 50000, price: 5000 },
  { maxStitches: 100000, price: 7500 }
]

// Скидки за тираж
export const EMBROIDERY_QUANTITY_DISCOUNTS: QuantityDiscount[] = [
  { minQuantity: 1, maxQuantity: 9, discount: 0 },
  { minQuantity: 10, maxQuantity: 24, discount: 5 },
  { minQuantity: 25, maxQuantity: 49, discount: 10 },
  { minQuantity: 50, maxQuantity: 99, discount: 15 },
  { minQuantity: 100, maxQuantity: 249, discount: 20 },
  { minQuantity: 250, maxQuantity: 499, discount: 25 },
  { minQuantity: 500, maxQuantity: null, discount: 30 }
]

// Изделия для вышивки
export interface EmbroideryGarment {
  id: string
  name: string
  category: string
  basePrice: number
  availablePositions: string[]
  maxColors: number // Максимум цветов без доплаты
}

export const EMBROIDERY_GARMENTS: EmbroideryGarment[] = [
  {
    id: 'polo',
    name: 'Поло',
    category: 'polo',
    basePrice: 650,
    availablePositions: ['left-chest', 'right-chest', 'left-sleeve', 'right-sleeve', 'collar'],
    maxColors: 6
  },
  {
    id: 'shirt',
    name: 'Рубашка',
    category: 'shirt',
    basePrice: 850,
    availablePositions: ['left-chest', 'right-chest', 'left-sleeve', 'right-sleeve', 'collar'],
    maxColors: 6
  },
  {
    id: 'tshirt',
    name: 'Футболка',
    category: 'tshirt',
    basePrice: 400,
    availablePositions: ['left-chest', 'right-chest', 'center-chest', 'back-full', 'back-top', 'left-sleeve', 'right-sleeve'],
    maxColors: 6
  },
  {
    id: 'hoodie',
    name: 'Худи',
    category: 'hoodie',
    basePrice: 1300,
    availablePositions: ['left-chest', 'right-chest', 'center-chest', 'back-full', 'back-top'],
    maxColors: 6
  },
  {
    id: 'jacket',
    name: 'Куртка/ветровка',
    category: 'jacket',
    basePrice: 1500,
    availablePositions: ['left-chest', 'right-chest', 'back-full', 'back-top', 'left-sleeve', 'right-sleeve'],
    maxColors: 6
  },
  {
    id: 'cap',
    name: 'Кепка',
    category: 'cap',
    basePrice: 400,
    availablePositions: ['cap-front', 'cap-side', 'cap-back'],
    maxColors: 4
  },
  {
    id: 'beanie',
    name: 'Шапка',
    category: 'beanie',
    basePrice: 350,
    availablePositions: ['cap-front'],
    maxColors: 4
  },
  {
    id: 'bag',
    name: 'Сумка',
    category: 'bag',
    basePrice: 300,
    availablePositions: ['center-chest', 'back-full'],
    maxColors: 6
  },
  {
    id: 'towel',
    name: 'Полотенце',
    category: 'towel',
    basePrice: 450,
    availablePositions: ['center-chest'],
    maxColors: 6
  }
]

// Входные данные для расчёта вышивки
export interface EmbroideryDesign {
  id: string
  name: string
  widthMm: number
  heightMm: number
  stitchCount: number // Количество стежков (из файла или расчёт)
  colorsCount: number
  density: EmbroideryDensity
  threadType: ThreadType
  hasDigitizing: boolean // Нужен ли дигитайзинг (новый дизайн)
}

export interface EmbroideryPrintInput {
  id: string
  garmentId: string
  quantity: number
  positions: Array<{
    positionId: string
    designId: string // Ссылка на дизайн
  }>
}

export interface EmbroideryCalculationResult {
  orders: Record<string, unknown>[]; // Для типизации в компонентах
  totalCost: number
  avgCostPerItem: number
  totalDigitizingCost: number
  totalEmbroideryCost: number
  totalGarmentCost: number
  totalSetupCost: number
  totalExtraColorsCost: number
  totalCostBeforeDiscount: number
  discountAmount: number
  discountPercent: number
  totalQuantity: number
  totalStitches: number
  totalThreadConsumption: number
  threadConsumption?: {
    totalThreadMeters: number
  }
}

// Параметры по умолчанию
export const DEFAULT_EMBROIDERY_PARAMS = {
  density: 'medium' as EmbroideryDensity,
  threadType: 'polyester' as ThreadType,
  hasDigitizing: true
}

// Утилита: расчёт стежков по размеру и плотности
export function estimateStitchCount(
  widthMm: number,
  heightMm: number,
  density: EmbroideryDensity,
  fillPercent: number = 70
): number {
  const areaCm2 = (widthMm / 10) * (heightMm / 10)
  const densityInfo = EMBROIDERY_DENSITIES.find(d => d.id === density)
  const stitchesPerCm2 = densityInfo?.stitchesPerCm2 || 80
  
  return Math.round(areaCm2 * stitchesPerCm2 * (fillPercent / 100))
}

// Утилита: расход нити (примерно 5 метров на 1000 стежков)
export function estimateThreadConsumption(stitchCount: number): number {
  return (stitchCount / 1000) * 5
}
