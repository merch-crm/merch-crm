import { CalculatorType } from './base';
import { UploadedDesignFile } from './files';
import { UrgencySettings } from './specific';
import { CalculationParameters } from './params';

/**
 * Детализация себестоимости
 */
export interface CostBreakdown {
  /** Стоимость печати/работы */
  print: number;
  /** Стоимость материалов */
  materials: number;
  /** Стоимость нанесений */
  placements: number;
  /** Стоимость создания программы (для вышивки) */
  programCost?: number;
  /** Стоимость рамок (для шелкографии) */
  framesCost?: number;
  /** Суммарная себестоимость */
  total: number;
}

/**
 * Результат расчёта калькулятора
 */
export interface CalculationResult {
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Детализация себестоимости */
  costBreakdown: CostBreakdown;
  /** Детальный список расходников */
  consumables: Array<{
    name: string;
    pricePerUnit: number;
    consumption: number;
    unit: string;
    cost: number;
  }>;
  /** Детальный список нанесений */
  placements: Array<{
    productName: string;
    areaName: string;
    quantity: number;
    pricePerUnit: number;
    cost: number;
  }>;
  /** Общая себестоимость */
  totalCost: number;
  /** Процент маржи */
  marginPercent: number;
  /** Сумма маржи */
  marginAmount: number;
  /** Настройки срочности */
  urgency: UrgencySettings;
  /** Итоговая цена продажи */
  sellingPrice: number;
  /** Количество */
  quantity: number;
  /** Цена за единицу */
  pricePerItem: number;
}

/**
 * Запись истории расчётов (полная модель)
 */
export interface CalculationHistoryItem {
  /** Уникальный идентификатор */
  id: string;
  /** Номер расчёта (CALC-2026-XXXXX) */
  calculationNumber: string;
  /** Алиас для номера (для совместимости) */
  number: string;
  /** Название расчёта */
  name: string;
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Общая себестоимость */
  totalCost: number;
  /** Себестоимость (для обратной совместимости) */
  costPrice?: number;
  /** Цена продажи */
  sellingPrice: number;
  /** Количество */
  quantity: number;
  /** Цена за единицу */
  pricePerItem: number;
  /** Процент маржи */
  marginPercent: number;
  /** Полные параметры расчёта */
  parameters: CalculationParameters;
  /** Загруженные файлы */
  designFiles: UploadedDesignFile[];
  /** Визуализация раскладки (если есть) */
  rollVisualization?: {
    imageUrl: string;
    totalLengthM: number;
    efficiencyPercent: number;
  } | null;
  /** Имя клиента */
  clientName?: string | null;
  /** Комментарий */
  comment?: string | null;
  /** Дата создания */
  createdAt: Date;
  /** ID автора */
  createdBy: string;
  /** Имя автора (для отображения) */
  createdByName?: string | null;
  
  // Детализация (для PDF)
  consumablesCost?: number;
  placementsCost?: number;
  urgencySurcharge?: number;
  consumables?: Array<{
    name: string;
    pricePerUnit: number;
    consumptionPerUnit: number;
    unit: string;
    cost: number;
  }>;
  placements?: Array<{
    productName: string;
    zoneName: string;
    quantity: number;
    pricePerUnit: number;
    cost: number;
  }>;
  
  // Схема раскладки (SVG data URL)
  layoutSvg?: string;
  
  /** Дата удаления (soft delete) */
  deletedAt?: Date | null;
  /** ID удалившего */
  deletedBy?: string | null;
}

/**
 * Фильтры истории расчётов
 */
export interface HistoryFilters {
  /** Текущая страница */
  page?: number;
  /** Лимит на страницу */
  limit?: number;
  /** Поисковый запрос */
  search?: string;
  /** Тип калькулятора */
  calculatorType?: CalculatorType | 'all';
  /** Дата ОТ */
  dateFrom?: string | Date;
  /** Дата ДО */
  dateTo?: string | Date;
  /** Поле сортировки */
  sortBy?: 'createdAt' | 'sellingPrice' | 'name' | 'totalCost';
  /** Направление сортировки */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Результат запроса истории с пагинацией
 */
export interface HistoryPaginatedResult {
  /** Записи */
  items: CalculationHistoryItem[];
  /** Пагинация */
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Лимиты загрузки файлов
 */
export const FILE_UPLOAD_LIMITS = {
  /** Максимум файлов в одном расчёте */
  maxFilesPerCalculation: 20,
  /** Максимальный размер изображения (МБ) */
  maxImageSizeMB: 20,
  /** Максимальный размер вектора (МБ) */
  maxVectorSizeMB: 50,
  /** Максимальный размер файла вышивки (МБ) */
  maxEmbroiderySizeMB: 30,
  /** Максимальный общий размер (МБ) */
  maxTotalSizeMB: 100,
  /** Максимальный общий размер (байты) */
  maxTotalSizeBytes: 100 * 1024 * 1024,
} as const;

/**
 * Лимиты пагинации
 */
export const PAGINATION_LIMITS = {
  /** Записей истории на страницу */
  historyPerPage: 10,
} as const;
