/**
 * Склонение русских слов в зависимости от числа
 * @param count - число
 * @param one - форма для 1 (позиция)
 * @param few - форма для 2-4 (позиции)
 * @param many - форма для 5+ (позиций)
 * @returns правильная форма слова
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
    const absCount = Math.abs(count);
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many;
    }
    if (lastDigit === 1) {
        return one;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return few;
    }
    return many;
}

/**
 * Склонение русских слов для родительного падежа (для фразы "из 10 позиций")
 * @param count - число
 * @param oneGen - форма родительного падежа ед. числа (позиции, товара)
 * @param manyGen - форма родительного падежа мн. числа (позиций, товаров)
 */
export function pluralizeGenitive(count: number, oneGen: string, manyGen: string): string {
    const absCount = Math.abs(count);
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return manyGen;
    }
    if (lastDigit === 1) {
        return oneGen;
    }
    return manyGen;
}

/**
 * Форматирование числа с правильным склонением слова
 */
export function formatCount(count: number, one: string, few: string, many: string): string {
    return `${count} ${pluralize(count, one, few, many)}`;
}

/**
 * Род существительного
 */
export type Gender = 'm' | 'f' | 'n';

/**
 * Склонение прилагательных или глаголов в зависимости от рода и числа
 * Помогает строить фразы типа "Удален 1 товар" / "Удалена 1 позиция" / "Удалено 5 товаров"
 * 
 * @param count - количество предметов
 * @param gender - род существительного ('m' - мужской, 'f' - женский, 'n' - средний)
 * @param forms - объект с формами слова для разных родов в ед. и мн. числе
 * 
 * @example
 * // Глаголы/причастия (Удален/Удалена/Удалено)
 * const text = inflect('удален', count, 'f'); // "удалена" для 1, "удалено" для 5
 */
export function inflect(wordOrForms: string | { one: string, many: string }, count: number, gender: Gender): string {
    const isOne = (count % 10 === 1) && (count % 100 !== 11);

    // Если передана строка (базовая форма), пытаемся автоматически определить окончания для причастий/глаголов
    // Это упрощенная логика, для сложных слов лучше передавать объект с формами
    if (typeof wordOrForms === 'string') {
        const base = wordOrForms;
        if (!isOne) return base.endsWith('ен') ? base + 'о' : base + 'о'; // Удалено, Выбрано

        if (gender === 'f') {
            if (base.endsWith('ен')) return base + 'а'; // Удалена
            if (base.endsWith('ый')) return base.slice(0, -2) + 'ая'; // Красивая
            return base + 'а';
        }
        if (gender === 'n') {
            return base + 'о'; // Удалено
        }
        return base; // Удален (мужской род, ед. число)
    }

    return isOne ? wordOrForms.one : wordOrForms.many;
}

/**
 * Расширенная функция для построения целой фразы с учетом рода
 * @example
 * // "Удалено 5 позиций" или "Удалена 1 позиция"
 * sentence(count, 'f', { one: 'Удалена', many: 'Удалено' }, { one: 'позиция', few: 'позиции', many: 'позиций' })
 */
export function sentence(
    count: number,
    gender: Gender,
    verbForms: { one: string, many: string },
    nounForms: { one: string, few: string, many: string }
): string {
    const verb = (count % 10 === 1) && (count % 100 !== 11) ? verbForms.one : verbForms.many;
    const noun = pluralize(count, nounForms.one, nounForms.few, nounForms.many);
    return `${verb} ${count} ${noun}`;
}
