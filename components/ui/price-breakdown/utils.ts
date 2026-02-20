/**
 * Форматирование цены
 */
export const formatPrice = (price: number, currency = "₽"): string => {
    return new Intl.NumberFormat("ru-RU").format(price) + " " + currency;
};

/**
 * Форматирование процента
 */
export const formatPercent = (value: number): string => {
    return value.toFixed(1).replace(".0", "") + "%";
};
