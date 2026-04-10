// app/(main)/dashboard/production/calculators/dtf/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import { DTFCalculatorClient } from './dtf-calculator-client';
import { CalculatorPageSkeleton } from '../components/CalculatorPageSkeleton';

export const metadata: Metadata = {
 title: 'DTF калькулятор | MerchCRM',
 description: 'Расчёт стоимости DTF печати',
};

/**
 * Страница DTF калькулятора
 */
export default function DTFCalculatorPage() {
 return (
  <Suspense fallback={<CalculatorPageSkeleton />}>
   <DTFCalculatorClient />
  </Suspense>
 );
}
