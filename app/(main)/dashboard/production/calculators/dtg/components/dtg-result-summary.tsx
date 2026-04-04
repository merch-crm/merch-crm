'use client'

import { useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Shirt, 
  Printer, 
  Hand, 
  Droplets,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { type DtgCalculationResult } from '../../types'

interface DtgResultSummaryProps {
  result: DtgCalculationResult
}

export const DtgResultSummary = memo(function DtgResultSummary({
  result
}: DtgResultSummaryProps) {
  
  const breakdown = useMemo(() => {
    const total = result.totalCost
    if (total === 0) return []

    const items = [
      {
        label: 'Заготовки',
        value: result.totalGarmentCost,
        percent: (result.totalGarmentCost / total) * 100,
        icon: Shirt,
        color: 'bg-blue-500'
      },
      {
        label: 'Печать',
        value: result.totalPrintCost,
        percent: (result.totalPrintCost / total) * 100,
        icon: Printer,
        color: 'bg-purple-500'
      },
      {
        label: 'Работа',
        value: result.totalWorkCost,
        percent: (result.totalWorkCost / total) * 100,
        icon: Hand,
        color: 'bg-green-500'
      }
    ]

    if (result.totalPrimerCost > 0) {
      items.push({
        label: 'Праймер',
        value: result.totalPrimerCost,
        percent: (result.totalPrimerCost / total) * 100,
        icon: Droplets,
        color: 'bg-amber-500'
      })
    }

    return (items || []).filter(item => item.value > 0)
  }, [result])

  return (
    <Card className="overflow-hidden border-slate-200 shadow-xl rounded-[32px] bg-white">
      {/* Заголовок с градиентом */}
      <div className="p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calculator className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-bold mb-2">Общая себестоимость DTG</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <p className="text-5xl font-black">
                    {formatCurrency(result.totalCost)}
                </p>
                <div className="flex items-center gap-2 mb-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <span className="text-xs font-black  text-white/80">В среднем:</span>
                    <span className="text-lg font-black">{formatCurrency(result.avgCostPerItem)}</span>
                </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-2">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Shirt className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/60 leading-none mb-1">Изделий</p>
                        <p className="font-black leading-none">{result.totalQuantity} шт</p>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Printer className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/60 leading-none mb-1">Технология</p>
                        <p className="font-black leading-none">DTG Direct</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Разбивка */}
          <div className="p-8 space-y-3 border-r border-slate-100">
            <h4 className="text-xs font-black text-slate-400">Структура себестоимости</h4>
            <div className="space-y-3">
            {breakdown.map((item, index) => {
                const Icon = item.icon
                return (
                <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm", item.color.replace('bg-', 'bg-').replace('-500', '-50'), item.color.replace('bg-', 'text-'))}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-black text-slate-800">{item.label}</span>
                            <p className="text-xs font-bold text-slate-400 ">{item.percent.toFixed(1)}% от чека</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{formatCurrency(item.value)}</span>
                    </div>
                    </div>
                    <Progress value={item.percent} className="h-2 rounded-full bg-slate-100" />
                </div>
                )
            })}
            </div>
          </div>

          {/* Детализация по изделиям */}
          <div className="p-8 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-400 mb-6">Детализация по позициям</h4>
            
            <div className="space-y-3">
            {(result?.items || []).map((item, index) => (
                <div 
                key={index}
                className={cn(
                    "p-4 rounded-[24px] flex items-center justify-between border shadow-sm transition-all hover:scale-[1.02]",
                    item.garmentColor === 'dark' ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
                )}
                >
                <div className="flex items-center gap-3">
                    <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                    item.garmentColor === 'dark' ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600"
                    )}>
                    <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                    <p className="font-black text-sm">{item.garment.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold  opacity-60">{item.quantity} шт</span>
                        <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                        <span className="text-xs font-bold  opacity-60">{item.positions.length} поз.</span>
                    </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="font-black text-base">{formatCurrency(item.totalCost)}</p>
                    <p className="text-xs font-bold  opacity-60">{formatCurrency(item.costPerItem)} / шт</p>
                </div>
                </div>
            ))}
            </div>
          </div>
      </div>
    </Card>
  )
})
