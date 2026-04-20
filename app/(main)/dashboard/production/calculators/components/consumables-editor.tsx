'use client'

import { useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
 Droplet, 
 Wind, 
 FileText,
 Percent,
 AlertTriangle,
 Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ConsumablesConfigData, type ApplicationType } from '../types'

interface ConsumablesEditorProps {
 config: ConsumablesConfigData
 applicationType: ApplicationType
 onUpdate: (config: ConsumablesConfigData) => void
 isLoading?: boolean
}

interface ConsumableFieldProps {
 label: string
 icon: React.ReactNode
 value: number
 unit: string
 description?: string
 onChange: (value: number) => void
 min?: number
 max?: number
 step?: number
 color?: string
}

const ConsumableField = memo(function ConsumableField({
 label,
 icon,
 value,
 unit,
 description,
 onChange,
 min = 0,
 max = 100,
 step = 0.1,
 color = 'slate'
}: ConsumableFieldProps) {
 const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = parseFloat(e.target.value) || 0
  onChange(Math.max(min, Math.min(max, newValue)))
 }, [onChange, min, max])

 return (
  <div className="space-y-2">
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      color === 'cyan' && "bg-cyan-100 text-cyan-600",
      color === 'violet' && "bg-violet-100 text-violet-600",
      color === 'amber' && "bg-amber-100 text-amber-600",
      color === 'emerald' && "bg-emerald-100 text-emerald-600",
      color === 'slate' && "bg-slate-100 text-slate-600"
     )}>
      {icon}
     </div>
     <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    <div className="relative w-32">
     <Input type="number" value={value} onChange={handleChange} className="pr-12 text-sm text-right font-medium" min={min} max={max} step={step} />
     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 select-none bg-white pl-1 pointer-events-none">
      {unit}
     </span>
    </div>
   </div>
   {description && (
    <p suppressHydrationWarning className="text-xs text-slate-500 ml-10">{description}</p>
   )}
  </div>
 )
})

interface PercentSliderProps {
 label: string
 value: number
 onChange: (value: number) => void
 description?: string
 color?: 'green' | 'amber' | 'red'
}

const PercentSlider = memo(function PercentSlider({
 label,
 value,
 onChange,
 description,
 color = 'green'
}: PercentSliderProps) {
 const handleChange = useCallback((values: number[]) => {
  onChange(values[0])
 }, [onChange])

 return (
  <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
   <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <Badge className={cn( "font-mono", color === 'green' && "bg-green-100 text-green-700", color === 'amber' && "bg-amber-100 text-amber-700", color === 'red' && "bg-red-100 text-red-700" )} color="gray">
     {value}%
    </Badge>
   </div>
   
   <Slider value={[value]} onValueChange={handleChange} min={0} max={100} step={5} className={cn( color === 'green' && "[&_[role=slider]]:bg-green-500", color === 'amber' && "[&_[role=slider]]:bg-amber-500", color === 'red' && "[&_[role=slider]]:bg-red-500" )} />
   
   {description && (
    <p suppressHydrationWarning className="text-xs text-slate-500">{description}</p>
   )}
  </div>
 )
})

