"use client";

/**
 * ЗВУКОВАЯ СИСТЕМА MERCH CRM
 * ==========================
 * Централизованное управление звуковыми эффектами
 */

// Типы звуковых событий
export type SoundType =
    // Уведомления
    | "notification"           // Общее уведомление
    | "notification_success"   // Успешное уведомление
    | "notification_warning"   // Предупреждение
    | "notification_error"     // Ошибка

    // Заказы
    | "order_created"          // Новый заказ создан
    | "order_completed"        // Заказ завершён
    | "order_cancelled"        // Заказ отменён
    | "order_status_changed"   // Изменение статуса заказа

    // Клиенты
    | "client_created"         // Новый клиент
    | "client_updated"         // Клиент обновлён
    | "client_deleted"         // Клиент удалён

    // Склад
    | "item_created"           // Новая позиция на складе
    | "item_updated"           // Позиция обновлена
    | "stock_low"              // Низкий остаток
    | "stock_replenished"      // Пополнение склада

    // Финансы
    | "payment_received"       // Поступление оплаты
    | "expense_added"          // Добавлен расход

    // Чат и комментарии
    | "message_sent"           // Сообщение отправлено
    | "message_received"       // Получено новое сообщение

    // Задачи
    | "task_created"           // Новая задача создана
    | "task_completed"         // Задача выполнена
    | "task_reminder"          // Напоминание о дедлайне
    | "task_deleted"           // Задача удалена
    | "task_overdue"           // Дедлайн задачи пропущен

    // Импорт / Экспорт / Процессы
    | "process_started"        // Процесс запущен (например, экспорт базы)
    | "process_completed"      // Процесс успешно завершён
    | "process_failed"         // Процесс завершился ошибкой

    // Печать и документы
    | "print_started"          // Документ отправлен на печать
    | "document_generated"     // PDF или XLSX сгенерирован

    // Сканирование (Штрих-коды / QR)
    | "scan_success"           // Успешное сканирование
    | "scan_error"             // Ошибка сканирования / Не найден артикул

    // Интерфейс
    | "click"                  // Клик по кнопке
    | "toggle"                 // Переключатель
    | "modal_open"             // Открытие модального окна
    | "modal_close"            // Закрытие модального окна
    | "tab_switch"             // Переключение вкладки

    // Специальные
    | "achievement"            // Достижение/награда
    | "level_up";              // Повышение уровня (геймификация)

// Маппинг звуков на файлы
export const SOUND_FILES: Record<SoundType, string> = {
    // Уведомления
    notification: "/sounds/notification.wav",
    notification_success: "/sounds/success.wav",
    notification_warning: "/sounds/warning.wav",
    notification_error: "/sounds/error.wav",

    // Заказы
    order_created: "/sounds/order-created.ogg",
    order_completed: "/sounds/order-completed.ogg",
    order_cancelled: "/sounds/delete.ogg",
    order_status_changed: "/sounds/status-changed.ogg",

    // Клиенты
    client_created: "/sounds/client-created.ogg",
    client_updated: "/sounds/success.wav",
    client_deleted: "/sounds/delete.ogg",

    // Склад
    item_created: "/sounds/item-created.wav",
    item_updated: "/sounds/success.wav",
    stock_low: "/sounds/warning.wav",
    stock_replenished: "/sounds/success.wav",

    // Финансы
    payment_received: "/sounds/payment.wav",
    expense_added: "/sounds/expense.wav",

    // Чат
    message_sent: "/sounds/message-sent.wav",
    message_received: "/sounds/message-received.wav",

    // Задачи
    task_created: "/sounds/item-created.wav",
    task_completed: "/sounds/task-completed.ogg",
    task_reminder: "/sounds/notification.wav",
    task_deleted: "/sounds/delete.ogg",
    task_overdue: "/sounds/error.wav",

    // Процессы
    process_started: "/sounds/click.wav",
    process_completed: "/sounds/success.wav",
    process_failed: "/sounds/error.wav",

    // Печать
    print_started: "/sounds/message-sent.wav",
    document_generated: "/sounds/success.wav",

    // Сканирование
    scan_success: "/sounds/success.wav",
    scan_error: "/sounds/scan-error.ogg",

    // Интерфейс
    click: "/sounds/click.wav",
    toggle: "/sounds/toggle.wav",
    modal_open: "/sounds/modal-open.wav",
    modal_close: "/sounds/modal-close.wav",
    tab_switch: "/sounds/tab.wav",

    // Специальные
    achievement: "/sounds/achievement.wav",
    level_up: "/sounds/level-up.wav",
};

// Категории звуков для настроек
export const SOUND_CATEGORIES = {
    notifications: {
        label: "Уведомления",
        sounds: ["notification", "notification_success", "notification_error", "message_sent", "message_received"] as SoundType[],
    },
    orders: {
        label: "Заказы",
        sounds: ["order_created", "order_completed", "order_cancelled", "order_status_changed"] as SoundType[],
    },
    clients: {
        label: "Клиенты",
        sounds: ["client_created", "client_updated", "client_deleted"] as SoundType[],
    },
    warehouse: {
        label: "Склад",
        sounds: ["item_created", "item_updated", "stock_low", "stock_replenished", "scan_success", "scan_error"] as SoundType[],
    },
    tasks: {
        label: "Задачи",
        sounds: ["task_created", "task_completed", "task_reminder", "task_deleted"] as SoundType[],
    },
};

