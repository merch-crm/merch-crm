'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
 Plus, 
 Trash2, 
 Pencil,
 Check,
 X,
 GripVertical,
 Shirt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { type PlacementData, type ApplicationType } from '../types'

interface PlacementsEditorProps {
 placements: PlacementData[]
 applicationType: ApplicationType
 onUpdate: (placements: PlacementData[]) => void
 isLoading?: boolean
}

interface PlacementRowProps {
 placement: PlacementData
 isEditing: boolean
 onStartEdit: () => void
 onSaveEdit: (updates: Partial<PlacementData>) => void
 onCancelEdit: () => void
 onDelete: () => void
 canDelete: boolean
}

const PlacementRow = memo(function PlacementRow({
 placement,
 isEditing,
 onStartEdit,
 onSaveEdit,
 onCancelEdit,
 onDelete,
 canDelete
}: PlacementRowProps) {
 const [editValues, setEditValues] = useState({
  name: placement.name,
  widthMm: placement.widthMm,
  heightMm: placement.heightMm,
  workPrice: placement.workPrice
 })

 const handleSave = useCallback(() => {
  onSaveEdit(editValues)
 }, [editValues, onSaveEdit])

 const handleCancel = useCallback(() => {
  setEditValues({
   name: placement.name,
   widthMm: placement.widthMm,
   heightMm: placement.heightMm,
   workPrice: placement.workPrice
  })
  onCancelEdit()
 }, [placement, onCancelEdit])

 if (isEditing) {
  return (
   <div className="p-3 bg-primary/5 rounded-xl border-2 border-primary/20 space-y-3">
    <div className="grid grid-cols-2 gap-3">
     <div>
      <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
      <Input value={editValues.name} onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
       className="mt-1"
      />
     </div>
     <div>
      <label className="text-sm font-bold text-slate-700 ml-1">Цена работы</label>
      <div className="relative mt-1">
       <Input type="number" value={editValues.workPrice} onChange={(e) => setEditValues(v => ({ ...v, workPrice: parseFloat(e.target.value) || 0 }))}
        className="pr-8"
       />
       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₽</span>
      </div>
     </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
     <div>
      <label className="text-sm font-bold text-slate-700 ml-1">Ширина (мм)</label>
      <Input type="number" value={editValues.widthMm} onChange={(e) => setEditValues(v => ({ ...v, widthMm: parseInt(e.target.value) || 0 }))}
       className="mt-1"
      />
     </div>
     <div>
      <label className="text-sm font-bold text-slate-700 ml-1">Высота (мм)</label>
      <Input type="number" value={editValues.heightMm} onChange={(e) => setEditValues(v => ({ ...v, heightMm: parseInt(e.target.value) || 0 }))}
       className="mt-1"
      />
     </div>
    </div>

    <div className="flex justify-end gap-2">
     <Button variant="ghost" color="gray" size="sm" onClick={handleCancel}>
      <X className="w-4 h-4 mr-1" />
      <span className="hidden sm:inline">Отмена</span>
     </Button>
     <Button size="sm" onClick={handleSave}>
      <Check className="w-4 h-4 mr-1" />
      <span className="hidden sm:inline">Сохранить</span>
     </Button>
    </div>
   </div>
  )
 }

 return (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
   <div className="cursor-move text-slate-400 hover:text-slate-600">
    <GripVertical className="w-4 h-4" />
   </div>

   <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
    <Shirt className="w-5 h-5 text-slate-500" />
   </div>

   <div className="flex-1 min-w-0">
    <p className="font-medium text-slate-900 truncate">{placement.name}</p>
    <p className="text-sm text-slate-500">
     {placement.widthMm} × {placement.heightMm} мм
    </p>
   </div>

   <Badge className="font-mono" color="gray">
    {formatCurrency(placement.workPrice)}
   </Badge>

   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <Button variant="ghost" color="gray" size="sm" onClick={onStartEdit}>
     <Pencil className="w-4 h-4" />
    </Button>
    <Button variant="ghost" color="gray" size="sm" onClick={onDelete} disabled={!canDelete} className={cn(!canDelete && "invisible")}>
     <Trash2 className="w-4 h-4 text-red-500" />
    </Button>
   </div>
  </div>
 )
})

