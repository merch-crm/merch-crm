import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { registerCyrillicFont } from "./pdf-fonts";
import {
    renderHeader,
    renderParamsSection,
    renderTotalCostSection,
    renderSectionsTable,
    renderCostBreakdown,
    renderConsumptionTable,
    renderCanvasImage,
    renderNotes,
    renderFooter,
} from "./pdf-sections";
import { getApplicationTypeLabel } from "./pdf-formatters";
import type { ApplicationType, CalculatorParams, CalculationResult } from "../types";
import type { PdfReportData, PdfGenerationOptions } from "./pdf-types";

/**
 * Основная функция генерации PDF отчета
 */
export async function generateCalculationPdf(opts: {
    calculationNumber?: string;
    createdAt: Date;
    applicationType: ApplicationType;
    params: CalculatorParams;
    result: CalculationResult;
    canvasDataUrl?: string;
    notes?: string;
    companyName?: string;
    options?: PdfGenerationOptions;
}): Promise<Blob> {
    const {
        calculationNumber,
        createdAt,
        applicationType,
        params,
        result,
        canvasDataUrl,
        notes,
        companyName,
        options,
    } = opts;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
    });

    await registerCyrillicFont(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin + 5;

    yPos = renderHeader(doc, {
        calculationNumber,
        createdAt,
        applicationType,
        companyName: companyName || options?.companyName,
        margin,
        pageWidth,
        yPos,
    });

    yPos = renderParamsSection(doc, {
        params,
        margin,
        contentWidth,
        yPos,
    });

    yPos = renderTotalCostSection(doc, {
        result,
        margin,
        contentWidth,
        yPos,
    });

    yPos = renderSectionsTable(doc, autoTable, {
        result,
        margin,
        yPos,
    });

    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
    }

    yPos = renderCostBreakdown(doc, {
        result,
        margin,
        contentWidth,
        yPos,
    });

    yPos = renderConsumptionTable(doc, autoTable, {
        result,
        margin,
        yPos,
    });

    const finalCanvasUrl = canvasDataUrl || options?.canvasDataUrl;
    if (finalCanvasUrl) {
        if (yPos > pageHeight - 70) {
            doc.addPage();
            yPos = margin;
        }
        yPos = renderCanvasImage(doc, {
            canvasDataUrl: finalCanvasUrl,
            margin,
            contentWidth,
            yPos,
        });
    }

    const finalNotes = notes || options?.notes;
    if (finalNotes) {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
        }
        yPos = renderNotes(doc, {
            notes: finalNotes,
            margin,
            contentWidth,
            yPos,
        });
    }

    renderFooter(doc, {
        pageWidth,
        pageHeight,
        margin,
    });

    return doc.output("blob");
}

/**
 * Прокси-функция для обратной совместимости (устранение ошибки TS2305)
 */
export async function generatePdfReport(data: PdfReportData): Promise<Blob> {
    return generateCalculationPdf({
        calculationNumber: data.calculationNumber,
        createdAt: data.createdAt,
        applicationType: data.applicationType,
        params: data.params,
        result: data.result,
        canvasDataUrl: data.options?.canvasDataUrl,
        notes: data.options?.notes,
        companyName: data.options?.companyName,
        options: data.options,
    });
}

/**
 * Генерация имени файла
 */
export function generatePdfFileName(
    applicationType: string,
    calculationNumber?: string
): string {
    const date = new Date().toISOString().split("T")[0];
    const typeLabel = getApplicationTypeLabel(applicationType as ApplicationType)
        .toLowerCase()
        .replace(/\s+/g, "-");

    if (calculationNumber) {
        return `raschet-${calculationNumber}.pdf`;
    }

    return `raschet-${typeLabel}-${date}.pdf`;
}
