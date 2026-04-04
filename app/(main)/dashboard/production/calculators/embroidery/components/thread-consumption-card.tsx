'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Droplets, Info } from 'lucide-react'
import { Tooltip } from "@/components/ui/tooltip"
import { type EmbroideryCalculationResult } from '../../types'

interface ThreadConsumptionCardProps {
  result: EmbroideryCalculationResult
}

export const ThreadConsumptionCard = memo(function ThreadConsumptionCard({
  result
}: ThreadConsumptionCardProps) {
  const { totalThreadConsumption, totalStitches } = result

  // Примерный расчет катушек (одна катушка ~5000 метров, но мы считаем в метрах)
  // Для простоты покажем общий метраж
  
  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 text-slate-50">
        <Droplets className="w-24 h-24 rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black text-slate-400">Расход материалов</h4>
            <Tooltip content={
              <p className="text-xs font-bold leading-relaxed text-white bg-slate-900 border-none p-3 rounded-xl shadow-2xl">
                Расчет метража нити основан на общей сумме стежков с учетом натяжения и холостых переходов (в среднем 5-6 метров на 1000 стежков).
              </p>
            }>
               <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 leading-none">Общий метраж</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 ">
                {Math.round(totalThreadConsumption).toLocaleString()}
              </span>
              <span className="text-lg font-bold text-slate-400 ">метра</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 leading-none">Нагрузка (стежков)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 ">
                {(totalStitches / 1000).toFixed(1)}
              </span>
              <span className="text-lg font-bold text-slate-400 ">K</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
           <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                 <Droplets className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-sm font-black text-indigo-900  leading-tight">Запас материалов</p>
                 <p className="text-xs font-bold text-indigo-600 mt-1">Рекомендуется иметь запас +15% при вышивке сложных макетов</p>
              </div>
           </div>
        </div>
      </div>
    </Card>
  )
})
