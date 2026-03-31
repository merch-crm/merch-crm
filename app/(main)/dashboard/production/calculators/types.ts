// app/(main)/dashboard/production/calculators/types.ts

// ============================================================================
// APPLICATION TYPES - Типы нанесения
// ============================================================================

export type ApplicationType =
    | "dtf"
    | "sublimation"
    | "dtg"
    | "silkscreen"
    | "thermotransfer"
    | "embroidery"
    | "print-application";

export const APPLICATION_TYPES: ApplicationType[] = [
    "dtf",
    "sublimation",
    "dtg",
    "silkscreen",
    "thermotransfer",
    "embroidery",
    "print-application",
];

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
    dtf: "DTF-печать",
    sublimation: "Сублимация",
    dtg: "DTG-печать",
    silkscreen: "Шелкография",
    thermotransfer: "Термотрансфер",
    embroidery: "Вышивка",
    "print-application": "Нанесение принта",
};

export const APPLICATION_TYPE_DESCRIPTIONS: Record<ApplicationType, string> = {
  dtf: 'DTF-печать — прямая печать на плёнку с последующим термопереносом на ткань',
  sublimation: 'Сублимационная печать — перенос краски на полиэстер и керамику',
  dtg: 'DTG-печать — прямая цифровая печать на текстильные изделия',
  silkscreen: 'Трафаретная печать — классическая шелкография через сетчатые формы',
  embroidery: 'Машинная вышивка — нанесение дизайна нитками на ткань',
  thermotransfer: 'Термотрансферная печать — перенос изображения под воздействием температуры',
  'print-application': 'Нанесение принта — термотрансферы, нашивки, шевроны, наклейки',
};

export const APPLICATION_TYPE_PREFIXES: Record<ApplicationType, string> = {
    dtf: "DTF",
    sublimation: "SUBL",
    dtg: "DTG",
    silkscreen: "SILK",
    thermotransfer: "THERMO",
    embroidery: "EMB",
    "print-application": "PRNT",
};

// Какие типы поддерживают расчёт по метражу
export const METER_BASED_TYPES: ApplicationType[] = ["dtf", "sublimation", "dtg"];

// ============================================================================
// METER PRICE TIER - Уровень цены за метраж
// ============================================================================

export interface MeterPriceTierData {
    id: string;
    applicationType: ApplicationType;
    rollWidthMm: number;
    fromMeters: number;
    toMeters: number | null; // null = бесконечность
    pricePerMeter: number;
    sortOrder: number;
    isActive: boolean;
}

export interface MeterPriceTierInput {
    applicationType: ApplicationType;
    rollWidthMm: number;
    fromMeters: number;
    toMeters: number | null;
    pricePerMeter: number;
    sortOrder?: number;
    isActive?: boolean;
}

// ============================================================================
// PLACEMENT - Тип нанесения (место на изделии)
// ============================================================================

export interface PlacementData {
    id: string;
    applicationType: ApplicationType;
    name: string;
    slug: string;
    description: string | null;
    widthMm: number;
    heightMm: number;
    workPrice: number;
    isActive: boolean;
    sortOrder: number;
}

export interface PlacementInput {
    applicationType: ApplicationType;
    name: string;
    slug?: string;
    description?: string;
    widthMm: number;
    heightMm: number;
    workPrice: number;
    sortOrder?: number;
    isActive?: boolean;
}

// ============================================================================
// CONSUMABLES CONFIG - Настройки расхода материалов
// ============================================================================

export interface ConsumablesConfigData {
    applicationType: ApplicationType;
    inkWhitePerM2: number | null;
    inkCmykPerM2: number | null;
    powderPerM2: number | null;
    paperPerM2: number | null;
    fillPercent: number;
    wastePercent: number;
    config: Record<string, number> | null;
}

export interface ConsumablesConfigInput {
    inkWhitePerM2?: number | null;
    inkCmykPerM2?: number | null;
    powderPerM2?: number | null;
    paperPerM2?: number | null;
    fillPercent?: number;
    wastePercent?: number;
    config?: Record<string, number>;
}

// ============================================================================
// PRINT GROUP - Группа принтов (для ввода)
// ============================================================================

export interface PrintGroupInput {
    id: string;
    name: string;
    widthMm: number;
    heightMm: number;
    quantity: number;
    placementId: string | null;
    color: string;
    imagePreview?: string | null;
    
    // Для сублимации
    productId?: string;
    productPrice?: number;
}

export function createEmptyPrintGroup(color: string): PrintGroupInput {
    return {
        id: crypto.randomUUID(),
        name: "",
        widthMm: 0,
        heightMm: 0,
        quantity: 0,
        placementId: null,
        color,
        imagePreview: null,
    };
}

export function isPrintGroupFilled(group: PrintGroupInput): boolean {
    return group.widthMm > 0 && group.heightMm > 0 && group.quantity > 0;
}

// ============================================================================
// PRINT GROUP COLORS
// ============================================================================
export const PRINT_GROUP_COLORS: string[] = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1", "#14B8A6", "#A855F7",
];

export function getPrintGroupColor(index: number): string {
    return PRINT_GROUP_COLORS[index % PRINT_GROUP_COLORS.length];
}

// ============================================================================
// CALCULATED SECTION - Рассчитанная секция раскладки
// ============================================================================

export interface CalculatedSection {
    groupId: string;
    name: string;
    widthMm: number;
    heightMm: number;
    quantity: number;
    
