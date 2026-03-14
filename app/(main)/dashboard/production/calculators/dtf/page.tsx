import { Suspense } from 'react'
import { getMeterPricing } from '../actions/meter-pricing-actions'
import { getPlacements } from '../actions/placements-actions'
import { getConsumablesConfig } from '../actions/consumables-actions'
import { DtfCalculatorClient } from './dtf-calculator-client'
import { CalculatorsSkeleton } from '../components'

export const metadata = {
  title: 'DTF калькулятор | MerchCRM',
  description: 'Расчёт себестоимости DTF-печати'
}

export default async function DtfCalculatorPage() {
  const [meterPricingRes, placementsRes, consumablesRes] = await Promise.all([
    getMeterPricing('dtf'),
    getPlacements('dtf'),
    getConsumablesConfig('dtf')
  ])

  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <DtfCalculatorClient
        initialMeterPricing={meterPricingRes.success ? meterPricingRes.data : []}
        initialPlacements={placementsRes.success ? placementsRes.data : []}
        initialConsumables={consumablesRes.success ? consumablesRes.data : null}
      />
    </Suspense>
  )
}
