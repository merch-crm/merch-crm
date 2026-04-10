/* app/(main)/dashboard/production/calculators/dtg/page.tsx */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { DTGCalculatorClient } from './dtg-calculator-client';
import { CalculatorPageSkeleton } from '../components/CalculatorPageSkeleton';

export const metadata: Metadata = {
 title: 'DTG калькулятор | MerchCRM',
 description: 'Расчёт стоимости прямой цифровой печати на текстиль',
};

/**
 * Страница DTG калькулятора
 * @audit Создана 2026-03-26 для прямой печати на текстиль
 */
export default function DTGCalculatorPage() {
 return (
  <Suspense fallback={<CalculatorPageSkeleton />}>
   <DTGCalculatorClient />
  </Suspense>
 );
}
