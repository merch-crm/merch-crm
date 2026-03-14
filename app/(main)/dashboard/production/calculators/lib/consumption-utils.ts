import type {
    ConsumablesConfigData,
    ConsumptionItem,
    ApplicationType,
} from "../types";

/**
 * Дефолтные настройки расходников
 */
const DEFAULT_CONSUMABLES: Record<ApplicationType, Partial<ConsumablesConfigData>> = {
    dtf: {
        inkWhitePerM2: 10,
        inkCmykPerM2: 4,
        powderPerM2: 34,
        fillPercent: 80,
        wastePercent: 10,
    },
    sublimation: {
        inkCmykPerM2: 4,
        paperPerM2: 1,
        fillPercent: 100,
        wastePercent: 10,
    },
    dtg: {
        inkWhitePerM2: 15,
        inkCmykPerM2: 5,
        fillPercent: 80,
        wastePercent: 10,
        config: {
            primerPerItem: 10
        }
    },
    silkscreen: {
        inkCmykPerM2: 0,
        fillPercent: 0,
        wastePercent: 0,
    },
    thermotransfer: {
        inkCmykPerM2: 0,
        fillPercent: 0,
        wastePercent: 0,
    },
    embroidery: {
        inkCmykPerM2: 0,
        fillPercent: 0,
        wastePercent: 0,
    },
    "print-application": {
        inkCmykPerM2: 0,
        fillPercent: 0,
        wastePercent: 0
    }
};

/**
 * Получает конфиг расходников с дефолтами
 */
export function getConsumablesWithDefaults(
    config: ConsumablesConfigData | null,
    applicationType: ApplicationType
): ConsumablesConfigData {
    const defaults = DEFAULT_CONSUMABLES[applicationType];

    if (!config) {
        return {
            applicationType,
            inkWhitePerM2: defaults.inkWhitePerM2 ?? null,
            inkCmykPerM2: defaults.inkCmykPerM2 ?? null,
            powderPerM2: defaults.powderPerM2 ?? null,
            paperPerM2: defaults.paperPerM2 ?? null,
            fillPercent: defaults.fillPercent ?? 80,
            wastePercent: defaults.wastePercent ?? 10,
            config: null,
        };
    }

    return config;
}

/**
 * Рассчитывает расход материалов
 */
export function calculateConsumption(
    printsAreaM2: number,
    totalAreaM2: number,
    config: ConsumablesConfigData,
    applicationType: ApplicationType
): ConsumptionItem[] {
    const items: ConsumptionItem[] = [];
    const fillMultiplier = config.fillPercent / 100;

    // Чернила White (для DTF, DTG)
    if (config.inkWhitePerM2 && config.inkWhitePerM2 > 0) {
        items.push({
            key: "ink_white",
            name: "Чернила White",
            value: printsAreaM2 * config.inkWhitePerM2 * fillMultiplier,
            unit: "мл",
        });
    }

    // Чернила CMYK
    if (config.inkCmykPerM2 && config.inkCmykPerM2 > 0) {
        items.push({
            key: "ink_cmyk",
            name: "Чернила CMYK",
            value: printsAreaM2 * config.inkCmykPerM2 * fillMultiplier,
            unit: "мл",
        });
    }

    // Клей-порошок (DTF)
    if (config.powderPerM2 && config.powderPerM2 > 0) {
        items.push({
            key: "powder",
            name: "Клей-порошок",
            value: printsAreaM2 * config.powderPerM2,
            unit: "г",
        });
    }

    // Сублимационная бумага (как отдельный расходник в настройках)
    if (config.paperPerM2 && config.paperPerM2 > 0 && applicationType === "sublimation") {
        items.push({
            key: "paper",
            name: "Сублимационная бумага",
            value: totalAreaM2 * config.paperPerM2,
            unit: "м²",
        });
    }

    // Плёнка/Бумага (основной носитель)
    if (applicationType !== "sublimation" || !config.paperPerM2) {
        items.push({
            key: "film",
            name: applicationType === "sublimation" ? "Бумага" : "Плёнка DTF",
            value: totalAreaM2,
            unit: "м²",
        });
    }

    return items;
}

/**
 * Добавляет информацию о наличии на складе на основе данных из inventory_items
 */
export function enrichConsumptionWithStock(
    consumption: ConsumptionItem[],
    inventoryData?: Array<{ sku: string; quantity: number; lowStockThreshold: number }>
): ConsumptionItem[] {
    if (!inventoryData) return consumption;

    return consumption.map((item) => {
        const stockItem = inventoryData.find((inv) => inv.sku === item.key);
        if (!stockItem) return item;

        let status: "ok" | "low" | "none" = "ok";
        if (stockItem.quantity <= 0) {
            status = "none";
        } else if (stockItem.quantity <= stockItem.lowStockThreshold) {
            status = "low";
        }

        return {
            ...item,
            stockStatus: status,
            stockAvailable: stockItem.quantity,
        };
    });
}

/**
 * Рассчитывает стоимость материалов на основе актуальных цен со склада
 */
export function calculateMaterialsCost(
    consumption: ConsumptionItem[],
    inventoryPrices?: Record<string, number>
): number {
    // Дефолтные цены (₽ за ед. измерения), если нет цен со склада
    // В реальной системе эти SKU должны совпадать с ключами в consumption
    const DEFAULT_PRICES: Record<string, number> = {
        ink_white: 3.5, // ₽/мл
        ink_cmyk: 2.8, // ₽/мл
        powder: 0.6, // ₽/г
        film: 120, // ₽/м²
        paper: 60, // ₽/м²
    };

    return consumption.reduce((total, item) => {
        const price = inventoryPrices?.[item.key] || DEFAULT_PRICES[item.key] || 0;
        return total + item.value * price;
    }, 0);
}
