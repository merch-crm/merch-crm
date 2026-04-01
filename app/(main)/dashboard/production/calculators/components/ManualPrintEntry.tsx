'use client';

/**
 * @fileoverview Форма ручного добавления принта без загрузки файла
 * @module components/calculators/ManualPrintEntry
 */

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadedDesignFile, CalculatorType, CALCULATOR_TYPES_CONFIG } from '@/lib/types/calculators';
import { cn } from '@/lib/utils';

interface ManualPrintEntryProps {
  calculatorType: CalculatorType;
  onAdd: (file: UploadedDesignFile) => void;
  className?: string;
}

function createManualEntry(
  calculatorType: CalculatorType,
  name: string,
  widthMm: number,
  heightMm: number,
  quantity: number,
  stitchCount?: number
): UploadedDesignFile {
  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; // suppressHydrationWarning
  const term = CALCULATOR_TYPES_CONFIG[calculatorType].terminology;
  
  return {
    id,
    originalName: name || `${term.item.charAt(0).toUpperCase() + term.item.slice(1)} ${widthMm}×${heightMm} мм`,
    storedName: `${id}.manual`,
    mimeType: 'application/octet-stream',
    sizeBytes: 0,
    filePath: '',
    fileUrl: '',
    thumbnailUrl: undefined,
    dimensions: undefined,
    userDimensions: { widthMm, heightMm },
    quantity,
    calculatorType,
    uploadedAt: new Date(), // suppressHydrationWarning
    isManual: true,
    embroideryData: calculatorType === 'embroidery' ? {
      stitchCount: stitchCount || Math.round((widthMm * heightMm / 100) * 450), // Примерный расчет по плотности 4.5
      colorCount: 1,
      trimsCount: 0,
      totalThreadLengthMm: 0,
    } : undefined
  } as UploadedDesignFile;
}

export function ManualPrintEntry({
  calculatorType,
  onAdd,
  className,
}: ManualPrintEntryProps) {
  const [name, setName] = useState('');
  const [widthMm, setWidthMm] = useState<string>('');
  const [heightMm, setHeightMm] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [stitchCount, setStitchCount] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const term = CALCULATOR_TYPES_CONFIG[calculatorType].terminology;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Укажите название';
    if (!widthMm || Number(widthMm) <= 0) errs.widthMm = 'Укажите ширину';
    if (!heightMm || Number(heightMm) <= 0) errs.heightMm = 'Укажите высоту';
    if (!quantity || Number(quantity) < 1) errs.quantity = 'Мин. 1';
    return errs;
  };

  const handleAdd = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const entry = createManualEntry(
      calculatorType,
      name.trim(),
      Number(widthMm),
      Number(heightMm),
      Math.max(1, Number(quantity)),
      stitchCount ? Number(stitchCount) : undefined
    );
    onAdd(entry);
    // Reset
    setName('');
    setWidthMm('');
    setHeightMm('');
    setQuantity('1');
    setStitchCount('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className={cn('w-full', className)}>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Ряд 1: Название и Тираж */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className={cn(
            "text-sm font-semibold transition-colors font-sans",
            errors.name ? "text-destructive" : "text-slate-900/80"
          )}>
            Название <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={term.placeholder}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-slate-50/80 border-slate-200 rounded-2xl shadow-none hover:border-slate-300 hover:bg-slate-100/50 transition-all h-12 text-sm placeholder:text-slate-400", 
              errors.name && "border-destructive bg-destructive/5"
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className={cn(
            "text-sm font-semibold transition-colors font-sans",
            errors.quantity ? "text-destructive" : "text-slate-900/80"
          )}>
            Тираж (шт) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({ ...p, quantity: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-slate-50/80 border-slate-200 rounded-2xl shadow-none hover:border-slate-300 hover:bg-slate-100/50 transition-all h-12 text-sm placeholder:text-slate-400", 
              errors.quantity && "border-destructive bg-destructive/5"
            )}
          />
        </div>

        {/* Ряд 2: Параметры размера */}
        <div className="space-y-1.5">
          <label className={cn(
            "text-sm font-semibold transition-colors font-sans",
            errors.widthMm ? "text-destructive" : "text-slate-900/80"
          )}>
            Ширина (мм) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="напр. 200"
            value={widthMm}
            onChange={(e) => { setWidthMm(e.target.value); setErrors(p => ({ ...p, widthMm: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-slate-50/80 border-slate-200 rounded-2xl shadow-none hover:border-slate-300 hover:bg-slate-100/50 transition-all h-12 text-sm placeholder:text-slate-400", 
              errors.widthMm && "border-destructive bg-destructive/5"
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className={cn(
            "text-sm font-semibold transition-colors font-sans",
            errors.heightMm ? "text-destructive" : "text-slate-900/80"
          )}>
            Высота (мм) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="напр. 300"
            value={heightMm}
            onChange={(e) => { setHeightMm(e.target.value); setErrors(p => ({ ...p, heightMm: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-slate-50/80 border-slate-200 rounded-2xl shadow-none hover:border-slate-300 hover:bg-slate-100/50 transition-all h-12 text-sm placeholder:text-slate-400", 
              errors.heightMm && "border-destructive bg-destructive/5"
            )}
          />
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="h-12 flex items-center px-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-slate-500 font-medium font-sans">
            {widthMm && heightMm
              ? `≈ ${((Number(widthMm) * Number(heightMm)) / 100).toFixed(0)} см²`
              : '— площадь'}
          </div>
        </div>

        {/* Стежки (только для вышивки) - в новом ряду если есть */}
        {calculatorType === 'embroidery' && (
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-sm font-semibold text-slate-900/80 font-sans">
              Стежки <span className="font-normal text-slate-400 text-xs">(авторасчет если пусто)</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="напр. 5000"
              value={stitchCount}
              onChange={(e) => setStitchCount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6 pt-4 border-t border-slate-100">
        <Button
          type="button"
          onClick={handleAdd}
          className="rounded-xl h-10 px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {term.action}
        </Button>
      </div>
    </div>
  );
}
