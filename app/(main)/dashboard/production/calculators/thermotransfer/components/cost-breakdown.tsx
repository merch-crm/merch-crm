'use client'

import { Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'

import { PrintApplicationResult } from '../../types'

interface CostBreakdownProps {
 result: PrintApplicationResult
}

export function CostBreakdown({ result }: CostBreakdownProps) {
 const subtotal = result.garmentsCost + result.printsCost + result.workCost + result.setupCost
 
 const segments = [
  { label: 'Изделия', value: result.garmentsCost, color: 'bg-blue-500' },
  { label: 'Принты', value: result.printsCost, color: 'bg-indigo-500' },
  { label: 'Работа', value: result.workCost, color: 'bg-violet-500' },
  { label: 'Настройка', value: result.setupCost, color: 'bg-slate-500' },
 ].filter(s => s.value > 0)

 return (
  <Card>
   <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium flex items-center gap-2">
     Распределение стоимости
     <Tooltip content="Детализация затрат на изделия, покупку принтов, работу по их нанесению и настройку оборудования">
      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
     </Tooltip>
    </CardTitle>
   </CardHeader>
   
   <CardContent className="space-y-3">
    {/* Прогресс-бар с сегментами */}
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
     {segments.map((segment, idx) => (
      <div
       key={idx}
       className={segment.color}
       style={{ width: `${(segment.value / subtotal) * 100}%` }}
      />
     ))}
    </div>

    {/* Легенда */}
    <div className="space-y-2">
     {segments.map((segment, idx) => (
      <div key={idx} className="flex items-center justify-between text-sm">
       <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${segment.color}`} />
        <span className="text-muted-foreground">{segment.label}</span>
       </div>
       <span className="font-medium">
        {segment.value.toLocaleString('ru-RU')} ₽
       </span>
      </div>
     ))}
     
     {result.quantityDiscount > 0 && (
      <div className="flex items-center justify-between text-sm pt-2 border-t text-green-600">
       <span className="font-medium">Скидка за объём</span>
       <span className="font-bold">
        -{result.quantityDiscount.toLocaleString('ru-RU')} ₽
       </span>
      </div>
     )}
    </div>
   </CardContent>
  </Card>
 )
}
