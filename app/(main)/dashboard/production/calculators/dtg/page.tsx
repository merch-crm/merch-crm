import { DTGCalculatorClient } from './dtg-calculator-client'

export const metadata = {
  title: 'DTG калькулятор | MerchCRM',
  description: 'Расчёт себестоимости прямой цифровой печати'
}

export default function DtgCalculatorPage() {
  return <DTGCalculatorClient />
}
