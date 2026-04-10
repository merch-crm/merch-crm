'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { 
 Trash2, 
 Copy, 
 Plus,
 Minus,
 ChevronDown,
 ChevronUp,
 Sun,
 Moon,
 Shirt,
 X,
 Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { pluralize } from '@/lib/pluralize'
import { 
 DTG_GARMENTS,
 DTG_PRINT_POSITIONS,
 type DtgPrintInput,
 type GarmentColor,
 type DtgPrintPosition
} from '../../dtg-types'

interface DtgOrderCardProps {
 order: DtgPrintInput
 index: number
 onUpdate: (updates: Partial<DtgPrintInput>) => void
 onDelete: () => void
 onDuplicate: () => void
}

export const DtgOrderCard = memo(function DtgOrderCard({
 order,
 index: _index,
 onUpdate,
 onDelete,
 onDuplicate
}: DtgOrderCardProps) {
 const [isExpanded, setIsExpanded] = useState(true)

 const garment = useMemo(() => 
  DTG_GARMENTS.find(g => g.id === order.garmentId),
  [order.garmentId]
 )

 // Доступные позиции для добавления
 const availablePositions = useMemo(() => 
  DTG_PRINT_POSITIONS.filter((pos: DtgPrintPosition) => 
   !order.positions.some((p) => p.positionId === pos.id)
  ).map((pos: DtgPrintPosition) => ({
    id: pos.id,
    title: pos.name,
    description: `До ${pos.maxWidth}×${pos.maxHeight}мм • Стоимость нанесения ${formatCurrency(pos.workPrice)}`
  })),
  [order.positions]
 )

 // Общая площадь печати
 const totalArea = useMemo(() => 
  order.positions.reduce((sum: number, pos: NonNullable<DtgPrintInput['positions']>[number]) => {
   return sum + (pos.widthMm * pos.heightMm) / 100 // в см²
  }, 0),
  [order.positions]
 )

 const handleQuantityChange = useCallback((delta: number) => {
  const newQuantity = Math.max(1, order.quantity + delta)
  onUpdate({ quantity: newQuantity })
 }, [order.quantity, onUpdate])

 const handleColorToggle = useCallback(() => {
  const newColor: GarmentColor = order.garmentColor === 'light' ? 'dark' : 'light'
  onUpdate({ garmentColor: newColor })
 }, [order.garmentColor, onUpdate])

 const handleAddPosition = useCallback((positionId: string) => {
  const position = DTG_PRINT_POSITIONS.find(p => p.id === positionId)
  if (!position) return

  onUpdate({
   positions: [
    ...order.positions,
    {
     positionId,
     widthMm: Math.min(position.maxWidth, garment?.maxPrintWidth || position.maxWidth),
     heightMm: Math.min(position.maxHeight, garment?.maxPrintHeight || position.maxHeight),
     fillPercent: 60
    }
   ]
  })
 }, [order.positions, garment, onUpdate])

 const handleUpdatePosition = useCallback((positionId: string, updates: Partial<typeof order.positions[0]>) => {
  onUpdate({
   positions: order.positions.map(pos => 
    pos.positionId === positionId ? { ...pos, ...updates } : pos
   )
  })
 }, [order, onUpdate])

 const handleRemovePosition = useCallback((positionId: string) => {
  onUpdate({
   positions: order.positions.filter(pos => pos.positionId !== positionId)
  })
 }, [order, onUpdate])

 if (!garment) return null

 return (
  <Card className={cn( "overflow-hidden border-slate-200 shadow-sm rounded-[24px] transition-all", order.garmentColor === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white" )}>
   {/* Заголовок */}
   <div 
    className={cn(
      "p-5 flex items-center gap-3 cursor-pointer",
      order.garmentColor === 'dark' ? "hover:bg-slate-800" : "hover:bg-slate-50"
    )}
    role="button"
    tabIndex={0}
    onClick={() => setIsExpanded(!isExpanded)}
    onKeyDown={(e) => {
     if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsExpanded(!isExpanded)
     }
    }}
   >
    <div className={cn(
     "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
     order.garmentColor === 'dark' ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-600"
    )}>
     <Shirt className="w-6 h-6" />
    </div>

    <div className="flex-1 min-w-0">
     <div className="flex items-center gap-2 mb-0.5">
      <h4 className={cn(
        "font-black text-lg truncate",
        order.garmentColor === 'dark' ? "text-white" : "text-slate-900"
      )}>
        {garment.name}
      </h4>
      <Badge className={cn( "rounded-full font-bold text-xs px-2", order.garmentColor === 'dark' ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-amber-50 text-amber-600 border-amber-100" )}>
       {order.garmentColor === 'dark' ? 'Тёмное' : 'Светлое'}
      </Badge>
     </div>
     <p className={cn(
       "text-sm font-bold",
       order.garmentColor === 'dark' ? "text-slate-400" : "text-slate-500"
     )}>
      {order.positions.length} {pluralize(order.positions.length, 'позиция', 'позиции', 'позиций')} • {totalArea.toFixed(0)} см² площадь
     </p>
    </div>

    {/* Количество */}
    <div role="button" tabIndex={0} className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl" onClick={e => e.stopPropagation()}>
     <Button variant="ghost" color="neutral" size="sm" onClick={() => handleQuantityChange(-1)}
      disabled={order.quantity <= 1}
      className="w-8 h-8 p-0 rounded-xl hover:bg-white"
     >
      <Minus className="w-4 h-4" />
     </Button>
     <span className={cn(
       "w-8 text-center font-black text-base",
       order.garmentColor === 'dark' ? "text-white" : "text-slate-900"
     )}>
      {order.quantity}
     </span>
     <Button variant="ghost" color="neutral" size="sm" onClick={() => handleQuantityChange(1)}
      className="w-8 h-8 p-0 rounded-xl hover:bg-white"
     >
      <Plus className="w-4 h-4" />
     </Button>
    </div>

    {/* Действия */}
    <div role="button" tabIndex={0} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
     <Button variant="ghost" color="neutral" size="sm" onClick={onDuplicate} className="rounded-xl">
      <Copy className="w-4 h-4" />
     </Button>
     <Button variant="ghost" color="neutral" size="sm" onClick={onDelete} className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50">
      <Trash2 className="w-4 h-4" />
     </Button>
     <div className="ml-2">
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
     </div>
    </div>
   </div>

   {/* Развёрнутое содержимое */}
   {isExpanded && (
    <div className={cn(
      "px-6 pb-6 pt-2 space-y-3",
      order.garmentColor === 'dark' ? "text-slate-300" : "text-slate-700"
    )}>
     <div className="h-[1px] w-full bg-slate-100/10" />
     
     {/* Переключатель цвета */}
     <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          {order.garmentColor === 'dark' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </div>
        <div>
          <p className="text-sm font-black ">Цвет основы</p>
          <p className="text-xs text-slate-500">Влияет на расход белого и праймера</p>
        </div>
      </div>
      <Button variant="outline" color="neutral" size="sm" onClick={handleColorToggle} className={cn( "rounded-xl font-bold h-10 px-4 transition-all shadow-sm", order.garmentColor === 'dark' ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700" )}>
       {order.garmentColor === 'dark' ? 'Сменить на светлое' : 'Сменить на тёмное'}
      </Button>
     </div>

      <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <Target className="w-3 h-3" />
          Позиции печати ({order.positions.length})
        </p>
      </div>
      
      <div className="grid gap-3">
        {order.positions.map(pos => {
        const position = DTG_PRINT_POSITIONS.find(p => p.id === pos.positionId)
        if (!position) return null

        const areaCm2 = (pos.widthMm * pos.heightMm) / 100

        return (
          <div 
          key={pos.positionId}
          className={cn(
            "p-4 rounded-2xl border transition-all",
            order.garmentColor === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100 hover:border-slate-200"
          )}
          >
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-base">{position.name}</span>
            <div className="flex items-center gap-3">
            <Badge className="rounded-lg font-bold bg-white/10 text-xs" color="neutral">
              {areaCm2.toFixed(0)} см²
            </Badge>
            <Button variant="ghost" color="neutral" size="sm" onClick={() => handleRemovePosition(pos.positionId)}
              className="w-8 h-8 p-0 rounded-xl text-rose-500 hover:bg-rose-50/10"
            >
              <X className="w-4 h-4" />
            </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 ml-1">
              Ширина (макс {position.maxWidth})
            </label>
            <div className="relative">
              <Input type="number" value={pos.widthMm} onChange={(e) => handleUpdatePosition(pos.positionId, {
                  widthMm: Math.min(parseInt(e.target.value) || 0, Math.min(position.maxWidth, garment.maxPrintWidth))
                })}
                className="h-10 rounded-xl bg-white/5 border-slate-700 font-bold px-3"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">ММ</span>
            </div>
            </div>
            <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 ml-1">
              Высота (макс {position.maxHeight})
            </label>
            <div className="relative">
              <Input type="number" value={pos.heightMm} onChange={(e) => handleUpdatePosition(pos.positionId, {
                  heightMm: Math.min(parseInt(e.target.value) || 0, Math.min(position.maxHeight, garment.maxPrintHeight))
                })}
                className="h-10 rounded-xl bg-white/5 border-slate-700 font-bold px-3"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">ММ</span>
            </div>
            </div>
          </div>
          </div>
        )
        })}
      </div>

      {/* Добавление позиции */}
      {availablePositions.length > 0 && (
       <div className="mt-4">
         <Select value="" onChange={handleAddPosition} options={availablePositions} placeholder="+ Добавить позицию печати" triggerClassName="h-12 border-2 border-dashed border-slate-700 rounded-2xl bg-transparent text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all px-6" />
       </div>
      )}

      {order.positions.length === 0 && (
       <div className="py-8 text-center bg-slate-100/5 rounded-2xl border-2 border-dashed border-slate-800">
         <p className="text-sm font-bold text-slate-500">Добавьте область печати на изделие</p>
       </div>
      )}
     </div>
    </div>
   )}
  </Card>
 )
})
