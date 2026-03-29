'use client';

import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { useCalculator } from '../hooks/use-calculator';
import { 
  UV_DTF_FILM_TYPES, 
  UV_DTF_FINISH_TYPES,
} from '@/lib/types/calculators';
import type { UVDTFCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент UV DTF калькулятора
 */
export function UVDTFCalculatorClient() {
  const calculator = useCalculator('uv-dtf');
  
  // Явно типизируем параметры
  const params = calculator.params as UVDTFCalculatorParams;
  const updateParams = calculator.updateParams as (updates: Partial<UVDTFCalculatorParams>) => void;

  return (
    <BaseCalculatorForm
      calculatorType="uv-dtf"
      calculator={calculator}
      showRollVisualizer={true}
    >
      <CalculatorSection title="Основные параметры">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          
          <div className="space-y-3">
            <Label htmlFor="uv-quantity">Количество изделий</Label>
            <Input
              id="uv-quantity"
              type="number"
              min={1}
              value={params.quantity === 0 ? '' : params.quantity}
              onChange={(e) => updateParams({ quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-3">
            <Label>Тип плёнки</Label>
            <Select
              options={UV_DTF_FILM_TYPES.map(t => ({ id: t.value, title: t.label }))}
              value={params.filmType || ''}
              onChange={(value) => updateParams({ filmType: value as UVDTFCalculatorParams['filmType'] })}
            />
          </div>

          <div className="space-y-3">
            <Label>Тип финиша</Label>
            <Select
              options={UV_DTF_FINISH_TYPES.map(t => ({ id: t.value, title: t.label }))}
              value={params.finishType || ''}
              onChange={(value) => updateParams({ finishType: value as UVDTFCalculatorParams['finishType'] })}
            />
          </div>


          <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
            <div className="space-y-0.5">
              <Label htmlFor="uv-lamination">Ламинация</Label>
              <p className="text-xs text-slate-500 font-bold">
                Защитный слой
              </p>
            </div>
            <Switch
              id="uv-lamination"
              checked={params.withLamination}
              onCheckedChange={(checked) => updateParams({ withLamination: checked })}
            />
          </div>


        </div>
      </CalculatorSection>
    </BaseCalculatorForm>
  );
}
