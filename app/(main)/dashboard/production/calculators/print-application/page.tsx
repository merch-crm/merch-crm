import { Suspense } from 'react'
import PrintApplicationCalculatorClient from "./print-application-calculator-client"
import { CalculatorsSkeleton } from "../components"

export const metadata = {
  title: 'Нанесение принта | MerchCRM',
  description: 'Расчёт стоимости нанесения готовых принтов'
}

export default function PrintApplicationCalculatorPage() {
  return (
    <Suspense fallback={<CalculatorsSkeleton />}>
      <PrintApplicationCalculatorClient />
    </Suspense>
  )
}
