/**
 * @fileoverview Server Actions для управления брендингом PDF
 * @module lib/actions/branding
 * @requires drizzle
 * @audit Создан 2026-03-26
 */

'use server';

import { db } from '@/lib/db';
import { brandingSettings } from '@/lib/schema/branding';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSafeAction } from '@/lib/action-helpers';
import { type PDFBrandingSettings, DEFAULT_BRANDING_SETTINGS } from '@/lib/types/pdf';

/**
 * Валидация hex-цвета
 */
const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Некорректный формат цвета');

/**
 * Схема для сохранения настроек брендинга
 */
const saveBrandingSchema = z.object({
  companyName: z.string().min(1, 'Название компании обязательно').max(100),
  logoUrl: z.string().nullable().optional(),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  phone: z.string().nullable().optional(),
  email: z.string().email('Некорректный email').nullable().or(z.string().length(0)).optional(),
  website: z.string().url('Некорректный URL').nullable().or(z.string().length(0)).optional(),
  address: z.string().nullable().optional(),
  inn: z.string().nullable().optional(),
  kpp: z.string().nullable().optional(),
  ogrn: z.string().nullable().optional(),
  bankDetails: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  showQrCode: z.boolean().optional(),
});

/**
 * Получает настройки брендинга пользователя
 * @audit read - Чтение настроек брендинга
 * @returns Настройки брендинга или дефолтные значения
 */
export async function getBrandingSettings() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, error: 'Требуется авторизация' };
  }

  try {
    const settings = await db.query.brandingSettings.findFirst({
      where: eq(brandingSettings.userId, user.id),
    });

    if (!settings) {
      // Возвращаем дефолтные настройки
      return {
        success: true,
        data: {
          id: '',
          userId: user.id,
          ...DEFAULT_BRANDING_SETTINGS,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PDFBrandingSettings,
      };
    }

    return { success: true, data: settings as PDFBrandingSettings };
  } catch (error) {
    console.error('Ошибка получения настроек брендинга:', error);
    return { success: false, error: 'Не удалось загрузить настройки' };
  }
}

/**
 * Сохраняет настройки брендинга
 * @audit create/update - Создание или обновление настроек брендинга
 */
export const saveBrandingSettings = createSafeAction(
  saveBrandingSchema,
  async (data) => {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      throw new Error('Требуется авторизация');
    }

    const settingsData = {
      ...data,
      companyName: data.companyName.trim(),
      email: data.email || null,
      website: data.website || null,
      updatedAt: new Date(),
    };

    const existing = await db.query.brandingSettings.findFirst({
      where: eq(brandingSettings.userId, user.id),
    });

    let result;

    if (existing) {
      [result] = await db
        .update(brandingSettings)
        .set(settingsData)
        .where(eq(brandingSettings.userId, user.id))
        .returning();
    } else {
      [result] = await db
        .insert(brandingSettings)
        .values({
          ...settingsData,
          userId: user.id,
        })
        .returning();
    }

    revalidatePath('/dashboard/settings/branding');
    return result as PDFBrandingSettings;
  }
);

/**
 * Загружает логотип компании
 * @audit update - Загрузка логотипа
 * @param formData - FormData с файлом логотипа
 */
export async function uploadBrandingLogo(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, error: 'Требуется авторизация' };
  }

  const file = formData.get('logo') as File | null;

  if (!file) {
    return { success: false, error: 'Файл не выбран' };
  }

  // Валидация файла
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      success: false, 
      error: 'Допустимые форматы: PNG, JPEG, WebP, SVG' 
    };
  }

  const maxSize = 2 * 1024 * 1024; // 2 MB
  if (file.size > maxSize) {
    return { success: false, error: 'Максимальный размер файла 2 МБ' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Генерируем имя файла
    const ext = file.type === 'image/svg+xml' ? 'svg' : 'webp';
    const filename = `logo-${user.id}.${ext}`;

    // Конвертируем в WebP (кроме SVG)
    let processedBuffer = buffer;
    if (file.type !== 'image/svg+xml') {
      const sharp = (await import('sharp')).default;
      processedBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();
    }

    // Сохраняем файл
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'branding');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), processedBuffer);

    const logoUrl = `/api/files/branding/${filename}`;

    // Обновляем настройки
    await db
      .update(brandingSettings)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(brandingSettings.userId, user.id));

    revalidatePath('/dashboard/settings/branding');

    return { success: true, data: { logoUrl } };
  } catch (error) {
    console.error('Ошибка загрузки логотипа:', error);
    return { success: false, error: 'Не удалось загрузить логотип' };
  }
}

/**
 * Удаляет логотип компании
 * @audit delete - Удаление логотипа
 */
export async function deleteBrandingLogo() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, error: 'Требуется авторизация' };
  }

  try {
    const settings = await db.query.brandingSettings.findFirst({
      where: eq(brandingSettings.userId, user.id),
    });

    if (settings?.logoUrl) {
      // Удаляем файл
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filename = settings.logoUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(process.cwd(), 'uploads', 'branding', filename);
        await fs.unlink(filePath).catch(() => {});
      }
    }

    // Обновляем настройки
    await db
      .update(brandingSettings)
      .set({ logoUrl: null, updatedAt: new Date() })
      .where(eq(brandingSettings.userId, user.id));

    revalidatePath('/dashboard/settings/branding');

    return { success: true, data: null };
  } catch (error) {
    console.error('Ошибка удаления логотипа:', error);
    return { success: false, error: 'Не удалось удалить логотип' };
  }
}
