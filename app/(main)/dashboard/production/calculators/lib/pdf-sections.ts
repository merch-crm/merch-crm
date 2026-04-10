import { type jsPDF } from "jspdf";
import { type UserOptions } from "jspdf-autotable";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import {
  getApplicationTypeLabel,
  formatParamsForReport,
  formatCostBreakdown,
  formatSectionsForTable,
  formatConsumptionForTable,
  formatWithUnit,
  formatPercent,
} from "./pdf-formatters";
import type { ApplicationType, CalculatorParams, CalculationResult } from "../types";
import { COLORS, FONTS, FONT_NAME } from "./pdf-fonts"; // Now exporting from fonts or separate constants

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export type AutoTable = (doc: jsPDF, options: UserOptions) => void;

/**
 * Рендер заголовка
 */
export function renderHeader(
  doc: jsPDF,
  opts: {
    calculationNumber?: string;
    createdAt: Date;
    applicationType: ApplicationType;
    companyName?: string;
    margin: number;
    pageWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { margin, pageWidth, calculationNumber, createdAt, applicationType, companyName } = opts;

  if (companyName) {
    doc.setFontSize(FONTS.smallSize);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(companyName, margin, yPos);
    yPos += 6;
  }

  doc.setFontSize(FONTS.titleSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Расчёт себестоимости печати", margin, yPos);
  yPos += 8;

  doc.setFontSize(FONTS.subtitleSize);
  doc.setTextColor(...COLORS.primary);
  doc.text(getApplicationTypeLabel(applicationType), margin, yPos);
  yPos += 10;

  doc.setFontSize(FONTS.bodySize);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont(FONT_NAME, "normal");

  const dateStr = formatDateTime(createdAt);
  const infoLine = calculationNumber
    ? `№ ${calculationNumber} от ${dateStr}`
    : `Дата: ${dateStr}`;

  doc.text(infoLine, margin, yPos);
  yPos += 4;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  return yPos;
}

/**
 * Рендер параметров расчёта
 */
export function renderParamsSection(
  doc: jsPDF,
  opts: {
    params: CalculatorParams;
    margin: number;
    contentWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { params, margin, contentWidth } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Параметры расчёта", margin, yPos);
  yPos += 6;

  const paramsData = formatParamsForReport(params);
  const colWidth = contentWidth / 2;

  doc.setFontSize(FONTS.bodySize);
  doc.setFont(FONT_NAME, "normal");

  paramsData.forEach((param, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * colWidth;
    const y = yPos + row * 5;

    doc.setTextColor(...COLORS.textSecondary);
    doc.text(param.label + ":", x, y);

    doc.setTextColor(...COLORS.textPrimary);
    doc.text(param.value, x + 35, y);
  });

  yPos += Math.ceil(paramsData.length / 2) * 5 + 6;

  return yPos;
}

/**
 * Рендер блока итоговой стоимости
 */
export function renderTotalCostSection(
  doc: jsPDF,
  opts: {
    result: CalculationResult;
    margin: number;
    contentWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { result, margin, contentWidth } = opts;

  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F");

  yPos += 8;

  doc.setFontSize(FONTS.smallSize);
  doc.setTextColor(...COLORS.textSecondary);
  doc.text("Итоговая себестоимость", margin + 6, yPos);
  yPos += 8;

  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primary);
  doc.setFont(FONT_NAME, "bold");
  doc.text(formatCurrency(result.totalCost), margin + 6, yPos);

  const kpiX = margin + contentWidth - 60;
  let kpiY = yPos - 8;

  doc.setFontSize(FONTS.smallSize);
  doc.setFont(FONT_NAME, "normal");

  const kpis = [
    { label: "Принтов", value: result.totalPrints.toString() },
    { label: "Длина", value: formatWithUnit(result.totalLengthM, "м") },
    { label: "КПД", value: formatPercent(result.efficiencyPercent) },
  ];

  kpis.forEach((kpi) => {
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(kpi.label + ":", kpiX, kpiY);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(kpi.value, kpiX + 20, kpiY);
    kpiY += 5;
  });

  yPos += 22;

  doc.setFontSize(FONTS.bodySize);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont(FONT_NAME, "normal");
  doc.text(
    `Средняя цена за принт: ${formatCurrency(result.avgCostPerPrint)} (от ${formatCurrency(result.minCostPerPrint)} до ${formatCurrency(result.maxCostPerPrint)})`,
    margin + 6,
    yPos
  );

  yPos += 12;

  return yPos;
}

/**
 * Рендер таблицы секций
 */
export function renderSectionsTable(
  doc: jsPDF,
  autoTable: AutoTable,
  opts: {
    result: CalculationResult;
    margin: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { result, margin } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Детализация по секциям", margin, yPos);
  yPos += 4;

  const sectionsData = formatSectionsForTable(result);

  autoTable(doc, {
    startY: yPos,
    head: [["Принт", "Размер (мм)", "Кол-во", "Рядов", "Длина", "За шт.", "Итого"]],
    body: sectionsData.map((s) => [
      s.name,
      s.size,
      s.quantity.toString(),
      s.rows.toString(),
      s.length,
      s.costPerPrint,
      s.totalCost,
    ]),
    foot: [
      [
        "Всего",
        "",
        result.totalPrints.toString(),
        "",
        formatWithUnit(result.totalLengthM, "м"),
        formatCurrency(result.avgCostPerPrint),
        formatCurrency(
          result.sections.reduce(
            (sum: number, s) => sum + s.sectionCost,
            0
          )
        ),
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: FONTS.smallSize,
    },
    bodyStyles: {
      fontSize: FONTS.smallSize,
      textColor: COLORS.textPrimary,
    },
    footStyles: {
      fillColor: COLORS.background,
      textColor: COLORS.textPrimary,
      fontStyle: "bold",
      fontSize: FONTS.smallSize,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 8;

  return yPos;
}

/**
 * Рендер разбивки стоимости
 */
export function renderCostBreakdown(
  doc: jsPDF,
  opts: {
    result: CalculationResult;
    margin: number;
    contentWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { result, margin, contentWidth } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Структура себестоимости", margin, yPos);
  yPos += 6;

  const breakdown = formatCostBreakdown(result);
  const barHeight = 8;
  const barWidth = contentWidth - 80;

  breakdown.forEach((item, index) => {
    const isTotal = index === breakdown.length - 1;
    const textColor = isTotal ? COLORS.textPrimary : COLORS.textSecondary;

    doc.setFontSize(FONTS.bodySize);
    doc.setTextColor(...textColor);
    doc.setFont(FONT_NAME, isTotal ? "bold" : "normal");
    doc.text(item.label, margin, yPos + 5);

    if (!isTotal) {
      const percent = parseFloat(item.percent) / 100;
      doc.setFillColor(...COLORS.border);
      doc.roundedRect(margin + 45, yPos, barWidth, barHeight, 2, 2, "F");

      if (percent > 0) {
        doc.setFillColor(...COLORS.primary);
        doc.roundedRect(margin + 45, yPos, barWidth * percent, barHeight, 2, 2, "F");
      }
    }

    const valueX = margin + contentWidth - 30;
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFont(FONT_NAME, isTotal ? "bold" : "normal");
    doc.text(item.value, valueX, yPos + 5, { align: "right" });

    if (!isTotal) {
      doc.setFontSize(FONTS.smallSize);
      doc.setTextColor(...COLORS.textSecondary);
      doc.text(item.percent, margin + contentWidth, yPos + 5, { align: "right" });
    }

    yPos += isTotal ? 10 : 12;
  });

  yPos += 4;

  return yPos;
}

/**
 * Рендер таблицы расхода материалов
 */
export function renderConsumptionTable(
  doc: jsPDF,
  autoTable: AutoTable,
  opts: {
    result: CalculationResult;
    margin: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { result, margin } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Расход материалов", margin, yPos);
  yPos += 4;

  const consumptionData = formatConsumptionForTable(result);

  autoTable(doc, {
    startY: yPos,
    head: [["Материал", "Расход", "Ед. изм."]],
    body: consumptionData.map((c) => [c.material, c.amount, c.unit]),
    theme: "striped",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: FONTS.smallSize,
    },
    bodyStyles: {
      fontSize: FONTS.smallSize,
      textColor: COLORS.textPrimary,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: "right", cellWidth: 30 },
      2: { cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
    tableWidth: 120,
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 8;

  return yPos;
}

/**
 * Рендер изображения Canvas
 */
export function renderCanvasImage(
  doc: jsPDF,
  opts: {
    canvasDataUrl: string;
    margin: number;
    contentWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { canvasDataUrl, margin, contentWidth } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Визуализация раскладки", margin, yPos);
  yPos += 6;

  try {
    const imgHeight = 60;
    doc.addImage(canvasDataUrl, "PNG", margin, yPos, contentWidth, imgHeight);
    yPos += imgHeight + 8;
  } catch {
    doc.setFontSize(FONTS.smallSize);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text("Визуализация недоступна", margin, yPos);
    yPos += 8;
  }

  return yPos;
}

/**
 * Рендер примечаний
 */
export function renderNotes(
  doc: jsPDF,
  opts: {
    notes: string;
    margin: number;
    contentWidth: number;
    yPos: number;
  }
): number {
  let { yPos } = opts;
  const { notes, margin, contentWidth } = opts;

  doc.setFontSize(FONTS.headingSize);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont(FONT_NAME, "bold");
  doc.text("Примечания", margin, yPos);
  yPos += 6;

  doc.setFontSize(FONTS.bodySize);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont(FONT_NAME, "normal");

  const lines = doc.splitTextToSize(notes, contentWidth);
  doc.text(lines, margin, yPos);
  yPos += lines.length * 5 + 6;

  return yPos;
}

/**
 * Рендер футера
 */
export function renderFooter(
  doc: jsPDF,
  opts: {
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
): void {
  const { pageWidth, pageHeight, margin } = opts;
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(FONTS.smallSize);
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFont(FONT_NAME, "normal");

    doc.text(`Сформировано: ${formatDateTime(new Date())}`, margin, pageHeight - 7);
    doc.text(`Страница ${i} из ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  }
}
