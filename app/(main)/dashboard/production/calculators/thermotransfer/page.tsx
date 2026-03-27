// app/(main)/dashboard/production/calculators/thermotransfer/page.tsx
import { Suspense } from 'react';
import { ThermotransferCalculatorClient } from './thermotransfer-calculator-client';
import { CalculatorPageSkeleton } from '../components/CalculatorPageSkeleton';

export const metadata = {
  title: 'Калькулятор термотрансфера | MerchCRM',
  description: 'Калькулятор расчета себестоимости термотрансферного нанесения',
};

export default function ThermotransferCalculatorPage() {
  return (
    <Suspense fallback={<CalculatorPageSkeleton />}>
      <ThermotransferCalculatorClient />
    </Suspense>
  );
}
