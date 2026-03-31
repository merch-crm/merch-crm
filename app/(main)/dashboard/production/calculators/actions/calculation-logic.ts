import {
    type ApplicationType,
    type CalculationResult,
    type CalculatedSection,
    type ConsumptionItem,
    type PrintGroupInput,
    type MeterPriceTierData,
    type ConsumablesConfigData,
    type PlacementData,
} from "../types";

/**
 * Чистая логика расчета расклайки и себестоимости.
 * Не содержит побочных эффектов (БД, сессии и т.д.).
 */
export function performCalculation(opts: {
    applicationType: ApplicationType;
    rollWidthMm: number;
    edgeMarginMm: number;
    printGapMm: number;
    groups: PrintGroupInput[];
    pricing: MeterPriceTierData[];
    consumables: ConsumablesConfigData;
    placements: PlacementData[];
}): CalculationResult {
    const {
        applicationType,
        rollWidthMm,
        edgeMarginMm,
        printGapMm,
        groups,
        pricing,
        consumables,
        placements,
    } = opts;

    // Рабочая ширина
    const workingWidth = rollWidthMm - 2 * edgeMarginMm;

    // Фильтруем и сортируем группы по площади (большие сначала)
    const filledGroups = groups
        .filter((g) => g.widthMm > 0 && g.heightMm > 0 && g.quantity > 0)
        .sort((a, b) => b.widthMm * b.heightMm - a.widthMm * a.heightMm);

    // Расчёт секций
    const sections: CalculatedSection[] = [];
    let totalLengthMm = 0;
    let totalPrintsArea = 0;

    filledGroups.forEach((group, index) => {
        // Сколько принтов в ряд
        let printsPerRow = Math.floor((workingWidth + printGapMm) / (group.widthMm + printGapMm));
        if (printsPerRow < 1) printsPerRow = 1;

        // Сколько рядов
        const rowsCount = Math.ceil(group.quantity / printsPerRow);

        // Длина секции
        const sectionLengthMm = rowsCount * (group.heightMm + printGapMm);
        totalLengthMm += sectionLengthMm;

        // Площадь принтов в секции (м²)
        const sectionAreaM2 = (group.widthMm * group.heightMm * group.quantity) / 1_000_000;
        totalPrintsArea += sectionAreaM2;

        // Стоимость нанесения
        let placementCost = 0;
        if (group.placementId) {
            const placement = placements.find((p) => p.id === group.placementId);
            if (placement) {
                placementCost = placement.workPrice * group.quantity;
            }
        }

        sections.push({
            groupId: group.id,
            name: group.name || `Принт ${group.widthMm}×${group.heightMm}`,
            widthMm: group.widthMm,
            heightMm: group.heightMm,
            quantity: group.quantity,
            printsPerRow,
            rowsCount,
            sectionLengthMm,
            sectionAreaM2,
            placementId: group.placementId || null,
            placementCost,
            printCost: 0, 
            workCost: placementCost,
            sectionCost: 0,
            costPerPrint: 0,
            color: group.color,
            sortOrder: index,
        });
    });

    // Общая длина и площадь плёнки
    const totalLengthM = totalLengthMm / 1000;
    const totalAreaM2 = (totalLengthMm * rollWidthMm) / 1_000_000;

    // КПД
    const efficiencyPercent = totalAreaM2 > 0 ? (totalPrintsArea / totalAreaM2) * 100 : 0;

    // Цена за метр
    let pricePerMeter = 1500;
    for (const tier of pricing) {
        if (totalLengthM >= tier.fromMeters && (tier.toMeters === null || totalLengthM <= tier.toMeters)) {
            pricePerMeter = tier.pricePerMeter;
            break;
        }
    }

    const printCost = totalLengthM * pricePerMeter;
    const placementCost = sections.reduce((sum, s) => sum + s.placementCost, 0);

    // Расчёт расхода материалов
    const fillMultiplier = consumables.fillPercent / 100;
    const consumption: ConsumptionItem[] = [];

    if (consumables.inkWhitePerM2) {
        consumption.push({
            key: "ink_white",
            name: "Чернила White",
            value: totalPrintsArea * consumables.inkWhitePerM2 * fillMultiplier,
            unit: "мл",
        });
    }

    if (consumables.inkCmykPerM2) {
        consumption.push({
            key: "ink_cmyk",
            name: "Чернила CMYK",
            value: totalPrintsArea * consumables.inkCmykPerM2 * fillMultiplier,
            unit: "мл",
        });
    }

    if (consumables.powderPerM2) {
        consumption.push({
            key: "powder",
            name: "Клей-порошок",
            value: totalPrintsArea * consumables.powderPerM2,
            unit: "г",
        });
    }

    if (consumables.paperPerM2) {
        consumption.push({
            key: "paper",
            name: "Сублимационная бумага",
            value: totalAreaM2 * consumables.paperPerM2,
            unit: "м²",
        });
    }

    consumption.push({
        key: "film",
        name: applicationType === "sublimation" ? "Бумага" : "Плёнка",
        value: totalAreaM2,
        unit: "м²",
    });

    const totalCost = printCost + placementCost;
    const totalPrints = sections.reduce((sum, s) => sum + s.quantity, 0);

    sections.forEach((section) => {
        const sectionLengthM = section.sectionLengthMm / 1000;
        const sectionPrintCost = sectionLengthM * pricePerMeter;
        section.printCost = sectionPrintCost;
        section.workCost = section.placementCost;
        section.sectionCost = sectionPrintCost + section.placementCost;
        section.costPerPrint = section.sectionCost / section.quantity;
    });

    const costs = sections.map((s) => s.costPerPrint);
    const avgCostPerPrint = totalPrints > 0 ? totalCost / totalPrints : 0;
    const minCostPerPrint = costs.length > 0 ? Math.min(...costs) : 0;
    const maxCostPerPrint = costs.length > 0 ? Math.max(...costs) : 0;

    return {
        sections,
        totalPrints,
        totalLengthM,
        totalAreaM2,
        printsAreaM2: totalPrintsArea,
        efficiencyPercent,
        pricePerMeter,
        printCost,
        placementCost,
        materialsCost: 0,
        totalCost,
        avgCostPerPrint,
        minCostPerPrint,
        maxCostPerPrint,
        consumption,
    };
}
