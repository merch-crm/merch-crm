/**
 * @fileoverview Алгоритм оптимизации раскладки дизайнов на плёнке (FFDH)
 * @module lib/utils/layout-optimizer
 */

import {
  DesignItem,
  PlacedDesign,
  LayoutResult,
  LayoutSettings,
} from '@/lib/types/calculators';

const DEFAULT_SETTINGS: LayoutSettings = {
  rollWidthMm: 300,
  edgeMarginMm: 10,
  gapMm: 5,
  allowRotation: true,
};

interface Candidate {
  designId: string;
  instanceIndex: number;
  width: number;
  height: number;
  rotated: boolean;
}



/**
 * Expands each design into N candidate instances (one per quantity).
 * Sorts by max(width, height) descending — classic FFDH ordering.
 */
function buildCandidates(designs: DesignItem[]): Candidate[] {
  const list: Candidate[] = [];
  for (const d of designs) {
    for (let i = 0; i < d.quantity; i++) {
      list.push({
        designId: d.id,
        instanceIndex: i,
        width: d.widthMm,
        height: d.heightMm,
        rotated: false,
      });
    }
  }
  // Sort by max(width, height) descending — classic FFDH ordering for efficiency.
  list.sort((a, b) => {
    const sizeA = Math.max(a.width, a.height);
    const sizeB = Math.max(b.width, b.height);
    if (sizeA !== sizeB) return sizeB - sizeA;
    // Secondary sort by designId to keep same designs together within same height groups
    return a.designId.localeCompare(b.designId);
  });
  return list;
}



/**
 * First-Fit Decreasing Height (FFDH) strip packing algorithm.
 */
