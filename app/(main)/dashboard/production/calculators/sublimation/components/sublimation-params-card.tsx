'use client'

import { useCallback, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ruler, ArrowLeftRight, Space } from 'lucide-react'
import { type CalculatorParams, ROLL_WIDTH_OPTIONS } from '../../types'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface SublimationParamsCardProps {
 params: CalculatorParams
 onChange: (updates: Partial<CalculatorParams>) => void
}

export const SublimationParamsCard = memo(function SublimationParamsCard({
 params,
 onChange
}: SublimationParamsCardProps) {
 const rollWidthOptions = ROLL_WIDTH_OPTIONS.sublimation.map(opt => ({
   id: opt.value.toString(),
   title: opt.label,
 }));

 const handleRollWidthChange = useCallback((value: string) => {
  onChange({ rollWidthMm: parseInt(value) })
 }, [onChange])

 const handleEdgeMarginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  onChange({ edgeMarginMm: parseInt(e.target.value) || 0 })
 }, [onChange])

 const handlePrintGapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  onChange({ printGapMm: parseInt(e.target.value) || 0 })
 }, [onChange])

 const workingWidth = params.rollWidthMm - params.edgeMarginMm * 2

 return (
  <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
   <div className="p-4 sm:p-6 space-y-3">
    <div className="flex items-center justify-between">
     <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
      <Ruler className="w-4 h-4 text-primary" />
      Параметры бумаги
     </h3>
     <Badge className="bg-slate-100 text-slate-600 border-none" color="gray">
      Рабочая ширина: {workingWidth} мм
     </Badge>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
     {/* Ширина рулона */}
     <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 ml-1">
       Ширина рулона
      </label>
      <Select value={params.rollWidthMm.toString()} onChange={handleRollWidthChange} options={rollWidthOptions} triggerClassName="bg-slate-50 border-slate-200 rounded-xl" />
     </div>

     {/* Отступ от края */}
     <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
       <ArrowLeftRight className="w-3.5 h-3.5" />
       Отступ от края (мм)
      </label>
      <Input type="number" value={params.edgeMarginMm} onChange={handleEdgeMarginChange} min={0} max={50} className="bg-slate-50 border-slate-200 rounded-xl focus:ring-primary/20" />
     </div>

     {/* Зазор между принтами */}
     <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
       <Space className="w-3.5 h-3.5" />
       Зазор (мм)
      </label>
      <Input type="number" value={params.printGapMm} onChange={handlePrintGapChange} min={0} max={20} className="bg-slate-50 border-slate-200 rounded-xl focus:ring-primary/20" />
     </div>
    </div>
   </div>
  </Card>
 )
})
