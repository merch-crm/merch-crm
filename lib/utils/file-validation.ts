/**
 * @fileoverview Утилиты валидации файлов для калькуляторов
 * @module lib/utils/file-validation
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

import {
  CalculatorType,
  CALCULATOR_FILE_FORMATS,
  FILE_UPLOAD_LIMITS,
} from '@/lib/types/calculators';

/**
 * Результат валидации файла
 */
export interface FileValidationResult {
  /** Файл валиден */
  isValid: boolean;
  /** Сообщение об ошибке */
  error?: string;
  /** Тип файла (image, vector, embroidery) */
  fileType?: 'image' | 'vector' | 'embroidery';
}

/**
 * Получает расширение файла в нижнем регистре
 * @param filename - Имя файла
 * @returns Расширение без точки
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Проверяет, является ли файл изображением
 * @param filename - Имя файла
 * @returns true если изображение
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'tiff', 'tif'];
  return imageExtensions.includes(ext);
}

/**
 * Проверяет, является ли файл векторным
 * @param filename - Имя файла
 * @returns true если вектор
 */
export function isVectorFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const vectorExtensions = ['ai', 'eps', 'pdf', 'cdr', 'svg'];
  return vectorExtensions.includes(ext);
}

/**
 * Проверяет, является ли файл файлом вышивки
 * @param filename - Имя файла
 * @returns true если файл вышивки
 */
export function isEmbroideryFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const embroideryExtensions = [
    'dst', 'pes', 'pec', 'exp', 'jef', 'jef+', 'jpx',
    'vp3', 'vip', 'hus', 'xxx', 'art', 'sew', 'shv',
    'pcs', 'pcm', 'csd', 'emd', '10o', 'u01', 'dsb',
    'emb', 'ofm', 'pxf',
  ];
  return embroideryExtensions.includes(ext);
}

/**
 * Проверяет, является ли файл DST (поддерживается парсинг)
 * @param filename - Имя файла
 * @returns true если DST
 */
export function isDSTFile(filename: string): boolean {
  return getFileExtension(filename) === 'dst';
}

/**
 * Валидирует файл для загрузки в калькулятор
 * @param file - Файл для проверки
 * @param calculatorType - Тип калькулятора
 * @returns Результат валидации
 */
export function validateDesignFile(
  file: File,
  calculatorType: CalculatorType
): FileValidationResult {
  const formats = CALCULATOR_FILE_FORMATS[calculatorType];
  const ext = getFileExtension(file.name);

  // Проверяем расширение
  const allExtensions = formats.flatMap((f) => f.extensions);
  if (!allExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `Формат .${ext} не поддерживается. Допустимые форматы: ${allExtensions.join(', ')}`,
    };
  }

  // Находим категорию формата и лимит размера
  const formatCategory = formats.find((f) => f.extensions.includes(ext));
  if (!formatCategory) {
    return {
      isValid: false,
      error: 'Неизвестный формат файла',
    };
  }

  // Проверяем размер
  if (file.size > formatCategory.maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимум ${formatCategory.maxSizeMB} МБ для данного формата`,
    };
  }

  // Проверяем MIME-тип (если браузер предоставил)
  if (formatCategory.mimeTypes.length > 0) {
    const fileMime = file.type || '';
    
    // Для многих вышивальных и бинарных форматов MIME может быть generic или пустым
    const isGenericMime = fileMime === '' || fileMime === 'application/octet-stream';
    const isExactMime = formatCategory.mimeTypes.some((mime) => fileMime === mime);
    
    if (!isExactMime && !isGenericMime) {
      // Не блокируем, но логируем для отладки
      console.warn(`[FileValidation] Нетипичный MIME-тип: "${fileMime}" для файла ${file.name} (расширение .${ext})`);
    }
  }

  // Определяем тип файла
  let fileType: 'image' | 'vector' | 'embroidery' = 'image';
  if (isEmbroideryFile(file.name)) {
    fileType = 'embroidery';
  } else if (isVectorFile(file.name)) {
    fileType = 'vector';
  }

  return {
    isValid: true,
    fileType,
  };
}

/**
 * Валидирует набор файлов для загрузки
 * @param files - Массив файлов
 * @param calculatorType - Тип калькулятора
 * @param existingFilesCount - Количество уже загруженных файлов
 * @returns Результат валидации с массивом ошибок
 */
export function validateDesignFiles(
  files: File[],
  calculatorType: CalculatorType,
  existingFilesCount: number = 0
): { isValid: boolean; errors: string[]; validFiles: File[] } {
  const errors: string[] = [];
  const validFiles: File[] = [];

  // Проверяем общее количество
  const totalCount = existingFilesCount + files.length;
  if (totalCount > FILE_UPLOAD_LIMITS.maxFilesPerCalculation) {
    errors.push(
      `Превышен лимит файлов. Максимум ${FILE_UPLOAD_LIMITS.maxFilesPerCalculation} файлов на расчёт`
    );
  }

  // Проверяем общий размер
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > FILE_UPLOAD_LIMITS.maxTotalSizeMB * 1024 * 1024) {
    errors.push(
      `Превышен общий размер файлов. Максимум ${FILE_UPLOAD_LIMITS.maxTotalSizeMB} МБ`
    );
  }

  // Валидируем каждый файл
  for (const file of files) {
    const result = validateDesignFile(file, calculatorType);
    if (result.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Форматирует список поддерживаемых форматов для отображения
 * @param calculatorType - Тип калькулятора
 * @returns Строка с форматами
 */
export function getFormatsDescription(calculatorType: CalculatorType): string {
  const formats = CALCULATOR_FILE_FORMATS[calculatorType];
  return formats
    .map((f) => `${f.description}: .${f.extensions.join(', .')}`)
    .join('\n');
}

/**
 * Получает accept-строку для input[type="file"]
 * @param calculatorType - Тип калькулятора
 * @returns Строка для атрибута accept
 */
export function getAcceptString(calculatorType: CalculatorType): string {
  const formats = CALCULATOR_FILE_FORMATS[calculatorType];
  const extensions = formats.flatMap((f) => f.extensions.map((e) => `.${e}`));
  const mimeTypes = formats.flatMap((f) => f.mimeTypes);
  return [...new Set([...extensions, ...mimeTypes])].join(',');
}
