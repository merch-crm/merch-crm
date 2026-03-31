/**
 * @fileoverview Парсер DST файлов вышивки
 * @module lib/utils/dst-parser
 * @audit Создан 2026-03-25
 */

import { EmbroideryFileData } from '@/lib/types/calculators';

/**
 * Результат парсинга DST файла
 */
export interface DSTParseResult {
  /** Успешно ли распарсен файл */
  success: boolean;
  /** Данные вышивки */
  data?: EmbroideryFileData;
  /** Ошибка парсинга */
  error?: string;
}

/**
 * Структура заголовка DST файла
 */
interface DSTHeader {
  label: string;
  stitchCount: number;
  colorChanges: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Парсит заголовок DST файла
 * @param buffer - ArrayBuffer с данными файла
 * @returns Заголовок DST
 */
function parseDSTHeader(buffer: ArrayBuffer): DSTHeader | null {
  try {
    // DST заголовок: первые 512 байт
    if (buffer.byteLength < 512) {
      return null;
    }

    const decoder = new TextDecoder('ascii');
    const headerBytes = new Uint8Array(buffer, 0, 512);
    const headerText = decoder.decode(headerBytes);

    // Извлекаем метку (первые 20 символов)
    const label = headerText.substring(0, 20).trim();

    // Tajima DST заголовок содержит метки типа ST:nnnnn, CO:nnn, +X:nnnn и т.д.
    // Некоторые редакторы добавляют двоеточие, другие — нет. Пробелы также варьируются.
    
    // Извлекаем количество стежков (ST)
    const stMatch = headerText.match(/ST:?\s*(\d+)/);
    const stitchCount = stMatch ? parseInt(stMatch[1], 10) : 0;
    
    // Извлекаем количество смен цвета (CO)
    const coMatch = headerText.match(/CO:?\s*(\d+)/);
    const colorChanges = coMatch ? parseInt(coMatch[1], 10) : 0;
    
    // Извлекаем границы (+X, -X, +Y, -Y в десятых долях мм)
    // В формате DST эти значения обычно означают максимальное смещение от центра
    const xPlusMatch = headerText.match(/\+X:?\s*(\d+)/);
    const xMinusMatch = headerText.match(/-X:?\s*(\d+)/);
    const yPlusMatch = headerText.match(/\+Y:?\s*(\d+)/);
    const yMinusMatch = headerText.match(/-Y:?\s*(\d+)/);
    
    // Размеры в мм (значения в файле — в 0.1 мм)
    const xPlus = xPlusMatch ? parseInt(xPlusMatch[1], 10) : 0;
    const xMinus = xMinusMatch ? parseInt(xMinusMatch[1], 10) : 0;
    const yPlus = yPlusMatch ? parseInt(yPlusMatch[1], 10) : 0;
    const yMinus = yMinusMatch ? parseInt(yMinusMatch[1], 10) : 0;
    
    return {
      label,
      stitchCount,
      colorChanges,
      minX: -xMinus / 10,
      maxX: xPlus / 10,
      minY: -yMinus / 10,
      maxY: yPlus / 10,
    };
  } catch (error) {
    console.error('Ошибка парсинга заголовка DST:', error);
    return null;
  }
}

/**
 * Подсчитывает стежки в DST файле по данным
 * @param buffer - ArrayBuffer с данными файла
 * @returns Количество стежков
 */
function countDSTStitches(buffer: ArrayBuffer): number {
  try {
    // Данные стежков начинаются после заголовка (512 байт)
    const dataStart = 512;
    if (buffer.byteLength <= dataStart) {
      return 0;
    }

    const data = new Uint8Array(buffer, dataStart);
    let stitchCount = 0;
    let i = 0;

    while (data && i < data.length - 2) {
      const b0 = data[i];
      const b1 = data[i + 1];
      const b2 = data[i + 2];

      // Конец файла (0x00, 0x00, 0xF3)
      if (b0 === 0x00 && b1 === 0x00 && b2 === 0xF3) {
        break;
      }

      // Обычный стежок или перемещение
      if ((b2 & 0x83) === 0x03) {
        // Стежок
        stitchCount++;
      }
      // Смена цвета (b2 & 0xC3) === 0xC3 — не считаем как стежок

      i += 3;
    }

    return stitchCount;
  } catch (error) {
    console.error('Ошибка подсчёта стежков DST:', error);
    return 0;
  }
}

/**
 * Декодирует один стежок DST (Tajima)
 */
function decodeDSTStitch(b0: number, b1: number, b2: number) {
  let dx = 0;
  let dy = 0;

  if (b0 & 0x01) dx += 1;
  if (b0 & 0x02) dx -= 1;
  if (b0 & 0x04) dx += 9;
  if (b0 & 0x08) dx -= 9;
  if (b0 & 0x80) dy -= 1;
  if (b0 & 0x40) dy += 1;
  if (b0 & 0x20) dy -= 9;
  if (b0 & 0x10) dy += 9;

  if (b1 & 0x01) dx += 3;
  if (b1 & 0x02) dx -= 3;
  if (b1 & 0x04) dx += 27;
  if (b1 & 0x08) dx -= 27;
  if (b1 & 0x80) dy -= 3;
  if (b1 & 0x40) dy += 3;
  if (b1 & 0x20) dy -= 27;
  if (b1 & 0x10) dy += 27;

  if (b2 & 0x04) dx += 81;
  if (b2 & 0x08) dx -= 81;
  if (b2 & 0x20) dy -= 81;
  if (b2 & 0x10) dy += 81;

  let type: 'stitch' | 'jump' | 'color_change' | 'end' = 'stitch';
  if ((b2 & 0xC3) === 0xF3) type = 'end';
  else if (b2 & 0x80) type = 'jump';
  else if (b2 & 0x40) type = 'color_change';

  return { dx, dy, type };
}

/**
 * Палитра цветов по умолчанию для DST (т.к. сам формат их не хранит)
 */
const DEFAULT_PALETTE = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#1f2937', // Dark Grey
  '#000000', // Black
];

