'use client';

/**
 * @fileoverview Компонент загрузки файлов дизайна
 * @module components/calculators/DesignFileUploader
 * @requires react-dropzone
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, PenLine, Loader2, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip } from '@/components/ui/tooltip';
import { CalculatorType, CALCULATOR_FILE_FORMATS, UploadedDesignFile, CALCULATOR_TYPES_CONFIG, type FileFormatConfig } from '@/lib/types/calculators';
import { uploadDesignFile } from '@/lib/actions/calculators/files';
import { useToast } from '@/components/ui/toast';
import { ManualPrintEntry } from './ManualPrintEntry';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';

interface DesignFileUploaderProps {
  calculatorType: CalculatorType;
  onUploadSuccess: (file: UploadedDesignFile) => void;
  className?: string;
}

type Mode = 'upload' | 'manual';

export function DesignFileUploader({
  calculatorType,
  onUploadSuccess,
  className,
}: DesignFileUploaderProps) {
  const [mode, setMode] = useState<Mode>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      setUploadProgress(10);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const result = await uploadDesignFile(formData, calculatorType);
          if (result.success && result.data) {
            const uploadedFile = result.data;
            onUploadSuccess(uploadedFile);
            toast(`Файл ${file.name} успешно добавлен.`, 'success');
          } else {
            toast(result.error || `Не удалось загрузить ${file.name}`, 'destructive');
          }
        } catch {
          toast(`Ошибка при отправке файла ${file.name}`, 'destructive');
        }
      }

      setIsUploading(false);
      setUploadProgress(0);
    },
    [calculatorType, onUploadSuccess, toast]
  );

  const formats = CALCULATOR_FILE_FORMATS[calculatorType];
  const accept: Record<string, string[]> = {};
  
  formats.forEach((f: FileFormatConfig) => {
    f.mimeTypes.forEach((mime: string) => {
      if (!accept[mime]) accept[mime] = [];
      f.extensions.forEach((ext: string) => {
        const dotExt = `.${ext}`;
        if (!accept[mime].includes(dotExt)) {
          accept[mime].push(dotExt);
        }
      });
    });
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    disabled: isUploading,
  });

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Tab switcher */}
      <SegmentedControl
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        options={[
          { value: 'upload', label: 'Загрузить файл', icon: Upload },
          { value: 'manual', label: 'Ввести вручную', icon: PenLine },
        ]}
        className="w-full"
      />

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center outline-none',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30',
            isUploading && 'opacity-60 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />

          <div className="bg-primary/10 p-4 rounded-full mb-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-lg text-foreground">{isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы или нажмите для выбора'}</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Поддерживаются: {formats.map((f: FileFormatConfig) => f.extensions.join(', ')).join('; ')}
            </p>
          </div>

          {isUploading && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-background/80 backdrop-blur-sm rounded-b-xl border-t">
              <div className="flex items-center gap-3">
                <Progress value={uploadProgress} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground">Загрузка...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="border rounded-xl p-5 bg-muted/20">
          <ManualPrintEntry
            calculatorType={calculatorType}
            onAdd={(file) => {
              onUploadSuccess(file);
              setMode('upload');
              const term = CALCULATOR_TYPES_CONFIG[calculatorType].terminology;
              toast(`${term.item.charAt(0).toUpperCase() + term.item.slice(1)} «${file.originalName}» добавлен.`, 'success');
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          {mode === 'upload'
            ? <span>Максимальный размер: {Math.max(...formats.map((f: FileFormatConfig) => f.maxSizeMB))} МБ</span>
            : <span>Укажите размеры {CALCULATOR_TYPES_CONFIG[calculatorType].terminology.itemGenitive} в мм и количество</span>
          }
        </div>

        {mode === 'upload' && (
          <Tooltip
            content={
              <div className="space-y-2">
                {formats.map((f: FileFormatConfig, i: number) => (
                  <div key={i} className="border-b last:border-0 pb-2 last:pb-0">
                    <p className="font-bold text-xs">{f.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      .{f.extensions.join(', .')}
                    </p>
                  </div>
                ))}
              </div>
            }
          >
            <button 
              type="button"
              className="hover:text-foreground underline decoration-dotted transition-colors"
            >
              Подробнее о форматах
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
