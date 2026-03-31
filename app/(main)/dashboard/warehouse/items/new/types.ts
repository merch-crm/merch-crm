/**
 * Данные линейки
 */
export interface LineData {
    /** Пользовательское название (пустое = автогенерация) */
    customName: string;
    /** Описание линейки */
    description: string;
    /** ID общих атрибутов */
    commonAttributeIds: string[];
    /** ID коллекции принтов (для готовых линеек) */
    printCollectionId: string | null;
    /** ID базовой линейки (для готовых линеек) */
    baseLineId: string | null;
}

/**
 * Атрибут с выбранным значением
 */
export interface SelectedAttributeValue {
    attributeId: string;
    attributeCode?: string;
    attributeName: string;
    value: string;
    valueLabel?: string;
}

/**
 * Генерированная позиция для линейки
 */
export interface GeneratedPosition {
    /** Временный ID */
    tempId: string;
    /** Название позиции */
    name: string;
    /** SKU */
    sku: string;
    /** Значения атрибутов */
    attributes: Record<string, string>;
    /** ID принта (для готовых линеек) */
    printDesignId?: string;
    /** Название принта */
    printName?: string;
    /** ID базовой позиции */
    baseItemId?: string;
}
