import { DTFCalculatorClient } from './dtf-calculator-client'

export const metadata = {
  title: 'DTF калькулятор | MerchCRM',
  description: 'Расчёт себестоимости DTF-печати'
}

export default function DtfCalculatorPage() {
  return <DTFCalculatorClient />
}
