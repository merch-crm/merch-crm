/**
 * @fileoverview API роут для отдачи файлов
 * @module api/files
 * @audit Создан 2026-03-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSession } from '@/lib/session';

/**
 * Базовый путь хранения
 */
const STORAGE_BASE = process.env.STORAGE_PATH || './storage';

/**
 * MIME-типы по расширениям
 */
const MIME_TYPES: Record<string, string> = {
 png: 'image/png',
 jpg: 'image/jpeg',
 jpeg: 'image/jpeg',
 webp: 'image/webp',
 svg: 'image/svg+xml',
 gif: 'image/gif',
 tiff: 'image/tiff',
 tif: 'image/tiff',
 pdf: 'application/pdf',
 dst: 'application/octet-stream',
 pes: 'application/octet-stream',
 ai: 'application/postscript',
 eps: 'application/postscript',
};

/**
 * GET /api/files/[...path]
 * Отдаёт файл по пути
 */
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ path: string[] }> }
) {
 try {
  const { path: pathSegments } = await params;
  // Проверяем авторизацию
  const session = await getSession();
  if (!session) {
   return new NextResponse('Unauthorized', { status: 401 });
  }

  // Собираем путь
  const filePath = pathSegments.join('/');
  const fullPath = path.join(STORAGE_BASE, filePath);

  // Защита от path traversal
  const resolvedPath = path.resolve(fullPath);
  const resolvedBase = path.resolve(STORAGE_BASE);
  if (!resolvedPath.startsWith(resolvedBase)) {
   return new NextResponse('Forbidden', { status: 403 });
  }

  // Проверяем существование файла
  if (!existsSync(fullPath)) {
   return new NextResponse('Not Found', { status: 404 });
  }

  // Проверяем, что это файл пользователя или администратора
  // Путь: calculators/designs/{userId}/...
  const pathParts = filePath.split('/');
  if (pathParts.length >= 3 && pathParts[0] === 'calculators' && pathParts[1] === 'designs') {
   const fileUserId = pathParts[2];
   
   // Если файл не принадлежит пользователю, проверяем роль админа
   if (fileUserId !== session.id) {
    const { checkIsAdmin } = await import('@/lib/admin');
    const isAdmin = await checkIsAdmin(session);
    if (!isAdmin) {
     return new NextResponse('Forbidden', { status: 403 });
    }
   }
  }

  // Читаем файл
  const fileBuffer = await readFile(fullPath);
  const fileStat = await stat(fullPath);

  // Определяем MIME-тип
  const ext = path.extname(fullPath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Формируем ответ
  return new NextResponse(new Uint8Array(fileBuffer), {
   status: 200,
   headers: {
    'Content-Type': contentType,
    'Content-Length': fileStat.size.toString(),
    'Cache-Control': 'private, max-age=86400', // 24 часа
   },
  });
 } catch (error) {
  console.error('Ошибка отдачи файла:', error);
  return new NextResponse('Internal Server Error', { status: 500 });
 }
}
