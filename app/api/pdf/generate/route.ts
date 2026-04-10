import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { PDFGenerator } from '@/lib/services/pdf/pdf-generator';
import { getBrandingSettings } from '@/lib/actions/branding';
import type { PDFCalculationData, PDFGenerationOptions } from '@/lib/types/pdf';

/**
 * POST /api/pdf/generate
 * Генерирует PDF документ расчёта
 * @requires auth - Требуется авторизация
 * @audit create - Генерация PDF документа
 */
export async function POST(request: NextRequest) {
 try {
  const user = await getCurrentUser();
  
  if (!user?.id) {
   return NextResponse.json(
    { error: 'Требуется авторизация' },
    { status: 401 }
   );
  }

  const body = await request.json();
  const { calculationData, options } = body as {
   calculationData: PDFCalculationData;
   options?: Partial<PDFGenerationOptions>;
  };

  if (!calculationData) {
   return NextResponse.json(
    { error: 'Данные расчёта обязательны' },
    { status: 400 }
   );
  }

  // Восстанавливаем Date объект после JSON.parse (JSON превращает Date в строку)
  if (calculationData.date && typeof calculationData.date === 'string') {
   calculationData.date = new Date(calculationData.date);
  }

  // Получаем настройки брендинга
  const brandingResult = await getBrandingSettings();
  
  if (!brandingResult.success || !brandingResult.data) {
   return NextResponse.json(
    { error: brandingResult.error || 'Не удалось загрузить настройки брендинга' },
    { status: 500 }
   );
  }

  // Генерируем PDF
  const generator = new PDFGenerator(brandingResult.data, options);
  const result = await generator.generate(calculationData);

  if (!result.success || !result.blob) {
   return NextResponse.json(
    { error: result.error || 'Ошибка генерации PDF' },
    { status: 500 }
   );
  }

  // Возвращаем PDF
  const arrayBuffer = await result.blob.arrayBuffer();
  return new NextResponse(arrayBuffer, {
   headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${result.filename}"`,
   },
  });
 } catch (error) {
  console.error('Ошибка API генерации PDF:', error);
  return NextResponse.json(
   { error: 'Внутренняя ошибка сервера' },
   { status: 500 }
  );
 }
}
