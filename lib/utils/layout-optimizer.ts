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

interface Strip {
  /** Y coordinate of the strip top (mm from roll start) */
  y: number;
  /** Height of the tallest item in this strip */
  height: number;
  /** X cursor: next free X position inside the strip */
  nextX: number;
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
  // Sort largest first to improve packing
  list.sort((a, b) => {
    const sizeA = Math.max(a.width, a.height);
    const sizeB = Math.max(b.width, b.height);
    return sizeB - sizeA;
  });
  return list;
}

/**
 * Tries to orient the candidate to fit in the given width.
 * Returns the oriented dimensions or null if it cannot fit.
 */
function orient(
  c: Candidate,
  availableWidth: number,
  usableWidth: number,
  allowRotation: boolean
): { w: number; h: number; rotated: boolean } | null {
  // Try natural orientation
  if (c.width <= availableWidth && c.width <= usableWidth) {
    return { w: c.width, h: c.height, rotated: false };
  }
  // Try rotated
  if (allowRotation && c.height <= availableWidth && c.height <= usableWidth) {
    return { w: c.height, h: c.width, rotated: true };
  }
  return null;
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

  // Usable width excluding edge margins on both sides
  const usableWidth = rollWidthMm - edgeMarginMm * 2;

  const candidates = buildCandidates(designs);

  if (candidates.length === 0 || usableWidth <= 0) {
    return {
      placedDesigns: [],
      stats: { totalLengthMm: 0, usedAreaMm2: 0, totalAreaMm2: 0, efficiency: 0, printCount: 0 },
      settings: cfg,
    };
  }

  const strips: Strip[] = [];
  const placements: Array<{
    candidate: Candidate;
    w: number;
    h: number;
    rotated: boolean;
    x: number;
    stripIdx: number;
  }> = [];

  for (const c of candidates) {
    let isPlaced = false;

    // Try to fit into an existing strip (first fit)
    for (let si = 0; si < strips.length; si++) {
      const strip = strips[si];
      // Available width in this strip (account for gap before next item)
      const gapBefore = strip.nextX > edgeMarginMm ? gapMm : 0;
      const available = edgeMarginMm + usableWidth - strip.nextX - gapBefore;

      const o = orient(c, available, usableWidth, allowRotation);
      if (o) {
        const x = strip.nextX + gapBefore;
        placements.push({ candidate: c, ...o, x, stripIdx: si });
        strip.nextX = x + o.w;
        if (o.h > strip.height) strip.height = o.h;
        isPlaced = true;
        break;
      }
    }

    if (!isPlaced) {
      // Open a new strip
      const o = orient(c, usableWidth, usableWidth, allowRotation);
      if (o) {
        // Y of new strip = end of last strip + margin/gap
        let newY = edgeMarginMm;
        if (strips.length > 0) {
          const last = strips[strips.length - 1];
          newY = last.y + last.height + gapMm;
        }
        const newStrip: Strip = { y: newY, height: o.h, nextX: edgeMarginMm + o.w };
        strips.push(newStrip);
        placements.push({ candidate: c, ...o, x: edgeMarginMm, stripIdx: strips.length - 1 });
      } else {
        console.warn(`Design ${c.designId} is too wide for roll (${rollWidthMm}mm)`);
      }
    }
  }

  // Build PlacedDesign array
  const placedDesigns: PlacedDesign[] = placements.map((p) => ({
    designId: p.candidate.designId,
    instanceIndex: p.candidate.instanceIndex,
    x: p.x,
    y: strips[p.stripIdx].y,
    width: p.w,
    height: p.h,
    rotated: p.rotated,
    colorIndex: designs.findIndex((d) => d.id === p.candidate.designId),
  }));

  // Total roll length (last strip bottom + bottom margin)
  let totalLengthMm = edgeMarginMm * 2; // at minimum, just margins
  if (strips.length > 0) {
    const last = strips[strips.length - 1];
    totalLengthMm = last.y + last.height + edgeMarginMm;
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
  { value: 420, label: '42 см' },
  { value: 600, label: '60 см' },
  { value: 900, label: '90 см' },
  { value: 1200, label: '120 см' },
] as const;

export default optimizeLayout;
