/**
 * @fileoverview Типы для модуля нанесений
 * @module lib/types/placements
 * @audit Создан 2026-03-25
 */

/**
 * Типы продуктов для нанесения
 */
export const PRODUCT_TYPES = {
  tshirt: { label: 'Футболка', icon: '👕' },
  hoodie: { label: 'Худи', icon: '🧥' },
  sweatshirt: { label: 'Свитшот', icon: '👔' },
  polo: { label: 'Поло', icon: '👕' },
  cap: { label: 'Кепка', icon: '🧢' },
  bag: { label: 'Сумка/Шоппер', icon: '👜' },
  backpack: { label: 'Рюкзак', icon: '🎒' },
  apron: { label: 'Фартук', icon: '🥻' },
  towel: { label: 'Полотенце', icon: '🛁' },
  pillow: { label: 'Подушка', icon: '🛋️' },
  mug: { label: 'Кружка', icon: '☕' },
  bottle: { label: 'Бутылка', icon: '🍶' },
  phonecase: { label: 'Чехол для телефона', icon: '📱' },
  notebook: { label: 'Блокнот', icon: '📓' },
  flag: { label: 'Флаг/Баннер', icon: '🚩' },
  other: { label: 'Другое', icon: '📦' },
} as const;

export type PlacementProductType = keyof typeof PRODUCT_TYPES;

/**
 * Зона нанесения на продукте
 */
export interface PlacementArea {
  id: string;
  /** ID продукта */
  productId: string;
  /** Название зоны */
  name: string;
  /** Код зоны (для программной идентификации) */
  code: string;
  /** Максимальная ширина (мм) */
  maxWidthMm: number;
  /** Максимальная высота (мм) */
  maxHeightMm: number;
  /** Стоимость работы за нанесение */
  workPrice: number;
  /** Активна ли зона */
  isActive: boolean;
  /** Порядок сортировки */
  sortOrder: number;
  /** Дата создания */
  createdAt: Date;
  /** Дата обновления */
  updatedAt: Date;
}

/**
 * Продукт с зонами нанесения
 */
export interface PlacementProduct {
  id: string;
  /** Тип продукта */
  type: PlacementProductType;
  /** Название продукта */
  name: string;
  /** Описание */
  description?: string;
  /** Активен ли продукт */
  isActive: boolean;
  /** Порядок сортировки */
  sortOrder: number;
  /** Зоны нанесения */
  areas: PlacementArea[];
  /** Дата создания */
  createdAt: Date;
  /** Дата обновления */
  updatedAt: Date;
}

/**
 * Выбранное нанесение в калькуляторе
 */
export interface SelectedPlacement {
  /** ID зоны нанесения */
  areaId: string;
  /** ID продукта */
  productId: string;
  /** Название продукта */
  productName: string;
  /** Название зоны */
  areaName: string;
  /** Стоимость работы */
  workPrice: number;
  /** Количество нанесений на единицу продукта */
  count: number;
}

/**
 * Результат расчёта стоимости нанесений
 */
export interface PlacementsCostResult {
  /** Список нанесений с ценами */
  items: Array<{
    areaId: string;
    productName: string;
    areaName: string;
    workPrice: number;
    count: number;
    subtotal: number;
  }>;
  /** Общая стоимость на единицу */
  costPerUnit: number;
  /** Общая стоимость на весь тираж */
  totalCost: number;
}

/**
 * Данные формы создания/редактирования продукта
 */
export interface PlacementProductFormData {
  type: PlacementProductType;
  name: string;
  description?: string;
  isActive: boolean;
  areas: Array<{
    id?: string;
    name: string;
    code: string;
    maxWidthMm: number;
    maxHeightMm: number;
    workPrice: number;
    isActive: boolean;
    sortOrder: number;
  }>;
}

/**
 * Предустановленные зоны для типов продуктов
 */
export const DEFAULT_AREAS_BY_PRODUCT: Record<
  PlacementProductType,
  Array<{ name: string; code: string; maxWidthMm: number; maxHeightMm: number }>
