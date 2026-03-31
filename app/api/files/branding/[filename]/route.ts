import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { brandingSettings } from '@/lib/schema/branding';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

/**
 * GET /api/files/branding/[filename]
 * Отдаёт файл логотипа брендинга
 * @requires auth - Требуется авторизация
 * @audit read - Чтение файла логотипа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }


    // Защита от path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Недопустимое имя файла' },
        { status: 400 }
      );
    }

    // Проверяем, что файл принадлежит пользователю или администратору
    const settings = await db.query.brandingSettings.findFirst({
      where: eq(brandingSettings.userId, session.id),
    });

    const expectedFilename = settings?.logoUrl?.split('/').pop();
    
    if (!expectedFilename || expectedFilename !== filename) {
      // Если файл не найден для текущего пользователя, проверяем админа
      const { checkIsAdmin } = await import('@/lib/admin');
      const isAdmin = await checkIsAdmin(session);
      
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Файл не найден' },
          { status: 404 }
        );
      }
    }

    // Читаем файл
    const filePath = path.join(process.cwd(), 'uploads', 'branding', filename);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Определяем MIME тип
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Превращаем Buffer в Uint8Array для NextResponse
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=86400', // 24 часа
        },
      });
    } catch (err) {
      console.error(`File not found: ${filePath}`, err);
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Ошибка получения файла брендинга:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