export const ConsumablesEditor = memo(function ConsumablesEditor({
 config,
 applicationType: _applicationType,
 onUpdate,
 isLoading: _isLoading
}: ConsumablesEditorProps) {
 const handleFieldChange = useCallback((field: keyof ConsumablesConfigData, value: number) => {
  onUpdate({ ...config, [field]: value })
 }, [config, onUpdate])

 // Расчёт примерной стоимости материалов на 1 м²
 const estimatedCostPerM2 = useMemo(() => {
  // Примерные цены за единицу
  const inkWhitePrice = 3 // ₽/мл
  const inkCmykPrice = 2.5 // ₽/мл
  const powderPrice = 0.5 // ₽/г
  const paperPrice = 50 // ₽/м²

  const inkCost = ((config.inkWhitePerM2 || 0) * inkWhitePrice + (config.inkCmykPerM2 || 0) * inkCmykPrice)
  const powderCost = (config.powderPerM2 || 0) * powderPrice
  const paperCost = (config.paperPerM2 || 0) * paperPrice
  
  const subtotal = inkCost + powderCost + paperCost
  const withFill = subtotal * (config.fillPercent / 100)
  const withWaste = withFill * (1 + config.wastePercent / 100)

  return Math.round(withWaste)
 }, [config])

 return (
  <div className="space-y-3">
   {/* Расход чернил */}
   <div className="space-y-3">
    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
     <Droplet className="w-4 h-4" />
     Расход чернил
    </h4>
    
    <div className="grid gap-3">
     <ConsumableField label="Белые чернила" icon={<Droplet className="w-4 h-4" />}
      value={config.inkWhitePerM2 || 0}
      unit="мл/м²"
      description="Подложка под цветную печать"
      onChange={(v) => handleFieldChange('inkWhitePerM2', v)}
      min={0}
      max={50}
      step={0.5}
      color="cyan"
     />
     
     <ConsumableField label="CMYK чернила" icon={<Droplet className="w-4 h-4" />}
      value={config.inkCmykPerM2 || 0}
      unit="мл/м²"
      description="Цветная печать"
      onChange={(v) => handleFieldChange('inkCmykPerM2', v)}
      min={0}
      max={50}
      step={0.5}
      color="violet"
     />
    </div>
   </div>

   {/* Расход материалов */}
   <div className="space-y-3">
    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
     <Wind className="w-4 h-4" />
     Расходные материалы
    </h4>
    
    <div className="grid gap-3">
     <ConsumableField label="Клей-порошок" icon={<Wind className="w-4 h-4" />}
      value={config.powderPerM2 || 0}
      unit="г/м²"
      description="Термоклей для фиксации"
      onChange={(v) => handleFieldChange('powderPerM2', v)}
      min={0}
      max={100}
      step={1}
      color="amber"
     />
     
     <ConsumableField label="Плёнка/бумага" icon={<FileText className="w-4 h-4" />}
      value={config.paperPerM2 || 0}
      unit="м²/м²"
      description="Коэффициент расхода носителя"
      onChange={(v) => handleFieldChange('paperPerM2', v)}
      min={1}
      max={2}
      step={0.05}
      color="emerald"
     />
    </div>
   </div>

   {/* Коэффициенты */}
   <div className="space-y-3">
    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
     <Percent className="w-4 h-4" />
     Коэффициенты
    </h4>
    
    <div className="grid gap-3">
     <PercentSlider label="Заполнение макета" value={config.fillPercent} onChange={(v) => handleFieldChange('fillPercent', v)}
      description="Средний процент заполнения площади чернилами"
      color="green"
     />
     
     <PercentSlider label="Запас на отходы" value={config.wastePercent} onChange={(v) => handleFieldChange('wastePercent', v)}
      description="Брак, тестовые отпечатки, настройка оборудования"
      color="amber"
     />
    </div>
   </div>

   {/* Калькуляция */}
   <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
    <div className="flex items-center justify-between mb-3">
     <span className="text-sm font-medium text-slate-700">
      Примерная стоимость материалов
     </span>
     <Badge className="bg-primary text-white">
      ≈ {estimatedCostPerM2} ₽/м²
     </Badge>
    </div>
    
    <div className="text-xs text-slate-500 flex items-start gap-2">
     <Info className="w-4 h-4 shrink-0 mt-0.5" />
     <span>
      Расчёт на основе средних цен на расходники. 
      Фактическая стоимость может отличаться.
     </span>
    </div>
   </Card>

   {/* Предупреждение о высоких значениях */}
   {(config.wastePercent > 20 || config.fillPercent > 80) && (
    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
     <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
     <div>
      {config.wastePercent > 20 && (
       <p>Высокий процент отходов ({config.wastePercent}%) увеличивает себестоимость</p>
      )}
      {config.fillPercent > 80 && (
       <p>Заполнение {config.fillPercent}% может быть завышено для большинства макетов</p>
      )}
     </div>
    </div>
   )}
  </div>
 )
})
