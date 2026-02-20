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

/**
 * Handle a11y keyboard events for custom interactive elements (role="button")
 * Supports Enter and Space key presses to trigger the onClick equivalent
 */
export function handleA11yKeyDown(e: React.KeyboardEvent, callback: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
    }
}

/**
 * Safely opens an external URL, catching pop-up blocker issues
 * @param url The URL to open
 * @param externalName Name of the service (e.g. "Telegram", "Телефон") for the error message
 * @param toastFn The toast function from useToast() to display errors
 * @param isMobileOverride Optional: forces a mobile link behavior without blank target
 */
export function safeExternalOpen(
    url: string,
    externalName: string,
    toastFn: (msg: string, type?: "error" | "success" | "warning" | "info") => void,
    isMobileOverride: boolean = false
) {
    try {
        const target = isMobileOverride ? '_self' : '_blank';
        const win = window.open(url, target);

        // Check if browser blocked the popup (returns null)
        // Exceptions: if we forced _self or if it's a mailto/tel link on mobile
        if (!win && target === '_blank') {
            const isMobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobileBrowser || !url.startsWith('tel:')) {
                toastFn(`Браузер заблокировал переход (${externalName}). Разрешите всплывающие окна.`, "error");
            }
        }
    } catch {
        toastFn(`Не удалось открыть ссылку (${externalName}).`, "error");
    }
}
/**
 * Возвращает правильную форму слова (склонение) в зависимости от числа.
 * Пример: formatPlural(count, ['запись', 'записи', 'записей'])
 */
export function formatPlural(count: number, forms: [string, string, string]): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return forms[0];
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return forms[1];
    }
    return forms[2];
}
