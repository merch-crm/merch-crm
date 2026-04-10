'use client';

import { AlertCircle } from 'lucide-react';
import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import {
 SUBLIMATION_SUBSTRATE_TYPES,
 SUBLIMATION_PAPER_TYPES,
 ROLL_WIDTH_OPTIONS,
} from '@/lib/types/calculators';
import type { SublimationCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент калькулятора сублимации
 */
export function SublimationCalculatorClient() {
 const calculator = useCalculator('sublimation');
 
 const params = calculator.params as SublimationCalculatorParams;
 const updateParams = calculator.updateParams as (updates: Partial<SublimationCalculatorParams>) => void;

 const substrateLabel = SUBLIMATION_SUBSTRATE_TYPES.find(t => t.value === params.substrateType)?.label;

 return (
  <BaseCalculatorForm calculatorType="sublimation" calculator={calculator} showRollVisualizer={true}>
   {params.substrateType !== 'polyester' && (
    <div className="mb-4 flex gap-3 items-start rounded-md bg-blue-50 border border-blue-200 p-4 text-blue-800">
     <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
     <div className="text-sm font-medium">
      Сублимация предназначена для синтетических тканей (полиэстер &gt; 60%). 
      <br />
      Текущий носитель: {substrateLabel || 'не выбран'}.
     </div>
    </div>
   )}

   {/* Основные параметры */}
   <CalculatorSection title="Основные параметры">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
     <div className="space-y-3">
      <Label htmlFor="sub-quantity">Количество изделий</Label>
      <Input id="sub-quantity" type="number" min={1} value={params.quantity || 1} onChange={(e) => updateParams({ quantity: parseInt(e.target.value) || 1 })}
      />
     </div>

     <div className="space-y-3">
      <Label>Тип носителя</Label>
      <Select options={SUBLIMATION_SUBSTRATE_TYPES.map(t => ({ id: t.value, title: t.label }))}
       value={params.substrateType || ''}
       onChange={(value) => updateParams({ substrateType: value as SublimationCalculatorParams['substrateType'] })}
      />
     </div>

     <div className="space-y-3">
      <Label>Тип бумаги</Label>
      <Select options={SUBLIMATION_PAPER_TYPES.map(t => ({ id: t.value, title: t.label }))}
       value={params.paperType || ''}
       onChange={(value) => updateParams({ paperType: value as SublimationCalculatorParams['paperType'] })}
      />
     </div>

     <div className="space-y-3">
      <Label>Ширина рулона</Label>
      <Select options={ROLL_WIDTH_OPTIONS.map(o => ({ id: String(o.value), title: o.label }))}
       value={String(params.rollWidth || '')}
       onChange={(value) => updateParams({ rollWidth: parseInt(value) as SublimationCalculatorParams['rollWidth'] })}
      />
     </div>
    </div>
   </CalculatorSection>
  </BaseCalculatorForm>
 );
}
