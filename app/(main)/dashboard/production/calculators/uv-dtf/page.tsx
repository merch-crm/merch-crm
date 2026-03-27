// app/(main)/dashboard/production/calculators/uv-dtf/page.tsx
import { Suspense } from 'react';
import { UVDTFCalculatorClient } from './uv-dtf-calculator-client';
import { CalculatorPageSkeleton } from '../components/CalculatorPageSkeleton';

export const metadata = {
  title: 'UV DTF калькулятор | MerchCRM',
  description: 'Калькулятор расчета себестоимости UV DTF печати',
};

export default function UVDTFCalculatorPage() {
  return (
    <Suspense fallback={<CalculatorPageSkeleton />}>
      <UVDTFCalculatorClient />
    </Suspense>
  );
}
