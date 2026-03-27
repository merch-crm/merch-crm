'use client';

import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCalculator } from '../hooks/use-calculator';
import { DTF_FILM_TYPES, ROLL_WIDTH_OPTIONS } from '@/lib/types/calculators';
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
    <BaseCalculatorForm
      calculatorType="dtf"
      calculator={calculator}
      showRollVisualizer={true}
    >
      <CalculatorSection title="Основные параметры">
        <div className="grid grid-cols-2 gap-3">
          {/* Количество */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Количество изделий</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={params.quantity || 1}
              onChange={(e) => updateParams({ quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* Тип плёнки */}
          <div className="space-y-2">
            <Select
              label="Тип плёнки"
              value={params.filmType || ''}
              options={DTF_FILM_TYPES.map(t => ({ id: t.value, title: t.label }))}
              onChange={(value) => updateParams({ filmType: value as DTFCalculatorParams['filmType'] })}
              compact
            />
          </div>

          {/* Ширина рулона */}
          <div className="space-y-2">
            <Select
              label="Ширина рулона"
              value={String(params.rollWidth || '')}
              options={ROLL_WIDTH_OPTIONS.map(o => ({ id: String(o.value), title: o.label }))}
              onChange={(value) => updateParams({ rollWidth: parseInt(value) as DTFCalculatorParams['rollWidth'] })}
              compact
            />
          </div>

          {/* Поворот */}
          <div className="flex items-center justify-between space-y-0 pt-6">
            <Label htmlFor="allowRotation">Разрешить поворот</Label>
            <Switch
              id="allowRotation"
              checked={params.allowRotation}
              onCheckedChange={(checked) => updateParams({ allowRotation: checked })}
            />
          </div>
        </div>
      </CalculatorSection>
    </BaseCalculatorForm>
  );
}
