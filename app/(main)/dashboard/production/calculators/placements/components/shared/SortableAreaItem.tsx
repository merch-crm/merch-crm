'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PlacementProductFormData } from '@/lib/types/placements';

interface SortableAreaItemProps {
  id: string;
  index: number;
  area: PlacementProductFormData['areas'][0];
  onUpdate: (index: number, updates: Partial<PlacementProductFormData['areas'][0]>) => void;
  onRemove: (index: number) => void;
  _isLast?: boolean;
}

/**
 * Вспомогательный компонент для сортируемого элемента зоны
 */
export function SortableAreaItem({
  id,
  index,
  area,
  onUpdate,
  onRemove,
}: SortableAreaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col gap-3 p-5 border rounded-[20px] bg-white relative transition-all hover:border-slate-300 hover:shadow-lg",
        isDragging && "border-indigo-500 ring-2 ring-indigo-500/10 shadow-2xl"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-400 leading-none mb-1">Зона #{index + 1}</span>
            <span className="text-sm font-bold text-slate-900">{area.name || 'Без названия'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-500">Активна</span>
            <Switch
              checked={area.isActive}
              onCheckedChange={(val) => onUpdate(index, { isActive: val })}
              className="scale-75"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">Название зоны</Label>
          <Input
            placeholder="Например: Грудь слева"
            className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
            value={area.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">Код зоны (ID)</Label>
          <Input
            placeholder="chest_left"
            className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono text-sm"
            value={area.code}
            onChange={(e) => onUpdate(index, { code: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">Макс. Ширина (мм)</Label>
          <Input
            type="number"
            className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-bold"
            value={area.maxWidthMm}
            onChange={(e) => onUpdate(index, { maxWidthMm: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">Макс. Высота (мм)</Label>
          <Input
            type="number"
            className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-bold"
            value={area.maxHeightMm}
            onChange={(e) => onUpdate(index, { maxHeightMm: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">Цена работы (₽)</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₽</span>
            <Input
              type="number"
              className="h-10 pl-8 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-black text-indigo-600"
              value={area.workPrice}
              onChange={(e) => onUpdate(index, { workPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
