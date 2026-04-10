/**
 * Определяет, является ли цвет светлым на основе его яркости (ance).
 * Используется для выбора контрастного цвета текста/иконок (черный против белого).
 * 
 * @param hex - Цвет в формате #RRGGBB или RRGGBB
 * @param threshold - Порог яркости (0.65 по умолчанию согласно стандартам проекта)
 * @returns true, если цвет считается светлым
 */
export function isLightColor(hex: string, threshold: number = 0.65): boolean {
    if (!hex) return false;
    
    const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    
    // Поддержка короткой записи (напр. #FFF)
    let r, g, b;
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex.slice(0, 1) + cleanHex.slice(0, 1), 16);
        g = parseInt(cleanHex.slice(1, 2) + cleanHex.slice(1, 2), 16);
        b = parseInt(cleanHex.slice(2, 3) + cleanHex.slice(2, 3), 16);
    } else {
        r = parseInt(cleanHex.slice(0, 2), 16);
        g = parseInt(cleanHex.slice(2, 4), 16);
        b = parseInt(cleanHex.slice(4, 6), 16);
    }
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

    // Расчет относительной яркости (Rec. 601)
    const ance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return ance > threshold;
}
