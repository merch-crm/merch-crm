import { format } from "date-fns";
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
        }).format(amount).replace(currencyCode, symbol).replace("RUB", "₽");
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

    const f = map[formatStr] || "dd.MM.yyyy";
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

    const f = map[formatStr] || "dd.MM.yyyy HH:mm";
    return format(d, f, { locale: ru });
}
