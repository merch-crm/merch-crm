'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { type EmbroideryCalculationResult } from '../../types'

interface EmbroideryCostBreakdownProps {
 result: EmbroideryCalculationResult
}

export const EmbroideryCostBreakdown = memo(function EmbroideryCostBreakdown({
 result
}: EmbroideryCostBreakdownProps) {
 const {
  totalGarmentCost,
  totalEmbroideryCost,
  totalDigitizingCost,
  totalSetupCost,
  totalExtraColorsCost,
  materialsCost = 0,
  totalCostBeforeDiscount,
  discountAmount
 } = result

 const segments = [
  { label: 'Изделия (заготовки)', value: totalGarmentCost, color: 'bg-slate-900', percentage: (totalGarmentCost / totalCostBeforeDiscount) * 100 },
  { label: 'Вышивка (работа)', value: totalEmbroideryCost, color: 'bg-pink-500', percentage: (totalEmbroideryCost / totalCostBeforeDiscount) * 100 },
  { label: 'Дигитайзинг', value: totalDigitizingCost, color: 'bg-indigo-500', percentage: (totalDigitizingCost / totalCostBeforeDiscount) * 100 },
  { label: 'Подготовка/Настройка', value: totalSetupCost, color: 'bg-blue-500', percentage: (totalSetupCost / totalCostBeforeDiscount) * 100 },
  { label: 'Доп. цвета нитей', value: totalExtraColorsCost, color: 'bg-amber-500', percentage: (totalExtraColorsCost / totalCostBeforeDiscount) * 100 },
  { label: 'Материалы со склада', value: materialsCost, color: 'bg-cyan-500', percentage: (materialsCost / totalCostBeforeDiscount) * 100 }
 ].filter(s => s.value > 0)

 return (
  <Card className="p-6 border-slate-200 shadow-sm bg-white overflow-hidden">
   <div className="flex items-center justify-between mb-6">
    <h4 className="text-xs font-black text-slate-400">Структура расходов</h4>
    <div className="flex items-baseline gap-1">
     <span className="text-xs font-bold text-slate-400">Всего:</span>
     <span className="text-sm font-black text-slate-900">{formatCurrency(totalCostBeforeDiscount)}</span>
    </div>
   </div>

   <div className="space-y-3">
    {/* Визуальная шкала */}
    <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
     {segments.map((segment, idx) => (
      <div
       key={idx}
       className={`${segment.color} transition-all duration-1000 ease-out`}
       style={{ width: `${segment.percentage}%` }}
       title={`${segment.label}: ${segment.percentage.toFixed(1)}%`}
      />
     ))}
    </div>

    {/* Легенда и детали */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     {segments.map((segment, idx) => (
      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-colors">
       <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${segment.color}`} />
        <span className="text-xs font-bold text-slate-600 ">{segment.label}</span>
       </div>
       <div className="text-right">
        <p className="text-sm font-black text-slate-900 leading-none">{formatCurrency(segment.value)}</p>
        <p className="text-xs font-bold text-slate-400 leading-none mt-1">{segment.percentage.toFixed(1)}%</p>
       </div>
      </div>
     ))}
    </div>

    {/* Скидка если есть */}
    {discountAmount > 0 && (
     <div className="pt-4 border-t border-slate-100">
       <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-black">Общая скидка за тираж</span>
        </div>
        <span className="text-lg font-black italic">-{formatCurrency(discountAmount)}</span>
       </div>
     </div>
    )}
   </div>
  </Card>
 )
})
