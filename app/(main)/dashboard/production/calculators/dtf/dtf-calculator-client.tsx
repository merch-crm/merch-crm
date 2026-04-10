'use client';

import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import { DTF_FILM_TYPES } from '@/lib/types/calculators';
import type { DTFCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент DTF калькулятора
 */
export function DTFCalculatorClient() {
 const calculator = useCalculator('dtf');
 
 // Явно типизируем параметры
 const params = calculator.params as DTFCalculatorParams;
 const updateParams = calculator.updateParams as (updates: Partial<DTFCalculatorParams>) => void;

 return (
  <BaseCalculatorForm calculatorType="dtf" calculator={calculator} showRollVisualizer={true}>
   <CalculatorSection title="Основные параметры">
    <div className="grid grid-cols-2 gap-3">
     {/* Количество */}
     <div className="space-y-2">
      <Label htmlFor="quantity">Количество изделий</Label>
      <Input id="quantity" type="number" min={1} value={params.quantity === 0 ? '' : params.quantity} onChange={(e) => updateParams({ quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
      />
     </div>

     {/* Тип плёнки */}
     <div className="space-y-2">
      <Label>Тип плёнки</Label>
      <Select value={params.filmType || ''} options={DTF_FILM_TYPES.map(t => ({ id: t.value, title: t.label }))}
       onChange={(value) => updateParams({ filmType: value as DTFCalculatorParams['filmType'] })}
      />
     </div>


    </div>
   </CalculatorSection>
  </BaseCalculatorForm>
 );
}
