'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { 
 Plus, 
 Trash2, 
 GripVertical,
 AlertCircle,
 Ruler
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { 
 type MeterPriceTierData, 
 type ApplicationType,
 type RollWidthOption,
 ROLL_WIDTH_OPTIONS 
} from '../types'

interface MeterPricingEditorProps {
 tiers: MeterPriceTierData[]
 applicationType: ApplicationType
 onUpdate: (tiers: MeterPriceTierData[]) => void
 isLoading?: boolean
}

interface TierRowProps {
 tier: MeterPriceTierData
 index: number
 isLast: boolean
 onUpdate: (index: number, updates: Partial<MeterPriceTierData>) => void
 onDelete: (index: number) => void
 canDelete: boolean
}

const TierRow = memo(function TierRow({ 
 tier, 
 index, 
 isLast: _isLast,
 onUpdate, 
 onDelete,
 canDelete 
}: TierRowProps) {
 const handleFromChange = useCallback((value: string) => {
  const numValue = parseFloat(value) || 0
  onUpdate(index, { fromMeters: numValue })
 }, [index, onUpdate])

 const handleToChange = useCallback((value: string) => {
  const numValue = value === '' || value === '∞' ? null : parseFloat(value)
  onUpdate(index, { toMeters: numValue })
 }, [index, onUpdate])

 const handlePriceChange = useCallback((value: string) => {
  const numValue = parseFloat(value) || 0
  onUpdate(index, { pricePerMeter: numValue })
 }, [index, onUpdate])

 const handleDelete = useCallback(() => {
  onDelete(index)
 }, [index, onDelete])

 return (
  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
   <div className="cursor-move text-slate-400 hover:text-slate-600">
    <GripVertical className="w-4 h-4" />
   </div>
   
   <div className="flex-1 grid grid-cols-3 gap-2">
    <div className="relative">
     <Input type="number" value={tier.fromMeters} onChange={(e) => handleFromChange(e.target.value)}
      className="pr-8 text-sm"
      min={0}
      step={0.1}
     />
     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
      м
     </span>
    </div>
    
    <div className="relative">
     <Input type="text" value={tier.toMeters === null ? '∞' : String(tier.toMeters)} onChange={(e) => handleToChange(e.target.value)}
      className="pr-8 text-sm"
      placeholder="∞"
     />
     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
      м
     </span>
    </div>
    
    <div className="relative">
     <Input type="number" value={tier.pricePerMeter} onChange={(e) => handlePriceChange(e.target.value)}
      className="pr-10 text-sm font-medium"
      min={0}
      step={10}
     />
     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
      ₽/м
     </span>
    </div>
   </div>

   <Button variant="ghost" color="gray" size="sm" onClick={handleDelete} disabled={!canDelete} className={cn( "opacity-0 group-hover:opacity-100 transition-opacity", !canDelete && "invisible" )}>
    <Trash2 className="w-4 h-4 text-red-500" />
   </Button>
  </div>
 )
})

