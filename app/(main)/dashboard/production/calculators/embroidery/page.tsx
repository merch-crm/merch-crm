import { Suspense } from 'react'
import { EmbroideryCalculatorClient } from './embroidery-calculator-client'
import { CalculatorsSkeleton } from '../components'

export const metadata = {
  title: 'Вышивка калькулятор | MerchCRM',
  description: 'Расчёт себестоимости машинной вышивки'
}

export default async function EmbroideryCalculatorPage() {
  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <EmbroideryCalculatorClient />
    </Suspense>
  )
}
