import type { PrintGroupInput } from "../types";

/**
 * Параметры раскладки
 */
export interface LayoutParams {
  rollWidthMm: number;
  edgeMarginMm: number;
  printGapMm: number;
}

/**
 * Результат расчёта раскладки одной группы
 */
export interface GroupLayoutResult {
  printsPerRow: number;
  rowsCount: number;
  sectionLengthMm: number;
  sectionAreaM2: number;
  printsAreaM2: number;
}

/**
 * Рассчитывает раскладку для одной группы принтов
 */
export function calculateGroupLayout(
  group: PrintGroupInput,
  params: LayoutParams
): GroupLayoutResult {
  const { rollWidthMm, edgeMarginMm, printGapMm } = params;
  const { widthMm, heightMm, quantity } = group;

  // Рабочая ширина (без отступов от края)
  const workingWidth = rollWidthMm - 2 * edgeMarginMm;

  // Сколько принтов помещается в ряд
  // Формула: (workingWidth + gap) / (printWidth + gap)
  let printsPerRow = Math.floor((workingWidth + printGapMm) / (widthMm + printGapMm));
  
  // Минимум 1 принт в ряд
  if (printsPerRow < 1) {
    printsPerRow = 1;
  }

  // Сколько рядов нужно
  const rowsCount = Math.ceil(quantity / printsPerRow);

  // Длина секции (высота всех рядов + отступы между ними)
  // Последний ряд без отступа снизу
  const sectionLengthMm = rowsCount * heightMm + (rowsCount - 1) * printGapMm;

  // Площадь секции на плёнке (м²)
  const sectionAreaM2 = (sectionLengthMm * rollWidthMm) / 1_000_000;

  // Площадь самих принтов (м²)
  const printsAreaM2 = (widthMm * heightMm * quantity) / 1_000_000;

  return {
    printsPerRow,
    rowsCount,
    sectionLengthMm,
    sectionAreaM2,
    printsAreaM2,
  };
}

/**
 * Рассчитывает раскладку для всех групп
 */
export function calculateAllGroupsLayout(
  groups: PrintGroupInput[],
  params: LayoutParams
): {
  sections: Array<GroupLayoutResult & { group: PrintGroupInput; sortOrder: number }>;
  totalLengthMm: number;
  totalAreaM2: number;
  printsAreaM2: number;
} {
  // Сортируем группы по площади принта (большие сначала)
  // Это оптимизирует использование плёнки
  const sortedGroups = [...groups].sort(
    (a, b) => (b.widthMm * b.heightMm) - (a.widthMm * a.heightMm)
  );

  let totalLengthMm = 0;
  let totalPrintsArea = 0;

  const sections = sortedGroups.map((group, index) => {
    const layout = calculateGroupLayout(group, params);
    totalLengthMm += layout.sectionLengthMm;
    totalPrintsArea += layout.printsAreaM2;

    // Добавляем отступ между секциями (кроме последней)
    if (index < sortedGroups.length - 1) {
      totalLengthMm += params.printGapMm;
    }

    return {
      ...layout,
      group,
      sortOrder: index,
    };
  });

  const totalAreaM2 = (totalLengthMm * params.rollWidthMm) / 1_000_000;

  return {
    sections,
    totalLengthMm,
    totalAreaM2,
    printsAreaM2: totalPrintsArea,
  };
}

/**
 * Рассчитывает КПД (эффективность использования плёнки)
 */
export function calculateEfficiency(printsAreaM2: number, totalAreaM2: number): number {
  if (totalAreaM2 <= 0) return 0;
  return (printsAreaM2 / totalAreaM2) * 100;
}
