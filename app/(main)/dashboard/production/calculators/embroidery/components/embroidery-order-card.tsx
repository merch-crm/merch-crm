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
  Shirt,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import {
  EMBROIDERY_GARMENTS,
  EMBROIDERY_POSITIONS,
  type EmbroideryPrintInput,
  type EmbroideryDesign
} from '../../embroidery-types'

interface EmbroideryOrderCardProps {
  order: EmbroideryPrintInput
  index: number
  designs: EmbroideryDesign[]
  onUpdate: (updates: Partial<EmbroideryPrintInput>) => void
  onDelete: () => void
  onDuplicate: () => void
}

export const EmbroideryOrderCard = memo(function EmbroideryOrderCard({
  order,
  index: _index,
  designs,
  onUpdate,
  onDelete,
  onDuplicate
}: EmbroideryOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const garment = useMemo(() => 
    EMBROIDERY_GARMENTS.find(g => g.id === order.garmentId),
    [order.garmentId]
  )

  // Доступные позиции
  const availablePositions = useMemo(() => {
    if (!garment) return []
    return EMBROIDERY_POSITIONS.filter(pos => 
      garment.availablePositions.includes(pos.id) &&
      !order.positions.some(p => p.positionId === pos.id)
    )
  }, [garment, order.positions])

  // Общее количество стежков на одно изделие в этом заказе
  const totalStitchesPerItem = useMemo(() => 
    order.positions.reduce((sum: number, pos) => {
      const design = designs.find(d => d.id === pos.designId)
      return sum + (design?.stitchCount || 0)
    }, 0),
    [order.positions, designs]
  )

  // Количество цветов (для проверки доплаты)
  const totalColors = useMemo(() => 
    order.positions.reduce((sum: number, pos) => {
      const design = designs.find(d => d.id === pos.designId)
      return sum + (design?.colorsCount || 0)
    }, 0),
    [order.positions, designs]
  )

  const extraColors = garment ? Math.max(0, totalColors - garment.maxColors) : 0

  // Обработчики
  const handleQuantityChange = useCallback((value: number) => {
    onUpdate({ quantity: Math.max(1, value) })
  }, [onUpdate])

  const handleAddPosition = useCallback((positionId: string) => {
    if (designs.length === 0 || !positionId) return
    
    onUpdate({
      positions: [
        ...order.positions,
        {
          positionId,
          designId: designs[0].id
        }
      ]
    })
  }, [order.positions, designs, onUpdate])

  const handleUpdatePosition = useCallback((
    positionId: string, 
    updates: { designId: string }
  ) => {
    onUpdate({
      positions: order.positions.map(pos => 
        pos.positionId === positionId ? { ...pos, ...updates } : pos
      )
    })
  }, [order.positions, onUpdate])

  const handleRemovePosition = useCallback((positionId: string) => {
    onUpdate({
      positions: order.positions.filter(pos => pos.positionId !== positionId)
    })
  }, [order.positions, onUpdate])

  if (!garment) return null

  // Опции для выбора позиции
  const positionOptions = availablePositions.map(pos => ({
    id: pos.id,
    title: pos.name
  }))

  // Опции для выбора дизайна
  const designOptions = designs.map(d => ({
    id: d.id,
    title: `${d.name} (${d.stitchCount.toLocaleString()} ст.)`
  }))

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white border-l-4 border-l-pink-500">
      {/* Заголовок */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100 shadow-sm">
            <Shirt className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-slate-900 truncate tracking-tight">{garment.name}</h4>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs font-bold tracking-tight">
                {order.positions.length} поз.
              </Badge>
            </div>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
              Базовая цена: <span className="text-slate-900">{formatCurrency(garment.basePrice)}</span>
              {totalStitchesPerItem > 0 && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-pink-600">{totalStitchesPerItem.toLocaleString()} стежков/изд</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div role="button" tabIndex={0} className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {/* Управление количеством */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(order.quantity - 1)}
              disabled={order.quantity <= 1}
              className="w-8 h-8 rounded-lg hover:bg-white hover:text-pink-600"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <div className="flex flex-col items-center px-2 min-w-[3rem]">
              <span className="text-xs font-bold text-slate-400 tracking-tighter">Тираж</span>
              <Input
                type="number"
                value={order.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-12 h-5 p-0 text-center border-none bg-transparent font-bold text-slate-900 focus-visible:ring-0"
                min={1}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(order.quantity + 1)}
              className="w-8 h-8 rounded-lg hover:bg-white hover:text-pink-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Действия */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8 text-slate-400 hover:text-blue-600">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-slate-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Содержимое */}
      {isExpanded && (
        <div className="px-6 pb-6 flex flex-col gap-3 animate-in fade-in duration-300 border-t border-slate-50 pt-6 bg-slate-50/20">
          {/* Информация о цветах */}
          <div className="flex flex-wrap gap-3">
             <div className={cn(
              "flex-1 p-3 rounded-2xl border flex items-center justify-between",
              extraColors > 0 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-green-50 border-green-200 text-green-900"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", extraColors > 0 ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                <span className="text-xs font-bold">
                  Цвета нитей в заказе: <span className="text-sm font-black">{totalColors}</span>
                </span>
              </div>
              <span className="text-xs font-bold opacity-60">
                Лимит: {garment.maxColors} цв.
              </span>
            </div>
            {extraColors > 0 && (
              <Badge className="bg-amber-600 border-none shadow-sm py-2 px-4 rounded-xl">
                Доплата за {extraColors} доп. цв.
              </Badge>
            )}
          </div>

          {/* Позиции */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-slate-400">Места нанесения вышивки</h5>
              <Badge variant="outline" className="text-xs font-bold">{order.positions.length} активных</Badge>
            </div>

            {order.positions.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.positions.map(pos => {
                  const position = EMBROIDERY_POSITIONS.find(p => p.id === pos.positionId)
                  if (!position) return null

                  return (
                    <div 
                      key={pos.positionId}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative group/pos"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(pos.positionId)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover/pos:opacity-100 transition-all z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-pink-100 text-pink-600 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{position.name}</span>
                      </div>

                      <Select
                        value={pos.designId}
                        onChange={(value) => handleUpdatePosition(pos.positionId, { designId: value })}
                        options={designOptions}
                        compact
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-white/50">
                   <p className="text-sm font-medium text-slate-400">Позиции не выбраны</p>
                </div>
            )}

            {/* Добавление позиции */}
            {availablePositions.length > 0 && designs.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                   <Select
                    value=""
                    onChange={handleAddPosition}
                    options={positionOptions}
                    placeholder="+ Выберите место нанесения"
                  />
                </div>
              </div>
            )}

            {designs.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold tracking-tight">Внимание: создайте хотя бы один дизайн сверху, чтобы выбрать его для этого изделия</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
})
