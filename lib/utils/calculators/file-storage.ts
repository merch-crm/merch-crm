/**
 * Утилиты для работы с хранилищем файлов калькуляторов
 */

import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CalculatorType } from '@/lib/types/calculators';
import { getFileExtension } from '@/lib/utils/file-validation';

export const STORAGE_BASE = process.env.STORAGE_PATH || './storage';
export const DESIGNS_PATH = 'calculators/designs';

/**
 * Создаёт директорию, если не существует
 */
export async function ensureDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Генерирует путь для хранения файла
 */
export function generateStoragePath(
  userId: string,
  calculatorType: CalculatorType,
  filename: string
): { filePath: string; storedName: string } {
  const ext = getFileExtension(filename);
  const uuid = uuidv4();
  const storedName = `${uuid}.${ext}`;
  const filePath = path.join(DESIGNS_PATH, userId, calculatorType, storedName);
  return { filePath, storedName };
}

/**
 * Создаёт превью изображения в WebP
 */
export async function createThumbnail(
  sourcePath: string,
  thumbnailPath: string
): Promise<boolean> {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(sourcePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    return true;
  } catch (error) {
    console.error('Ошибка создания превью:', error);
    return false;
  }
}

/**
 * Получает размеры изображения
 */
export async function getImageDimensions(
  filePath: string
): Promise<{ width: number; height: number } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(filePath).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения размеров:', error);
    return null;
  }
}