export function optimizeLayout(
  designs: DesignItem[],
  settings: Partial<LayoutSettings> = {}
): LayoutResult {
  const cfg: LayoutSettings = { ...DEFAULT_SETTINGS, ...settings };
  const { rollWidthMm, edgeMarginMm, gapMm, allowRotation } = cfg;

  const candidates = buildCandidates(designs);

  if (candidates.length === 0) {
    return {
      placedDesigns: [],
      stats: { totalLengthMm: 0, usedAreaMm2: 0, totalAreaMm2: 0, efficiency: 0, printCount: 0 },
      settings: cfg,
    };
  }

  // Usable width excluding edge margins on both sides
  const usableWidth = rollWidthMm - edgeMarginMm * 2;

  if (usableWidth <= 0) {
    return {
      placedDesigns: [],
      stats: { totalLengthMm: 0, usedAreaMm2: 0, totalAreaMm2: 0, efficiency: 0, printCount: 0 },
      settings: cfg,
    };
  }

  // We'll manage Columns that span the entire roll width
  // Each column has an X range and a nextY where the next item can be placed
  const columns: Array<{ x: number, w: number, nextY: number }> = [];
  
  // Initially, one column covering the entire usable width
  columns.push({ x: edgeMarginMm, w: usableWidth, nextY: edgeMarginMm });

  const skippedDesigns: Array<{ id: string; name: string; width: number; height: number }> = [];

  const placements: Array<{
    candidate: Candidate;
    w: number;
    h: number;
    rotated: boolean;
    x: number;
    actualY: number;
  }> = [];

  for (const c of candidates) {
    let bestSlot = null;
    let minPlacedY = Infinity;

    // Try both orientations
    const orientations = [
      { w: c.width, h: c.height, rotated: false },
      allowRotation ? { w: c.height, h: c.width, rotated: true } : null
    ].filter(Boolean) as Array<{ w: number; h: number; rotated: boolean }>;

    for (const o of orientations) {
      if (o.w + gapMm > usableWidth) continue;

      for (let i = 0; i < columns.length; i++) {
        const colStart = columns[i].x;
        if (colStart + o.w > edgeMarginMm + usableWidth) continue;

        let maxY = edgeMarginMm;
        let coveredWidth = 0;
        for (let j = i; j < columns.length; j++) {
           maxY = Math.max(maxY, columns[j].nextY);
           coveredWidth += columns[j].w;
           if (coveredWidth >= o.w) break;
        }

        if (coveredWidth >= o.w) {
          // We want the absolute minimum Y across all possibilities
          // In case of a tie in Y, we prefer the one with smaller height (h) to save vertical space
          if (maxY < minPlacedY || (maxY === minPlacedY && bestSlot && o.h < bestSlot.h)) {
            minPlacedY = maxY;
            bestSlot = { x: colStart, y: maxY, ...o };
          }
        }
      }
    }

    if (bestSlot) {
      const { x, y, w, h, rotated } = bestSlot;
      placements.push({ candidate: c, w, h, rotated, x, actualY: y });

      // Update columns with horizontal gaps: each item takes (w + gapMm) space
      const newNextY = y + h + gapMm;
      const totalOccupyW = w + gapMm;
      
      // Find range of columns to update
      let startIdx = -1;
      let endIdx = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].x <= x && columns[i].x + columns[i].w > x) {
          if (startIdx === -1) startIdx = i;
        }
        if (columns[i].x < x + totalOccupyW && columns[i].x + columns[i].w >= x + totalOccupyW) {
          endIdx = i;
        }
      }

      if (startIdx !== -1 && endIdx !== -1) {
        const firstCol = columns[startIdx];
        const lastCol = columns[endIdx];
        
        const leadingW = x - firstCol.x;
        const trailingW = (lastCol.x + lastCol.w) - (x + totalOccupyW);
        
        const newCols: typeof columns = [];
        if (leadingW > 0.1) newCols.push({ x: firstCol.x, w: leadingW, nextY: firstCol.nextY });
        newCols.push({ x, w: totalOccupyW, nextY: newNextY });
        if (trailingW > 0.1) newCols.push({ x: x + totalOccupyW, w: trailingW, nextY: lastCol.nextY });

        columns.splice(startIdx, (endIdx - startIdx) + 1, ...newCols);
      }
    } else {
      if (!skippedDesigns.find(d => d.id === c.designId)) {
        skippedDesigns.push({ 
          id: c.designId, 
          name: designs.find(d => d.id === c.designId)?.name || 'Unknown',
          width: c.width,
          height: c.height
        });
      }
      console.warn(`Design ${c.designId} is too wide for roll (${rollWidthMm}mm)`);
    }
  }

  // Build PlacedDesign array
  const placedDesigns: PlacedDesign[] = placements.map((p) => ({
    designId: p.candidate.designId,
    instanceIndex: p.candidate.instanceIndex,
    x: p.x,
    y: p.actualY,
    width: p.w,
    height: p.h,
    rotated: p.rotated,
    colorIndex: designs.findIndex((d) => d.id === p.candidate.designId),
  }));

  // Total roll length (exactly the height of the elements)
  let totalLengthMm = 0;
  if (placedDesigns.length > 0) {
    totalLengthMm = Math.max(...placedDesigns.map(p => p.y + p.height)) + edgeMarginMm;
  }

  // usedAreaMm2 = sum of each placed item's area
  const usedAreaMm2 = placedDesigns.reduce((sum, p) => sum + p.width * p.height, 0);

  // totalAreaMm2 = roll width × total length (the actual film used)
  const totalAreaMm2 = rollWidthMm * totalLengthMm;

  // Efficiency = usedArea / totalArea (capped at 100%)
  const efficiency = totalAreaMm2 > 0
    ? Math.min(100, Math.round((usedAreaMm2 / totalAreaMm2) * 1000) / 10)
    : 0;

  return {
    placedDesigns,
    stats: {
      totalLengthMm: Math.round(totalLengthMm),
      usedAreaMm2: Math.round(usedAreaMm2),
      totalAreaMm2: Math.round(totalAreaMm2),
      efficiency,
      printCount: placedDesigns.length,
    },
    settings: cfg,
    skippedDesigns,
  };
}

/**
 * Converts uploaded files to DesignItem array for the layout optimizer.
 */
export function filesToDesignItems(
  files: Array<{
    id: string;
    originalName: string;
    userDimensions?: { widthMm: number; heightMm: number };
    quantity?: number;
  }>
): DesignItem[] {
  return files
    .filter((f) => {
      // Skip files without dimensions
      if (!f.userDimensions?.widthMm || !f.userDimensions?.heightMm) return false;
      if (f.userDimensions.widthMm <= 0 || f.userDimensions.heightMm <= 0) return false;
      return true;
    })
    .map((file, index) => ({
      id: file.id,
      name: file.originalName,
      widthMm: file.userDimensions!.widthMm,
      heightMm: file.userDimensions!.heightMm,
      quantity: file.quantity || 1,
      colorIndex: index,
    }));
}

/**
 * Available roll widths the user can select.
 */
export const ROLL_WIDTH_OPTIONS = [
  { value: 300, label: '30 см' },
  { value: 330, label: '33 см' },
  { value: 450, label: '45 см' },
  { value: 600, label: '60 см' },
  { value: 1200, label: '120 см' },
] as const;

export default optimizeLayout;
