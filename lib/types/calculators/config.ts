import { CalculatorType } from './base';

/**
 * Конфигурация типа калькулятора (для UI)
 */
export interface CalculatorTypeConfig {
  /** Идентификатор типа */
  type: CalculatorType;
  /** Название на русском */
  label: string;
  /** Краткое описание */
  description: string;
  /** Цвет для бейджа (Tailwind) */
  color: string;
  /** Название иконки из lucide-react */
  icon: string;
  /** Поддержка визуализации раскладки */
  hasVisualization: boolean;
  /** Поддержка модуля нанесений */
  hasPlacements: boolean;
  /** Терминология для UI (принт, дизайн, макет и т.д.) */
  terminology: {
    item: string;
    itemGenitive: string;
    itemPlural: string;
    itemPossessive: string;
    placeholder: string;
    action: string;
  };
}

/**
 * Конфигурация всех типов калькуляторов
 */
export const CALCULATOR_TYPES_CONFIG: Record<CalculatorType, CalculatorTypeConfig> = {
  dtf: {
    type: 'dtf',
    label: 'DTF-печать',
    description: 'Печать на плёнку для переноса на текстиль',
    color: 'blue',
    icon: 'Layers',
    hasVisualization: true,
    hasPlacements: true,
    terminology: {
      item: 'принт',
      itemGenitive: 'принта',
      itemPlural: 'принты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной принт, Спина',
      action: 'Добавить принт',
    },
  },
  'uv-dtf': {
    type: 'uv-dtf',
    label: 'UV DTF',
    description: 'УФ-печать на плёнку для твёрдых поверхностей',
    color: 'violet',
    icon: 'Sun',
    hasVisualization: true,
    hasPlacements: true,
    terminology: {
      item: 'принт',
      itemGenitive: 'принта',
      itemPlural: 'принты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной принт, Спина',
      action: 'Добавить принт',
    },
  },
  dtg: {
    type: 'dtg',
    label: 'DTG-печать',
    description: 'Прямая цифровая печать на текстиль',
    color: 'emerald',
    icon: 'Shirt',
    hasVisualization: false,
    hasPlacements: true,
    terminology: {
      item: 'принт',
      itemGenitive: 'принта',
      itemPlural: 'принты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной принт, Спина',
      action: 'Добавить принт',
    },
  },
  sublimation: {
    type: 'sublimation',
    label: 'Сублимация',
    description: 'Сублимационная печать на полиэстер',
    color: 'orange',
    icon: 'Flame',
    hasVisualization: false,
    hasPlacements: true,
    terminology: {
      item: 'принт',
      itemGenitive: 'принта',
      itemPlural: 'принты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной принт, Спина',
      action: 'Добавить принт',
    },
  },
  embroidery: {
    type: 'embroidery',
    label: 'Вышивка',
    description: 'Машинная вышивка',
    color: 'pink',
    icon: 'Scissors',
    hasVisualization: true,
    hasPlacements: false,
    terminology: {
      item: 'вышивка',
      itemGenitive: 'вышивки',
      itemPlural: 'вышивок',
      itemPossessive: 'Грудная',
      placeholder: 'Грудная вышивка, Спина',
      action: 'Добавить вышивку',
    },
  },
  silkscreen: {
    type: 'silkscreen',
    label: 'Шелкография',
    description: 'Трафаретная печать',
    color: 'cyan',
    icon: 'Grid3X3',
    hasVisualization: false,
    hasPlacements: true,
    terminology: {
      item: 'макет',
      itemGenitive: 'макета',
      itemPlural: 'макеты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной макет, Спина',
      action: 'Добавить макет',
    },
  },
  thermotransfer: {
    type: 'thermotransfer',
    label: 'Термотрансфер',
    description: 'Печать термотрансферными плёнками',
    color: 'red',
    icon: 'Thermometer',
    hasVisualization: true,
    hasPlacements: true,
    terminology: {
      item: 'макет',
      itemGenitive: 'макета',
      itemPlural: 'макеты',
      itemPossessive: 'Грудной',
      placeholder: 'Грудной макет, Спина',
      action: 'Добавить макет',
    },
  },
};
