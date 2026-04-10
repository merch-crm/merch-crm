import { type jsPDF } from "jspdf";
import { Buffer } from "buffer";

// Настройки цветов
export const COLORS = {
  primary: [79, 70, 229] as [number, number, number], // Indigo 600
  textPrimary: [17, 24, 39] as [number, number, number], // Gray 900
  textSecondary: [107, 114, 128] as [number, number, number], // Gray 500
  background: [249, 250, 251] as [number, number, number], // Gray 50
  border: [229, 231, 235] as [number, number, number], // Gray 200
  white: [255, 255, 255] as [number, number, number],
};

// Настройки шрифтов
export const FONTS = {
  titleSize: 18,
  subtitleSize: 14,
  headingSize: 12,
  bodySize: 10,
  smallSize: 8,
};

export const FONT_NAME = "Manrope";

/**
 * Регистрируем системный шрифт Manrope в jsPDF (загружаем из public/fonts/)
 */
export async function registerCyrillicFont(doc: jsPDF): Promise<void> {
  const fontFiles = [
    { url: "/fonts/Manrope-Regular.ttf", name: "Manrope-Regular.ttf", fontName: "Manrope", style: "normal" },
    { url: "/fonts/Manrope-Bold.ttf", name: "Manrope-Bold.ttf", fontName: "Manrope", style: "bold" },
  ];

  try {
    await Promise.all(
      fontFiles.map(async (font) => {
        const response = await fetch(font.url);
        if (!response.ok) throw new Error(`Failed to load font ${font.url}: ${response.statusText}`);
        
        const buffer = await response.arrayBuffer();
        
        // ПРОВЕРКА НА БИТЫЙ ФАЙЛ (часто скачивается HTML страница вместо TTF)
        const header = new TextDecoder().decode(buffer.slice(0, 50));
        if (header.includes("<!DOCTYPE") || header.includes("<html")) {
          console.error(`КРИТИЧЕСКАЯ ОШИБКА: Файл шрифта ${font.url} является HTML-страницей, а не TTF файлом! Проверьте public/fonts/`);
          throw new Error(`Font file ${font.name} is corrupted (HTML instead of binary).`);
        }

        if (buffer.byteLength < 5000) {
          throw new Error(`Font file ${font.url} seems too small (${buffer.byteLength} bytes)`);
        }

        // Используем Buffer для надежной конвертации бинарных данных в base64
        const base64 = Buffer.from(buffer).toString("base64");

        doc.addFileToVFS(font.name, base64);
        // "Identity-H" обязателен для поддержки кириллицы/UTF-8 в TTF шрифтах jsPDF
        doc.addFont(font.name, font.fontName, font.style, "Identity-H");
      })
    );

    // Устанавливаем шрифт по умолчанию сразу после успешной регистрации
    doc.setFont(FONT_NAME, "normal");
  } catch (e) {
    console.error("Ошибка при регистрации шрифтов (используем backup):", e);
    // В случае ошибки пытаемся использовать стандартный шрифт
    doc.setFont("helvetica", "normal");
  }
}
