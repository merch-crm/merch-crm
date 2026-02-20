/**
 * Сериализует данные для передачи от серверных компонентов к клиентским.
 * Обрабатывает Date, BigInt, Decimal, Map, Set и другие типы,
 * которые не поддерживаются обычным JSON.stringify.
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// Рекурсивный тип для сериализованных данных
export type Serialized<T> = T extends Date
    ? string
    : T extends bigint
    ? string
    : T extends Map<infer K, infer V>
    ? Record<string & K, Serialized<V>>
    : T extends Set<infer U>
    ? Serialized<U>[]
    : T extends Array<infer U>
    ? Serialized<U>[]
    : T extends object
    ? { [K in keyof T]: Serialized<T[K]> }
    : T;

/**
 * Сериализует объект в JSON-совместимый формат, корректно обрабатывая сложные типы.
 */
export function serializeForClient<T>(data: T): Serialized<T> {
    if (data === null || data === undefined) {
        return data as Serialized<T>;
    }

    try {
        return JSON.parse(JSON.stringify(data, (_, value) => {
            // Date → ISO string
            if (value instanceof Date) {
                return value.toISOString();
            }

            // BigInt → string
            if (typeof value === 'bigint') {
                return value.toString();
            }

            // Map → object
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }

            // Set → array
            if (value instanceof Set) {
                return Array.from(value);
            }

            // Decimal (Prisma/Drizzle) → string
            if (value?.constructor?.name === 'Decimal' || typeof value?.toNumber === 'function') {
                return value.toString();
            }

            // Buffer → base64 (Node.js only)
            if (
                typeof Buffer !== 'undefined' &&
                typeof Buffer.isBuffer === 'function' &&
                Buffer.isBuffer(value)
            ) {
                return value.toString('base64');
            }

            return value;
        }));
    } catch (error) {
        console.error('Serialization failed:', error);
        throw new Error('Failed to serialize data');
    }
}

/**
 * Десериализует даты из ISO строк обратно в Date объекты.
 * @param jsonString - JSON строка для парсимга
 */
export function deserializeDates<T>(jsonString: string): T {
    return JSON.parse(jsonString, (_, value) => {
        if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        return value;
    });
}

/**
 * Рекурсивно преобразует ISO-строки дат в объекты Date в существующем объекте.
 * @param data - объект с потенциальными ISO-строками дат
 */
export function reviveDatesInObject<T>(data: T): T {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string' && ISO_DATE_REGEX.test(data)) {
        const date = new Date(data);
        return (isNaN(date.getTime()) ? data : date) as T;
    }

    if (Array.isArray(data)) {
        return (data || []).map(reviveDatesInObject) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = reviveDatesInObject(value);
        }
        return result as T;
    }

    return data;
}
