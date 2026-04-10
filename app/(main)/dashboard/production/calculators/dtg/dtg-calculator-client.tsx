'use client';

import { useMemo } from 'react';
import { Droplets, Info } from 'lucide-react';
import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import {
 DTG_PRETREATMENT_TYPES,
 DTG_RESOLUTION_OPTIONS,
 DTG_INK_TYPES,
 GARMENT_COLOR_OPTIONS,
} from '@/lib/types/calculators';
import type { DTGCalculatorParams } from '@/lib/types/calculator-configs';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/**
 * Клиентский компонент DTG калькулятора
 */
export function DTGCalculatorClient() {
 const calculator = useCalculator('dtg');
 
 const params = calculator.params as DTGCalculatorParams;
 const updateParams = calculator.updateParams as (updates: Partial<DTGCalculatorParams>) => void;

 /**
  * Расчёт стоимости предобработки (вспомогательный, для информации)
  */
 const pretreatmentCost = useMemo(() => {
  if (params.pretreatmentType === 'none') return 0;
  // Стоимость за единицу: тёмное — 50р, светлое — 30р
  const costPerItem = params.pretreatmentType === 'dark' ? 50 : 30;
  return costPerItem * (params.quantity || 1);
 }, [params.pretreatmentType, params.quantity]);

 /**
  * Обработчик изменения цвета изделия
  */
 const handleGarmentColorChange = (color: string) => {
  const c = color as 'light' | 'dark';
  updateParams({
   garmentColor: c,
   whiteUnderbase: c === 'dark',
   pretreatmentType: c === 'dark' ? 'dark' : (params.pretreatmentType === 'dark' ? 'none' : params.pretreatmentType),
  });
 };

 const garmentColorOptions = useMemo(() => 
  GARMENT_COLOR_OPTIONS.map(opt => ({
   id: opt.value,
   title: opt.label,
   description: opt.value === 'dark' ? 'Требуется праймер' : undefined
  })), []);

 const resolutionOptions = useMemo(() => 
  DTG_RESOLUTION_OPTIONS.map(opt => ({
   id: String(opt.value),
   title: opt.label
  })), []);

 const inkTypeOptions = useMemo(() => 
  DTG_INK_TYPES.map(opt => ({
   id: opt.value,
   title: opt.label
  })), []);

 const pretreatmentOptions = useMemo(() => 
  DTG_PRETREATMENT_TYPES.map(opt => ({
   id: opt.value,
   title: opt.label
  })), []);

 const whitePassOptions = [
  { id: '1', title: '1 проход' },
  { id: '2', title: '2 прохода' },
  { id: '3', title: '3 прохода' },
 ];

 /* Секция Технологии для слота beforeFilesContent */
 const technologySection = (
  <CalculatorSection title="Технология">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="space-y-3">
     <div className="space-y-2">
      <Label>Предобработка (Праймер)</Label>
      <Select options={pretreatmentOptions} value={params.pretreatmentType || ''} onChange={(val) => updateParams({ pretreatmentType: val as DTGCalculatorParams['pretreatmentType'] })}
       disabled={params.garmentColor === 'dark'}
      />
     </div>

     <div className="space-y-2">
      <Label>Проходов белого</Label>
      <Select options={whitePassOptions} value={String(params.whitePassCount || '')} onChange={(val) => updateParams({ whitePassCount: parseInt(val) as DTGCalculatorParams['whitePassCount'] })}
       disabled={!params.whiteUnderbase}
      />
     </div>
    </div>

    <div className="flex flex-col justify-center space-y-3">
     <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-colors",
      params.whiteUnderbase ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-200"
     )}>
      <div className="space-y-0.5">
       <Label className="text-base font-bold">Белая подложка</Label>
       <p className="text-xs text-muted-foreground">Для яркости на цветном текстиле</p>
      </div>
      <Switch checked={params.whiteUnderbase} onCheckedChange={(checked) => updateParams({ whiteUnderbase: checked })}
       disabled={params.garmentColor === 'dark'}
      />
     </div>

     {pretreatmentCost > 0 && (
      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-bold">
       <span className="text-emerald-800 flex items-center gap-2">
        <Info className="h-4 w-4" />
        Праймер:
       </span>
       <span className="text-emerald-900">{formatCurrency(pretreatmentCost)}</span>
      </div>
     )}
    </div>
   </div>
  </CalculatorSection>
 );

 return (
  <BaseCalculatorForm calculatorType="dtg" calculator={calculator} beforeFilesContent={technologySection} calculateButtonText="Рассчитать стоимость">
   <div className="space-y-3">
    {params.garmentColor === 'dark' && (
     <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
      <Droplets className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800">
       <p className="font-semibold">Тёмная ткань</p>
       <p className="opacity-90">Потребуется праймер и белая подложка (включено автоматически).</p>
      </div>
     </div>
    )}

    <CalculatorSection title="Основные параметры">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-3">
       <div className="space-y-2">
        <Label>Количество изделий</Label>
        <Input type="number" min={1} value={params.quantity || 1} onChange={(e) => updateParams({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
        />
       </div>

       <div className="space-y-2">
        <Label>Цвет изделия</Label>
        <Select options={garmentColorOptions} value={params.garmentColor || ''} onChange={handleGarmentColorChange} />
       </div>
      </div>

      <div className="space-y-3">
       <div className="space-y-2">
        <Label>Разрешение печати</Label>
        <Select options={resolutionOptions} value={String(params.printResolution || '')} onChange={(val) => updateParams({ printResolution: parseInt(val) as DTGCalculatorParams['printResolution'] })}
        />
       </div>

       <div className="space-y-2">
        <Label>Тип чернил</Label>
        <Select options={inkTypeOptions} value={params.inkType || ''} onChange={(val) => updateParams({ inkType: val as DTGCalculatorParams['inkType'] })}
        />
       </div>
      </div>
     </div>
    </CalculatorSection>
   </div>
  </BaseCalculatorForm>
 );
}