export const PlacementsEditor = memo(function PlacementsEditor({
 placements,
 applicationType,
 onUpdate,
 isLoading
}: PlacementsEditorProps) {
 const [editingId, setEditingId] = useState<string | null>(null)

 const sortedPlacements = useMemo(() => 
  [...placements].sort((a, b) => a.sortOrder - b.sortOrder),
  [placements]
 )

 const handleStartEdit = useCallback((id: string) => {
  setEditingId(id)
 }, [])

 const handleSaveEdit = useCallback((id: string, updates: Partial<PlacementData>) => {
  const newPlacements = placements.map(p => 
   p.id === id ? { ...p, ...updates } : p
  )
  onUpdate(newPlacements)
  setEditingId(null)
 }, [placements, onUpdate])

 const handleCancelEdit = useCallback(() => {
  setEditingId(null)
 }, [])

 const handleDelete = useCallback((id: string) => {
  const newPlacements = placements.filter(p => p.id !== id)
  onUpdate(newPlacements)
 }, [placements, onUpdate])

 const handleAddNew = useCallback(() => {
  const newPlacement: PlacementData = {
   id: `temp-${Date.now()}`, // suppressHydrationWarning
   applicationType,
   name: 'Новое нанесение',
   slug: `new-placement-${Date.now()}`, // suppressHydrationWarning
   description: null,
   widthMm: 100,
   heightMm: 100,
   workPrice: 50,
   isActive: true,
   sortOrder: placements.length
  }
  onUpdate([...placements, newPlacement])
  setEditingId(newPlacement.id)
 }, [placements, applicationType, onUpdate])

 // Статистика
 const stats = useMemo(() => ({
  total: placements.length,
  avgPrice: placements.length > 0 
   ? Math.round(placements.reduce((sum, p) => sum + p.workPrice, 0) / placements.length)
   : 0,
  minPrice: placements.length > 0 
   ? Math.min(...placements.map(p => p.workPrice))
   : 0,
  maxPrice: placements.length > 0 
   ? Math.max(...placements.map(p => p.workPrice))
   : 0
 }), [placements])

 return (
  <div className="space-y-3">
   {/* Статистика */}
   <div className="grid grid-cols-4 gap-2">
    <Card className="p-3 text-center">
     <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
     <p className="text-xs text-slate-500">Всего</p>
    </Card>
    <Card className="p-3 text-center">
     <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.minPrice)}</p>
     <p className="text-xs text-slate-500">Мин. цена</p>
    </Card>
    <Card className="p-3 text-center">
     <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.avgPrice)}</p>
     <p className="text-xs text-slate-500">Средняя</p>
    </Card>
    <Card className="p-3 text-center">
     <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.maxPrice)}</p>
     <p className="text-xs text-slate-500">Макс. цена</p>
    </Card>
   </div>

   {/* Список нанесений */}
   <div className="space-y-2">
    {sortedPlacements.map(placement => (
     <PlacementRow key={placement.id} placement={placement} isEditing={editingId === placement.id} onStartEdit={() => handleStartEdit(placement.id)}
      onSaveEdit={(updates) => handleSaveEdit(placement.id, updates)}
      onCancelEdit={handleCancelEdit}
      onDelete={() => handleDelete(placement.id)}
      canDelete={placements.length > 1}
     />
    ))}
   </div>

   {/* Кнопка добавления */}
   <Button variant="outline" color="gray" size="sm" onClick={handleAddNew} disabled={isLoading || editingId !== null} className="w-full rounded-xl">
    <Plus className="w-4 h-4 mr-2" />
    Добавить нанесение
   </Button>
  </div>
 )
})
