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
  const totalHeightMm = Math.max(stats.totalLengthMm, 100);

  // SVG Header
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${rollWidthMm}mm" height="${totalHeightMm}mm" viewBox="0 0 ${rollWidthMm} ${totalHeightMm}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white" />
  
  <!-- Зоны отступов -->
  <rect x="0" y="0" width="${settings.edgeMarginMm}" height="${totalHeightMm}" fill="#fef3c7" fill-opacity="0.3" />
  <rect x="${rollWidthMm - settings.edgeMarginMm}" y="0" width="${settings.edgeMarginMm}" height="${totalHeightMm}" fill="#fef3c7" fill-opacity="0.3" />

  <!-- Линейки (только основные деления) -->
  <g stroke="#9ca3af" stroke-width="0.2">
    ${Array.from({ length: Math.floor(rollWidthMm / 100) + 1 }, (_, i) => i * 100).map(x => 
      `<line x1="${x}" y1="0" x2="${x}" y2="${totalHeightMm}" stroke-dasharray="2,2" />`
    ).join('')}
    ${Array.from({ length: Math.floor(totalHeightMm / 100) + 1 }, (_, i) => i * 100).map(y => 
      `<line x1="0" y1="${y}" x2="${rollWidthMm}" y2="${y}" stroke-dasharray="2,2" />`
    ).join('')}
  </g>
`;

  // Размещённые дизайны
  placedDesigns.forEach((placed) => {
    const design = designs.find((d) => d.id === placed.designId);
    const color = DESIGN_COLORS[placed.colorIndex % DESIGN_COLORS.length];
    
    svg += `
  <g>
    <rect 
      x="${placed.x}" 
      y="${placed.y}" 
      width="${placed.width}" 
      height="${placed.height}" 
      fill="${color.fill}" 
      stroke="${color.border}" 
      stroke-width="0.5"
      rx="1"
    />
    <text 
      x="${placed.x + placed.width / 2}" 
      y="${placed.y + placed.height / 2 - 2}" 
      font-family="Arial, sans-serif"
      font-size="${Math.min(8, placed.width / 8)}" 
      fill="${color.text}" 
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${design?.name.length || 0 > 20 ? design?.name.slice(0, 17) + '...' : design?.name || 'Design'}
    </text>
    <text 
      x="${placed.x + placed.width / 2}" 
      y="${placed.y + placed.height / 2 + 6}" 
      font-family="Arial, sans-serif"
      font-size="${Math.min(6, placed.width / 10)}" 
      fill="${color.text}" 
      fill-opacity="0.7"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${placed.width}x${placed.height}mm
    </text>
  </g>`;
  });

  // Stamp / Info
  svg += `
  <g transform="translate(10, ${totalHeightMm - 10})">
    <text font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
      MerchCRM Layout | Efficiency: ${stats.efficiency}% | Total Length: ${stats.totalLengthMm / 10}cm
    </text>
  </g>
</svg>`;

  return svg;
}

export default generateLayoutSVG;
