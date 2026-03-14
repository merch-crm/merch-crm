import { type CalculationResult, type CalculatorParams, type ApplicationType } from "../types";

export interface PdfReportData {
    // Мета-информация
    calculationNumber?: string;
    createdAt: Date;
    applicationType: ApplicationType;

    // Параметры расчёта
    params: CalculatorParams;

    // Результаты
    result: CalculationResult;

    // Опции генерации
    options?: PdfGenerationOptions;
}

export interface PdfGenerationOptions {
    includeCanvas?: boolean;
    canvasDataUrl?: string;
    includeConsumption?: boolean;
    includeCostBreakdown?: boolean;
    companyName?: string;
    companyLogo?: string;
    notes?: string;
}

export interface PdfTableColumn {
    header: string;
    dataKey: string;
    width?: number;
    align?: "left" | "center" | "right";
}

export interface PdfSection {
    title: string;
    type: "table" | "text" | "image" | "keyValue";
    data: unknown;
    options?: Record<string, unknown>;
}