/**
 * Обрабатывает стежки DST для генерации SVG и сбора статистики
 * @param buffer - ArrayBuffer с данными файла
 * @returns SVG, цвета и расширенная статистика
 */
function processDSTStitches(buffer: ArrayBuffer): { 
  svg: string; 
  colors: string[];
  totalThreadLengthMm: number;
  trimsCount: number;
  colorDetails: {
    stitches: number;
    color: string;
    lengthMm: number;
  }[];
} {
  const dataStart = 512;
  const data = new Uint8Array(buffer, dataStart);
  
  let x = 0;
  let y = 0;
  let minX = 0, minY = 0, maxX = 0, maxY = 0;
  
  const paths: { color: string; points: [number, number][] }[] = [];
  let currentPoints: [number, number][] = [[0, 0]];
  let colorIndex = 0;

  // Статистика
  let totalThreadLengthMm = 0;
  let trimsCount = 0;
  let isInJumpSequence = false;
  
  const colorDetails: { stitches: number; color: string; lengthMm: number }[] = [];
  let currentColorStats = { stitches: 0, color: DEFAULT_PALETTE[0], lengthMm: 0 };

  for (let i = 0; data && i < data.length - 2; i += 3) {
    const stitch = decodeDSTStitch(data[i], data[i+1], data[i+2]);
    
    if (stitch.type === 'end') break;

    const dxMm = stitch.dx / 10;
    const dyMm = stitch.dy / 10;
    const distMm = Math.sqrt(dxMm * dxMm + dyMm * dyMm);

    x += stitch.dx;
    y += stitch.dy;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    if (stitch.type === 'stitch') {
      currentPoints.push([x, y]);
      currentColorStats.stitches++;
      currentColorStats.lengthMm += distMm;
      totalThreadLengthMm += distMm;
      isInJumpSequence = false;
    } else if (stitch.type === 'jump') {
      if (!isInJumpSequence) {
        trimsCount++;
        isInJumpSequence = true;
      }
      totalThreadLengthMm += distMm; // Прыжки тоже расходуют нить (протяжки)
      
      if (currentPoints.length > 1) {
        paths.push({ 
          color: DEFAULT_PALETTE[colorIndex % DEFAULT_PALETTE.length], 
          points: currentPoints 
        });
      }
      currentPoints = [[x, y]];
    } else if (stitch.type === 'color_change') {
      if (currentPoints.length > 1) {
        paths.push({ 
          color: DEFAULT_PALETTE[colorIndex % DEFAULT_PALETTE.length], 
          points: currentPoints 
        });
      }
      
      // Сохраняем статистику текущего цвета
      colorDetails.push({ ...currentColorStats });
      
      colorIndex++;
      currentPoints = [[x, y]];
      currentColorStats = { 
        stitches: 0, 
        color: DEFAULT_PALETTE[colorIndex % DEFAULT_PALETTE.length], 
        lengthMm: 0 
      };
      isInJumpSequence = false;
    }
  }

  // Добавляем последний путь и статистику последнего цвета
  if (currentPoints.length > 1) {
    paths.push({ 
      color: DEFAULT_PALETTE[colorIndex % DEFAULT_PALETTE.length], 
      points: currentPoints 
    });
  }
  colorDetails.push({ ...currentColorStats });

  const width = maxX - minX;
  const height = maxY - minY;
  const padding = Math.max(width, height) * 0.05;

  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
  
  const svgLines = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">`,
    ...paths.map(p => {
      const pointsAttr = p.points.map(pt => pt.join(',')).join(' ');
      return `<polyline points="${pointsAttr}" fill="none" stroke="${p.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`;
    }),
    '</svg>'
  ];

  const svgStr = svgLines.join('\n');
  const base64 = typeof btoa !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgStr))) 
    : Buffer.from(svgStr).toString('base64');

  return { 
    svg: `data:image/svg+xml;base64,${base64}`,
    colors: DEFAULT_PALETTE.slice(0, Math.min(colorIndex + 1, DEFAULT_PALETTE.length)),
    totalThreadLengthMm: Math.round(totalThreadLengthMm),
    trimsCount,
    colorDetails: colorDetails.map(d => ({
      ...d,
      lengthMm: Math.round(d.lengthMm)
    }))
  };
}

