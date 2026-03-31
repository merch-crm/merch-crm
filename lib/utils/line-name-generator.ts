/**
 * Генератор названия линейки из общих атрибутов
 */

// Приоритет атрибутов для формирования названия
const ATTRIBUTE_PRIORITY: Record<string, number> = {
    brand: 1,
    density: 2,
    fabric: 3,
    material: 4,
    color: 5,
    // Остальные атрибуты получат приоритет 100+
};


interface AttributeValue {
    attributeId: string;
    attributeCode?: string;
    attributeName: string;
    value: string;
    valueLabel?: string;
}

interface GenerateLineNameOptions {
    /** Общие атрибуты линейки */
    attributes: AttributeValue[];
    /** Название подкатегории (опционально, для контекста) */
    subcategoryName?: string;
    /** Максимальная длина названия */
    maxLength?: number;
}

/**
 * Генерирует название линейки из атрибутов
 */
export function generateLineName(options: GenerateLineNameOptions): string {
    const { attributes, maxLength = 100 } = options;

    if (!attributes || attributes.length === 0) {
        return "";
    }

    // Сортируем атрибуты по приоритету
    const sortedAttributes = [...attributes].sort((a, b) => {
        const priorityA = ATTRIBUTE_PRIORITY[a.attributeCode || ""] ?? 100;
        const priorityB = ATTRIBUTE_PRIORITY[b.attributeCode || ""] ?? 100;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        // При одинаковом приоритете сортируем по названию атрибута
        return a.attributeName.localeCompare(b.attributeName);
    });

    // Собираем значения
    const nameParts: string[] = [];

    for (const attr of sortedAttributes) {
        const value = attr.valueLabel || attr.value;

        if (value && value.trim()) {
            nameParts.push(value.trim());
        }
    }

    // Объединяем в строку
    let name = nameParts.join(" ");

    // Обрезаем до максимальной длины
    if (name.length > maxLength) {
        name = name.substring(0, maxLength - 3) + "...";
    }

    return name;
}

/**
 * Генерирует название позиции готовой продукции
 * Формат: [Изделие] [Название линейки] [Принт] [Цвет] [Размер]
 */
export function generatePositionName(options: {
    productName: string;      // Название изделия (ед.ч.) - Футболка
    lineName: string;         // Название базовой линейки - Muse 220
    printName: string;        // Название принта - Овен
    colorName: string;        // Цвет - Белый
    sizeName: string;         // Размер - S
}): string {
    const { productName, lineName, printName, colorName, sizeName } = options;

    const parts = [
        productName,
        lineName,
        printName,
        colorName,
        sizeName,
    ].filter(Boolean);

    return parts.join(" ");
}

/**
 * Преобразует название подкатегории из множественного в единственное число
 */
export function singularize(pluralName: string): string {
    const pluralToSingular: Record<string, string> = {
        // Одежда
        "Футболки": "Футболка",
        "Худи": "Худи",
        "Лонгсливы": "Лонгслив",
        "Свитшоты": "Свитшот",
        "Толстовки": "Толстовка",
        "Поло": "Поло",
        "Майки": "Майка",
        "Шорты": "Шорты",
        "Брюки": "Брюки",
        "Джинсы": "Джинсы",
        "Куртки": "Куртка",
        "Жилеты": "Жилет",
        "Пальто": "Пальто",
        // Головные уборы
        "Кепки": "Кепка",
        "Шапки": "Шапка",
        "Панамы": "Панама",
        "Банданы": "Бандана",
        // Аксессуары
        "Сумки": "Сумка",
        "Рюкзаки": "Рюкзак",
        "Кошельки": "Кошелёк",
        "Ремни": "Ремень",
        "Шарфы": "Шарф",
        "Перчатки": "Перчатки",
        "Носки": "Носки",
        // Для дома
        "Кружки": "Кружка",
        "Чашки": "Чашка",
        "Подушки": "Подушка",
        "Пледы": "Плед",
        "Полотенца": "Полотенце",
        // Канцелярия
        "Блокноты": "Блокнот",
        "Ежедневники": "Ежедневник",
        "Ручки": "Ручка",
        "Карандаши": "Карандаш",
        // Техника
        "Чехлы": "Чехол",
        "Флешки": "Флешка",
        "Powerbank": "Powerbank",
    };

    return pluralToSingular[pluralName] || pluralName;
}

/**
 * Генерирует SKU для позиции
 * Формат: [КАТ]-[ЛИНИЯ]-[ПРИНТ]-[ЦВЕТ]-[РАЗМЕР]
 */
export function generatePositionSKU(options: {
    categoryCode: string;     // Код категории - FT (футболки)
    lineCode: string;         // Код линейки - MUSE220
    printCode: string;        // Код принта - OVEN
    colorCode: string;        // Код цвета - WHT
    sizeCode: string;         // Код размера - S
}): string {
    const { categoryCode, lineCode, printCode, colorCode, sizeCode } = options;

    const parts = [
        categoryCode.toUpperCase(),
        lineCode.toUpperCase(),
        printCode.toUpperCase(),
        colorCode.toUpperCase(),
        sizeCode.toUpperCase(),
    ].filter(Boolean);

    return parts.join("-");
}

/**
 * Транслитерация для генерации кодов
 */
export function transliterate(text: string): string {
    const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };

    return text
        .toLowerCase()
        .split("")
        .map((char) => map[char] || char)
        .join("")
        .replace(/[^a-z0-9]/g, "")
        .toUpperCase();
}

/**
 * Генерирует короткий код из названия
 */
export function generateShortCode(name: string, maxLength: number = 8): string {
    // Удаляем специальные символы и разбиваем на слова
    const words = name
        .replace(/[^\wа-яА-ЯёЁ\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return "";

    if (words.length === 1) {
        // Одно слово - берём первые N символов
        return transliterate(words[0]).substring(0, maxLength);
    }

    // Несколько слов - берём первые буквы или комбинируем
    if (words.length <= 3) {
        // Берём по 2-3 буквы от каждого слова
        const charsPerWord = Math.floor(maxLength / words.length);
        return words
            .map((w) => transliterate(w).substring(0, charsPerWord))
            .join("")
            .substring(0, maxLength);
    }

    // Много слов - берём первые буквы
    return words
        .map((w) => transliterate(w)[0] || "")
        .join("")
        .substring(0, maxLength);
}
