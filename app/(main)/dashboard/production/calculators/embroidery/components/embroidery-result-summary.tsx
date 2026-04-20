'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingDown, Sparkles, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { type EmbroideryCalculationResult } from '../../types'

interface EmbroideryResultSummaryProps {
 result: EmbroideryCalculationResult
}

interface EmbroideryOrderData {
 quantity: number;
 garment: { name: string };
 totalEmbroideryPrice: number;
 garmentCost: number;
 extraColorsCost: number;
 totalCost: number;
 costPerItem: number;
}

export const EmbroideryResultSummary = memo(function EmbroideryResultSummary({
 result
}: EmbroideryResultSummaryProps) {
 return (
  <Card className="border-none shadow-2xl overflow-hidden bg-white">
   <div className="relative">
     {/* Фоновый градиент для акцента */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
    
    <div className="p-8 relative">
     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="space-y-2">
       <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
        <span className="text-sm font-black text-slate-400">Итоговая себестоимость</span>
       </div>
       <div className="flex items-baseline gap-3">
        <p className="text-6xl font-black text-slate-900 ">
         {formatCurrency(result.totalCost)}
        </p>
        {result.discountPercent > 0 && (
         <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-1.5 rounded-full text-base font-black">
          <TrendingDown className="w-5 h-5 mr-2" />
          -{result.discountPercent}% СКИДКА
         </Badge>
        )}
       </div>
       <div className="flex items-center gap-2 text-xl font-bold text-pink-600 pt-2 ">
        <span>{formatCurrency(result.avgCostPerItem)}</span>
        <span className="text-slate-300 font-light">/ средняя за ед.</span>
       </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
       <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400">
         <Calculator className="w-4 h-4" />
         <span className="text-xs font-black leading-none">Изделий</span>
        </div>
        <p className="text-3xl font-black text-slate-800 ">{result.totalQuantity}<span className="text-lg font-bold ml-1">шт</span></p>
       </div>

       <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400">
         <Sparkles className="w-4 h-4" />
         <span className="text-xs font-black leading-none">Всего стежков</span>
        </div>
        <p className="text-3xl font-black text-slate-800 ">{result.totalStitches.toLocaleString()}</p>
       </div>

       <div className="space-y-1 col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2 text-slate-400">
         <Scissors className="w-4 h-4" />
         <span className="text-xs font-black leading-none">Дигитайзинг</span>
        </div>
        <p className="text-3xl font-black text-slate-800 ">{formatCurrency(result.totalDigitizingCost)}</p>
       </div>
      </div>
     </div>
    </div>
   </div>

   <div className="bg-slate-50 border-t border-slate-100 p-8">
    <h4 className="text-xs font-black text-slate-400 mb-6">Детализация по типам изделий</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
     {((result?.orders as unknown as EmbroideryOrderData[]) || []).map((order, index: number) => (
      <div 
       key={index}
       className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-pink-200 transition-colors group"
      >
       <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
          {order.quantity}
         </div>
         <div>
          <p className="font-bold text-slate-900 leading-none mb-1">{order.garment.name}</p>
          <p className="text-xs font-black text-slate-400">Тираж изделия</p>
         </div>
        </div>
       </div>
       
       <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
         <span className="text-slate-500 font-medium">Работа (вышивка):</span>
         <span className="font-bold text-slate-900">{formatCurrency(order.totalEmbroideryPrice)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
         <span className="text-slate-500 font-medium">Заготовки:</span>
         <span className="font-bold text-slate-900">{formatCurrency(order.garmentCost)}</span>
        </div>
        {order.extraColorsCost > 0 && (
          <div className="flex justify-between items-center text-sm text-amber-600">
          <span className="font-bold underline">Доплата за цвета:</span>
          <span className="font-black">+{formatCurrency(order.extraColorsCost)}</span>
         </div>
        )}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
         <span className="text-lg font-black text-slate-900 ">
          {formatCurrency(order.totalCost)}
         </span>
         <Badge color="purple" variant="outline" className="text-xs font-black bg-pink-50 text-pink-600 border-pink-100">
          {formatCurrency(order.costPerItem)} / шт
         </Badge>
        </div>
       </div>
      </div>
     ))}
    </div>
   </div>
  </Card>
 )
})
