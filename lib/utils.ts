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
    pcs: "шт.",
    liters: "л",
    meters: "м",
    kg: "кг",
    "шт": "шт.",
    "шт.": "шт.",
};

/**
 * Converts an internal unit enum value (e.g. "pcs") to a user-facing Russian label (e.g. "шт.").
 * Falls back to the raw value if no mapping exists.
 */
export function formatUnit(unit: string | null | undefined): string {
    if (!unit) return "шт.";
    return UNIT_LABELS[unit] ?? unit;
}