> = {
  tshirt: [
    { name: 'Грудь (центр)', code: 'chest_center', maxWidthMm: 300, maxHeightMm: 350 },
    { name: 'Грудь (левая)', code: 'chest_left', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Грудь (правая)', code: 'chest_right', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Спина (полная)', code: 'back_full', maxWidthMm: 350, maxHeightMm: 450 },
    { name: 'Спина (верх)', code: 'back_top', maxWidthMm: 300, maxHeightMm: 100 },
    { name: 'Рукав (левый)', code: 'sleeve_left', maxWidthMm: 80, maxHeightMm: 120 },
    { name: 'Рукав (правый)', code: 'sleeve_right', maxWidthMm: 80, maxHeightMm: 120 },
  ],
  hoodie: [
    { name: 'Грудь (центр)', code: 'chest_center', maxWidthMm: 300, maxHeightMm: 300 },
    { name: 'Грудь (левая)', code: 'chest_left', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Спина (полная)', code: 'back_full', maxWidthMm: 350, maxHeightMm: 400 },
    { name: 'Капюшон', code: 'hood', maxWidthMm: 200, maxHeightMm: 150 },
    { name: 'Рукав (левый)', code: 'sleeve_left', maxWidthMm: 80, maxHeightMm: 250 },
    { name: 'Рукав (правый)', code: 'sleeve_right', maxWidthMm: 80, maxHeightMm: 250 },
    { name: 'Карман', code: 'pocket', maxWidthMm: 250, maxHeightMm: 150 },
  ],
  sweatshirt: [
    { name: 'Грудь (центр)', code: 'chest_center', maxWidthMm: 300, maxHeightMm: 300 },
    { name: 'Грудь (левая)', code: 'chest_left', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Спина (полная)', code: 'back_full', maxWidthMm: 350, maxHeightMm: 400 },
    { name: 'Рукав (левый)', code: 'sleeve_left', maxWidthMm: 80, maxHeightMm: 250 },
    { name: 'Рукав (правый)', code: 'sleeve_right', maxWidthMm: 80, maxHeightMm: 250 },
  ],
  polo: [
    { name: 'Грудь (левая)', code: 'chest_left', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Грудь (правая)', code: 'chest_right', maxWidthMm: 100, maxHeightMm: 100 },
    { name: 'Спина (верх)', code: 'back_top', maxWidthMm: 300, maxHeightMm: 100 },
    { name: 'Рукав', code: 'sleeve', maxWidthMm: 60, maxHeightMm: 80 },
  ],
  cap: [
    { name: 'Передняя панель', code: 'front', maxWidthMm: 120, maxHeightMm: 80 },
    { name: 'Боковая панель', code: 'side', maxWidthMm: 60, maxHeightMm: 60 },
    { name: 'Задняя панель', code: 'back', maxWidthMm: 80, maxHeightMm: 40 },
    { name: 'Козырёк', code: 'visor', maxWidthMm: 150, maxHeightMm: 60 },
  ],
  bag: [
    { name: 'Передняя сторона', code: 'front', maxWidthMm: 300, maxHeightMm: 350 },
    { name: 'Задняя сторона', code: 'back', maxWidthMm: 300, maxHeightMm: 350 },
    { name: 'Карман', code: 'pocket', maxWidthMm: 150, maxHeightMm: 150 },
  ],
  backpack: [
    { name: 'Передняя панель', code: 'front', maxWidthMm: 250, maxHeightMm: 300 },
    { name: 'Клапан', code: 'flap', maxWidthMm: 200, maxHeightMm: 150 },
    { name: 'Боковой карман', code: 'side_pocket', maxWidthMm: 100, maxHeightMm: 150 },
  ],
  apron: [
    { name: 'Грудь', code: 'chest', maxWidthMm: 250, maxHeightMm: 200 },
    { name: 'Нижняя часть', code: 'bottom', maxWidthMm: 300, maxHeightMm: 300 },
    { name: 'Карман', code: 'pocket', maxWidthMm: 200, maxHeightMm: 150 },
  ],
  towel: [
    { name: 'Угол', code: 'corner', maxWidthMm: 150, maxHeightMm: 150 },
    { name: 'Центр', code: 'center', maxWidthMm: 400, maxHeightMm: 300 },
    { name: 'Бордюр', code: 'border', maxWidthMm: 600, maxHeightMm: 100 },
  ],
  pillow: [
    { name: 'Лицевая сторона', code: 'front', maxWidthMm: 350, maxHeightMm: 350 },
    { name: 'Оборотная сторона', code: 'back', maxWidthMm: 350, maxHeightMm: 350 },
  ],
  mug: [
    { name: 'Основная область', code: 'main', maxWidthMm: 200, maxHeightMm: 90 },
    { name: 'Полная запечатка', code: 'full_wrap', maxWidthMm: 240, maxHeightMm: 90 },
  ],
  bottle: [
    { name: 'Основная область', code: 'main', maxWidthMm: 150, maxHeightMm: 80 },
    { name: 'Полная запечатка', code: 'full_wrap', maxWidthMm: 220, maxHeightMm: 100 },
  ],
  phonecase: [
    { name: 'Задняя панель', code: 'back', maxWidthMm: 70, maxHeightMm: 140 },
  ],
  notebook: [
    { name: 'Обложка', code: 'cover', maxWidthMm: 150, maxHeightMm: 210 },
    { name: 'Корешок', code: 'spine', maxWidthMm: 20, maxHeightMm: 210 },
  ],
  flag: [
    { name: 'Полная площадь', code: 'full', maxWidthMm: 1500, maxHeightMm: 1000 },
  ],
  other: [
    { name: 'Основная область', code: 'main', maxWidthMm: 300, maxHeightMm: 300 },
  ],
};
