import { db } from "@/lib/db";
import {
    meterPriceTiers,
    printPlacements,
    calculatorConsumablesSettings,
} from "@/lib/schema/calculators";

export async function seedCalculatorsData() {
    console.log("🌱 Seeding calculators data...");

    // ========================================================================
    // ЦЕНЫ ЗА МЕТРАЖ
    // ========================================================================

    // DTF 300mm - прогрессивная шкала
    const dtf300Prices = [
        { fromMeters: "0.01", toMeters: "5", pricePerMeter: "1500", sortOrder: 1 },
        { fromMeters: "5", toMeters: "20", pricePerMeter: "1200", sortOrder: 2 },
        { fromMeters: "20", toMeters: "50", pricePerMeter: "1000", sortOrder: 3 },
        { fromMeters: "50", toMeters: "100", pricePerMeter: "850", sortOrder: 4 },
        { fromMeters: "100", toMeters: null, pricePerMeter: "700", sortOrder: 5 },
    ];

    // DTF 600mm - прогрессивная шкала
    const dtf600Prices = [
        { fromMeters: "0.01", toMeters: "5", pricePerMeter: "2800", sortOrder: 1 },
        { fromMeters: "5", toMeters: "20", pricePerMeter: "2400", sortOrder: 2 },
        { fromMeters: "20", toMeters: "50", pricePerMeter: "2000", sortOrder: 3 },
        { fromMeters: "50", toMeters: null, pricePerMeter: "1700", sortOrder: 4 },
    ];

    // Сублимация 610mm
    const sublimation610Prices = [
        { fromMeters: "0.01", toMeters: "10", pricePerMeter: "1200", sortOrder: 1 },
        { fromMeters: "10", toMeters: "30", pricePerMeter: "1000", sortOrder: 2 },
        { fromMeters: "30", toMeters: null, pricePerMeter: "800", sortOrder: 3 },
    ];

    // Сублимация 1118mm
    const sublimation1118Prices = [
        { fromMeters: "0.01", toMeters: "10", pricePerMeter: "2200", sortOrder: 1 },
        { fromMeters: "10", toMeters: "30", pricePerMeter: "1800", sortOrder: 2 },
        { fromMeters: "30", toMeters: null, pricePerMeter: "1500", sortOrder: 3 },
    ];

    // DTG 400mm
    const dtg400Prices = [
        { fromMeters: "0.01", toMeters: "5", pricePerMeter: "3500", sortOrder: 1 },
        { fromMeters: "5", toMeters: "15", pricePerMeter: "3000", sortOrder: 2 },
        { fromMeters: "15", toMeters: null, pricePerMeter: "2500", sortOrder: 3 },
    ];

    // Вставляем цены
    await db.insert(meterPriceTiers).values([
        ...dtf300Prices.map(p => ({ ...p, applicationType: "dtf", rollWidthMm: 300 })),
        ...dtf600Prices.map(p => ({ ...p, applicationType: "dtf", rollWidthMm: 600 })),
        ...sublimation610Prices.map(p => ({ ...p, applicationType: "sublimation", rollWidthMm: 610 })),
        ...sublimation1118Prices.map(p => ({ ...p, applicationType: "sublimation", rollWidthMm: 1118 })),
        ...dtg400Prices.map(p => ({ ...p, applicationType: "dtg", rollWidthMm: 400 })),
    ]).onConflictDoNothing();

    console.log("  ✓ Meter price tiers seeded");

    // ========================================================================
    // ТИПЫ НАНЕСЕНИЙ
    // ========================================================================

    const dtfPlacements = [
        { name: "Без нанесения", slug: "none", widthMm: 0, heightMm: 0, workPrice: "0", sortOrder: 0 },
        { name: "Футболка перед", slug: "tshirt-front", widthMm: 290, heightMm: 400, workPrice: "50", sortOrder: 1 },
        { name: "Футболка спина", slug: "tshirt-back", widthMm: 290, heightMm: 400, workPrice: "50", sortOrder: 2 },
        { name: "Футболка карман", slug: "tshirt-pocket", widthMm: 80, heightMm: 80, workPrice: "40", sortOrder: 3 },
        { name: "Худи перед", slug: "hoodie-front", widthMm: 290, heightMm: 400, workPrice: "60", sortOrder: 4 },
        { name: "Худи спина", slug: "hoodie-back", widthMm: 290, heightMm: 400, workPrice: "60", sortOrder: 5 },
        { name: "Худи капюшон", slug: "hoodie-hood", widthMm: 150, heightMm: 100, workPrice: "70", sortOrder: 6 },
        { name: "Свитшот перед", slug: "sweatshirt-front", widthMm: 290, heightMm: 400, workPrice: "55", sortOrder: 7 },
        { name: "Свитшот спина", slug: "sweatshirt-back", widthMm: 290, heightMm: 400, workPrice: "55", sortOrder: 8 },
        { name: "Рукав левый", slug: "sleeve-left", widthMm: 100, heightMm: 150, workPrice: "70", sortOrder: 9 },
        { name: "Рукав правый", slug: "sleeve-right", widthMm: 100, heightMm: 150, workPrice: "70", sortOrder: 10 },
        { name: "Кепка перед", slug: "cap-front", widthMm: 100, heightMm: 60, workPrice: "80", sortOrder: 11 },
        { name: "Кепка бок", slug: "cap-side", widthMm: 60, heightMm: 40, workPrice: "80", sortOrder: 12 },
        { name: "Шоппер", slug: "shopper", widthMm: 280, heightMm: 350, workPrice: "60", sortOrder: 13 },
        { name: "Рюкзак", slug: "backpack", widthMm: 200, heightMm: 250, workPrice: "70", sortOrder: 14 },
        { name: "Бирка/лейбл", slug: "label", widthMm: 50, heightMm: 30, workPrice: "100", sortOrder: 15 },
        { name: "Носок", slug: "sock", widthMm: 80, heightMm: 100, workPrice: "90", sortOrder: 16 },
    ];

    const sublimationPlacements = [
        { name: "Без нанесения", slug: "none", widthMm: 0, heightMm: 0, workPrice: "0", sortOrder: 0 },
        { name: "Футболка полная", slug: "tshirt-full", widthMm: 380, heightMm: 600, workPrice: "100", sortOrder: 1 },
        { name: "Кружка 11oz", slug: "mug-11oz", widthMm: 200, heightMm: 90, workPrice: "50", sortOrder: 2 },
        { name: "Кружка магическая", slug: "mug-magic", widthMm: 200, heightMm: 90, workPrice: "70", sortOrder: 3 },
        { name: "Чехол телефона", slug: "phone-case", widthMm: 80, heightMm: 150, workPrice: "40", sortOrder: 4 },
        { name: "Коврик для мыши", slug: "mousepad", widthMm: 240, heightMm: 200, workPrice: "60", sortOrder: 5 },
        { name: "Пазл A4", slug: "puzzle-a4", widthMm: 210, heightMm: 297, workPrice: "80", sortOrder: 6 },
        { name: "Подушка 40×40", slug: "pillow-40", widthMm: 400, heightMm: 400, workPrice: "90", sortOrder: 7 },
    ];

    // Вставляем нанесения
    await db.insert(printPlacements).values([
        ...dtfPlacements.map(p => ({ ...p, applicationType: "dtf" })),
        ...sublimationPlacements.map(p => ({ ...p, applicationType: "sublimation" })),
        ...dtfPlacements.slice(0, 12).map(p => ({ ...p, applicationType: "dtg", slug: `dtg-${p.slug}` })),
    ]).onConflictDoNothing();

    console.log("  ✓ Print placements seeded");

    // ========================================================================
    // НАСТРОЙКИ РАСХОДНИКОВ
    // ========================================================================

    await db.insert(calculatorConsumablesSettings).values([
        {
            applicationType: "dtf",
            inkWhitePerM2: "10",      // 10 мл/м²
            inkCmykPerM2: "4",        // 4 мл/м²
            powderPerM2: "34",        // 34 г/м²
            fillPercent: 80,
            wastePercent: 10,
        },
        {
            applicationType: "sublimation",
            inkCmykPerM2: "4",        // 4 мл/м²
            paperPerM2: "1",          // 1 м² бумаги на 1 м² печати
            fillPercent: 70,
            wastePercent: 8,
        },
        {
            applicationType: "dtg",
            inkWhitePerM2: "12",      // 12 мл/м²
            inkCmykPerM2: "5",        // 5 мл/м²
            fillPercent: 80,
            wastePercent: 5,
            config: {
                primerPerItem: 15,    // 15 мл праймера на изделие
            },
        },
    ]).onConflictDoNothing();

    console.log("  ✓ Consumables settings seeded");

    console.log("✅ Calculators data seeded successfully!");
}

// Функция для очистки данных (для разработки)
export async function clearCalculatorsData() {
    console.log("🗑️ Clearing calculators data...");
    
    await db.delete(meterPriceTiers);
    await db.delete(printPlacements);
    await db.delete(calculatorConsumablesSettings);
    
    console.log("✅ Calculators data cleared!");
}
