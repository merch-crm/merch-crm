// app/(main)/dashboard/production/calculators/dtf-types.ts

import { 
  CalculationResult,
  CalculatorParams,
} from './types';

export type DtfCalculationResult = CalculationResult;

export const DTF_ROLL_WIDTHS = [
  { value: 300, label: "300 мм", description: "Стандартный" },
  { value: 600, label: "600 мм", description: "Широкий" },
];

export const DEFAULT_DTF_PARAMS: Omit<CalculatorParams, "applicationType"> = {
  rollWidthMm: 300,
  edgeMarginMm: 10,
  printGapMm: 10
};
