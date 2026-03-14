// app/(main)/dashboard/production/calculators/silkscreen-types.ts

export interface SilkscreenGarment {
  id: string
  name: string
  type: 'tshirt' | 'hoodie' | 'polo' | 'sweatshirt' | 'jacket' | 'cap' | 'bag'
  basePrice: number
  availablePositions: string[]
}

export const SILKSCREEN_GARMENTS: SilkscreenGarment[] = [
  { id: 'tshirt', name: 'Футболка', type: 'tshirt', basePrice: 350, availablePositions: ['front', 'back', 'left-sleeve', 'right-sleeve'] },
  { id: 'hoodie', name: 'Худи', type: 'hoodie', basePrice: 1200, availablePositions: ['front', 'back', 'left-sleeve', 'right-sleeve', 'pocket'] },
  { id: 'polo', name: 'Поло', type: 'polo', basePrice: 650, availablePositions: ['front', 'back', 'left-sleeve', 'right-sleeve', 'collar'] },
  { id: 'sweatshirt', name: 'Свитшот', type: 'sweatshirt', basePrice: 950, availablePositions: ['front', 'back', 'left-sleeve', 'right-sleeve'] },
  { id: 'jacket', name: 'Куртка', type: 'jacket', basePrice: 1800, availablePositions: ['front', 'back', 'left-sleeve', 'right-sleeve', 'collar'] },
  { id: 'cap', name: 'Кепка', type: 'cap', basePrice: 300, availablePositions: ['front', 'side', 'back'] },
  { id: 'bag', name: 'Сумка', type: 'bag', basePrice: 250, availablePositions: ['front', 'back'] }
]

export interface SilkscreenPosition {
  id: string
  name: string
  description: string
  difficultyMultiplier: number
}

export const SILKSCREEN_POSITIONS: SilkscreenPosition[] = [
  { id: 'front', name: 'Грудь / Спереди', description: 'Центральная часть спереди', difficultyMultiplier: 1.0 },
  { id: 'back', name: 'Спина', description: 'Задняя часть изделия', difficultyMultiplier: 1.0 },
  { id: 'left-sleeve', name: 'Левый рукав', description: 'На левом рукаве', difficultyMultiplier: 1.3 },
  { id: 'right-sleeve', name: 'Правый рукав', description: 'На правом рукаве', difficultyMultiplier: 1.3 },
  { id: 'pocket', name: 'Карман', description: 'На кармане (худи)', difficultyMultiplier: 1.2 },
  { id: 'collar', name: 'Воротник', description: 'Область воротника', difficultyMultiplier: 1.4 },
  { id: 'side', name: 'Боковая панель', description: 'Бок кепки', difficultyMultiplier: 1.3 }
]

export interface SilkscreenPrintSize {
  id: string
  name: string
  width: number
  height: number
  setupPrice: number
  basePrice: number // Базовая цена за 1 цвет за 1 изделие
}

export const SILKSCREEN_PRINT_SIZES: SilkscreenPrintSize[] = [
  { id: 'xs', name: 'XS (до 10×10 см)', width: 100, height: 100, setupPrice: 400, basePrice: 15 },
  { id: 's', name: 'S (до 15×15 см)', width: 150, height: 150, setupPrice: 500, basePrice: 20 },
  { id: 'm', name: 'M (до 21×30 см, A4)', width: 210, height: 300, setupPrice: 600, basePrice: 30 },
  { id: 'l', name: 'L (до 30×42 см, A3)', width: 300, height: 420, setupPrice: 800, basePrice: 45 },
  { id: 'xl', name: 'XL (до 38×50 см)', width: 380, height: 500, setupPrice: 1000, basePrice: 60 },
  { id: 'xxl', name: 'XXL (до 50×70 см)', width: 500, height: 700, setupPrice: 1500, basePrice: 100 }
]

export interface SilkscreenPriceTier {
  minQuantity: number
  maxQuantity: number | null
  multiplier: number // Коэффициент цены от тиража
}

