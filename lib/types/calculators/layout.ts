/**
 * Дизайн для визуализации на рулоне
 */
export interface DesignItem {
  /** Уникальный идентификатор (совпадает с id файла) */
  id: string;
  /** Название (из имени файла) */
  name: string;
  /** Ширина в мм */
  widthMm: number;
  /** Высота в мм */
  heightMm: number;
  /** Количество экземпляров */
  quantity: number;
  /** Индекс цвета для визуализации */
  colorIndex: number;
  /** URL миниатюры */
  thumbnailUrl?: string;
}

/**
 * Размещённый дизайн на раскладке
 */
export interface PlacedDesign {
  /** ID дизайна */
  designId: string;
  /** Индекс экземпляра (0, 1, 2...) */
  instanceIndex: number;
  /** Позиция X от левого края (мм) */
  x: number;
  /** Позиция Y от верха (мм) */
  y: number;
  /** Ширина (мм) */
  width: number;
  /** Высота (мм) */
  height: number;
  /** Повёрнут на 90° */
  rotated: boolean;
  /** Индекс цвета дизайна */
  colorIndex: number;
}

/**
 * Статистика раскладки
 */
export interface LayoutStats {
  /** Использованная площадь (мм²) */
  usedAreaMm2: number;
  /** Общая площадь рулона (мм²) */
  totalAreaMm2: number;
  /** Эффективность (%) */
  efficiency: number;
  /** Общее количество принтов */
  printCount: number;
}

/**
 * Настройки раскладки
 */
export interface LayoutSettings {
  /** Ширина рулона (мм) */
  rollWidthMm: number;
  /** Отступ от краёв (мм) */
  edgeMarginMm: number;
  /** Зазор между принтами (мм) */
  gapMm: number;
  /** Разрешить поворот */
  allowRotation: boolean;
}

/**
 * Результат оптимизации раскладки
 */
export interface LayoutResult {
  /** Массив размещённых дизайнов */
  placedDesigns: PlacedDesign[];
  /** Статистика */
  stats: LayoutStats & { totalLengthMm: number };
  /** Настройки */
  settings: LayoutSettings;
  /** Дизайны, которые не влезли (превышают ширину рулона) */
  skippedDesigns?: Array<{ id: string; name: string; width: number; height: number }>;
}

/**
 * Цвета для визуализации дизайнов (12 цветов)
 */
export const DESIGN_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', fill: '#DBEAFE' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700', fill: '#D1FAE5' },
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', fill: '#FEF3C7' },
  { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-700', fill: '#FFE4E6' },
  { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-700', fill: '#EDE9FE' },
  { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700', fill: '#CFFAFE' },
  { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', fill: '#FFEDD5' },
  { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', fill: '#FCE7F3' },
  { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-700', fill: '#ECFCCB' },
  { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700', fill: '#E0E7FF' },
  { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700', fill: '#CCFBF1' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-700', fill: '#FAE8FF' },
] as const;
