'use client';

import { useMemo } from 'react';
import { Clock, Scissors } from 'lucide-react';
import { pluralize } from '@/lib/pluralize';
import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import {
 EMBROIDERY_FABRIC_TYPES,
 STABILIZER_TYPES,
 MACHINE_HEAD_OPTIONS,
 CALCULATOR_TYPES_CONFIG,
} from '@/lib/types/calculators';
import { formatNumber } from '@/lib/utils/format';
import type { EmbroideryCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент калькулятора вышивки
 */
export function EmbroideryCalculatorClient() {
 const calculator = useCalculator('embroidery');
 const { params: rawParams, updateParams: rawUpdateParams, designFiles } = calculator;
 const { terminology: term } = CALCULATOR_TYPES_CONFIG['embroidery'];

 // Строгая типизация
 const params = rawParams as EmbroideryCalculatorParams;
 const updateParams = rawUpdateParams as (updates: Partial<EmbroideryCalculatorParams>) => void;

 /** Расчет статистики вышивки на основе загруженных DST файлов */
 const embroideryStats = useMemo(() => {
  const totalStitches = designFiles.files.reduce((sum, f) => sum + (f.embroideryData?.stitchCount || 0) * f.quantity, 0);
  const totalColors = designFiles.files.reduce((max, f) => Math.max(max, f.embroideryData?.colorCount || 0), 0);
  const colors = designFiles.files.find(f => (f.embroideryData?.colors?.length || 0) > 0)?.embroideryData?.colors || [];
  const totalThreadLengthMm = designFiles.files.reduce((sum, f) => sum + (f.embroideryData?.totalThreadLengthMm || 0) * f.quantity, 0);
  const totalTrims = designFiles.files.reduce((sum, f) => sum + (f.embroideryData?.trimsCount || 0) * f.quantity, 0);

  const machineHeads = params.machineHeads || 1;
  const stitchesPerMinute = 800 * machineHeads;
  const timeMinutes = totalStitches > 0 ? Math.ceil(totalStitches / stitchesPerMinute) : 0;
  const colorChangeTime = totalColors * 0.5; // 30 секунд на смену цвета

  const totalTimeMinutes = timeMinutes + colorChangeTime;
  const hours = Math.floor(totalTimeMinutes / 60);
  const minutes = Math.round(totalTimeMinutes % 60);

  return {
   totalStitches,
   totalColors,
   colors,
   totalThreadLengthM: Math.round(totalThreadLengthMm / 1000 * 10) / 10,
   totalTrims,
   timeString: hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`,
  };
 }, [designFiles.files, params.machineHeads]);

 const hasDSTFiles = designFiles.files.some((f) => f.originalName?.toLowerCase().endsWith('.dst'));

 const beforeFilesContent = (
  !hasDSTFiles && designFiles.files.length === 0 ? (
   <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 border">
    <Scissors className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-xs font-medium">
     Загрузите DST файлы для автоматического подсчёта стежков.
     Или введите количество стежков вручную в параметрах файла.
    </AlertDescription>
   </Alert>
  ) : undefined
 );

 const afterFilesContent = embroideryStats.totalStitches > 0 ? (
  <CalculatorSection title="Детализация вышивки">
   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
    <Card className="border-slate-200 shadow-sm">
     <CardContent className="pt-4 flex flex-col items-center justify-center text-center p-3">
      <div className="text-lg font-bold text-slate-900 leading-none">
       {formatNumber(embroideryStats.totalStitches)}
      </div>
      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-1">
       Стежков
      </p>
     </CardContent>
    </Card>

    <Card className="border-slate-200 shadow-sm">
     <CardContent className="pt-4 flex flex-col items-center justify-center text-center p-3">
      <div className="flex flex-col items-center gap-1.5">
       <div className="text-lg font-bold text-slate-900 leading-none">
        {embroideryStats.totalColors}
       </div>
       {embroideryStats.colors.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 max-w-[80px]">
         {embroideryStats.colors.map((color, i) => (
          <div 
           key={i} 
           className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-sm"
           style={{ backgroundColor: color }}
           title={`Цвет ${i + 1}`}
          />
         ))}
        </div>
       )}
      </div>
      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-1">
       {pluralize(embroideryStats.totalColors, 'Цвет', 'Цвета', 'Цветов')}
      </p>
     </CardContent>
    </Card>

    <Card className="border-slate-200 shadow-sm">
     <CardContent className="pt-4 flex flex-col items-center justify-center text-center p-3">
      <div className="text-lg font-bold text-slate-900 leading-none">
       {embroideryStats.totalThreadLengthM} м
      </div>
      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-1">
       Расход нити
      </p>
     </CardContent>
    </Card>

    <Card className="border-slate-200 shadow-sm">
     <CardContent className="pt-4 flex flex-col items-center justify-center text-center p-3">
      <div className="text-lg font-bold text-slate-900 leading-none">
       {embroideryStats.totalTrims}
      </div>
      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-1">
       {pluralize(embroideryStats.totalTrims, 'Обрезка', 'Обрезки', 'Обрезок')}
      </p>
     </CardContent>
    </Card>

    <Card className="border-slate-200 shadow-sm">
     <CardContent className="pt-4 flex flex-col items-center justify-center text-center p-3">
      <div className="flex items-center gap-1.5 justify-center">
       <Clock className="h-3.5 w-3.5 text-slate-400" />
       <div className="text-lg font-bold text-slate-900 leading-none">
        {embroideryStats.timeString}
       </div>
      </div>
      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-1">
       Время
      </p>
     </CardContent>
    </Card>
   </div>
  </CalculatorSection>
 ) : undefined;

 return (
  <BaseCalculatorForm calculatorType="embroidery" calculator={calculator} filesSectionTitle={`Файлы ${term.itemGenitive} (DST)`} beforeFilesContent={beforeFilesContent} afterFilesContent={afterFilesContent}>
   <CalculatorSection title="Основные параметры">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
     <div className="space-y-3">
      <Label htmlFor="emb-quantity">Количество изделий</Label>
      <Input id="emb-quantity" type="number" min={1} value={params.quantity === 0 ? '' : params.quantity} onChange={(e) => updateParams({ quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
      />
     </div>

     <div className="space-y-3">
      <Label>Тип ткани</Label>
      <Select options={EMBROIDERY_FABRIC_TYPES.map(t => ({ id: t.value, title: t.label }))}
       value={params.fabricType || ''}
       onChange={(value) => updateParams({ fabricType: value as EmbroideryCalculatorParams['fabricType'] })}
      />
     </div>

     <div className="space-y-3">
      <Label>Стабилизатор</Label>
      <Select options={STABILIZER_TYPES.map(t => ({ id: t.value, title: t.label }))}
       value={params.stabilizerType || ''}
       onChange={(value) => updateParams({ stabilizerType: value as EmbroideryCalculatorParams['stabilizerType'] })}
      />
     </div>

     <div className="space-y-3">
      <Label>Голов машины</Label>
      <Select options={MACHINE_HEAD_OPTIONS.map(o => ({ id: String(o.value), title: o.label }))}
       value={String(params.machineHeads || 1)}
       onChange={(value) => updateParams({ machineHeads: parseInt(value) as EmbroideryCalculatorParams['machineHeads'] })}
      />
     </div>

     <div className="space-y-3">
      <Label htmlFor="stitchDensity">Плотность стежков (стежков/см²)</Label>
      <Input id="stitchDensity" type="number" min={1} max={10} step={0.1} value={params.stitchDensity === 0 ? '' : params.stitchDensity} onChange={(e) => updateParams({ stitchDensity: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
      />
     </div>
    </div>
   </CalculatorSection>
  </BaseCalculatorForm>
 );
}
