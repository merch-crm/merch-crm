'use client';

import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import {
 THERMOTRANSFER_TYPES,
 ROLL_WIDTH_OPTIONS,
} from '@/lib/types/calculators';
import type { ThermotransferCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент калькулятора термотрансфера
 */
export function ThermotransferCalculatorClient() {
 const calculator = useCalculator('thermotransfer');
 
 // Явно типизируем параметры
 const params = calculator.params as ThermotransferCalculatorParams;
 const updateParams = calculator.updateParams as (updates: Partial<ThermotransferCalculatorParams>) => void;

 return (
  <BaseCalculatorForm calculatorType="thermotransfer" calculator={calculator} showRollVisualizer={true}>
   <CalculatorSection title="Основные параметры">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
     <div className="space-y-3">
      <Label htmlFor="tt-quantity">Количество изделий</Label>
      <Input id="tt-quantity" type="number" min={1} value={params.quantity || 1} onChange={(e) => updateParams({ quantity: parseInt(e.target.value) || 1 })}
      />
     </div>

     <div className="space-y-3">
      <Label>Тип трансфера</Label>
      <Select options={THERMOTRANSFER_TYPES.map(t => ({ id: t.value, title: t.label }))}
       value={params.transferType || ''}
       onChange={(value) => updateParams({ transferType: value as ThermotransferCalculatorParams['transferType'] })}
      />
     </div>

     <div className="space-y-3">
      <Label>Ширина рулона</Label>
      <Select options={ROLL_WIDTH_OPTIONS.map(o => ({ id: String(o.value), title: o.label }))}
       value={String(params.rollWidth || '')}
       onChange={(value) => updateParams({ rollWidth: parseInt(value) as ThermotransferCalculatorParams['rollWidth'] })}
      />
     </div>

     <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
      <div className="space-y-0.5">
       <Label htmlFor="tt-plotter">Плоттер</Label>
       <p className="text-xs text-slate-500 font-bold">
        Использовать резку
       </p>
      </div>
      <Switch id="tt-plotter" checked={params.usePlotter} onCheckedChange={(checked) => updateParams({ usePlotter: checked })}
      />
     </div>
    </div>
   </CalculatorSection>
  </BaseCalculatorForm>
 );
}
