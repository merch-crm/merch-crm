export { formatFileSize as formatSize, formatUptime, formatTimeAgo as getTimeAgo } from "@/lib/formatters";

export function translateErrorMessage(message: string): string {
    if (!message) return "Неизвестная ошибка";

    const rules = [
        { rule: /Cannot read properties of undefined/, text: "Ошибка в коде: попытка чтения свойства у неопределенного объекта (undefined)" },
        { rule: /Cannot read properties of null/, text: "Ошибка в коде: попытка чтения свойства у null-объекта" },
        { rule: /relation.*does not exist/, text: "Ошибка базы данных: таблица или отношение не найдено" },
        { rule: /syntax error/, text: "Ошибка базы данных: синтаксическая ошибка в SQL запросе" },
        { rule: /ECONNREFUSED/, text: "Сбой подключения: сервер или база данных недоступны" },
        { rule: /unique constraint/, text: "Конфликт данных: нарушение уникальности (дубликат)" },
        { rule: /violates not-null constraint/, text: "Ошибка данных: обязательное поле не заполнено" },
        { rule: /invalid input syntax/, text: "Ошибка данных: неверный формат входных значений" },
        { rule: /drizzle-kit: not found/, text: "Системная ошибка: утилита миграций не найдена" },
    ];

    for (const { rule, text } of rules) {
        if (rule.test(message)) return text;
    }

    return message;
}
