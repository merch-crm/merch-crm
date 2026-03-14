import { Suspense } from 'react'
import { getMeterPricing, getPlacements, getConsumablesConfig } from '../actions'
import { SublimationCalculatorClient } from './sublimation-calculator-client'
import { CalculatorsSkeleton } from '../components'

export const metadata = {
  title: 'Сублимация калькулятор | MerchCRM',
  description: 'Расчёт себестоимости сублимационной печати'
}

export default async function SublimationCalculatorPage() {
  const [meterPricingRes, placementsRes, consumablesRes] = await Promise.all([
    getMeterPricing('sublimation'),
    getPlacements('sublimation'),
    getConsumablesConfig('sublimation')
  ])

  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <SublimationCalculatorClient
        initialMeterPricing={meterPricingRes.success ? meterPricingRes.data : []}
        initialPlacements={placementsRes.success ? placementsRes.data : []}
        initialConsumablesConfig={consumablesRes.success ? consumablesRes.data : null}
      />
    </Suspense>
  )
}
