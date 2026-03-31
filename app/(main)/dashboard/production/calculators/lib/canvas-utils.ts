import type { CalculatedSection } from "../types";

/**
 * Параметры для отрисовки Canvas
 */
export interface CanvasRenderParams {
    sections: CalculatedSection[];
    rollWidthMm: number;
    edgeMarginMm: number;
    printGapMm: number;
    canvasWidth: number;
    maxPreviewRows: number;
    showNumbers: boolean;
    showDimensions: boolean;
}

/**
 * Рассчитывает масштаб для отображения
 */
export function calculateScale(rollWidthMm: number, canvasWidth: number): number {
    return canvasWidth / rollWidthMm;
}

/**
 * Рассчитывает общую длину всех секций в мм
 */
export function calculateTotalLength(
    sections: CalculatedSection[],
    printGapMm: number
): number {
    if (sections.length === 0) return 0;

    return sections.reduce((total, section, index) => {
        const sectionLength = section.sectionLengthMm;
        const gap = index < sections.length - 1 ? printGapMm : 0;
        return total + sectionLength + gap;
    }, 0);
}

/**
 * Рассчитывает высоту Canvas для превью
 */
export function calculateCanvasHeight(
    sections: CalculatedSection[],
    printGapMm: number,
    scale: number,
    maxPreviewRows: number
): number {
    let totalHeight = 0;

    sections.forEach((section, index) => {
        // Ограничиваем количество рядов для превью
        const displayRows = Math.min(section.rowsCount, maxPreviewRows);
        const sectionHeight = displayRows * section.heightMm + (displayRows - 1) * printGapMm;

        // Добавляем место для "... ещё N рядов"
        const extraHeight = section.rowsCount > maxPreviewRows ? 30 / scale : 0;

        totalHeight += sectionHeight + extraHeight;

        // Отступ между секциями
        if (index < sections.length - 1) {
            totalHeight += printGapMm + 20 / scale; // 20px для разделителя
        }
    });

    // Добавляем отступы сверху и снизу
    totalHeight += 20 / scale;

    return Math.max(totalHeight * scale, 100);
}

/**
 * Конвертирует HEX цвет в RGBA
 */
export function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Отрисовывает фон плёнки
 */
export function drawFilmBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    edgeMarginPx: number
): void {
    // Основной фон
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Отступы от края (более тёмные)
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, edgeMarginPx, height);
    ctx.fillRect(width - edgeMarginPx, 0, edgeMarginPx, height);

    // Рамка
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

/**
 * Отрисовывает один принт
 */
export function drawPrint(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    number?: number
): void {
    const radius = Math.min(4, width / 10, height / 10);

    // Заливка
    ctx.fillStyle = hexToRgba(color, 0.2);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();

    // Обводка
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Номер
    if (number !== undefined && width > 20 && height > 20) {
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.min(12, width / 3, height / 3)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(number), x + width / 2, y + height / 2);
    }
}

/**
 * Отрисовывает пунктирную линию-разделитель
 */
export function drawSectionDivider(
    ctx: CanvasRenderingContext2D,
    y: number,
    width: number
): void {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.restore();
}

/**
 * Отрисовывает текст "... ещё N рядов"
 */
export function drawMoreRowsText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    remainingRows: number
): void {
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`... ещё ${remainingRows} рядов`, x, y);
}

/**
 * Отрисовывает размеры секции
 */
export function drawSectionDimensions(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    widthMm: number,
    heightMm: number,
    color: string
): void {
    ctx.fillStyle = color;
    ctx.font = "10px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${widthMm}×${heightMm}`, x + 4, y + 4);
}
