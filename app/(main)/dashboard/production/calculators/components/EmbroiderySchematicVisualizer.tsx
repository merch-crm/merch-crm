/**
 * @fileoverview Визуализатор дизайнов вышивки (список с доп. информацией)
 * @module calculators/components/EmbroiderySchematicVisualizer
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
 Scissors,
 Clock,
 Palette,
 Maximize,
 Hash,
} from 'lucide-react';
import {
 UploadedDesignFile,
 DESIGN_COLORS,
} from '@/lib/types/calculators';

/**
 * Пропсы визуализатора вышивки
 */
interface EmbroiderySchematicVisualizerProps {
 /** Файлы вышивки */
 files: UploadedDesignFile[];
 /** Режим только для чтения */
 readonly?: boolean;
}

/**
 * Визуализатор дизайнов вышивки (сетка информационных карточек)
 */
export function EmbroiderySchematicVisualizer({
 files,
 readonly: _readonly = false,
}: EmbroiderySchematicVisualizerProps) {
 // Фильтруем только файлы с данными вышивки
 const embroideryFiles = files.filter(f => f.embroideryData);

 /**
  * Получает цвет для дизайна
  */
 const getDesignColor = (index: number) => {
  return DESIGN_COLORS[index % DESIGN_COLORS.length];
 };

 if (embroideryFiles.length === 0) {
  return (
   <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-center">
    <Scissors className="h-10 w-10 mb-2 opacity-20" />
    <p className="text-sm">Нет данных вышивки для отображения</p>
    <p className="text-xs">Загрузите DST/PES файлы для анализа параметров</p>
   </div>
  );
 }

 return (
  <div className="space-y-3">
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {embroideryFiles.map((file, index) => {
     const color = getDesignColor(index);
     const data = file.embroideryData!;

     return (
      <Card key={file.id} className="relative overflow-hidden group">
       {/* Цветовой индикатор вверху */}
       <div 
        className="h-1 w-full" 
        style={{ backgroundColor: color.border }}
       />

       <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
         <div className="flex-1 overflow-hidden">
          <CardTitle className="text-sm truncate" title={file.originalName}>
           {file.originalName}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
           {data.format.toUpperCase()}
          </p>
         </div>
         <Badge className="px-1.5 py-0 h-5 shrink-0" color="gray">
          ×{file.quantity}
         </Badge>
        </div>
       </CardHeader>

       <CardContent className="p-4 pt-2 space-y-3">
        {/* Сетка параметров */}
        <div className="grid grid-cols-2 gap-2">
         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
           <span className="text-xs text-muted-foreground leading-none">Стежки</span>
           <span className="text-xs font-bold font-mono">
            {data.stitchCount.toLocaleString()}
           </span>
          </div>
         </div>

         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
           <span className="text-xs text-muted-foreground leading-none">Цвета</span>
           <span className="text-xs font-bold font-mono">
            {data.colorCount}
           </span>
          </div>
         </div>

         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Maximize className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
           <span className="text-xs text-muted-foreground leading-none">Размер</span>
           <span className="text-xs font-bold font-mono">
            {data.widthMm}×{data.heightMm}
           </span>
          </div>
         </div>

         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
           <span className="text-xs text-muted-foreground leading-none">Время</span>
           <span className="text-xs font-bold font-mono">
            {data.estimatedTimeMin || '?'} мин
           </span>
          </div>
         </div>
        </div>

        {/* Прогресс-бары для визуального веса */}
        <div className="space-y-1 mt-2">
         <div className="flex justify-between text-xs text-muted-foreground">
          <span>Плотность вышивки</span>
          <span>{(data.stitchCount / (data.widthMm * data.heightMm / 100)).toFixed(1)} ст/см²</span>
         </div>
         <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div 
           className="h-full bg-primary/40 rounded-full" 
           style={{ 
            width: `${Math.min((data.stitchCount / 50000) * 100, 100)}%` 
           }} 
          />
         </div>
        </div>
       </CardContent>
      </Card>
     );
    })}
   </div>

   {/* Итоговая статистика по всей вышивке */}
   <Card className="bg-primary/5 border-primary/20">
    <CardContent className="p-4">
     <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-primary/10 rounded-lg">
        <Scissors className="h-5 w-5 text-primary" />
       </div>
       <div>
        <p className="text-xs text-muted-foreground">Всего стежков</p>
        <p className="text-xl font-bold font-mono">
         {embroideryFiles.reduce((acc, f) => acc + (f.embroideryData?.stitchCount || 0) * f.quantity, 0).toLocaleString()}
        </p>
       </div>
      </div>

      <div className="h-10 w-px bg-primary/20 hidden sm:block" />

      <div className="flex items-center gap-3">
       <div className="p-2 bg-primary/10 rounded-lg">
        <Clock className="h-5 w-5 text-primary" />
       </div>
       <div>
        <p className="text-xs text-muted-foreground">Общее время (раб.)</p>
        <p className="text-xl font-bold font-mono">
         {embroideryFiles.reduce((acc, f) => acc + (f.embroideryData?.estimatedTimeMin || 0) * f.quantity, 0)} мин
        </p>
       </div>
      </div>

      <div className="h-10 w-px bg-primary/20 hidden sm:block" />

      <div className="flex flex-col">
       <p className="text-xs text-muted-foreground mb-1">Кол-во программ</p>
       <div className="flex items-center gap-2">
        <Badge color="purple" variant="outline" className="font-mono">{embroideryFiles.length}</Badge>
        <span className="text-xs text-muted-foreground">дизайнов</span>
       </div>
      </div>
     </div>
    </CardContent>
   </Card>
  </div>
 );
}

export default EmbroiderySchematicVisualizer;