export const SILKSCREEN_PRICE_TIERS: SilkscreenPriceTier[] = [
  { minQuantity: 1, maxQuantity: 49, multiplier: 2.5 },
  { minQuantity: 50, maxQuantity: 99, multiplier: 1.8 },
  { minQuantity: 100, maxQuantity: 249, multiplier: 1.4 },
  { minQuantity: 250, maxQuantity: 499, multiplier: 1.1 },
  { minQuantity: 500, maxQuantity: 999, multiplier: 0.9 },
  { minQuantity: 1000, maxQuantity: null, multiplier: 0.75 }
]

export interface SilkscreenExtraCharge {
  id: string
  name: string
  price: number
  type: 'per-item' | 'per-color' | 'fixed'
}

export const SILKSCREEN_EXTRA_CHARGES: SilkscreenExtraCharge[] = [
  { id: 'flash', name: 'Промежуточная сушка (подложка)', price: 15, type: 'per-item' },
  { id: 'metallic', name: 'Металлизированная краска (золото/серебро)', price: 20, type: 'per-item' },
  { id: 'special', name: 'Спецэффекты (флуор, светоотражайка)', price: 30, type: 'per-item' },
  { id: 'waterbase', name: 'Водные краски (премиум)', price: 10, type: 'per-item' }
]

export interface SilkscreenPrintInput {
  id: string
  garmentId: string
  quantity: number
  isDarkGarment: boolean
  positions: Array<{
    positionId: string
    sizeId: string
    colors: Array<{
      inkType: string
      isUnderbase: boolean
    }>
    extraCharges?: string[]
  }>
}

export interface SilkscreenCalculatedPosition {
  positionId: string;
  positionName: string;
  sizeId: string;
  sizeName: string;
  colorsCount: number;
  colors: Array<{
    inkType: string;
    inkName: string;
    isUnderbase: boolean;
    screenCost: number;
    setupCost: number;
    printCostPerItem: number;
    totalPrintCost: number;
  }>;
  totalScreensCost: number;
  totalSetupCost: number;
  printCostPerItem: number;
  totalPrintCost: number;
}

export interface SilkscreenCalculationResult {
  positions: SilkscreenCalculatedPosition[];
  quantity: number;
  garmentCost: number;
  totalScreensCost: number;
  totalSetupCost: number;
  printCostBeforeDiscount: number;
  quantityDiscount: number;
  discountPercent: number;
  totalPrintCost: number;
  totalCost: number;
  costPerItem: number;
  breakdown: {
    garments: number;
    screens: number;
    setup: number;
    printing: number;
    discount: number;
    total: number;
  };
}

export type InkType = string;

export const SILKSCREEN_INK_TYPES = [
  { id: 'standard', name: 'Стандартная (Пластизоль)', priceMultiplier: 1 },
  { id: 'waterbase', name: 'Водная', priceMultiplier: 1.2 },
  { id: 'metallic', name: 'Металлик', priceMultiplier: 1.5 }
];

export const SILKSCREEN_SCREEN_PRICING = [
  { colorCount: 1, screenPrice: 1000, setupPrice: 500 },
  { colorCount: 2, screenPrice: 2000, setupPrice: 1000 },
  { colorCount: 3, screenPrice: 3000, setupPrice: 1500 },
  { colorCount: 4, screenPrice: 4000, setupPrice: 2000 },
  { colorCount: 5, screenPrice: 5000, setupPrice: 2500 },
  { colorCount: 6, screenPrice: 6000, setupPrice: 3000 },
  { colorCount: 999, screenPrice: 8000, setupPrice: 4000 }
];

export const SILKSCREEN_QUANTITY_DISCOUNTS = [
  { minQuantity: 1, maxQuantity: 49, discount: 0 },
  { minQuantity: 50, maxQuantity: 99, discount: 5 },
  { minQuantity: 100, maxQuantity: 249, discount: 10 },
  { minQuantity: 250, maxQuantity: 499, discount: 15 },
  { minQuantity: 500, maxQuantity: 999, discount: 20 },
  { minQuantity: 1000, maxQuantity: null, discount: 25 }
];

export interface QuantityDiscount {
  minQuantity: number
  maxQuantity: number | null
  discount: number
  label?: string
}

export const DEFAULT_SILKSCREEN_PARAMS = {
  includeScreens: true
};
