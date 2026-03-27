import { CalculatorType } from './base';

/**
 * Конфигурация допустимых форматов файлов
 */
export interface FileFormatConfig {
  /** Допустимые расширения */
  extensions: string[];
  /** MIME-типы */
  mimeTypes: string[];
  /** Максимальный размер в МБ */
  maxSizeMB: number;
  /** Описание категории */
  description: string;
}

/**
 * Допустимые форматы файлов по типам калькуляторов
 */
export const CALCULATOR_FILE_FORMATS: Record<CalculatorType, FileFormatConfig[]> = {
  dtf: [
    {
      extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'tiff', 'tif'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/tiff'],
      maxSizeMB: 20,
      description: 'Изображения для печати',
    },
    {
      extensions: ['ai', 'eps', 'pdf', 'cdr', 'svg'],
      mimeTypes: ['application/postscript', 'application/pdf', 'image/svg+xml', 'application/x-cdr'],
      maxSizeMB: 50,
      description: 'Векторные файлы',
    },
  ],
  'uv-dtf': [
    {
      extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'tiff', 'tif'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/tiff'],
      maxSizeMB: 20,
      description: 'Изображения для печати',
    },
    {
      extensions: ['ai', 'eps', 'pdf', 'cdr', 'svg'],
      mimeTypes: ['application/postscript', 'application/pdf', 'image/svg+xml', 'application/x-cdr'],
      maxSizeMB: 50,
      description: 'Векторные файлы',
    },
  ],
  dtg: [
    {
      extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
      maxSizeMB: 20,
      description: 'Изображения для печати',
    },
  ],
  sublimation: [
    {
      extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
      maxSizeMB: 20,
      description: 'Изображения для печати',
    },
  ],
  embroidery: [
    {
      extensions: ['png', 'jpg', 'jpeg', 'svg'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
      maxSizeMB: 20,
      description: 'Изображения для оцифровки',
    },
    {
      extensions: [
        'dst', 'pes', 'pec', 'exp', 'jef', 'jef+', 'jpx',
        'vp3', 'vip', 'hus', 'xxx', 'art', 'sew', 'shv',
        'pcs', 'pcm', 'csd', 'emd', '10o', 'u01', 'dsb',
      ],
      mimeTypes: ['application/octet-stream'],
      maxSizeMB: 10,
      description: 'Файлы вышивальных машин',
    },
    {
      extensions: ['emb', 'ofm', 'pxf'],
      mimeTypes: ['application/octet-stream'],
      maxSizeMB: 30,
      description: 'Редактируемые дизайны вышивки',
    },
  ],
  silkscreen: [
    {
      extensions: ['ai', 'eps', 'pdf', 'svg', 'cdr'],
      mimeTypes: ['application/postscript', 'application/pdf', 'image/svg+xml'],
      maxSizeMB: 50,
      description: 'Векторные макеты',
    },
    {
      extensions: ['png', 'jpg', 'jpeg', 'tiff'],
      mimeTypes: ['image/png', 'image/jpeg', 'image/tiff'],
      maxSizeMB: 20,
      description: 'Изображения',
    },
  ],
  thermotransfer: [
    {
      extensions: ['ai', 'eps', 'pdf', 'svg', 'cdr'],
      mimeTypes: ['application/postscript', 'application/pdf', 'image/svg+xml'],
      maxSizeMB: 50,
      description: 'Векторные макеты',
    },
    {
      extensions: ['png', 'jpg', 'jpeg'],
      mimeTypes: ['image/png', 'image/jpeg'],
      maxSizeMB: 20,
      description: 'Изображения',
    },
  ],
};

/**
 * Данные из файла вышивки
 */
export interface EmbroideryFileData {
  /** Формат файла (dst, etc) */
  format: string;
  /** Количество стежков */
  stitchCount: number;
  /** Оценочное время в минутах */
  estimatedTimeMin?: number;
  /** SVG превью (data URI) */
  svgPreview?: string;
  /** Список цветов (hex) */
  colors?: string[];
  /** Количество цветов */
  colorCount: number;
  /** Последовательность цветов (если доступна) */
  colorSequence?: string[];
  /** Ширина в мм */
  widthMm: number;
  /** Высота в мм */
  heightMm: number;
  /** Общая длина нити в мм */
  totalThreadLengthMm?: number;
  /** Количество обрезок (trims) */
  trimsCount?: number;
  /** Детальная статистика по цветам */
  colorDetails?: {
    stitches: number;
    color: string;
    lengthMm: number;
  }[];
}

/**
 * Загруженный файл дизайна
 */
export interface UploadedDesignFile {
  /** Уникальный идентификатор */
  id: string;
  /** Оригинальное имя файла */
  originalName: string;
  /** Имя файла на сервере (UUID) */
  storedName: string;
  /** MIME-тип */
  mimeType: string;
  /** Размер в байтах */
  sizeBytes: number;
  /** Относительный путь к файлу */
  filePath: string;
  /** Относительный путь к превью */
  thumbnailPath?: string;
  /** Полный URL файла */
  fileUrl: string;
  /** Полный URL превью */
  thumbnailUrl?: string;
  /** Размеры из файла */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Данные вышивки */
  embroideryData?: EmbroideryFileData;
  /** Пользовательские размеры */
  userDimensions?: {
    widthMm: number;
    heightMm: number;
  };
  /** Количество экземпляров */
  quantity: number;
  /** Тип калькулятора */
  calculatorType: CalculatorType;
  /** Дата загрузки */
  uploadedAt: Date;
  /** Файл добавлен вручную (без физического файла) */
  isManual?: boolean;
}
