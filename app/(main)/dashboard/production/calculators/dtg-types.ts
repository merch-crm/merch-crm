// app/(main)/dashboard/production/calculators/dtg-types.ts

import { ConsumptionItem } from './types'

export type GarmentColor = 'light' | 'dark'

export interface DtgGarment {
 id: string
 name: string
 category: 'tshirt' | 'hoodie' | 'sweatshirt' | 'polo' | 'bag' | 'other'
 basePrice: number // Стоимость заготовки
 maxPrintWidth: number // Макс. ширина печати
 maxPrintHeight: number // Макс. высота печати
}

export const DTG_GARMENTS: DtgGarment[] = [
 // Футболки
 { id: 'tshirt-basic', name: 'Футболка базовая', category: 'tshirt', basePrice: 350, maxPrintWidth: 350, maxPrintHeight: 450 },
 { id: 'tshirt-premium', name: 'Футболка премиум', category: 'tshirt', basePrice: 550, maxPrintWidth: 350, maxPrintHeight: 450 },
 { id: 'tshirt-oversize', name: 'Футболка оверсайз', category: 'tshirt', basePrice: 650, maxPrintWidth: 400, maxPrintHeight: 500 },
 
 // Худи и свитшоты
 { id: 'hoodie-basic', name: 'Худи базовое', category: 'hoodie', basePrice: 1200, maxPrintWidth: 350, maxPrintHeight: 400 },
 { id: 'hoodie-premium', name: 'Худи премиум', category: 'hoodie', basePrice: 1800, maxPrintWidth: 350, maxPrintHeight: 400 },
 { id: 'sweatshirt', name: 'Свитшот', category: 'sweatshirt', basePrice: 1100, maxPrintWidth: 350, maxPrintHeight: 400 },
 
 // Поло
 { id: 'polo-basic', name: 'Поло базовое', category: 'polo', basePrice: 650, maxPrintWidth: 250, maxPrintHeight: 300 },
 { id: 'polo-premium', name: 'Поло премиум', category: 'polo', basePrice: 950, maxPrintWidth: 250, maxPrintHeight: 300 },
 
 // Сумки
 { id: 'tote-bag', name: 'Шоппер', category: 'bag', basePrice: 250, maxPrintWidth: 300, maxPrintHeight: 350 },
 { id: 'drawstring-bag', name: 'Рюкзак-мешок', category: 'bag', basePrice: 350, maxPrintWidth: 280, maxPrintHeight: 350 }
]

export const DTG_GARMENT_CATEGORIES = [
 { id: 'all', name: 'Все' },
 { id: 'tshirt', name: 'Футболки' },
 { id: 'hoodie', name: 'Худи' },
 { id: 'sweatshirt', name: 'Свитшоты' },
 { id: 'polo', name: 'Поло' },
 { id: 'bag', name: 'Сумки' }
]

export interface DtgPrintPosition {
 id: string
 name: string
 maxWidth: number
 maxHeight: number
 workPrice: number // Стоимость работы за позицию
}

export const DTG_PRINT_POSITIONS: DtgPrintPosition[] = [
 { id: 'front-full', name: 'Перед (полный)', maxWidth: 350, maxHeight: 450, workPrice: 150 },
 { id: 'front-a4', name: 'Перед (A4)', maxWidth: 210, maxHeight: 297, workPrice: 100 },
 { id: 'front-a5', name: 'Перед (A5)', maxWidth: 148, maxHeight: 210, workPrice: 70 },
 { id: 'front-logo', name: 'Перед (лого)', maxWidth: 100, maxHeight: 100, workPrice: 50 },
 { id: 'back-full', name: 'Спина (полный)', maxWidth: 350, maxHeight: 450, workPrice: 150 },
 { id: 'back-a4', name: 'Спина (A4)', maxWidth: 210, maxHeight: 297, workPrice: 100 },
 { id: 'sleeve-left', name: 'Рукав левый', maxWidth: 100, maxHeight: 150, workPrice: 80 },
 { id: 'sleeve-right', name: 'Рукав правый', maxWidth: 100, maxHeight: 150, workPrice: 80 },
 { id: 'pocket', name: 'Карман', maxWidth: 80, maxHeight: 80, workPrice: 60 },
 { id: 'collar', name: 'Воротник', maxWidth: 50, maxHeight: 30, workPrice: 40 }
]

// Цены DTG по площади (₽ за см²)
export interface DtgPriceLevel {
 minAreaCm2: number
 maxAreaCm2: number | null
 pricePerCm2Light: number // Для светлых тканей
 pricePerCm2Dark: number // Для тёмных тканей (включает белую подложку)
}

export const DTG_PRICE_LEVELS: DtgPriceLevel[] = [
 { minAreaCm2: 0, maxAreaCm2: 100, pricePerCm2Light: 2.5, pricePerCm2Dark: 4.0 },
 { minAreaCm2: 100, maxAreaCm2: 300, pricePerCm2Light: 2.0, pricePerCm2Dark: 3.5 },
 { minAreaCm2: 300, maxAreaCm2: 600, pricePerCm2Light: 1.5, pricePerCm2Dark: 3.0 },
 { minAreaCm2: 600, maxAreaCm2: 1000, pricePerCm2Light: 1.2, pricePerCm2Dark: 2.5 },
 { minAreaCm2: 1000, maxAreaCm2: null, pricePerCm2Light: 1.0, pricePerCm2Dark: 2.0 }
]

// Расход чернил DTG (мл на м²)
export const DTG_INK_CONSUMPTION = {
 cmyk: 15, // мл/м²
 white: 25, // мл/м² (для тёмных тканей)
 primer: 20 // мл/м² (предобработка для тёмных)
}

// Параметры по умолчанию для DTG
export const DEFAULT_DTG_PARAMS = {
 garmentColor: 'light' as GarmentColor,
 fillPercent: 60,
 wastePercent: 10
}

// Интерфейс для DTG-расчёта
export interface DtgPrintInput {
 id: string
 garmentId: string
 garmentColor: GarmentColor
 positions: Array<{
  positionId: string
  widthMm: number
  heightMm: number
  fillPercent?: number
 }>
 quantity: number
}

export interface DtgCalculationResult {
 items: Array<{
  garment: DtgGarment
  garmentColor: GarmentColor
  quantity: number
  positions: Array<{
   position: DtgPrintPosition
   areaCm2: number
   printCost: number
   workCost: number
  }>
  garmentCost: number // Стоимость заготовок
  printCost: number  // Стоимость печати
  workCost: number  // Стоимость работы
  primerCost: number // Стоимость праймера (для тёмных)
  totalCost: number
  costPerItem: number
 }>
 totalQuantity: number
 totalGarmentCost: number
 totalPrintCost: number
 totalWorkCost: number
 totalPrimerCost: number
 totalCost: number
 avgCostPerItem: number
 consumption: ConsumptionItem[]
}
