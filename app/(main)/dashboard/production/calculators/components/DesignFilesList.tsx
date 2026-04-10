'use client';

/**
 * @fileoverview Cписок загруженных файлов дизайна с поддержкой сортировки
 * @module components/calculators/DesignFilesList
 * @requires @dnd-kit/core
 * @requires @dnd-kit/sortable
 * @audit Создан 2026-03-25
 */

import React from 'react';
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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Files } from 'lucide-react';
import { SortableFileItem } from './SortableFileItem';
import { UploadedDesignFile } from '@/lib/types/calculators';

interface DesignFilesListProps {
 /** Список файлов */
 files: UploadedDesignFile[];
 /** Колбэк удаления */
 onRemove: (id: string) => void;
 /** Колбэк обновления */
 onUpdate: (id: string, updates: Partial<UploadedDesignFile>) => void;
 /** Колбэк изменения порядка */
 onReorder: (files: UploadedDesignFile[]) => void;
}

/**
 * Компонент списка файлов с поддержкой Drag-and-Drop перетаскивания
 */
export function DesignFilesList({
 files,
 onRemove,
 onUpdate,
 onReorder,
}: DesignFilesListProps) {
 const sensors = useSensors(
  useSensor(PointerSensor, {
   activationConstraint: {
    distance: 8, // Требуется сдвиг на 8px перед началом перетаскивания
   },
  }),
  useSensor(KeyboardSensor, {
   coordinateGetter: sortableKeyboardCoordinates,
  })
 );

 const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
   const oldIndex = files.findIndex((f) => f.id === active.id);
   const newIndex = files.findIndex((f) => f.id === over.id);
   
   onReorder(arrayMove(files, oldIndex, newIndex));
  }
 };

 if (!files || files.length === 0) {
  return (
   <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
    <Files className="h-10 w-10 mb-4 opacity-20" />
    <p className="text-sm font-medium">Файлы дизайна пока не добавлены</p>
    <p className="text-xs mt-1">Загрузите файлы выше, чтобы начать расчет</p>
   </div>
  );
 }

 return (
  <div className="space-y-3">
   {/* Header removed for Bento integration */}

   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
    <SortableContext items={files.map((f) => f.id)}
     strategy={verticalListSortingStrategy}
    >
     <div className="space-y-3">
      {files.map((file) => (
       <SortableFileItem key={file.id} file={file} onRemove={onRemove} onUpdate={onUpdate} />
      ))}
     </div>
    </SortableContext>
   </DndContext>
  </div>
 );
}
