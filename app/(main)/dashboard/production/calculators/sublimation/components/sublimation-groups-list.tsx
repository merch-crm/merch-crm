'use client'

import { useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Package } from 'lucide-react'

// Переиспользуем компоненты из DTF
import { PrintGroupCard } from '../../dtf/components/print-group-card'

import { 
 type PrintGroupInput, 
 type PlacementData,
 PRINT_GROUP_COLORS 
} from '../../types'

interface SublimationGroupsListProps {
 groups: PrintGroupInput[]
 onChange: (groups: PrintGroupInput[]) => void
 placements: PlacementData[]
 maxGroups?: number
}

export const SublimationGroupsList = memo(function SublimationGroupsList({
 groups,
 onChange,
 placements,
 maxGroups = 20
}: SublimationGroupsListProps) {

 const isGroupFilled = useCallback((group: PrintGroupInput): boolean => {
  return group.widthMm > 0 && group.heightMm > 0 && group.quantity > 0
 }, [])

 const stats = useMemo(() => {
  const filled = groups.filter(isGroupFilled)
  const totalQuantity = filled.reduce((sum, g) => sum + g.quantity, 0)
  const totalArea = filled.reduce((sum, g) => sum + (g.widthMm * g.heightMm * g.quantity) / 1_000_000, 0)
  
  return {
   filledCount: filled.length,
   totalQuantity,
   totalAreaM2: totalArea
  }
 }, [groups, isGroupFilled])

 const canAddGroup = useMemo(() => {
  if (groups.length >= maxGroups) return false
  if (groups.length === 0) return true
  return isGroupFilled(groups[groups.length - 1])
 }, [groups, maxGroups, isGroupFilled])

 const handleGroupChange = useCallback((index: number, updates: Partial<PrintGroupInput>) => {
  const newGroups = [...groups]
  newGroups[index] = { ...newGroups[index], ...updates }
  onChange(newGroups)
 }, [groups, onChange])

 const handleGroupDelete = useCallback((index: number) => {
  const newGroups = groups.filter((_, i) => i !== index)
  const recoloredGroups = newGroups.map((group, i) => ({
   ...group,
   color: PRINT_GROUP_COLORS[i % PRINT_GROUP_COLORS.length]
  }))
  
  onChange(recoloredGroups.length > 0 ? recoloredGroups : [{
   id: crypto.randomUUID(),
   name: '',
   widthMm: 0,
   heightMm: 0,
   quantity: 1,
   placementId: null,
   color: PRINT_GROUP_COLORS[0]
  }])
 }, [groups, onChange])

 const handleAddGroup = useCallback(() => {
  if (!canAddGroup) return
  
  const newGroup: PrintGroupInput = {
   id: crypto.randomUUID(),
   name: '',
   widthMm: 0,
   heightMm: 0,
   quantity: 1,
   placementId: null,
   color: PRINT_GROUP_COLORS[groups.length % PRINT_GROUP_COLORS.length]
  }
  
  onChange([...groups, newGroup])
 }, [groups, canAddGroup, onChange])

 return (
  <div className="space-y-3">
   {/* Stats Summary */}
   {stats.filledCount > 0 && (
    <Card className="p-3 bg-slate-50 border-slate-200 border-dashed rounded-[24px]">
       <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 ">Групп:</span>
            <span className="text-sm font-black text-slate-900">{stats.filledCount}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 ">Изделий:</span>
            <span className="text-sm font-black text-slate-900">{stats.totalQuantity}</span>
          </div>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/50">
          <span className="text-xs font-bold text-primary mr-2">Площадь:</span>
          <span className="text-sm font-black text-slate-900">{stats.totalAreaM2.toFixed(3)} м²</span>
        </div>
      </div>
    </Card>
   )}

   {/* Groups List */}
   <div className="grid grid-cols-1 gap-3">
    {groups.map((group, index) => (
     <PrintGroupCard key={group.id} group={group} index={index} placements={placements} onUpdate={(updates: Partial<PrintGroupInput>) => handleGroupChange(index, updates)}
      onRemove={() => handleGroupDelete(index)}
      canRemove={groups.length > 1}
     />
    ))}
   </div>

   {/* Add Button */}
   <Button variant="outline" onClick={handleAddGroup} disabled={!canAddGroup} className="w-full h-14 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-600 font-bold transition-all">
    <Plus className="w-5 h-5 mr-2" />
    Добавить группу изделий
    {groups.length >= maxGroups && (
     <span className="ml-2 text-xs font-bold opacity-60">(лимит: {maxGroups})</span>
    )}
   </Button>
  </div>
 )
})
