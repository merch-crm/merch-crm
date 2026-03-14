import { Suspense } from 'react'
import { SilkscreenCalculatorClient } from './silkscreen-calculator-client'
import { CalculatorsSkeleton } from '../components'

export const metadata = {
  title: 'Шелкография калькулятор | MerchCRM',
  description: 'Расчёт себестоимости трафаретной печати'
}

export default async function SilkscreenCalculatorPage() {
  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <SilkscreenCalculatorClient />
    </Suspense>
  )
}
