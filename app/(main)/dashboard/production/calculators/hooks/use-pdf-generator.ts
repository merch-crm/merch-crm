'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import type { 
 PDFCalculationData, 
 PDFGenerationOptions,
} from '@/lib/types/pdf';

interface UsePDFGeneratorReturn {
 /** Генерация в процессе */
 isGenerating: boolean;
 /** Ошибка генерации */
 error: string | null;
 /** Генерирует и скачивает PDF */
 generateAndDownload: (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ) => Promise<void>;
 /** Генерирует PDF и возвращает Blob */
 generateBlob: (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ) => Promise<Blob | null>;
 /** Открывает PDF в новой вкладке */
 generateAndOpen: (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ) => Promise<void>;
}

/**
 * Хук для генерации PDF документов
 * @returns Методы и состояние генератора
 */
export function usePDFGenerator(): UsePDFGeneratorReturn {
 const [isGenerating, setIsGenerating] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const { toast } = useToast();

 /**
  * Выполняет запрос на генерацию PDF
  */
 const fetchPDF = useCallback(async (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ): Promise<{ blob: Blob; filename: string } | null> => {
  setIsGenerating(true);
  setError(null);

  try {
   const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ calculationData: data, options }),
   });

   if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка генерации PDF');
   }

   const blob = await response.blob();
   const contentDisposition = response.headers.get('Content-Disposition');
   const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
   const filename = filenameMatch?.[1] || `document_${Date.now()}.pdf`;

   return { blob, filename };
  } catch (err) {
   const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
   setError(message);
    toast(message, 'error');
   return null;
  } finally {
   setIsGenerating(false);
  }
 }, [toast]);

 /**
  * Генерирует и скачивает PDF
  */
 const generateAndDownload = useCallback(async (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ): Promise<void> => {
  const result = await fetchPDF(data, options);
  
  if (result) {
   // Создаём ссылку для скачивания
   const url = URL.createObjectURL(result.blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = result.filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);

   toast(`PDF создан: файл ${result.filename} скачан`, 'success');
  }
 }, [fetchPDF, toast]);

 /**
  * Генерирует PDF и возвращает Blob
  */
 const generateBlob = useCallback(async (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ): Promise<Blob | null> => {
  const result = await fetchPDF(data, options);
  return result?.blob || null;
 }, [fetchPDF]);

 /**
  * Генерирует и открывает PDF в новой вкладке
  */
 const generateAndOpen = useCallback(async (
  data: PDFCalculationData,
  options?: Partial<PDFGenerationOptions>
 ): Promise<void> => {
  const result = await fetchPDF(data, options);
  
  if (result) {
   const url = URL.createObjectURL(result.blob);
   window.open(url, '_blank');
   
   // Освобождаем URL через некоторое время
   setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
 }, [fetchPDF]);

 return {
  isGenerating,
  error,
  generateAndDownload,
  generateBlob,
  generateAndOpen,
 };
}
