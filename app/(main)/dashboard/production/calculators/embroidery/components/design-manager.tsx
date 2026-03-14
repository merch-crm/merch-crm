'use client'

import { useState, useCallback, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2, 
  Pencil,
  Check,
  X,
  Sparkles,
  Layers
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import {
  type EmbroideryDesign,
  type EmbroideryDensity,
  type ThreadType,
  EMBROIDERY_DENSITIES,
  EMBROIDERY_THREAD_TYPES,
  EMBROIDERY_DIGITIZING_PRICING,
  DEFAULT_EMBROIDERY_PARAMS,
  estimateStitchCount
} from '../../types'

interface DesignManagerProps {
  designs: EmbroideryDesign[]
  onAdd: (design: EmbroideryDesign) => void
  onUpdate: (designId: string, updates: Partial<EmbroideryDesign>) => void
  onDelete: (designId: string) => void
}

interface DesignCardProps {
  design: EmbroideryDesign
  onUpdate: (updates: Partial<EmbroideryDesign>) => void
  onDelete: () => void
}

const DesignCard = memo(function DesignCard({
  design,
  onUpdate,
  onDelete
}: DesignCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState(design)

  const handleSave = useCallback(() => {
    onUpdate(editValues)
    setIsEditing(false)
  }, [editValues, onUpdate])

  const handleCancel = useCallback(() => {
    setEditValues(design)
    setIsEditing(false)
  }, [design])

  // Расчёт стоимости дигитайзинга
  const digitizingPrice = design.hasDigitizing
    ? EMBROIDERY_DIGITIZING_PRICING.find(p => design.stitchCount <= p.maxStitches)?.price 
      || EMBROIDERY_DIGITIZING_PRICING[EMBROIDERY_DIGITIZING_PRICING.length - 1].price
    : 0

  const densityInfo = EMBROIDERY_DENSITIES.find(d => d.id === design.density)
  const threadInfo = EMBROIDERY_THREAD_TYPES.find(t => t.id === design.threadType)

  if (isEditing) {
    return (
      <Card className="p-4 ring-2 ring-pink-500 bg-pink-50/20 border-pink-100">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Название дизайна
              </label>
              <Input
                value={editValues.name}
                onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                placeholder="Например: Логотип МерчCRM"
                className="h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Ширина × Высота (мм)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editValues.widthMm}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 0
                    const stitches = estimateStitchCount(width, editValues.heightMm, editValues.density)
                    setEditValues(v => ({ ...v, widthMm: width, stitchCount: stitches }))
                  }}
                  min={10}
                  max={300}
                />
                <span className="text-slate-400">×</span>
                <Input
                  type="number"
                  value={editValues.heightMm}
                  onChange={(e) => {
                    const height = parseInt(e.target.value) || 0
                    const stitches = estimateStitchCount(editValues.widthMm, height, editValues.density)
                    setEditValues(v => ({ ...v, heightMm: height, stitchCount: stitches }))
                  }}
                  min={10}
                  max={200}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Количество стежков
              </label>
              <Input
                type="number"
                value={editValues.stitchCount}
                onChange={(e) => setEditValues(v => ({ ...v, stitchCount: parseInt(e.target.value) || 0 }))}
                min={100}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Количество цветов
              </label>
              <Input
                type="number"
                value={editValues.colorsCount}
                onChange={(e) => setEditValues(v => ({ ...v, colorsCount: parseInt(e.target.value) || 1 }))}
                min={1}
                max={15}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Плотность заливки
              </label>
              <Select
                value={editValues.density}
                onChange={(value) => {
                  const stitches = estimateStitchCount(editValues.widthMm, editValues.heightMm, value as EmbroideryDensity)
                  setEditValues(v => ({ ...v, density: value as EmbroideryDensity, stitchCount: stitches }))
                }}
                options={EMBROIDERY_DENSITIES.map(d => ({
                  id: d.id,
                  title: d.name
                }))}
                compact
              />
            </div>

            <div className="flex flex-col gap-1 border-t pt-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 tracking-tighter ml-1">
                Тип нити
              </label>
              <Select
                value={editValues.threadType}
                onChange={(value) => setEditValues(v => ({ ...v, threadType: value as ThreadType }))}
                options={EMBROIDERY_THREAD_TYPES.map(t => ({
                  id: t.id,
                  title: `${t.name} (×${t.priceMultiplier})`
                }))}
                compact
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-pink-100 shadow-inner">
            <Switch
              checked={editValues.hasDigitizing}
              onCheckedChange={(checked) => setEditValues(v => ({ ...v, hasDigitizing: checked }))}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-700">Требуется дигитайзинг</span>
              <p className="text-xs text-slate-500 tracking-wider font-semibold">Оцифровка нового макета (разовая оплата)</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-9 px-4">
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
            <Button size="sm" onClick={handleSave} className="h-9 px-6 bg-pink-600 hover:bg-pink-700">
              <Check className="w-4 h-4 mr-2" />
              Принять изменения
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-slate-200 group relative bg-white">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100 shadow-sm group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h4 className="font-bold text-slate-900 truncate text-lg tracking-tight">{design.name}</h4>
            {design.hasDigitizing && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 text-xs py-0 font-bold">
                + Дигитайзинг
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{design.widthMm}×{design.heightMm} мм</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-pink-600 font-bold">{design.stitchCount.toLocaleString()} стежков</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{design.colorsCount} цветов</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs font-bold text-slate-400 bg-slate-50 border-slate-200">
              {densityInfo?.name} плотность
            </Badge>
            <Badge variant="outline" className="text-xs font-bold text-slate-400 bg-slate-50 border-slate-200">
              нить: {threadInfo?.name}
            </Badge>
            {design.hasDigitizing && (
              <Badge className="text-xs font-bold bg-pink-600 shadow-sm">
                Оцифровка: {formatCurrency(digitizingPrice)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-slate-50 rounded-xl p-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-9 w-9 text-slate-400 hover:text-blue-600">
            <Pencil className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-9 w-9 text-slate-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
})

export const DesignManager = memo(function DesignManager({
  designs,
  onAdd,
  onUpdate,
  onDelete
}: DesignManagerProps) {
  const handleAddDesign = useCallback(() => {
    const newDesign: EmbroideryDesign = {
      id: crypto.randomUUID(),
      name: `Макет вышивки #${designs.length + 1}`,
      widthMm: 80,
      heightMm: 80,
      stitchCount: estimateStitchCount(80, 80, DEFAULT_EMBROIDERY_PARAMS.density),
      colorsCount: 3,
      density: DEFAULT_EMBROIDERY_PARAMS.density,
      threadType: DEFAULT_EMBROIDERY_PARAMS.threadType,
      hasDigitizing: DEFAULT_EMBROIDERY_PARAMS.hasDigitizing
    }
    onAdd(newDesign)
  }, [designs.length, onAdd])

  return (
    <Card className="border-slate-200 shadow-md overflow-hidden bg-slate-50/20">
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg shadow-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-none mb-1">Макеты для вышивки</h3>
              <p className="text-xs font-bold text-slate-400 tracking-tight leading-none mb-1">Настройте параметры каждого дизайна</p>
            </div>
          </div>
          {designs.length > 0 && (
            <Badge className="bg-slate-800 text-white font-mono px-3">{designs.length}</Badge>
          )}
        </div>

        {designs.length > 0 ? (
          <div className="space-y-3 mb-6">
            {designs.map(design => (
              <DesignCard
                key={design.id}
                design={design}
                onUpdate={(updates: Partial<EmbroideryDesign>) => onUpdate(design.id, updates)}
                onDelete={() => onDelete(design.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-white/40 mb-4 transition-colors hover:bg-white/60">
            <Sparkles className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">Нет созданных дизайнов</p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleAddDesign}
          className="w-full h-14 border-2 border-slate-200 rounded-2xl text-slate-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all font-bold text-base shadow-sm group"
        >
          <div className="flex items-center justify-center gap-2 group-active:scale-95 transition-transform">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Добавить новый дизайн для вышивки
          </div>
        </Button>
      </div>
    </Card>
  )
})
