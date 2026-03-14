import { Suspense } from 'react'
import { getMeterPricing, getPlacements, getConsumablesConfig } from '../actions'
import { DtgCalculatorClient } from './dtg-calculator-client'
import { CalculatorsSkeleton } from '../components'
import { ApplicationType, ConsumablesConfigData } from '../types'

export const metadata = {
  title: 'DTG калькулятор | MerchCRM',
  description: 'Расчёт себестоимости прямой печати на текстиль'
}

export default async function DtgCalculatorPage() {
  const [pRes, plRes, cRes] = await Promise.all([
    getMeterPricing('dtg'),
    getPlacements('dtg'),
    getConsumablesConfig('dtg')
  ])

  // Рендерим клиентский компонент только если данные успешно загружены (или используем пустые массивы как fallback)
  const meterPricing = pRes.success ? pRes.data : []
  const placements = plRes.success ? plRes.data : []
  const consumables = cRes.success ? (cRes.data as unknown as ConsumablesConfigData) : { 
    applicationType: 'dtg' as ApplicationType,
    inkWhitePerM2: 0,
    inkCmykPerM2: 0,
    powderPerM2: 0,
    paperPerM2: 0,
    fillPercent: 0,
    wastePercent: 0,
    config: null
  }

  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <DtgCalculatorClient
        initialMeterPricing={meterPricing}
        initialPlacements={placements}
        initialConsumablesConfig={consumables}
      />
    </Suspense>
  )
}
