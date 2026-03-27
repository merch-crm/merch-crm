import { jsPDF } from 'jspdf';
import { BrandingSettings } from '@/lib/types/branding';
import { robotoBase64 } from './fonts/roboto-base64';

/**
 * Регистрирует шрифты в документе
 */
export function registerFonts(doc: jsPDF): void {
  // Используем доступный шрифт для обоих начертаний для надежности
  doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');
  doc.setFont('Roboto-Regular');
}

/**
 * Отрисовывает заголовок документа с логотипом
 */
export function drawHeader(
  doc: jsPDF,
  settings: BrandingSettings,
  title: string,
  number: string
): void {
  const primaryColor = settings.primaryColor || '#2563eb';
  
  // Фон заголовка
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Текст
  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(24);
  doc.text(settings.companyName || 'MerchCRM', 20, 25);

  doc.setFontSize(10);
  doc.text(title, 20, 32);
  
  if (number) {
    const numWidth = doc.getTextWidth(String(number));
    doc.text(String(number), 190 - numWidth, 25);
  }
}

/**
 * Отрисовывает подвал документа
 */
export function drawFooter(doc: jsPDF, settings: BrandingSettings): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(230, 230, 230);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);
  
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  const footerText = settings.emailFooter || `Сгенерировано в MerchCRM - ${new Date().toLocaleDateString()}`;
  doc.text(footerText, 20, pageHeight - 12);
  
  // Упрощенная нумерация (jsPDF-compatible)
  const pageCount = (doc as jsPDF & { internal: { pages: unknown[] } }).internal.pages.length - 1;
  const pageNumber = `Страница ${pageCount}`;
  const pgWidth = doc.getTextWidth(pageNumber);
  doc.text(pageNumber, 190 - pgWidth, pageHeight - 12);
}
