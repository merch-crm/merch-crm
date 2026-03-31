/* lib/services/pdf/fonts/load-font.ts */

/**
 * Загружает шрифт Manrope с поддержкой кириллицы
 * @requires Файлы шрифтов в public/fonts/
 */

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const FONT_FILES: Record<FontWeight, string> = {
  regular: 'Manrope-Regular.ttf',
  medium: 'Manrope-Medium.ttf',
  semibold: 'Manrope-SemiBold.ttf',
  bold: 'Manrope-Bold.ttf',
};

/**
 * Кэш загруженных шрифтов
 */
const fontCache: Map<FontWeight, string> = new Map();

/**
 * Загружает шрифт Manrope указанного начертания
 * @param weight - Начертание шрифта
 * @returns Base64-encoded шрифт
 */
export async function loadManropeFont(weight: FontWeight = 'regular'): Promise<string> {
  if (fontCache.has(weight)) {
    return fontCache.get(weight)!;
  }

  const filename = FONT_FILES[weight];

  try {
    if (typeof window === 'undefined') {
      // Сервер
      const fs = await import('fs/promises');
      const path = await import('path');
      const fontPath = path.join(process.cwd(), 'public', 'fonts', filename);
      const fontBuffer = await fs.readFile(fontPath);
      const base64 = fontBuffer.toString('base64');
      fontCache.set(weight, base64);
      return base64;
    }

    // Браузер
    const response = await fetch(`/fonts/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    fontCache.set(weight, base64);
    return base64;
  } catch (error) {
    console.error(`Ошибка загрузки шрифта ${filename}:`, error);
    throw new Error(`Не удалось загрузить шрифт Manrope (${weight})`);
  }
}

/**
 * Загружает все начертания шрифта Manrope
 */
export async function loadAllManropeFonts(): Promise<Record<FontWeight, string>> {
  const weights: FontWeight[] = ['regular', 'medium', 'semibold', 'bold'];
  const fonts = {} as Record<FontWeight, string>;

  await Promise.all(
    weights.map(async (weight) => {
      fonts[weight] = await loadManropeFont(weight);
    })
  );

  return fonts;
}
