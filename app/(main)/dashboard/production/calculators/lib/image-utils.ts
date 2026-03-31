import { DEFAULT_DPI, pixelsToMm } from "../types";

export interface ImageDimensions {
    widthPx: number;
    heightPx: number;
    widthMm: number;
    heightMm: number;
}

/**
 * Получает размеры изображения из файла
 */
export function getImageDimensions(
    file: File,
    dpi: number = DEFAULT_DPI
): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const widthPx = img.naturalWidth;
                const heightPx = img.naturalHeight;

                resolve({
                    widthPx,
                    heightPx,
                    widthMm: pixelsToMm(widthPx, dpi),
                    heightMm: pixelsToMm(heightPx, dpi),
                });
            };

            img.onerror = () => {
                reject(new Error("Не удалось загрузить изображение"));
            };

            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error("Не удалось прочитать файл"));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Создаёт превью изображения (data URL)
 */
export function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };

        reader.onerror = () => {
            reject(new Error("Не удалось создать превью"));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Извлекает имя файла без расширения
 */
export function getFileNameWithoutExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, "");
}

/**
 * Проверяет, является ли файл допустимым изображением
 */
export function isValidImageFile(file: File): boolean {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    return validTypes.includes(file.type);
}

/**
 * Максимальный размер файла (10 МБ)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Проверяет размер файла
 */
export function isValidFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
}
