/**
 * @fileoverview Server Actions для работы с файлами калькуляторов
 * @module lib/actions/calculators/files
 * @requires drizzle
 * @audit Создан 2026-03-25
 */

'use server';

import { revalidatePath } from 'next/cache';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { designFiles } from '@/lib/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { 
  createSafeAction
} from '@/lib/action-helpers';
import { getCurrentUser } from '@/lib/auth/session';
import { CalculatorType, UploadedDesignFile } from '@/lib/types/calculators';
import {
  validateDesignFile,
  getFileExtension,
  isImageFile,
} from '@/lib/utils/file-validation';
import { parseDSTFile } from '@/lib/utils/dst-parser';
import { z } from 'zod';
import { calculateMmFromPx } from '@/lib/utils/file-dimensions';

/**
 * Базовый путь для хранения файлов
 */
const STORAGE_BASE = process.env.STORAGE_PATH || './storage';
const DESIGNS_PATH = 'calculators/designs';

/**
 * Результат загрузки файла
 */
interface UploadResult {
  success: boolean;
  data?: UploadedDesignFile;
  error?: string;
}

/**
 * Создаёт директорию, если не существует
 */
async function ensureDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Генерирует путь для хранения файла
 */
function generateStoragePath(
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
async function createThumbnail(
  sourcePath: string,
  thumbnailPath: string
): Promise<boolean> {
  try {
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
async function getImageDimensions(
  filePath: string
): Promise<{ width: number; height: number } | null> {
  try {
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

/**
 * Загружает файл дизайна
 * @param formData - FormData с файлом
 * @param calculatorType - Тип калькулятора
 * @returns Результат загрузки
 */
export async function uploadDesignFile(
  formData: FormData,
  calculatorType: CalculatorType
): Promise<UploadResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Авторизуйтесь для загрузки файлов' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Файл не найден' };
    }

    // Валидация
    const validation = validateDesignFile(file, calculatorType);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Генерируем пути
    const { filePath, storedName } = generateStoragePath(
      user.id,
      calculatorType,
      file.name
    );
    const fullPath = path.join(STORAGE_BASE, filePath);
    const dirPath = path.dirname(fullPath);

    // Создаём директорию
    await ensureDir(dirPath);

    // Сохраняем файл
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    // Инициализируем данные файла
    let thumbnailPath: string | undefined;
    let fileDimensions: { widthPx?: number; heightPx?: number; widthMm?: number; heightMm?: number } | null = null;
    let embroideryData: import('@/lib/types/calculators').EmbroideryFileData | null = null;
    const extension = getFileExtension(file.name);

    // Обработка в зависимости от типа
    if (isImageFile(file.name)) {
      // Создаём превью
      const thumbName = `${storedName.split('.')[0]}_thumb.webp`;
      const thumbFullPath = path.join(dirPath, thumbName);
      const thumbCreated = await createThumbnail(fullPath, thumbFullPath);
      if (thumbCreated) {
        thumbnailPath = path.join(
          DESIGNS_PATH,
          user.id,
          calculatorType,
          thumbName
        );
      }

      // Получаем размеры
      const dims = await getImageDimensions(fullPath);
      if (dims) {
        fileDimensions = {
          widthPx: dims.width,
          heightPx: dims.height,
        };
      }
    } else if (extension === 'dst') {
      // Парсим DST файл
      const parseResult = await parseDSTFile(file);
      if (parseResult.success && parseResult.data) {
        embroideryData = parseResult.data;
        fileDimensions = {
          widthMm: parseResult.data.widthMm,
          heightMm: parseResult.data.heightMm,
        };

        // Сохраняем SVG превью как файл
        if (parseResult.data.svgPreview) {
          const thumbName = `${storedName.split('.')[0]}_thumb.svg`;
          const thumbFullPath = path.join(dirPath, thumbName);
          const svgBase64 = parseResult.data.svgPreview.split(',')[1];
          await writeFile(thumbFullPath, Buffer.from(svgBase64, 'base64'));
          thumbnailPath = path.join(
            DESIGNS_PATH,
            user.id,
            calculatorType,
            thumbName
          );
        }
      }
    }

    // Сохраняем в БД
    const [dbRecord] = await db
      .insert(designFiles)
      .values({
        originalName: file.name,
        storedName,
        mimeType: file.type || 'application/octet-stream',
        extension,
        sizeBytes: file.size,
        filePath,
        thumbnailPath: thumbnailPath || null,
        calculatorType,
        fileDimensions,
        embroideryData,
        uploadedBy: user.id,
      })
      .returning();

    // Формируем ответ
    const uploadedFile: UploadedDesignFile = {
      id: dbRecord.id,
      originalName: dbRecord.originalName,
      storedName: dbRecord.storedName,
      mimeType: dbRecord.mimeType,
      sizeBytes: dbRecord.sizeBytes,
      filePath: dbRecord.filePath,
      thumbnailPath: dbRecord.thumbnailPath || undefined,
      fileUrl: `/api/files/${dbRecord.filePath}`,
      thumbnailUrl: dbRecord.thumbnailPath ? `/api/files/${dbRecord.thumbnailPath}` : undefined,
      calculatorType: dbRecord.calculatorType as CalculatorType,
      dimensions: fileDimensions ? {
        width: (fileDimensions.widthMm || fileDimensions.widthPx || 0) as number,
        height: (fileDimensions.heightMm || fileDimensions.heightPx || 0) as number,
      } : undefined,
      embroideryData: dbRecord.embroideryData as import('@/lib/types/calculators').EmbroideryFileData | undefined,
      userDimensions: embroideryData
        ? {
            widthMm: embroideryData.widthMm,
            heightMm: embroideryData.heightMm,
          }
        : (fileDimensions && fileDimensions.widthPx && fileDimensions.heightPx) 
        ? {
            widthMm: calculateMmFromPx(fileDimensions.widthPx),
            heightMm: calculateMmFromPx(fileDimensions.heightPx),
          }
        : undefined,
      quantity: 1,
      uploadedAt: dbRecord.uploadedAt,
    };

    return { success: true, data: uploadedFile };
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    return { success: false, error: 'Не удалось загрузить файл' };
  }
}

/**
 * Удаляет файл дизайна
 */
export const deleteDesignFile = createSafeAction(
  z.object({ fileId: z.string() }),
  async ({ fileId }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Авторизуйтесь для выполнения действия');

    // Получаем файл из БД
    const file = await db.query.designFiles.findFirst({
      where: eq(designFiles.id, fileId),
    });

    if (!file) throw new Error('Файл не найден');
    if (file.uploadedBy !== user.id) throw new Error('Нет доступа к файлу');

    // Удаляем файлы с диска
    const fullPath = path.join(STORAGE_BASE, file.filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    if (file.thumbnailPath) {
      const thumbPath = path.join(STORAGE_BASE, file.thumbnailPath);
      if (existsSync(thumbPath)) {
        await unlink(thumbPath);
      }
    }

    // Мягкое удаление в БД
    await db
      .update(designFiles)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(designFiles.id, fileId));

    revalidatePath('/dashboard/production/calculators');
    return { success: true };
  }
);

/**
 * Получает список файлов пользователя для калькулятора
 */
export const getUserDesignFiles = createSafeAction(
  z.object({ calculatorType: z.string() as z.ZodType<CalculatorType> }),
  async ({ calculatorType }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Авторизуйтесь');

    const files = await db.query.designFiles.findMany({
      where: and(
        eq(designFiles.uploadedBy, user.id),
        eq(designFiles.calculatorType, calculatorType),
        isNull(designFiles.deletedAt)
      ),
      orderBy: (df, { desc }) => [desc(df.uploadedAt)],
      limit: 50,
    });

    const mappedFiles: UploadedDesignFile[] = files.map((f) => {
      const fileDims = f.fileDimensions as { widthPx?: number; heightPx?: number; widthMm?: number; heightMm?: number } | null;
      const embroideryData = f.embroideryData as import('@/lib/types/calculators').EmbroideryFileData | null;
      
      const width = (fileDims?.widthMm || fileDims?.widthPx || 0) as number;
      const height = (fileDims?.heightMm || fileDims?.heightPx || 0) as number;

      return {
        id: f.id,
        originalName: f.originalName,
        storedName: f.storedName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        filePath: f.filePath,
        thumbnailPath: f.thumbnailPath || undefined,
        fileUrl: `/api/files/${f.filePath}`,
        thumbnailUrl: f.thumbnailPath
          ? `/api/files/${f.thumbnailPath}`
          : undefined,
        calculatorType: f.calculatorType as import('@/lib/types/calculators').CalculatorType,
        dimensions: fileDims ? { width, height } : undefined,
        embroideryData: embroideryData || undefined,
        userDimensions: embroideryData ? {
          widthMm: embroideryData.widthMm,
          heightMm: embroideryData.heightMm,
        } : (fileDims?.widthMm && fileDims.heightMm ? {
          widthMm: fileDims.widthMm,
          heightMm: fileDims.heightMm,
        } : (fileDims?.widthPx && fileDims.heightPx ? {
          widthMm: calculateMmFromPx(fileDims.widthPx),
          heightMm: calculateMmFromPx(fileDims.heightPx),
        } : undefined)),
        quantity: 1,
        uploadedAt: f.uploadedAt,
        isManual: false,
      };
    });

    return mappedFiles;
  }
);
