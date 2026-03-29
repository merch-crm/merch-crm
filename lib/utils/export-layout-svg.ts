/**
 * @fileoverview Утилита экспорта раскладки в SVG строку для PDF/печати
 * @module lib/utils/export-layout-svg
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

import {
  LayoutResult,
  DesignItem,
  DESIGN_COLORS,
} from '@/lib/types/calculators';

/**
 * Генерирует SVG строку на основе результата раскладки
 * @param layoutResult - Результат оптимизации раскладки
 * @param designs - Исходные дизайны
 * @returns Строка SVG
 */
export function generateLayoutSVG(
  layoutResult: LayoutResult,
  designs: DesignItem[]
): string {
  const { placedDesigns, stats, settings } = layoutResult;
  const { rollWidthMm } = settings;
  const totalLengthMm = stats.totalLengthMm;
  
  // Размеры зон
  const leftMargin = 30; // Зона для стрелки высоты
  const topMargin = 45;  // Зона для стрелки ширины (увеличено с 30)
  const legendItemHeight = 16;
  const legendHeaderHeight = 40 + (designs.length * legendItemHeight); // Увеличено с 25
  const footerHeight = 20;

  const svgWidth = rollWidthMm + leftMargin + 20;
  const svgHeight = legendHeaderHeight + topMargin + totalLengthMm + footerHeight;

  const rollX = leftMargin;
  const rollY = legendHeaderHeight + topMargin;

  // SVG Header with marker definitions
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${svgWidth}mm" height="${svgHeight}mm" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
    </marker>
    <marker id="arrowhead-rev" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="10 0, 0 3.5, 10 7" fill="#64748b" />
    </marker>
  </defs>
  
  <rect width="100%" height="100%" fill="white" />

  <!-- ЛЕГЕНДА / СПИСОК ПРИНТОВ -->
  <g transform="translate(15, 15)">
    <text font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#0f172a">СПИСОК ПРИНТОВ В ЗАКАЗЕ</text>
    <text y="12" font-family="system-ui, sans-serif" font-size="8" font-weight="600" fill="#94a3b8">
      Эффективность: ${stats.efficiency}%  |  Общая длина: ${(stats.totalLengthMm / 10).toFixed(1)} см
    </text>
    ${designs.map((d, i) => {
      const color = DESIGN_COLORS[d.colorIndex % DESIGN_COLORS.length];
      const y = 30 + i * legendItemHeight; // Сдвинуто вниз на 30 вместо 15
      return `
      <g transform="translate(0, ${y})">
        <!-- Миниатюра (цветной квадрат как подложка) -->
        <rect width="12" height="12" rx="3" fill="${color.fill}" stroke="${color.border}" stroke-width="0.3" />
        ${d.thumbnailUrl ? `<image href="${d.thumbnailUrl}" x="1" y="1" width="10" height="10" clip-path="inset(0% round 2px)" />` : ''}
        
        <text x="18" y="9" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#334155">${d.name.length > 40 ? d.name.slice(0, 37) + '...' : d.name}</text>
        <text x="180" y="9" font-family="system-ui, sans-serif" font-size="8" font-weight="600" fill="#64748b">${d.widthMm}×${d.heightMm} мм</text>
        <text x="260" y="9" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#0f172a">×${d.quantity}</text>
      </g>`;
    }).join('')}
  </g>

  <!-- СТРЕЛКИ РАЗМЕРОВ ПОЛОТНА -->
  <g stroke="#64748b" stroke-width="0.8">
    <!-- Ширина (Сверху) -->
    <line x1="${rollX}" y1="${rollY - 15}" x2="${rollX + rollWidthMm}" y2="${rollY - 15}" marker-start="url(#arrowhead-rev)" marker-end="url(#arrowhead)" />
    <text x="${rollX + rollWidthMm / 2}" y="${rollY - 20}" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#475569" text-anchor="middle" stroke="none">${rollWidthMm} мм</text>
    
    <!-- Высота (Слева) -->
    <line x1="${rollX - 15}" y1="${rollY}" x2="${rollX - 15}" y2="${rollY + totalLengthMm}" marker-start="url(#arrowhead-rev)" marker-end="url(#arrowhead)" />
    <text transform="translate(${rollX - 22}, ${rollY + totalLengthMm / 2}) rotate(-90)" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#475569" text-anchor="middle" stroke="none">${totalLengthMm} мм</text>
  </g>

  <!-- РУЛОН С ДИЗАЙНАМИ -->
  <g transform="translate(${rollX}, ${rollY})">
    <rect width="${rollWidthMm}" height="${totalLengthMm}" fill="white" stroke="#e5e7eb" stroke-width="0.5" />
    
    <!-- Зоны отступов -->
    <rect x="0" y="0" width="${settings.edgeMarginMm}" height="${totalLengthMm}" fill="#f3f4f6" fill-opacity="0.5" />
    <rect x="${rollWidthMm - settings.edgeMarginMm}" y="0" width="${settings.edgeMarginMm}" height="${totalLengthMm}" fill="#f3f4f6" fill-opacity="0.5" />

    <!-- Сетка -->
    <g stroke="#e5e7eb" stroke-width="0.3">
      ${Array.from({ length: Math.floor(rollWidthMm / 100) + 1 }, (_, i) => i * 100).map(x => 
        `<line x1="${x}" y1="0" x2="${x}" y2="${totalLengthMm}" stroke-dasharray="2,2" />`
      ).join('')}
      ${Array.from({ length: Math.floor(totalLengthMm / 100) + 1 }, (_, i) => i * 100).map(y => 
        `<line x1="0" y1="${y}" x2="${rollWidthMm}" y2="${y}" stroke-dasharray="2,2" />`
      ).join('')}
    </g>

    <!-- Сами принты -->
    ${placedDesigns.map((placed) => {
      const design = designs.find((d) => d.id === placed.designId);
      const color = DESIGN_COLORS[placed.colorIndex % DESIGN_COLORS.length];
      const longSide = Math.max(placed.width, placed.height);
      const shortSide = Math.min(placed.width, placed.height);
      const centerX = placed.x + placed.width / 2;
      const centerY = placed.y + placed.height / 2;
      const showLabels = longSide > 25 && shortSide > 12;
      const showName = showLabels && shortSide > 18;
      const baseSize = Math.min(7.5, longSide / 10, shortSide / 2.8);
      const nameLimit = Math.max(6, Math.floor(longSide / 6.5));
      const displayName = design?.name || 'Design';
      const truncatedName = displayName.length > nameLimit ? displayName.slice(0, nameLimit - 2) + '..' : displayName;
      const dimsStr = placed.rotated ? `${placed.height}×${placed.width}` : `${placed.width}×${placed.height}`;

      return `
    <g>
      <rect x="${placed.x}" y="${placed.y}" width="${placed.width}" height="${placed.height}" fill="${color.fill}" stroke="${color.border}" stroke-width="0.4" rx="1.5" />
      ${showLabels ? `
      <text transform="translate(${centerX}, ${centerY}) ${placed.rotated ? 'rotate(90)' : ''}" font-family="system-ui, sans-serif" font-size="${baseSize}" fill="${color.text}" text-anchor="middle" dominant-baseline="middle">
        ${showName ? `<tspan x="0" dy="-0.45em" font-weight="700" opacity="0.8" font-size="0.75em">${truncatedName}</tspan>` : ''}
        <tspan x="0" dy="${showName ? '1.25em' : '0'}" font-weight="600" font-size="0.95em">${dimsStr}<tspan font-weight="400" font-size="0.8em"> мм</tspan></tspan>
      </text>` : ''}
    </g>`;
    }).join('')}
  </g>

</svg>`;

  return svg;
}

export default generateLayoutSVG;