    printsPerRow: number;
    rowsCount: number;
    sectionLengthMm: number;
    sectionAreaM2: number;
    
    placementId?: string | null;
    placementName?: string;
    placementCost: number;
    printCost: number;
    workCost: number;
    sectionCost: number;
    costPerPrint: number;
    
    color: string;
    sortOrder: number;
    
    blankCost?: number;
}

// ============================================================================
export interface ConsumptionItem {
    key: string;
    name: string;
    value: number;
    unit: string;
    inventoryItemId?: string;
    unitPrice?: number;
    totalPrice?: number;
    stockAvailable?: number;
    stockStatus?: "ok" | "low" | "none";
    color?: string;
}

export type ConsumptionKey =
    | "ink_white"
    | "ink_cmyk"
    | "powder"
    | "film"
    | "paper"
    | "primer"
    | "thread_top"
    | "thread_bottom"
    | "stabilizer";

export const CONSUMPTION_LABELS: Record<ConsumptionKey, string> = {
    ink_white: "Чернила White",
    ink_cmyk: "Чернила CMYK",
    powder: "Клей-порошок",
    film: "Плёнка DTF",
    paper: "Сублимационная бумага",
    primer: "Праймер",
    thread_top: "Нить верхняя",
    thread_bottom: "Нить нижняя",
    stabilizer: "Стабилизатор",
};

export const CONSUMPTION_UNITS: Record<ConsumptionKey, string> = {
    ink_white: "мл",
    ink_cmyk: "мл",
    powder: "г",
    film: "м²",
    paper: "м²",
    primer: "мл",
    thread_top: "м",
    thread_bottom: "м",
    stabilizer: "м²",
};

// ============================================================================
// CALCULATION RESULT - Результат расчёта
// ============================================================================

export interface CalculationResult {
    sections: CalculatedSection[];
    totalPrints: number;
    totalLengthM: number;
    totalAreaM2: number;
    printsAreaM2: number;
    efficiencyPercent: number;
    pricePerMeter: number;
    printCost: number;
    placementCost: number;
    materialsCost: number;
    totalCost: number;
    avgCostPerPrint: number;
    minCostPerPrint: number;
    maxCostPerPrint: number;
    blanksCost?: number;
    consumption: ConsumptionItem[];
}

// ============================================================================
// CALCULATOR PARAMS - Параметры калькулятора
// ============================================================================

export interface CalculatorParams {
    applicationType: ApplicationType;
    rollWidthMm: number;
    edgeMarginMm: number;
    printGapMm: number;
}

// ============================================================================
// ROLL WIDTH OPTIONS
// ============================================================================
export interface RollWidthOption {
    value: number;
    label: string;
    description?: string;
}

export const ROLL_WIDTH_OPTIONS: Record<ApplicationType, RollWidthOption[]> = {
    dtf: [
        { value: 300, label: "300 мм", description: "Стандартный" },
        { value: 600, label: "600 мм", description: "Широкий" },
    ],
    sublimation: [
        { value: 610, label: "610 мм (A1)" },
        { value: 914, label: "914 мм (A0)" },
        { value: 1118, label: "1118 мм" },
        { value: 1600, label: "1600 мм" },
    ],
    dtg: [{ value: 400, label: "400 мм", description: "Стандартный" }],
    silkscreen: [],
    thermotransfer: [
        { value: 500, label: "500 мм" },
        { value: 610, label: "610 мм" },
        { value: 1000, label: "1000 мм" },
    ],
    embroidery: [],
    "print-application": [],
};

// ============================================================================
// DPI OPTIONS
// ============================================================================
export interface DpiOption {
    value: number;
    label: string;
    description: string;
}

export const DPI_OPTIONS: DpiOption[] = [
    { value: 72, label: "72 DPI", description: "Веб (крупный принт)" },
    { value: 150, label: "150 DPI", description: "Стандарт" },
    { value: 300, label: "300 DPI", description: "Высокое качество" },
];

export const DEFAULT_DPI = 150;

export function pixelsToMm(pixels: number, dpi: number = DEFAULT_DPI): number {
    return Math.round((pixels / dpi) * 25.4);
}

export function mmToPixels(mm: number, dpi: number = DEFAULT_DPI): number {
    return Math.round((mm / 25.4) * dpi);
}

// ============================================================================
// EXPORT SPECIFIC TYPES
// ============================================================================
export * from "./silkscreen-types";
export * from "./dtg-types";
export * from "./embroidery-types";
export * from "./sublimation-types";
export * from "./print-application-types";

// ============================================================================
// QUICK SIZES - Быстрый выбор размеров
// ============================================================================

export interface QuickSize {
    label: string;
    widthMm: number;
    heightMm: number;
}

export const QUICK_SIZES: QuickSize[] = [
    { label: "5×5", widthMm: 50, heightMm: 50 },
    { label: "10×10", widthMm: 100, heightMm: 100 },
    { label: "15×15", widthMm: 150, heightMm: 150 },
    { label: "20×20", widthMm: 200, heightMm: 200 },
    { label: "A6", widthMm: 105, heightMm: 148 },
    { label: "A5", widthMm: 148, heightMm: 210 },
    { label: "A4", widthMm: 210, heightMm: 297 },
    { label: "A3", widthMm: 297, heightMm: 420 },
    { label: "30×30", widthMm: 300, heightMm: 300 },
    { label: "30×40", widthMm: 300, heightMm: 400 },
];
