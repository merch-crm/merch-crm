import { formatCurrency } from "@/lib/formatters";
import {
    type ApplicationType,
    APPLICATION_TYPE_LABELS,
    type CalculationResult,
    type CalculatorParams,
} from "../types";

/**
 * Форматирование числа с единицей измерения
 */
export function formatWithUnit(value: number, unit: string, decimals = 2): string {
    return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Форматирование процента
 */
export function formatPercent(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Получение названия типа печати
 */
export function getApplicationTypeLabel(type: ApplicationType): string {
    return APPLICATION_TYPE_LABELS[type] || type;
}

/**
 * Форматирование параметров для отчёта
 */
export function formatParamsForReport(
    params: CalculatorParams
): Array<{ label: string; value: string }> {
    return [
        { label: "Ширина рулона", value: `${params.rollWidthMm} мм` },
        { label: "Отступ от края", value: `${params.edgeMarginMm} мм` },
        { label: "Зазор между принтами", value: `${params.printGapMm} мм` },
        {
            label: "Рабочая ширина",
            value: `${params.rollWidthMm - params.edgeMarginMm * 2} мм`,
        },
    ];
}

/**
 * Форматирование итогов расчёта
 */
export function formatResultSummary(
    result: CalculationResult
): Array<{ label: string; value: string }> {
    return [
        { label: "Всего принтов", value: result.totalPrints.toString() },
        { label: "Общая длина", value: formatWithUnit(result.totalLengthM, "м") },
        { label: "Общая площадь", value: formatWithUnit(result.totalAreaM2, "м²") },
        { label: "Эффективность", value: formatPercent(result.efficiencyPercent) },
        { label: "Цена за метр", value: formatCurrency(result.pricePerMeter) },
    ];
}

/**
 * Форматирование разбивки стоимости
 */
export function formatCostBreakdown(
    result: CalculationResult
): Array<{ label: string; value: string; percent: string }> {
    const total = result.totalCost;

    const rows = [
        {
            label: "Печать (метраж)",
            value: formatCurrency(result.printCost),
            percent: total > 0 ? formatPercent((result.printCost / total) * 100) : "0%",
        },
        {
            label: "Нанесение",
            value: formatCurrency(result.placementCost),
            percent: total > 0 ? formatPercent((result.placementCost / total) * 100) : "0%",
        },
        {
            label: "Материалы",
            value: formatCurrency(result.materialsCost),
            percent: total > 0 ? formatPercent((result.materialsCost / total) * 100) : "0%",
        },
    ];

    if (result.blanksCost && result.blanksCost > 0) {
        rows.push({
            label: "Заготовки",
            value: formatCurrency(result.blanksCost),
            percent: total > 0 ? formatPercent((result.blanksCost / total) * 100) : "0%",
        });
    }

    rows.push({
        label: "Итого",
        value: formatCurrency(total),
        percent: "100%",
    });

    return rows;
}

/**
 * Форматирование данных секций для таблицы
 */
export function formatSectionsForTable(result: CalculationResult): Array<{
    name: string;
    size: string;
    quantity: number;
    rows: number;
    length: string;
    costPerPrint: string;
    totalCost: string;
}> {
    return result.sections.map((section) => ({
        name: section.name,
        size: `${section.widthMm}×${section.heightMm}`,
        quantity: section.quantity,
        rows: section.rowsCount,
        length: formatWithUnit(section.sectionLengthMm / 1000, "м"),
        costPerPrint: formatCurrency(section.costPerPrint),
        totalCost: formatCurrency(section.sectionCost),
    }));
}

/**
 * Форматирование расхода материалов
 */
export function formatConsumptionForTable(result: CalculationResult): Array<{
    material: string;
    amount: string;
    unit: string;
}> {
    return result.consumption.map((item) => ({
        material: item.name,
        amount: item.value.toFixed(2),
        unit: item.unit,
    }));
}