// Кэш для предзагруженных звуков
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Настройки звука
let soundEnabled = true;
let soundVolume = 0.5;
let vibrationEnabled = true;

// Конфигурация звуков
export interface SoundConfig {
    enabled: boolean;
    vibration: boolean;
    customUrl?: string | null;
}

let globalSoundConfig: Record<string, SoundConfig> = {};

/**
 * Установить конфигурацию звуков
 */
export function setGlobalSoundConfig(config: Record<string, SoundConfig>) {
    globalSoundConfig = config;
}

/**
 * Воспроизвести звук
 */
export function playSound(type: SoundType, options?: { volume?: number; force?: boolean }) {
    if (typeof window === "undefined") return;

    // Check global enabled state
    if (!soundEnabled && !options?.force) return;

    // Check specific sound config
    const config = globalSoundConfig[type];
    if (config && config.enabled === false) return;

    // Determine file path
    let soundFile = config?.customUrl || SOUND_FILES[type];

    // Add cache busting for custom sounds to ensure updates play immediately
    if (config?.customUrl) {
        soundFile = `${soundFile}?t=${Date.now()}`;
    }

    if (!soundFile) {
        console.warn(`Sound not found: ${type}`);
        return;
    }

    // Vibration logic
    if (vibrationEnabled && (config?.vibration !== false)) {
        let pattern: number | number[] = 100; // Default: short tick

        if (type.includes("error") || type.includes("failed") || type.includes("cancelled") || type.includes("scan_error")) {
            pattern = [100, 50, 100]; // Double bump for errors
        } else if (type.includes("success") || type.includes("completed") || type.includes("created") || type === "scan_success") {
            pattern = 70; // Even shorter crisp bump for success
        } else if (type.includes("warning") || type === "stock_low") {
            pattern = [300, 100, 300]; // Long alert for warnings
        } else if (type === "notification") {
            pattern = 200;
        }

        vibrate(pattern);
    }

    try {
        const audio = new Audio(soundFile);
        audio.volume = options?.volume ?? soundVolume;
        audio.play().catch((err) => {
            console.warn(`Failed to play sound ${type}:`, err);
        });
    } catch (err) {
        console.warn(`Error playing sound ${type}:`, err);
    }
}

/**
 * Вибрация (для мобильных устройств)
 */
export function vibrate(pattern: number | number[] = 200) {
    if (typeof window === "undefined" || !navigator.vibrate) return;
    if (!vibrationEnabled) return;

    try {
        navigator.vibrate(pattern);
    } catch (e) {
        // Ignore errors
    }
}

/**
 * Предзагрузить звуки
 */
export function preloadSounds(types?: SoundType[]) {
    if (typeof window === "undefined") return;

    const soundsToLoad = types || (Object.keys(SOUND_FILES) as SoundType[]);

    soundsToLoad.forEach((type) => {
        const config = globalSoundConfig[type];
        const soundFile = config?.customUrl || SOUND_FILES[type];

        if (soundFile) {
            const audio = new Audio();
            audio.preload = "auto";
            audio.src = soundFile;
        }
    });
}
// ... rest of file unmodified
export function setSoundEnabled(enabled: boolean) {
    soundEnabled = enabled;
    if (typeof window !== "undefined") {
        localStorage.setItem("crm_sound_enabled", String(enabled));
    }
}

export function setSoundVolume(volume: number) {
    soundVolume = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
        localStorage.setItem("crm_sound_volume", String(soundVolume));
    }
}

export function setVibrationEnabled(enabled: boolean) {
    vibrationEnabled = enabled;
    if (typeof window !== "undefined") {
        localStorage.setItem("crm_vibration_enabled", String(enabled));
    }
}

export function getSoundSettings() {
    return { enabled: soundEnabled, volume: soundVolume, vibration: vibrationEnabled };
}

export function initSoundSettings() {
    if (typeof window !== "undefined") {
        const savedEnabled = localStorage.getItem("crm_sound_enabled");
        const savedVolume = localStorage.getItem("crm_sound_volume");
        const savedVibration = localStorage.getItem("crm_vibration_enabled");

        if (savedEnabled !== null) soundEnabled = savedEnabled === "true";
        if (savedVolume !== null) soundVolume = parseFloat(savedVolume);
        if (savedVibration !== null) vibrationEnabled = savedVibration === "true";
    }
}

// LEGACY: Обратная совместимость
export const playNotificationSound = (customUrl?: string) => {
    if (customUrl) {
        try {
            const audio = new Audio(customUrl);
            audio.volume = soundVolume;
            audio.play().catch(e => console.log("Audio play failed:", e));
        } catch (e) {
            console.error("Error playing sound:", e);
        }
    } else {
        playSound("notification");
    }
};

export const playActionSound = () => playSound("notification_success");

// React Hook
export function useSoundEffect() {
    return {
        play: playSound,
        vibrate,
        preload: preloadSounds,
        setEnabled: setSoundEnabled,
        setVolume: setSoundVolume,
        setVibration: setVibrationEnabled,
        getSettings: getSoundSettings,
        setConfig: setGlobalSoundConfig
    };
}
