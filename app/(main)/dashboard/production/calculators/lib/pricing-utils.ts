import type { MeterPriceTierData, PlacementData, CalculatedSection } from "../types";

/**
 * Находит цену за метр по прогрессивной шкале
 */
export function getPricePerMeter(
    tiers: MeterPriceTierData[],
    rollWidthMm: number,
    totalLengthM: number
): number {
    // Фильтруем тиры по ширине рулона
    const applicableTiers = tiers
        .filter((t) => t.rollWidthMm === rollWidthMm && t.isActive)
        .sort((a, b) => a.fromMeters - b.fromMeters);

    if (applicableTiers.length === 0) {
        // Дефолтные цены если нет настроек
        if (rollWidthMm <= 300) return 1500; // DTF 300
        if (rollWidthMm <= 610) return 1200; // Subli A1 / DTF 600
        if (rollWidthMm <= 914) return 2000; // Subli A0
        if (rollWidthMm <= 1118) return 2500; // Subli Wide
        return 3000;
    }

    // Ищем подходящий тир
    for (const tier of applicableTiers) {
        const from = tier.fromMeters;
        const to = tier.toMeters;

        if (totalLengthM >= from && (to === null || totalLengthM <= to)) {
            return tier.pricePerMeter;
        }
    }

    // Если не нашли — берём последний (для больших объёмов)
    return applicableTiers[applicableTiers.length - 1].pricePerMeter;
}

/**
 * Рассчитывает стоимость печати
 */
export function calculatePrintCost(totalLengthM: number, pricePerMeter: number): number {
    return totalLengthM * pricePerMeter;
}

/**
 * Находит цену нанесения по ID
 */
export function getPlacementPrice(
    placements: PlacementData[],
    placementId: string | null
): number {
    if (!placementId) return 0;
    const placement = placements.find((p) => p.id === placementId);
    return placement?.workPrice || 0;
}

/**
 * Рассчитывает стоимость нанесения для секции
 */
export function calculatePlacementCost(
    placements: PlacementData[],
    placementId: string | null,
    quantity: number
): number {
    const pricePerUnit = getPlacementPrice(placements, placementId);
    return pricePerUnit * quantity;
}

/**
 * Рассчитывает общую стоимость нанесений
 */
export function calculateTotalPlacementCost(
    sections: Array<{ placementId: string | null; quantity: number }>,
    placements: PlacementData[]
): number {
    return sections.reduce((sum, section) => {
        return sum + calculatePlacementCost(placements, section.placementId, section.quantity);
    }, 0);
}

/**
 * Рассчитывает стоимость секции (печать + нанесение)
 */
export function calculateSectionCost(
    sectionLengthMm: number,
    rollWidthMm: number,
    pricePerMeter: number,
    placementCost: number
): number {
    const sectionLengthM = sectionLengthMm / 1000;
    const printCost = sectionLengthM * pricePerMeter;
    return printCost + placementCost;
}

/**
 * Рассчитывает стоимость за принт
 */
export function calculateCostPerPrint(sectionCost: number, quantity: number): number {
    if (quantity <= 0) return 0;
    return sectionCost / quantity;
}

/**
 * Находит мин/макс/среднюю стоимость за принт
 */
export function calculateCostStats(sections: CalculatedSection[]): {
    avgCostPerPrint: number;
    minCostPerPrint: number;
    maxCostPerPrint: number;
} {
    if (sections.length === 0) {
        return { avgCostPerPrint: 0, minCostPerPrint: 0, maxCostPerPrint: 0 };
    }

    const costs = sections.map((s) => s.costPerPrint);
    const totalCost = sections.reduce((sum, s) => sum + s.sectionCost, 0);
    const totalQuantity = sections.reduce((sum, s) => sum + s.quantity, 0);

    return {
        avgCostPerPrint: totalQuantity > 0 ? totalCost / totalQuantity : 0,
        minCostPerPrint: Math.min(...costs),
        maxCostPerPrint: Math.max(...costs),
    };
}