export const MeterPricingEditor = memo(function MeterPricingEditor({
 tiers,
 applicationType,
 onUpdate,
 isLoading
}: MeterPricingEditorProps) {
 const [selectedRollWidth, setSelectedRollWidth] = useState<number>(
  tiers[0]?.rollWidthMm || ROLL_WIDTH_OPTIONS[applicationType][0]?.value || 300
 )

 // Фильтруем тиры по выбранной ширине рулона
 const filteredTiers = useMemo(() => 
  tiers
   .filter(t => t.rollWidthMm === selectedRollWidth)
   .sort((a, b) => a.fromMeters - b.fromMeters),
  [tiers, selectedRollWidth]
 )

 const rollWidthOptions = useMemo(() => 
  ROLL_WIDTH_OPTIONS[applicationType].map((opt: RollWidthOption) => ({
   id: opt.value.toString(),
   title: opt.label
  })),
  [applicationType]
 )

 // Уникальные ширины в текущих данных
 const existingWidths = useMemo(() => 
  [...new Set(tiers.map(t => t.rollWidthMm))],
  [tiers]
 )

 const handleTierUpdate = useCallback((index: number, updates: Partial<MeterPriceTierData>) => {
  const tierIndex = tiers.findIndex(t => 
   t.rollWidthMm === selectedRollWidth && 
   t.fromMeters === filteredTiers[index].fromMeters
  )
  
  if (tierIndex === -1) return

  const newTiers = [...tiers]
  newTiers[tierIndex] = { ...newTiers[tierIndex], ...updates }
  
  // Автоматически корректируем границы
  const sameSizeTiers = newTiers
   .filter(t => t.rollWidthMm === selectedRollWidth)
   .sort((a, b) => a.fromMeters - b.fromMeters)
  
  // Обновляем toMeters предыдущего тира
  for (let i = 0; i < sameSizeTiers.length - 1; i++) {
   const current = sameSizeTiers[i]
   const next = sameSizeTiers[i + 1]
   const currentIdx = newTiers.findIndex(t => 
    t.rollWidthMm === current.rollWidthMm && 
    t.fromMeters === current.fromMeters
   )
   if (currentIdx !== -1) {
    newTiers[currentIdx].toMeters = next.fromMeters
   }
  }
  
  // Последний тир всегда ∞
  const lastIdx = newTiers.findIndex(t => 
   t.rollWidthMm === selectedRollWidth && 
   t.fromMeters === sameSizeTiers[sameSizeTiers.length - 1].fromMeters
  )
  if (lastIdx !== -1) {
   newTiers[lastIdx].toMeters = null
  }

  onUpdate(newTiers)
 }, [tiers, filteredTiers, selectedRollWidth, onUpdate])

 const handleTierDelete = useCallback((index: number) => {
  const tierToDelete = filteredTiers[index]
  const newTiers = tiers.filter(t => 
   !(t.rollWidthMm === tierToDelete.rollWidthMm && 
    t.fromMeters === tierToDelete.fromMeters)
  )
  onUpdate(newTiers)
 }, [tiers, filteredTiers, onUpdate])

 const handleAddTier = useCallback(() => {
  const lastTier = filteredTiers[filteredTiers.length - 1]
  const newFromMeters = lastTier ? (lastTier.toMeters || lastTier.fromMeters + 10) : 0
  
  const newTier: MeterPriceTierData = {
   id: `temp-${Date.now()}`, // suppressHydrationWarning
   applicationType,
   rollWidthMm: selectedRollWidth,
   fromMeters: newFromMeters,
   toMeters: null,
   pricePerMeter: lastTier ? Math.round(lastTier.pricePerMeter * 0.85) : 1000,
   sortOrder: filteredTiers.length,
   isActive: true
  }

  // Обновляем предыдущий тир
  const newTiers = [...tiers]
  if (lastTier) {
   const lastIdx = newTiers.findIndex(t => 
    t.rollWidthMm === lastTier.rollWidthMm && 
    t.fromMeters === lastTier.fromMeters
   )
   if (lastIdx !== -1) {
    newTiers[lastIdx].toMeters = newFromMeters
   }
  }

  onUpdate([...newTiers, newTier])
 }, [tiers, filteredTiers, applicationType, selectedRollWidth, onUpdate])

 const handleRollWidthChange = useCallback((value: string) => {
  setSelectedRollWidth(parseInt(value))
 }, [])

 // Валидация
 const validationErrors = useMemo(() => {
  const errors: string[] = []
  
  if (filteredTiers.length === 0) {
   errors.push('Добавьте хотя бы один ценовой уровень')
  }

  const hasGaps = filteredTiers.some((tier, i) => {
   if (i === 0 && tier.fromMeters !== 0) return true
   if (i > 0 && filteredTiers[i - 1].toMeters !== tier.fromMeters) return true
   return false
  })

  if (hasGaps) {
   errors.push('Обнаружены пропуски в диапазонах')
  }

  return errors
 }, [filteredTiers])

 return (
  <div className="space-y-3">
   {/* Выбор ширины рулона */}
   <div className="flex items-center gap-3">
    <div className="flex items-center gap-2 text-sm text-slate-600">
     <Ruler className="w-4 h-4" />
     <span>Ширина рулона:</span>
    </div>
    <Select value={selectedRollWidth.toString()} onChange={handleRollWidthChange} options={rollWidthOptions} className="w-40" />

    {existingWidths.length > 1 && (
     <div className="flex gap-1.5 ml-auto">
      {existingWidths.map(width => (
       <Badge key={width} color={width === selectedRollWidth ? 'purple' : 'gray'} className="cursor-pointer" onClick={() => setSelectedRollWidth(width)}
       >
        {width} мм
       </Badge>
      ))}
     </div>
    )}
   </div>

   {/* Заголовки столбцов */}
   <div className="grid grid-cols-[32px_1fr_32px] gap-2 px-3">
    <div />
    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-500">
     <span>От (м)</span>
     <span>До (м)</span>
     <span>Цена за метр</span>
    </div>
    <div />
   </div>

   {/* Список тиров */}
   <div className="space-y-2">
    {filteredTiers.map((tier, index) => (
     <TierRow key={`${tier.rollWidthMm}-${tier.fromMeters}`} tier={tier} index={index} isLast={index === filteredTiers.length - 1} onUpdate={handleTierUpdate} onDelete={handleTierDelete} canDelete={filteredTiers.length> 1}
     />
    ))}
   </div>

   {/* Ошибки валидации */}
   {validationErrors.length > 0 && (
    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
     <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
     <div className="space-y-1">
      {validationErrors.map((error, i) => (
       <p key={i}>{error}</p>
      ))}
     </div>
    </div>
   )}

   {/* Кнопка добавления */}
   <Button variant="outline" color="gray" size="sm" onClick={handleAddTier} disabled={isLoading} className="w-full rounded-xl">
    <Plus className="w-4 h-4 mr-2" />
    Добавить уровень цены
   </Button>

   {/* Превью шкалы */}
   <Card className="p-4 bg-slate-50">
    <p className="text-xs font-medium text-slate-500 mb-3">Превью ценовой шкалы</p>
    <div className="flex gap-1">
     {filteredTiers.map((tier, i) => {
      const width = tier.toMeters 
       ? Math.min((tier.toMeters - tier.fromMeters) * 5, 100)
       : 60
      return (
       <div
        key={i}
        className="relative h-8 rounded-md flex items-center justify-center text-xs font-medium text-white"
        style={{ 
         width: `${width}px`,
         backgroundColor: `hsl(${260 - i * 30}, 70%, ${50 + i * 5}%)`
        }}
       >
        {formatCurrency(tier.pricePerMeter)}
       </div>
      )
     })}
    </div>
   </Card>
  </div>
 )
})
