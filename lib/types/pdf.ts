/**
 * Типы и константы для генерации PDF документов
 * @requires lib/types/calculators.ts
 * @module lib/types/pdf
 * @audit Создан 2026-03-26
 */

import type { CalculatorType } from './calculators';

/**
 * Формат страницы PDF
 */
export type PDFPageFormat = 'a4' | 'a5' | 'letter';

/**
 * Ориентация страницы
 */
export type PDFOrientation = 'portrait' | 'landscape';

/**
 * Тип документа
 */
export type PDFDocumentType = 
  | 'calculation'      // Расчёт стоимости
  | 'commercial'       // Коммерческое предложение
  | 'invoice';         // Счёт

import { UserBrandingSettings } from './branding';

/**
 * Настройки брендинга для PDF (alias for compatibility)
 */
export type PDFBrandingSettings = UserBrandingSettings;

/**
 * Данные для создания PDF расчёта
 */
export interface PDFCalculationData {
  /** Номер расчёта */
  number: string;
  /** Название */
  name: string;
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Дата расчёта */
  date: Date;
  /** Имя клиента */
  clientName?: string;
  /** Контакт клиента */
  clientContact?: string;
  /** Параметры расчёта */
  parameters: PDFCalculationParameters;
  /** Расходники */
  consumables: PDFConsumableItem[];
  /** Размещения */
  placements: PDFPlacementItem[];
  /** Файлы дизайна */
  designFiles: PDFDesignFile[];
  /** Итоговые значения */
  totals: PDFCalculationTotals;
  /** Комментарий */
  comment?: string;
  /** SVG схемы раскладки (data URL) */
  layoutSvg?: string;
}

/**
 * Параметры расчёта для PDF
 */
export interface PDFCalculationParameters {
  /** Количество изделий */
  quantity: number;
  /** Ширина (мм) */
  width?: number;
  /** Высота (мм) */
  height?: number;
  /** Площадь печати (м²) */
  printArea?: number;
  /** Длина плёнки (м) */
  filmLength?: number;
  /** Количество стежков */
  stitchCount?: number;
  /** Количество цветов */
  colorCount?: number;
  /** Тип плёнки */
  filmType?: string;
  /** Тип финиша */
  finishType?: string;
  /** Срочность */
  isUrgent?: boolean;
  /** Наценка за срочность (%) */
  urgencySurcharge?: number;
  /** Цвет изделия (DTG) */
  garmentColor?: string;
  /** Тип предобработки (DTG) */
  pretreatmentType?: string;
  /** Разрешение печати (DTG) */
  printResolution?: string;
  /** Белая подложка (DTG) */
  whiteUnderbase?: boolean;
}

/**
 * Расходник для PDF
 */
export interface PDFConsumableItem {
  /** Название */
  name: string;
  /** Цена за единицу */
  pricePerUnit: number;
  /** Расход на единицу */
  consumptionPerUnit: number;
  /** Единица измерения */
  unit: string;
  /** Стоимость */
  cost: number;
}

/**
 * Размещение для PDF
 */
export interface PDFPlacementItem {
  /** Название продукта */
  productName: string;
  /** Зона размещения */
  zoneName: string;
  /** Количество */
  quantity: number;
  /** Цена за единицу */
  pricePerUnit: number;
  /** Стоимость */
  cost: number;
}

/**
 * Файл дизайна для PDF
 */
export interface PDFDesignFile {
  /** Название файла */
  name: string;
  /** Размеры (мм) */
  dimensions: string;
  /** Количество */
  quantity: number;
  /** Миниатюра (base64) */
  thumbnail?: string;
}

/**
 * Итоговые значения расчёта
 */
export interface PDFCalculationTotals {
  /** Себестоимость */
  costPrice: number;
  /** Маржа (%) */
  marginPercent: number;
  /** Цена продажи */
  sellingPrice: number;
  /** Цена за единицу */
  pricePerItem: number;
  /** Стоимость расходников */
  consumablesCost: number;
  /** Стоимость размещений */
  placementsCost: number;
  /** Наценка за срочность */
  urgencySurcharge: number;
}

/**
 * Опции генерации PDF
 */
export interface PDFGenerationOptions {
  /** Формат страницы */
  format: PDFPageFormat;
  /** Ориентация */
  orientation: PDFOrientation;
  /** Тип документа */
  documentType: PDFDocumentType;
  /** Включить схему раскладки */
  includeLayout: boolean;
  /** Включить детализацию расходников */
  includeConsumables: boolean;
  /** Включить миниатюры дизайнов */
  includeDesignThumbnails: boolean;
  /** Включить QR-код */
  includeQrCode: boolean;
  /** Кастомный заголовок */
  customTitle?: string;
}

/**
 * Результат генерации PDF
 */
export interface PDFGenerationResult {
  /** Успешность */
  success: boolean;
  /** Blob PDF файла */
  blob?: Blob;
  /** URL для скачивания */
  downloadUrl?: string;
  /** Имя файла */
  filename?: string;
  /** Ошибка */
  error?: string;
}

export const DEFAULT_BRANDING_SETTINGS: Omit<UserBrandingSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  companyName: 'Моя компания',
  logoUrl: null,
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  phone: null,
  email: null,
  website: null,
  address: null,
  inn: null,
  kpp: null,
  ogrn: null,
  bankDetails: null,
  footerText: null,
  showQrCode: false,
};

/**
 * Дефолтные опции генерации PDF
 */
export const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  format: 'a4',
  orientation: 'portrait',
  documentType: 'calculation',
  includeLayout: true,
  includeConsumables: true,
  includeDesignThumbnails: true,
  includeQrCode: false,
};

/**
 * Размеры страниц в мм
 */
export const PDF_PAGE_SIZES: Record<PDFPageFormat, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
};

/**
 * Названия типов документов
 */
export const PDF_DOCUMENT_TYPE_NAMES: Record<PDFDocumentType, string> = {
  calculation: 'Расчёт стоимости',
  commercial: 'Коммерческое предложение',
  invoice: 'Счёт на оплату',
};
