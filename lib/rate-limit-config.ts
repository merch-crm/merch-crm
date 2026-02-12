/**
 * Конфигурация лимитов для разных эндпоинтов
 */
export const RATE_LIMITS = {
    // Аутентификация — строгие лимиты
    login: {
        limit: 5,
        windowSec: 15 * 60, // 15 минут
        message: "Слишком много попыток входа. Подождите 15 минут.",
    },

    register: {
        limit: 3,
        windowSec: 60 * 60, // 1 час
        message: "Слишком много регистраций. Подождите час.",
    },

    passwordReset: {
        limit: 3,
        windowSec: 60 * 60, // 1 час
        message: "Слишком много запросов сброса пароля.",
    },

    // API — общие лимиты
    api: {
        limit: 100,
        windowSec: 60, // 1 минута
        message: "Слишком много запросов. Подождите минуту.",
    },

    // Загрузка файлов
    upload: {
        limit: 20,
        windowSec: 60, // 1 минута
        message: "Слишком много загрузок. Подождите минуту.",
    },

    // Поиск
    search: {
        limit: 30,
        windowSec: 60, // 1 минута
        message: "Слишком много поисковых запросов.",
    },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;
