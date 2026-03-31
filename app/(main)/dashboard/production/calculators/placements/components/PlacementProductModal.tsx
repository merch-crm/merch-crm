/**
 * @fileoverview Модальное окно создания/редактирования продукта нанесения
 * @module placements/components/PlacementProductModal
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlacementProduct, 
  PlacementProductFormData, 
  PRODUCT_TYPES, 
  DEFAULT_AREAS_BY_PRODUCT,
  PlacementProductType,
  PlacementArea
} from '@/lib/types/placements';
import { pluralize } from '@/lib/pluralize';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Sparkles, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableAreaItem } from './shared/SortableAreaItem';

interface PlacementProductModalProps {
  product: PlacementProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlacementProductFormData) => Promise<void>;
}

export function PlacementProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: PlacementProductModalProps) {
  const [formData, setFormData] = useState<PlacementProductFormData>({
    type: 'tshirt',
    name: '',
    description: '',
    isActive: true,
    areas: [],
  });
  const [loading, setLoading] = useState(false);

  // Сенсоры для dnd
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        type: product.type,
        name: product.name,
        description: product.description || '',
        isActive: product.isActive,
        areas: product.areas.map((a: PlacementArea) => ({
          id: a.id,
          name: a.name,
          code: a.code,
          maxWidthMm: a.maxWidthMm,
          maxHeightMm: a.maxHeightMm,
          workPrice: a.workPrice,
          isActive: a.isActive,
          sortOrder: a.sortOrder,
        })),
      });
    } else if (isOpen) {
      setFormData({
        type: 'tshirt',
        name: '',
        description: '',
        isActive: true,
        areas: [],
      });
    }
  }, [product, isOpen]);

  const addArea = () => {
    setFormData((prev) => ({
      ...prev,
      areas: [
        ...prev.areas,
        {
          name: '',
          code: '',
          maxWidthMm: 100,
          maxHeightMm: 100,
          workPrice: 0,
          isActive: true,
          sortOrder: prev.areas.length * 10,
        },
      ],
    }));
  };

  const removeArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index),
    }));
  };

  const updateArea = (index: number, updates: Partial<PlacementProductFormData['areas'][0]>) => {
    setFormData((prev) => {
      const newAreas = [...prev.areas];
      newAreas[index] = { ...newAreas[index], ...updates };
      return { ...prev, areas: newAreas };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.areas.findIndex((_, i) => `area-${i}` === active.id);
      const newIndex = formData.areas.findIndex((_, i) => `area-${i}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newAreas = arrayMove(formData.areas, oldIndex, newIndex).map((a, i) => ({
          ...a,
          sortOrder: i * 10
        }));
        setFormData({ ...formData, areas: newAreas });
      }
    }
  };

  const generateDefaultAreas = () => {
    const defaultAreas = DEFAULT_AREAS_BY_PRODUCT[formData.type] || [];
    if (defaultAreas.length === 0) {
      toast.error('Нет готовых пресетов для этого изделия');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      areas: [
        ...prev.areas,
        ...defaultAreas.map((da, idx) => ({
          name: da.name,
          code: da.code,
          maxWidthMm: da.maxWidthMm,
          maxHeightMm: da.maxHeightMm,
          workPrice: 0,
          isActive: true,
          sortOrder: (prev.areas.length + idx) * 10,
        })),
      ],
    }));
    toast.success(`Добавлено ${defaultAreas.length} ${pluralize(defaultAreas.length, 'зона', 'зоны', 'зон')} из пресета`);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Введите название изделия');
      return;
    }

    if (formData.areas.length === 0) {
      toast.error('Добавьте хотя бы одну зону нанесения');
      return;
    }

    if (formData.areas.some(a => !a.code || !a.name)) {
      toast.error('Заполните название и код для всех зон');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (_error) {
      // toast is handled in client
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = Object.entries(PRODUCT_TYPES).map(([id, config]) => ({
    id,
    title: config.label,
    icon: <span className="text-xl">{config.icon}</span>
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
              {product ? 'Редактирование изделия' : 'Новое изделие'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 font-medium">
            Настройте области нанесения и стоимость работы для конкретного типа продукции
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-8">
          <div className="grid gap-3 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Название продукции</Label>
                <Input
                  className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-bold text-lg"
                  placeholder="Например: Футболка Premium (Cotton 100%)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Тип изделия</Label>
                <Select
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val as PlacementProductType })}
                  options={typeOptions}
                  className="h-12"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Описание (опц.)</Label>
                <Textarea
                  placeholder="Дополнительные примечания к изделию для сотрудников..."
                  className="resize-none h-24 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 ml-1">Настройки статуса</Label>
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Активно</span>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">
                    Отключите, чтобы скрыть это изделие из всех калькуляторов
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-400">
                    Зоны нанесения
                  </h3>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold">
                    {formData.areas.length}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm"
                    onClick={generateDefaultAreas}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Из пресета
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                    onClick={addArea}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Добавить зону
                  </Button>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.areas.map((_, i) => `area-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pb-8">
                    {formData.areas.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/30">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                          <MapPin className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Нет добавленных зон</p>
                        <p className="text-xs text-slate-300 mt-1 max-w-[200px] mx-auto">
                          Используйте пресеты или добавьте зоны вручную
                        </p>
                      </div>
                    ) : (
                      formData.areas.map((area, index) => (
                        <SortableAreaItem
                          key={`area-${index}`}
                          id={`area-${index}`}
                          index={index}
                          area={area}
                          onUpdate={updateArea}
                          onRemove={removeArea}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-8 border-t bg-slate-50/50 gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="h-12 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="h-12 px-10 rounded-2xl font-black bg-indigo-500 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-600 hover:shadow-indigo-300 transition-all min-w-[200px]"
          >
            {loading ? 'Сохранение...' : (product ? 'Сохранить изменения' : 'Создать изделие')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
