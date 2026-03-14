'use client'

import { useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Scissors, 
  Ruler, 
  Package,
  Info
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { SUBLIMATION_FABRIC_PRICES } from '../../types'
import { Select } from '@/components/ui/select'

interface FabricCalculatorProps {
  params: {
    fabricType: string
    widthM: number
    lengthM: number
    quantity: number
  }
  onChange: (params: {
    fabricType: string
    widthM: number
    lengthM: number
    quantity: number
  }) => void
}

const fabricTypeOptions = Object.entries(SUBLIMATION_FABRIC_PRICES).map(([key, price]) => ({
    id: key,
    title: fabricTypeLabels[key] || key,
    description: `${price} ₽/м²`
}))

const fabricTypeLabels: Record<string, string> = {
    'polyester-basic': 'Полиэстер базовый',
    'polyester-premium': 'Полиэстер премиум',
    'satin': 'Атлас',
    'flag-fabric': 'Флаговая ткань',
    'jersey': 'Трикотаж'
}

export const FabricCalculator = memo(function FabricCalculator({
  params,
  onChange
}: FabricCalculatorProps) {
  
  const handleFabricTypeChange = useCallback((value: string) => {
    onChange({ ...params, fabricType: value })
  }, [params, onChange])

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...params, widthM: parseFloat(e.target.value) || 0 })
  }, [params, onChange])

  const handleLengthChange = useCallback((values: number[]) => {
    onChange({ ...params, lengthM: values[0] })
  }, [params, onChange])

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...params, quantity: parseInt(e.target.value) || 1 })
  }, [params, onChange])

  // Расчёты
  const calculations = useMemo(() => {
    const areaM2 = params.widthM * params.lengthM
    const totalAreaM2 = areaM2 * params.quantity
    const pricePerM2 = SUBLIMATION_FABRIC_PRICES[params.fabricType] || 0
    const fabricCost = totalAreaM2 * pricePerM2

    return {
      areaM2,
      totalAreaM2,
      pricePerM2,
      fabricCost
    }
  }, [params])

  return (
    <div className="space-y-3">
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-violet-500" />
                Параметры ткани
            </h3>
            <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-none">
                {calculations.totalAreaM2.toFixed(2)} м² итого
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Тип ткани */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Тип ткани
                </label>
                <Select
                    value={params.fabricType}
                    onChange={handleFabricTypeChange}
                    options={fabricTypeOptions}
                    triggerClassName="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              {/* Размеры */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    Ширина (м)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={params.widthM}
                      onChange={handleWidthChange}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="bg-slate-50 border-slate-200 rounded-xl h-10 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      М
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">
                    Кол-во отрезов
                  </label>
                  <Input
                    type="number"
                    value={params.quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={100}
                    className="bg-slate-50 border-slate-200 rounded-xl h-10"
                  />
                </div>
              </div>
          </div>

          {/* Длина слайдер */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5" />
                Длина одного отреза
              </label>
              <div className="text-sm font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                {params.lengthM.toFixed(1)} м
              </div>
            </div>
            <Slider
              value={[params.lengthM]}
              onValueChange={handleLengthChange}
              min={0.1}
              max={10}
              step={0.1}
              className="py-2"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>0.1 м</span>
              <span>2 м</span>
              <span>4 м</span>
              <span>6 м</span>
              <span>8 м</span>
              <span>10 м</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Результат ткани */}
      <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                      <p className="text-xs font-bold text-slate-500 tracking-tight">Тип ткани</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{fabricTypeLabels[params.fabricType]}</p>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 tracking-tight">Цена за м²</p>
                      <p className="text-xs font-bold text-slate-900">{formatCurrency(calculations.pricePerM2)}</p>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 tracking-tight">Общая площадь</p>
                      <p className="text-xs font-bold text-slate-900">{calculations.totalAreaM2.toFixed(2)} м²</p>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 tracking-tight">Итого за ткань</p>
                      <p className="text-sm font-black text-violet-700">{formatCurrency(calculations.fabricCost)}</p>
                  </div>
              </div>
          </div>
          <div className="px-4 py-2 bg-violet-600/5 border-t border-violet-100 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-violet-500" />
              <p className="text-xs font-medium text-violet-700 leading-tight">
                  Стоимость печати (бумага + чернила) будет добавлена при основном расчете.
              </p>
          </div>
      </Card>
    </div>
  )
})
