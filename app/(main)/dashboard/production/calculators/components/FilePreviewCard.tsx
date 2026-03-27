'use client';

/**
 * @fileoverview Карточка предпросмотра загруженного файла дизайна
 * @module components/calculators/FilePreviewCard
 * @audit Создан 2026-03-25
 */

import React from 'react';
import Image from 'next/image';
import { 
  X, 
  GripVertical, 
  Scissors, 
  File as FileIcon,
  PenLine,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UploadedDesignFile, 
  CALCULATOR_TYPES_CONFIG 
} from '@/lib/types/calculators';
import { 
  Tooltip,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { formatFileSize } from '@/lib/utils/format';
import { calculateDpi } from '@/lib/utils/file-dimensions';
import { cn } from '@/lib/utils';

interface FilePreviewCardProps {
  /** Файл дизайна */
  file: UploadedDesignFile;
  /** Колбэк удаления */
  onRemove: (id: string) => void;
  /** Колбэк обновления данных */
  onUpdate: (id: string, updates: Partial<UploadedDesignFile>) => void;
  /** Перетаскиваемый ли элемент */
  isDragging?: boolean;
  /** Обработка перетаскивания через dnd-kit */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null;
}

/**
 * Карточка предпросмотра файла с возможностью редактирования параметров
 */
export function FilePreviewCard({
  file,
  onRemove,
  onUpdate,
  isDragging,
  dragHandleProps,
}: FilePreviewCardProps) {
  const config = CALCULATOR_TYPES_CONFIG[file.calculatorType];
  const isManual = !!file.isManual;

  const dpi = React.useMemo(() => {
    if (!file.dimensions || !file.userDimensions?.widthMm) return null;
    return calculateDpi(file.dimensions.width, file.userDimensions.widthMm);
  }, [file.dimensions, file.userDimensions]);

  const isLowDpi = dpi !== null && dpi < 300;

  return (
    <TooltipProvider>
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 border-l-4',
        isDragging ? 'z-50 shadow-xl opacity-80 scale-[1.02]' : 'hover:shadow-md',
        `border-l-${config.color}-500`
      )}
    >
      <div className="flex flex-col sm:flex-row gap-3 p-4">
        {/* Ручка для перетаскивания и Предпросмотр */}
        <div className="flex gap-3 items-center">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors p-1"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Preview area */}
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
            {isManual ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-muted/60 text-muted-foreground gap-1">
                <PenLine className="h-7 w-7 opacity-50" />
                <span className="text-xs font-bold opacity-60">вручную</span>
              </div>
            ) : (file.thumbnailUrl || file.embroideryData?.svgPreview) ? (
              <Image
                src={file.thumbnailUrl || file.embroideryData?.svgPreview || ''}
                alt={file.originalName}
                fill
                className={cn(
                  "object-cover",
                  file.embroideryData?.svgPreview && !file.thumbnailUrl && "p-2 bg-white"
                )}
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                <FileIcon className="h-8 w-8 opacity-40" />
                <span className="absolute bottom-1 right-1 text-xs font-bold">
                  {file.storedName.split('.').pop()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Инфо о файле */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate pr-6" title={file.originalName}>
                {file.originalName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {isManual ? (
                  <Badge variant="outline" className="text-xs h-4 font-semibold text-indigo-600 border-indigo-200 bg-indigo-50">
                    Вручную
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs h-4 font-normal">
                    {formatFileSize(file.sizeBytes)}
                  </Badge>
                )}
                {!isManual && (
                  <span className="text-xs text-muted-foreground mr-2">
                    {file.dimensions ? `${file.dimensions.width} × ${file.dimensions.height} px` : '--- px'}
                  </span>
                )}
                  
                  {dpi && file.calculatorType !== 'embroidery' && (
                    <Tooltip
                      content={
                        isLowDpi 
                          ? `Низкое разрешение для печати. Рекомендуется минимум 300 DPI для качественного результата.`
                          : `Хорошее разрешение для печати.`
                      }
                    >
                      <Badge 
                        variant={isLowDpi ? "destructive" : "secondary"} 
                        className={cn(
                          "text-xs h-4 font-bold px-1.5 gap-1 cursor-default",
                          !isLowDpi && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}
                      >
                        {isLowDpi && <AlertTriangle className="h-2.5 w-2.5" />}
                        {dpi} DPI
                      </Badge>
                    </Tooltip>
                  )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(file.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 -mt-1 ml-1 mb-2">
            {!isManual && file.storedName && (
              <Badge variant="secondary" className="text-xs h-3.5 px-1 font-bold bg-muted/50 text-muted-foreground border-none">
                {file.storedName.split('.').pop()}
              </Badge>
            )}

          </div>

          {/* Параметры редактирования */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground pl-1">
                Ширина (мм)
              </label>
              <Input
                type="number"
                className="h-8 text-xs font-semibold bg-background/50 focus:bg-background transition-colors"
                value={file.userDimensions?.widthMm || ''}
                onChange={(e) => 
                  onUpdate(file.id, { 
                    userDimensions: { 
                      ...file.userDimensions!, 
                      widthMm: Number(e.target.value) 
                    } 
                  })
                }
              />
            </div>
 
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground pl-1">
                Высота (мм)
              </label>
              <Input
                type="number"
                className="h-8 text-xs font-semibold bg-background/50 focus:bg-background transition-colors"
                value={file.userDimensions?.heightMm || ''}
                onChange={(e) => 
                  onUpdate(file.id, { 
                    userDimensions: { 
                      ...file.userDimensions!, 
                      heightMm: Number(e.target.value) 
                    } 
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground pl-1">
                Тираж (шт)
              </label>
              <Input
                type="number"
                className="h-8 text-xs font-semibold bg-background/50 focus:bg-background transition-colors"
                value={file.quantity}
                onChange={(e) => 
                  onUpdate(file.id, { quantity: Math.max(1, Number(e.target.value)) })
                }
              />
            </div>

            {file.calculatorType === 'embroidery' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground pl-1 flex items-center gap-1">
                  <Scissors className="h-2.5 w-2.5" /> Стежки
                </label>
                <Input
                  type="number"
                  className="h-8 text-xs font-semibold bg-primary/5 border-primary/20 text-primary"
                  value={file.embroideryData?.stitchCount || ''}
                  onChange={(e) => 
                    onUpdate(file.id, { 
                      embroideryData: { 
                        ...file.embroideryData!, 
                        stitchCount: Number(e.target.value) 
                      } 
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
    </TooltipProvider>
  );
}
