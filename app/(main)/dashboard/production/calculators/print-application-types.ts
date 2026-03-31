// app/(main)/dashboard/production/calculators/print-application-types.ts

import { QuantityDiscount } from './silkscreen-types'

// Тип принта
export type PrintType = 
  | 'heat-transfer'      // Термотрансфер
  | 'vinyl'              // Виниловая плёнка
  | 'patch-sewn'         // Нашивка (пришивная)
  | 'patch-adhesive'     // Нашивка (клеевая)
  | 'chevron'            // Шеврон
  | 'label'              // Этикетка/бирка
  | 'rhinestones'        // Стразы
  | 'flock'              // Флок
  | 'reflective'         // Светоотражающий принт
  | '3d-transfer'        // 3D-трансфер

export interface PrintTypeInfo {
  id: PrintType
  name: string
  description: string
  baseWorkPrice: number      // Базовая цена работы за единицу
  setupTime: number          // Время настройки (минуты)
  applicationTime: number    // Время нанесения на 1 шт (минуты)
  requiresHeatPress: boolean // Нужен термопресс
  requiresSewing: boolean    // Нужна швейная машина
  minQuantity: number        // Минимальный заказ
}

export const PRINT_TYPES: PrintTypeInfo[] = [
  {
    id: 'heat-transfer',
    name: 'Термотрансфер',
    description: 'Перенос изображения под воздействием температуры и давления',
    baseWorkPrice: 50,
    setupTime: 5,
    applicationTime: 1,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
  {
    id: 'vinyl',
    name: 'Виниловая плёнка',
    description: 'Плоттерная резка и термоперенос виниловой плёнки',
    baseWorkPrice: 80,
    setupTime: 10,
    applicationTime: 2,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
  {
    id: 'patch-sewn',
    name: 'Нашивка пришивная',
    description: 'Пришивание готовой нашивки на изделие',
    baseWorkPrice: 100,
    setupTime: 3,
    applicationTime: 5,
    requiresHeatPress: false,
    requiresSewing: true,
    minQuantity: 1,
  },
  {
    id: 'patch-adhesive',
    name: 'Нашивка клеевая',
    description: 'Приклеивание термоклеевой нашивки',
    baseWorkPrice: 40,
    setupTime: 3,
    applicationTime: 1,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
  {
    id: 'chevron',
    name: 'Шеврон',
    description: 'Нанесение шеврона (пришивание или термоклей)',
    baseWorkPrice: 80,
    setupTime: 5,
    applicationTime: 3,
    requiresHeatPress: true,
    requiresSewing: true,
    minQuantity: 1,
  },
  {
    id: 'label',
    name: 'Этикетка / бирка',
    description: 'Пришивание или вшивание этикетки',
    baseWorkPrice: 30,
    setupTime: 2,
    applicationTime: 2,
    requiresHeatPress: false,
    requiresSewing: true,
    minQuantity: 10,
  },
  {
    id: 'rhinestones',
    name: 'Стразы',
    description: 'Термоперенос страз на изделие',
    baseWorkPrice: 120,
    setupTime: 10,
    applicationTime: 3,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
  {
    id: 'flock',
    name: 'Флок',
    description: 'Нанесение бархатистого флокового покрытия',
    baseWorkPrice: 90,
    setupTime: 8,
    applicationTime: 2,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 5,
  },
  {
    id: 'reflective',
    name: 'Светоотражающий',
    description: 'Нанесение светоотражающих элементов',
    baseWorkPrice: 100,
    setupTime: 5,
    applicationTime: 2,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
  {
    id: '3d-transfer',
    name: '3D-трансфер',
    description: 'Объёмный термотрансфер с эффектом 3D',
    baseWorkPrice: 150,
    setupTime: 10,
    applicationTime: 2,
    requiresHeatPress: true,
    requiresSewing: false,
    minQuantity: 1,
  },
]

// Размеры принтов
export interface PrintSize {
  id: string
  name: string
  maxWidth: number   // мм
  maxHeight: number  // мм
  priceMultiplier: number
}

export const PRINT_SIZES: PrintSize[] = [
  { id: 'xs', name: 'XS (до 5×5 см)', maxWidth: 50, maxHeight: 50, priceMultiplier: 0.6 },
  { id: 's', name: 'S (до 10×10 см)', maxWidth: 100, maxHeight: 100, priceMultiplier: 0.8 },
  { id: 'm', name: 'M (до 20×20 см)', maxWidth: 200, maxHeight: 200, priceMultiplier: 1.0 },
  { id: 'l', name: 'L (до 30×30 см)', maxWidth: 300, maxHeight: 300, priceMultiplier: 1.3 },
  { id: 'xl', name: 'XL (до 40×40 см)', maxWidth: 400, maxHeight: 400, priceMultiplier: 1.6 },
  { id: 'xxl', name: 'XXL (более 40 см)', maxWidth: 500, maxHeight: 600, priceMultiplier: 2.0 },
]

// Позиции нанесения
export interface ApplicationPosition {
  id: string
  name: string
  description: string
  difficultyMultiplier: number  // Множитель сложности
  maxPrints: number             // Макс. принтов на позиции
}

export const APPLICATION_POSITIONS: ApplicationPosition[] = [
  { id: 'chest-left', name: 'Грудь слева', description: 'Левая сторона груди', difficultyMultiplier: 1.0, maxPrints: 1 },
  { id: 'chest-right', name: 'Грудь справа', description: 'Правая сторона груди', difficultyMultiplier: 1.0, maxPrints: 1 },
  { id: 'chest-center', name: 'Грудь по центру', description: 'Центр груди', difficultyMultiplier: 1.0, maxPrints: 1 },
  { id: 'back-top', name: 'Спина сверху', description: 'Верхняя часть спины', difficultyMultiplier: 1.1, maxPrints: 1 },
  { id: 'back-center', name: 'Спина по центру', description: 'Центр спины', difficultyMultiplier: 1.0, maxPrints: 1 },
  { id: 'back-bottom', name: 'Спина снизу', description: 'Нижняя часть спины', difficultyMultiplier: 1.2, maxPrints: 1 },
  { id: 'sleeve-left', name: 'Рукав левый', description: 'Левый рукав', difficultyMultiplier: 1.3, maxPrints: 2 },
  { id: 'sleeve-right', name: 'Рукав правый', description: 'Правый рукав', difficultyMultiplier: 1.3, maxPrints: 2 },
  { id: 'collar', name: 'Воротник', description: 'Область воротника', difficultyMultiplier: 1.4, maxPrints: 1 },
  { id: 'pocket', name: 'Карман', description: 'На кармане', difficultyMultiplier: 1.2, maxPrints: 1 },
  { id: 'hem', name: 'Низ изделия', description: 'Нижняя кромка', difficultyMultiplier: 1.1, maxPrints: 1 },
  { id: 'hood', name: 'Капюшон', description: 'На капюшоне', difficultyMultiplier: 1.5, maxPrints: 1 },
]

// Скидки за объём
export const PRINT_APPLICATION_QUANTITY_DISCOUNTS: QuantityDiscount[] = [
  { minQuantity: 1, maxQuantity: 9, discount: 0, label: 'Без скидки' },
  { minQuantity: 10, maxQuantity: 24, discount: 5, label: 'От 10 шт.' },
  { minQuantity: 25, maxQuantity: 49, discount: 10, label: 'От 25 шт.' },
  { minQuantity: 50, maxQuantity: 99, discount: 15, label: 'От 50 шт.' },
  { minQuantity: 100, maxQuantity: 249, discount: 20, label: 'От 100 шт.' },
  { minQuantity: 250, maxQuantity: null, discount: 25, label: 'От 250 шт.' },
]

// Изделия для нанесения
export interface ApplicationGarment {
  id: string
  name: string
  category: string
  basePrice: number
  availablePositions: string[]  // ID доступных позиций
}

export const APPLICATION_GARMENTS: ApplicationGarment[] = [
  {
    id: 'tshirt',
    name: 'Футболка',
    category: 'Верхняя одежда',
    basePrice: 350,
    availablePositions: ['chest-left', 'chest-right', 'chest-center', 'back-top', 'back-center', 'sleeve-left', 'sleeve-right'],
  },
  {
    id: 'polo',
    name: 'Поло',
    category: 'Верхняя одежда',
    basePrice: 550,
    availablePositions: ['chest-left', 'chest-right', 'back-top', 'back-center', 'sleeve-left', 'sleeve-right', 'collar'],
  },
  {
    id: 'hoodie',
    name: 'Худи',
    category: 'Верхняя одежда',
    basePrice: 1200,
    availablePositions: ['chest-left', 'chest-right', 'chest-center', 'back-top', 'back-center', 'sleeve-left', 'sleeve-right', 'hood', 'pocket'],
  },
  {
    id: 'sweatshirt',
    name: 'Свитшот',
    category: 'Верхняя одежда',
    basePrice: 950,
    availablePositions: ['chest-left', 'chest-right', 'chest-center', 'back-top', 'back-center', 'sleeve-left', 'sleeve-right'],
  },
  {
    id: 'jacket',
    name: 'Куртка',
    category: 'Верхняя одежда',
    basePrice: 1800,
    availablePositions: ['chest-left', 'chest-right', 'back-top', 'back-center', 'sleeve-left', 'sleeve-right', 'collar'],
  },
  {
    id: 'vest',
    name: 'Жилет',
    category: 'Верхняя одежда',
    basePrice: 800,
    availablePositions: ['chest-left', 'chest-right', 'back-top', 'back-center'],
  },
  {
    id: 'cap',
    name: 'Кепка / Бейсболка',
    category: 'Головные уборы',
    basePrice: 300,
    availablePositions: ['chest-center'],  // передняя панель
  },
  {
    id: 'beanie',
    name: 'Шапка',
    category: 'Головные уборы',
    basePrice: 350,
    availablePositions: ['chest-center'],
  },
  {
    id: 'bag',
    name: 'Сумка / Шоппер',
    category: 'Аксессуары',
    basePrice: 250,
    availablePositions: ['chest-center', 'back-center'],
  },
  {
    id: 'backpack',
    name: 'Рюкзак',
    category: 'Аксессуары',
    basePrice: 800,
    availablePositions: ['back-center', 'pocket'],
  },
  {
    id: 'apron',
    name: 'Фартук',
    category: 'Спецодежда',
    basePrice: 400,
    availablePositions: ['chest-center', 'pocket'],
  },
  {
    id: 'pants',
    name: 'Брюки / Штаны',
    category: 'Нижняя одежда',
    basePrice: 700,
    availablePositions: ['pocket', 'hem'],
  },
]

export const APPLICATION_GARMENT_CATEGORIES = [
  'Верхняя одежда',
  'Головные уборы',
  'Аксессуары',
  'Спецодежда',
  'Нижняя одежда',
]

// Принт (готовый для нанесения)
export interface PrintItem {
  id: string
  name: string
  type: PrintType
  sizeId: string
  purchasePrice: number   // Закупочная цена принта
  quantity: number        // Количество в наличии/заказе
  supplierName?: string
  notes?: string
}

// Входные данные заказа на нанесение
export interface PrintApplicationInput {
  id: string
  garmentId: string
  garmentName?: string
  garmentPrice?: number
  quantity: number
  applications: {
    positionId: string
    positionName?: string
    printId: string
    printName?: string
    printType: PrintType
    printPrice: number
    sizeId: string
  }[]
}

// Результат расчёта
export interface PrintApplicationResult {
  totalCost: number
  costPerItem: number
  garmentsCost: number
  printsCost: number
  workCost: number
  setupCost: number
  quantityDiscount: number
  discountPercent: number
  totalItems: number
  totalPrints: number
  totalApplications: number
  estimatedTime: number
  breakdown: Array<{
    garmentName: string
    quantity: number
    garmentTotal: number
    applications: Array<{
      position: string
      printName: string
      printType: string
      printCost: number
      workCost: number
    }>
    itemTotal: number
  }>
}

// Параметры по умолчанию
export const DEFAULT_PRINT_APPLICATION_PARAMS = {
  includeGarments: true,        // Включать стоимость изделий
  setupFee: 200,                // Фиксированная плата за настройку
  rushMultiplier: 1.5,          // Множитель срочности
  minOrderAmount: 500,          // Минимальная сумма заказа
}
