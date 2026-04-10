/**
 * API эндпоинт для загрузки файлов калькулятора с поддержкой прогресса
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { db } from '@/lib/db';
import { designFiles } from '@/lib/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { 
 STORAGE_BASE, 
 DESIGNS_PATH, 
 ensureDir, 
 generateStoragePath, 
 createThumbnail, 
 getImageDimensions 
} from '@/lib/utils/calculators/file-storage';
import { 
 validateDesignFile, 
 getFileExtension, 
 isImageFile 
} from '@/lib/utils/file-validation';
import { parseDSTFile } from '@/lib/utils/dst-parser';
import { calculateMmFromPx } from '@/lib/utils/file-dimensions';
import { CalculatorType, UploadedDesignFile } from '@/lib/types/calculators';

export async function POST(request: NextRequest) {
 try {
  const user = await getCurrentUser();
  if (!user) {
   return NextResponse.json({ error: 'Авторизуйтесь для загрузки файлов' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const calculatorType = formData.get('calculatorType') as CalculatorType;

  if (!file || !calculatorType) {
   return NextResponse.json({ error: 'Файл или тип калькулятора не указаны' }, { status: 400 });
  }

  // Валидация
  const validation = validateDesignFile(file, calculatorType);
  if (!validation.isValid) {
   return NextResponse.json({ error: validation.error }, { status: 400 });
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
  
  // Безопасность: Валидация размера и типа перед записью (audit requirement)
  if (file.size > 50 * 1024 * 1024) { // 50MB max
   return NextResponse.json({ error: 'Файл слишком большой' }, { status: 400 });
  }
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dst')) {
   return NextResponse.json({ error: 'Неподдерживаемый тип файла' }, { status: 400 });
  }

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
  const dbData = {
   originalName: file.name,
   storedName,
   mimeType: file.type || 'application/octet-stream',
   extension,
   sizeBytes: file.size,
   filePath,
   thumbnailPath: thumbnailPath || null,
   calculatorType,
   fileDimensions: fileDimensions ? JSON.stringify(fileDimensions) : null,
   embroideryData: embroideryData ? JSON.stringify(embroideryData) : null,
   uploadedBy: user.id,
  };
  
  const [dbRecord] = await db
   .insert(designFiles)
   .values(dbData)
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
   embroideryData: dbRecord.embroideryData ? (typeof dbRecord.embroideryData === 'string' ? JSON.parse(dbRecord.embroideryData) : dbRecord.embroideryData) : undefined,
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

  return NextResponse.json({ success: true, data: uploadedFile });
 } catch (error) {
  console.error('[Upload API Error]:', error);
  return NextResponse.json({ 
   error: error instanceof Error ? error.message : 'Ошибка при загрузке файла' 
  }, { status: 500 });
 }
}
