/**
 * @fileoverview Хук для управления состоянием загруженных файлов дизайна
 * @module hooks/use-design-files
 * @requires lib/types/calculators
 * @requires lib/actions/calculators/files
 * @audit Создан 2026-03-25
 */

import { useState, useCallback, useMemo } from 'react';
import { UploadedDesignFile, CalculatorType } from '@/lib/types/calculators';
import { deleteDesignFile } from '@/lib/actions/calculators/files';
import { useToast } from '@/components/ui/toast';

export interface UseDesignFilesOptions {
 /** Тип калькулятора */
 calculatorType: CalculatorType;
 /** Начальный список файлов */
 initialFiles?: UploadedDesignFile[];
}

/**
 * Хук для управления списком файлов дизайна
 */
export function useDesignFiles({ calculatorType: _calculatorType, initialFiles = [] }: UseDesignFilesOptions) {
 const [files, setFiles] = useState<UploadedDesignFile[]>(initialFiles);
 const { toast } = useToast();


 /**
  * Добавляет файл в список
  */
 const addFile = useCallback((file: UploadedDesignFile) => {
  setFiles((prev) => [file, ...prev]);
 }, []);

 /**
  * Удаляет файл
  */
 const removeFile = useCallback(async (fileId: string) => {
  // Если id временный (начинается с 'temp-' или не является UUID), удаляем только локально
  const isManualEntry = fileId.startsWith('temp-') || fileId.length < 20;

  if (isManualEntry) {
   setFiles((prev) => prev.filter((f) => f.id !== fileId));
   return;
  }

  try {
   const result = await deleteDesignFile({ fileId });
   if (result.success) {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast('Файл удален', 'success');
   } else {
    toast(result.error || 'Ошибка при удалении', 'destructive');
   }
  } catch (_error) {
   toast('Ошибка при удалении', 'destructive');
  }
 }, [toast]);

 /**
  * Обновляет параметры файла (размеры, количество)
  */
 const updateFile = useCallback((fileId: string, updates: Partial<Pick<UploadedDesignFile, 'userDimensions' | 'quantity' | 'embroideryData'>>) => {
  setFiles((prev) =>
   prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
  );
 }, []);

 /**
  * Обновляет порядок файлов
  */
 const reorderFiles = useCallback((newFiles: UploadedDesignFile[]) => {
  setFiles(newFiles);
 }, []);

 /**
  * Очищает список
  */
 const clearAll = useCallback(() => {
  setFiles([]);
 }, []);

 /**
  * Статистика по всем файлам
  */
 const stats = useMemo(() => {
  return files.reduce(
   (acc, file) => {
    const qty = file.quantity || 1;
    
    // Площадь в м²
    if (file.userDimensions) {
     const areaM2 = (file.userDimensions.widthMm * file.userDimensions.heightMm * qty) / 1000000;
     acc.totalAreaM2 += areaM2;
    }

    // Стежки (для вышивки)
    if (file.embroideryData) {
     acc.totalStitches += (file.embroideryData.stitchCount || 0) * qty;
    }

    acc.totalQuantity += qty;
    acc.fileCount += 1;
    
    return acc;
   },
   { totalAreaM2: 0, totalStitches: 0, totalQuantity: 0, fileCount: 0 }
  );
 }, [files]);

 return {
  files,
  addFile,
  removeFile,
  updateFile,
  reorderFiles,
  clearAll,
  stats,
 };
}
