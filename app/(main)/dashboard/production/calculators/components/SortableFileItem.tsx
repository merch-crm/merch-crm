'use client';

/**
 * @fileoverview Обертка для перетаскиваемого элемента списка файлов
 * @module components/calculators/SortableFileItem
 * @requires @dnd-kit/sortable
 * @audit Создан 2026-03-25
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FilePreviewCard } from './FilePreviewCard';
import { UploadedDesignFile } from '@/lib/types/calculators';

interface SortableFileItemProps {
 /** Файл дизайна */
 file: UploadedDesignFile;
 /** Колбэк удаления */
 onRemove: (id: string) => void;
 /** Колбэк обновления */
 onUpdate: (id: string, updates: Partial<UploadedDesignFile>) => void;
}

/**
 * Перетаскиваемый элемент списка файлов с интеграцией dnd-kit
 */
export function SortableFileItem({
 file,
 onRemove,
 onUpdate,
}: SortableFileItemProps) {
 const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
 } = useSortable({ id: file.id });

 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
 };

 return (
  <div ref={setNodeRef} style={style}>
   <FilePreviewCard file={file} onRemove={onRemove} onUpdate={onUpdate} isDragging={isDragging} dragHandleProps={{ ...attributes, ...listeners }} />
  </div>
 );
}