/**
 * Парсит DST файл вышивки
 * @param file - Файл для парсинга
 * @returns Результат парсинга
 */
export async function parseDSTFile(file: File): Promise<DSTParseResult> {
  try {
    const buffer = await file.arrayBuffer();

    // Парсим заголовок
    const header = parseDSTHeader(buffer);
    if (!header) {
      return {
        success: false,
        error: 'Не удалось прочитать заголовок DST файла',
      };
    }

    // Если в заголовке нет количества стежков, считаем вручную
    let stitchCount = header.stitchCount;
    if (stitchCount === 0) {
      stitchCount = countDSTStitches(buffer);
    }

    // Генерируем превью и получаем расширенную статистику
    const processed = processDSTStitches(buffer);

    // Вычисляем размеры в мм
    const widthMm = Math.abs(header.maxX - header.minX);
    const heightMm = Math.abs(header.maxY - header.minY);

    // Оценка времени вышивки (примерно 800 стежков в минуту)
    const estimatedMinutes = Math.ceil(stitchCount / 800);

    const data: EmbroideryFileData = {
      stitchCount,
      colorCount: header.colorChanges + 1, // Смены цвета + 1 = количество цветов
      widthMm: Math.round(widthMm * 10) / 10,
      heightMm: Math.round(heightMm * 10) / 10,
      format: 'dst',
      estimatedTimeMin: estimatedMinutes,
      svgPreview: processed.svg,
      totalThreadLengthMm: processed.totalThreadLengthMm,
      trimsCount: processed.trimsCount,
      colorDetails: processed.colorDetails,
      colors: processed.colors,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Ошибка парсинга DST файла:', error);
    return {
      success: false,
      error: 'Ошибка чтения файла',
    };
  }
}

/**
 * Оценивает количество стежков по размерам и плотности
 * @param widthCm - Ширина в см
 * @param heightCm - Высота в см
 * @param densityPerCm2 - Плотность стежков на см² (по умолчанию 50)
 * @param fillPercent - Процент заполнения (по умолчанию 70)
 * @returns Оценочное количество стежков
 */
export function estimateStitchCount(
  widthCm: number,
  heightCm: number,
  densityPerCm2: number = 50,
  fillPercent: number = 70
): number {
  const area = widthCm * heightCm;
  const stitches = area * densityPerCm2 * (fillPercent / 100);
  return Math.round(stitches);
}

/**
 * Оценивает время вышивки
 * @param stitchCount - Количество стежков
 * @param stitchesPerMinute - Скорость (по умолчанию 800)
 * @returns Время в минутах
 */
export function estimateEmbroideryTime(
  stitchCount: number,
  stitchesPerMinute: number = 800
): number {
  return Math.ceil(stitchCount / stitchesPerMinute);
}
