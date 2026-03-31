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
  Layers,
  AlertTriangle
} from 'lucide-react';
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
import { ModernImageGallery } from '@/components/ui/modern-image-gallery';

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
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const config = CALCULATOR_TYPES_CONFIG[file.calculatorType];
  const isManual = !!file.isManual;

  const dpi = React.useMemo(() => {
    if (!file.dimensions || !file.userDimensions?.widthMm) return null;
    return calculateDpi(file.dimensions.width, file.userDimensions.widthMm);
  }, [file.dimensions, file.userDimensions]);

  const isLowDpi = dpi !== null && dpi < 300;

  return (
    <TooltipProvider>
    <div
      className={cn(
        'crm-card group relative overflow-hidden transition-all duration-200 border-l-4 p-0',
        isDragging ? 'z-50 shadow-xl opacity-80 scale-[1.02]' : 'hover:shadow-md',
        `border-l-${config.color}-500`
      )}
    >
      <div className="flex flex-col sm:flex-row gap-3 p-[var(--radius-padding)]">
        {/* Ручка для перетаскивания и Предпросмотр */}
        <div className="flex gap-3 items-center">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors p-1"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Preview area */}
          <button 
            type="button"
            className={cn(
              "relative h-28 w-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 border transition-all cursor-zoom-in hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary outline-none text-left",
              isManual ? "cursor-default" : "hover:border-primary/30"
            )}
            onClick={() => !isManual && setGalleryOpen(true)}
            aria-label={isManual ? undefined : `Просмотреть ${file.originalName}`}
            disabled={isManual}
          >
            {isManual ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-muted/60 text-muted-foreground gap-1">
                <Layers className="h-8 w-8 opacity-40" />
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
          </button>
        </div>

        {/* Gallery Overlay */}
        {!isManual && (file.thumbnailUrl || file.embroideryData?.svgPreview) && (
          <ModernImageGallery
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            images={[{ 
              src: file.fileUrl || file.thumbnailUrl || file.embroideryData?.svgPreview || '',
              label: file.originalName 
            }]}
            itemName={file.originalName}
          />
        )}

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
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  onUpdate(file.id, { 
                    userDimensions: { 
                      ...file.userDimensions!, 
                      widthMm: val
                    } 
                  });
                }}
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
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  onUpdate(file.id, { 
                    userDimensions: { 
                      ...file.userDimensions!, 
                      heightMm: val
                    } 
                  });
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground pl-1">
                Тираж (шт)
              </label>
              <Input
                type="number"
                className="h-8 text-xs font-semibold bg-background/50 focus:bg-background transition-colors"
                value={file.quantity || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  onUpdate(file.id, { quantity: isNaN(val) ? 0 : val });
                }}
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
    </div>
    </TooltipProvider>
  );
}
