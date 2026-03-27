'use client';

/**
 * @fileoverview Форма ручного добавления принта без загрузки файла
 * @module components/calculators/ManualPrintEntry
 */

import React, { useState } from 'react';
import { PlusCircle, Ruler, Hash, Type, Scissors } from 'lucide-react';
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
  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
    uploadedAt: new Date(),
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
    <div className={cn('w-full space-y-3', className)}>
      <p className="text-xs font-semibold text-muted-foreground tracking-normal">
        Параметры {term.itemGenitive}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Название */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Type className="h-3 w-3" />
            Название <span className="font-normal">(опционально)</span>
          </label>
          <Input
            placeholder={term.placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 text-sm bg-background/50"
          />
        </div>

        {/* Ширина */}
        <div className="space-y-1">
          <label className={cn(
            "text-xs font-bold flex items-center gap-1",
            errors.widthMm ? "text-destructive" : "text-muted-foreground"
          )}>
            <Ruler className="h-3 w-3" />
            Ширина (мм) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="напр. 200"
            value={widthMm}
            onChange={(e) => { setWidthMm(e.target.value); setErrors(p => ({ ...p, widthMm: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn("h-9 text-sm font-semibold bg-background/50", errors.widthMm && "border-destructive")}
          />
        </div>

        {/* Высота */}
        <div className="space-y-1">
          <label className={cn(
            "text-xs font-bold flex items-center gap-1",
            errors.heightMm ? "text-destructive" : "text-muted-foreground"
          )}>
            <Ruler className="h-3 w-3 rotate-90" />
            Высота (мм) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="напр. 300"
            value={heightMm}
            onChange={(e) => { setHeightMm(e.target.value); setErrors(p => ({ ...p, heightMm: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn("h-9 text-sm font-semibold bg-background/50", errors.heightMm && "border-destructive")}
          />
        </div>

        {/* Тираж */}
        <div className="space-y-1">
          <label className={cn(
            "text-xs font-bold flex items-center gap-1",
            errors.quantity ? "text-destructive" : "text-muted-foreground"
          )}>
            <Hash className="h-3 w-3" />
            Тираж (шт) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({ ...p, quantity: '' })); }}
            onKeyDown={handleKeyDown}
            className={cn("h-9 text-sm font-semibold bg-background/50", errors.quantity && "border-destructive")}
          />
        </div>

        {/* Стежки (только для вышивки) */}
        {calculatorType === 'embroidery' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Scissors className="h-3 w-3" />
              Стежки <span className="font-normal">(авторасчет если пусто)</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="напр. 5000"
              value={stitchCount}
              onChange={(e) => setStitchCount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm font-semibold bg-background border-primary/20"
            />
          </div>
        )}

        {/* Размер в см² — preview */}
        <div className="space-y-1 flex flex-col justify-end">
          <div className="h-9 flex items-center px-3 rounded-md bg-muted/40 border border-dashed text-xs text-muted-foreground font-medium">
            {widthMm && heightMm
              ? `≈ ${((Number(widthMm) * Number(heightMm)) / 100).toFixed(0)} см²`
              : '— площадь'}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleAdd}
        className="w-full h-9 gap-2 text-sm font-semibold"
        variant="outline"
      >
        <PlusCircle className="h-4 w-4" />
        {term.action}
      </Button>
    </div>
  );
}
