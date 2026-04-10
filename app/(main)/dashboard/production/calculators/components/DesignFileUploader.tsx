'use client';

/**
 * @fileoverview Компонент загрузки файлов дизайна
 * @module components/calculators/DesignFileUploader
 * @requires react-dropzone
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, PenLine, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CalculatorType, CALCULATOR_FILE_FORMATS, UploadedDesignFile, CALCULATOR_TYPES_CONFIG, type FileFormatConfig } from '@/lib/types/calculators';
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
 const [uploadError, setUploadError] = useState<string | null>(null);
 const { toast } = useToast();

 const onDrop = useCallback(
  async (acceptedFiles: File[]) => {
   if (acceptedFiles.length === 0) return;
   
   setIsUploading(true);
   setUploadError(null);
   setUploadProgress(0);

   let hasError = false;
   for (const file of acceptedFiles) {
    try {
     const uploadedFile = await new Promise<UploadedDesignFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('calculatorType', calculatorType);

      xhr.upload.onprogress = (event) => {
       if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
       }
      };

      xhr.onload = () => {
       if (xhr.status >= 200 && xhr.status < 300) {
        try {
         const response = JSON.parse(xhr.responseText);
         if (response.success && response.data) {
          resolve(response.data);
         } else {
          reject(new Error(response.error || 'Ошибка загрузки'));
         }
        } catch {
         reject(new Error('Ошибка обработки ответа'));
        }
       } else {
        try {
         const resp = JSON.parse(xhr.responseText);
         reject(new Error(resp.error || `Ошибка сервера (${xhr.status})`));
        } catch {
         reject(new Error(`Ошибка сервера (${xhr.status})`));
        }
       }
      };

      xhr.onerror = () => reject(new Error('Сетевая ошибка'));
      xhr.open('POST', '/api/calculators/upload');
      xhr.send(formData);
     });

     onUploadSuccess(uploadedFile);
     toast(`Файл ${file.name} успешно добавлен.`, 'success');
    } catch (err) {
     hasError = true;
     const message = err instanceof Error ? err.message : 'Ошибка загрузки';
     setUploadError(message);
     toast(message, 'destructive');
     break;
    }
   }

   if (!hasError) {
    setIsUploading(false);
    setUploadProgress(0);
   } else {
    setTimeout(() => {
     setIsUploading(false);
     setUploadProgress(0);
     setUploadError(null);
    }, 3000);
   }
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
   <SegmentedControl value={mode} onChange={(v) => setMode(v as Mode)}
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
       : 'border-muted-foreground/20 bg-slate-50 hover:border-primary/50 hover:bg-slate-100',
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
       Поддерживаются: png, jpg, jpeg, webp, svg, tiff, tif, ai, eps, pdf, cdr, svg.
      </p>
      <p className="text-xs font-bold text-primary/50 pt-1">
       Максимальный размер: {Math.max(...formats.map((f: FileFormatConfig) => f.maxSizeMB))} МБ
      </p>
     </div>

     {isUploading && (
      <div className={cn(
       "absolute inset-x-0 bottom-0 p-4 bg-background/80 backdrop-blur-sm rounded-b-xl border-t",
       uploadError && "bg-destructive/10 border-destructive/20"
      )}>
       <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
         <Progress value={uploadProgress} variant={uploadError ? "error" : "primary"} className="h-2 flex-1" />
         <span className={cn(
          "text-xs font-medium", 
          uploadError ? "text-destructive" : "text-muted-foreground"
         )}>
          {uploadError ? 'Ошибка' : 'Загрузка...'}
         </span>
        </div>
        {uploadError && (
         <p className="text-xs text-destructive font-bold truncate text-left">
          {uploadError}
         </p>
        )}
       </div>
      </div>
     )}
    </div>
   )}

   {/* Manual mode */}
   {mode === 'manual' && (
    <ManualPrintEntry calculatorType={calculatorType} onAdd={(file) => {
      onUploadSuccess(file);
      setMode('upload');
      const term = CALCULATOR_TYPES_CONFIG[calculatorType].terminology;
      toast(`${term.item.charAt(0).toUpperCase() + term.item.slice(1)} «${file.originalName}» добавлен.`, 'success');
     }}
    />
   )}
  </div>
 );
}
