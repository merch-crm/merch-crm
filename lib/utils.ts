import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
    const cyrillicToLatin: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return text.toLowerCase().split('').map(char => {
        return cyrillicToLatin[char] || char;
    }).join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const UNIT_LABELS: Record<string, string> = {
    "шт.": "шт.",
    "л": "л",
    "м": "м",
    "кг": "кг",
};

/**
 * Форматирует единицу измерения для отображения.
 * По умолчанию возвращает "шт.", если единица не указана.
 */
export function formatUnit(unit: string | null | undefined): string {
    if (!unit) return "шт.";
    // Если это варианты "шт" или "pcs", приводим к "шт."
    if (unit === "шт" || unit === "pcs") return "шт.";
    return UNIT_LABELS[unit] ?? unit;
}


/**
 * Formats a number as currency string with proper Russian locale
 * formatCurrency(1234567.89) → "1 234 567,89"
 */
export function formatCurrency(
    value: number | string | null | undefined,
    options?: { decimals?: number; symbol?: string }
): string {
    const { decimals = 2, symbol } = options ?? {};

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num == null || isNaN(num)) return '0';

    const formatted = num.toLocaleString('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Generates a unique ID (for client-side use only, not crypto-secure)
 */
export function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

