'use client';

import { useMemo } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import { BaseCalculatorForm } from '../components/BaseCalculatorForm';
import { CalculatorSection } from '../components/UnifiedCalculatorLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCalculator } from '../hooks/use-calculator';
import { formatCurrency } from '@/lib/utils/format';
import {
  SILKSCREEN_INK_TYPES,
  MESH_SIZE_OPTIONS,
  SUBSTRATE_TYPES,
} from '@/lib/types/calculators';
import type { SilkscreenCalculatorParams } from '@/lib/types/calculator-configs';

/**
 * Клиентский компонент калькулятора шелкографии
 */
export function SilkscreenCalculatorClient() {
  const calculator = useCalculator('silkscreen');
  
  const params = calculator.params as SilkscreenCalculatorParams;
  const updateParams = calculator.updateParams as (updates: Partial<SilkscreenCalculatorParams>) => void;

  const colorCount = params.colorCount || 1;
  const quantity = params.quantity || 1;

  /** Расчет минимальной рентабельности для шелкографии */
  const setupCost = useMemo(() => colorCount * 1500, [colorCount]);
  const minProfitableQuantity = useMemo(() => Math.max(50, colorCount * 20), [colorCount]);

  /* Контент, который будет выведен ПЕРЕД секцией файлов дизайна */
  const beforeFilesContent = (
    <>
      {quantity < minProfitableQuantity && quantity > 0 && (
        <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs font-medium">
            Рекомендуемый минимальный тираж для {colorCount}{' '}
            {colorCount === 1 ? 'цвета' : 'цветов'}: {minProfitableQuantity} шт.
            Шелкография нерентабельна на малых тиражах.
          </AlertDescription>
        </Alert>
      )}

      <CalculatorSection title="Подготовка производства">
        <Card className="border-slate-200 bg-slate-50/30 shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-slate-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Вывод плёнок и засветка сеток</p>
                  <p className="text-xs text-slate-500 font-bold">
                    {colorCount} {colorCount === 1 ? 'форма' : 'форм'}
                    {params.needsWhiteBase && ' + 1 для подложки'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{formatCurrency(setupCost)}</p>
                <p className="text-xs text-slate-500 font-bold">
                  Единоразово
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CalculatorSection>
    </>
  );

  return (
    <BaseCalculatorForm
      calculatorType="silkscreen"
      calculator={calculator}
      beforeFilesContent={beforeFilesContent}
    >
      <CalculatorSection title="Основные параметры">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-3">
            <Label htmlFor="silk-quantity">Тираж (шт)</Label>
            <Input
              id="silk-quantity"
              type="number"
              min={1}
              value={params.quantity || 1}
              onChange={(e) => updateParams({ quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Цветов: {colorCount}</Label>
              <span className="text-xs font-bold text-primary">{colorCount} / 8</span>
            </div>
            <Slider
              value={[colorCount]}
              onValueChange={([value]) => updateParams({ colorCount: value as SilkscreenCalculatorParams['colorCount'] })}
              min={1}
              max={8}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <Label>Тип краски</Label>
            <Select
              options={SILKSCREEN_INK_TYPES.map(t => ({ id: t.value, title: t.label }))}
              value={params.inkType || ''}
              onChange={(value) => updateParams({ inkType: value as SilkscreenCalculatorParams['inkType'] })}
            />
          </div>

          <div className="space-y-3">
            <Label>Размер сетки</Label>
            <Select
              options={MESH_SIZE_OPTIONS.map(o => ({ id: String(o.value), title: o.label }))}
              value={String(params.meshSize || '')}
              onChange={(value) => updateParams({ meshSize: parseInt(value) as SilkscreenCalculatorParams['meshSize'] })}
            />
          </div>

          <div className="space-y-3">
            <Label>Цвет изделия</Label>
            <Select
              options={SUBSTRATE_TYPES.map(t => ({ id: t.value, title: t.label }))}
              value={params.substrateType || ''}
              onChange={(value) => updateParams({ substrateType: value as SilkscreenCalculatorParams['substrateType'] })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
            <div className="space-y-0.5">
              <Label htmlFor="whiteBase">Белая подложка</Label>
              <p className="text-xs text-slate-500 font-bold">
                Для тёмных тканей
              </p>
            </div>
            <Switch
              id="whiteBase"
              checked={params.needsWhiteBase}
              onCheckedChange={(checked) => updateParams({ needsWhiteBase: checked })}
              disabled={params.substrateType === 'light'}
            />
          </div>
        </div>
      </CalculatorSection>
    </BaseCalculatorForm>
  );
}
