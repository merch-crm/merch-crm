import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function formatCurrency(amount: number, symbol: string = "₽"): string {
    const currencyMap: Record<string, string> = {
        "₽": "RUB",
        "$": "USD",
        "€": "EUR",
        "₸": "KZT",
        "₴": "UAH"
    };

    const currencyCode = currencyMap[symbol] || "RUB";

    try {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
            maximumFractionDigits: 2
        }).format(amount).replace(currencyCode, symbol).replace("RUB", "₽").trim();
    } catch {
        return `${amount.toLocaleString('ru-RU')} ${symbol}`;
    }
}

// Simple manual formatter if we want strict control over symbol placement
export function formatCurrencySimple(amount: number, symbol: string = "₽"): string {
    return `${amount.toLocaleString('ru-RU')} ${symbol}`;
}

export function formatDate(date: Date | string, formatStr: string = "DD.MM.YYYY"): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    // Map common user-friendly formats to date-fns formats
    const map: Record<string, string> = {
        "DD.MM.YYYY": "dd.MM.yyyy",
        "YYYY-MM-DD": "yyyy-MM-dd",
        "MM/DD/YYYY": "MM/dd/yyyy",
    };

    const f = map[formatStr] || formatStr;
    return format(d, f, { locale: ru });
}

export function formatDateTime(date: Date | string, formatStr: string = "DD.MM.YYYY"): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    // Map + add time
    const map: Record<string, string> = {
        "DD.MM.YYYY": "dd.MM.yyyy HH:mm",
        "YYYY-MM-DD": "yyyy-MM-dd HH:mm",
        "MM/DD/YYYY": "MM/dd/yyyy HH:mm",
    };

    const f = map[formatStr] || formatStr;
    return format(d, f, { locale: ru });
}

export function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function formatUptime(seconds: number) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${mins} м`;
};

export function formatTimeAgo(date: string | Date) {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
    } catch {
        return "";
    }
}

/**
 * Отрезает строку до указанной длины и добавляет многоточие.
 */
export function truncate(str: string, length: number, suffix: string = "..."): string {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + suffix;
}

/**
 * Форматирует номер телефона в формат +7 (999) 123-45-67.
 */
export function formatPhone(phone: string | null): string {
    if (!phone) return "";
    
    // Оставляем только цифры
    let cleaned = phone.replace(/\D/g, "");
    
    // Если начинается с 8 или 7 и длина 11
    if (cleaned.length === 11) {
        if (cleaned.startsWith("8")) {
            cleaned = "7" + cleaned.slice(1);
        }
    } else if (cleaned.length === 10) {
        cleaned = "7" + cleaned;
    }
    
    if (cleaned.length !== 11) return phone;
    
    const matched = cleaned.match(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (matched) {
        return `+${matched[1]} (${matched[2]}) ${matched[3]}-${matched[4]}-${matched[5]}`;
    }
    
    return phone;
}
