/**
 * @fileoverview Блок результата расчёта калькулятора
 * @module calculators/components/CalculatorResultBlock
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import {
  CostBreakdown,
  UrgencyLevel,
  UrgencySettings,
} from '@/lib/types/calculators';
import { formatCurrency } from '@/lib/utils/format';

/**
 * Пропсы блока результата расчёта
 */
interface CalculatorResultBlockProps {
  /** Разбивка себестоимости */
  costBreakdown: CostBreakdown;
  /** Количество изделий */
  quantity: number;
  /** Текущий процент маржи */
  marginPercent: number;
  /** Обработчик изменения маржи */
  onMarginChange: (value: number) => void;
  /** Текущая цена продажи (для двусторонней связи) */
  sellingPrice?: number;
  /** Обработчик прямого изменения цены продажи */
  onSellingPriceChange?: (value: number) => void;
  /** Настройки срочности */
  urgencySettings: UrgencySettings;
  /** Текущий уровень срочности */
  urgencyLevel: UrgencyLevel;
  /** Обработчик изменения срочности */
  onUrgencyChange: (level: UrgencyLevel) => void;
  /** Показывать детали себестоимости */
  showCostDetails?: boolean;
}

/**
 * Блок результата расчёта с маржой, срочностью и итоговой ценой
 */
export function CalculatorResultBlock({
  costBreakdown,
  quantity,
  marginPercent,
  onMarginChange,
  sellingPrice: externalSellingPrice,
  onSellingPriceChange,
  urgencySettings,
  urgencyLevel,
  onUrgencyChange,
  showCostDetails = true,
}: CalculatorResultBlockProps) {
  // Расчёт итогов
  const totalCost = costBreakdown.total;
  const urgencySurchargePercent =
    urgencyLevel === 'urgent' ? (urgencySettings.urgentSurcharge || 0) : 0;

  const marginAmountSync = totalCost * (marginPercent / 100);
  const calculatedSellingPrice = (totalCost + marginAmountSync) * (1 + urgencySurchargePercent / 100);
  const urgencySurcharge = calculatedSellingPrice - (totalCost + marginAmountSync);

  // Используем внешнюю цену, если передана, иначе вычисленную
  const displaySellingPrice = externalSellingPrice ?? calculatedSellingPrice;
  const pricePerItem = quantity > 0 ? displaySellingPrice / quantity : 0;
  const marginAmount = displaySellingPrice - totalCost - urgencySurcharge;

  // Локальное состояние для ручного ввода цены
  const [manualPriceInput, setManualPriceInput] = useState<string>('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Синхронизация при изменении внешней цены
  useEffect(() => {
    if (!isEditingPrice) {
      setManualPriceInput(displaySellingPrice.toFixed(2));
    }
  }, [displaySellingPrice, isEditingPrice]);

  /**
   * Обработчик ручного изменения цены продажи
   * Пересчитывает маржу на основе введённой цены
   */
  const handleManualPriceChange = (value: string) => {
    setManualPriceInput(value);
    const numValue = parseFloat(value);

    if (!isNaN(numValue) && numValue > 0 && totalCost > 0) {
      // Вычисляем маржу: 
      // price = (cost + marginAmount) * (1 + surchargePercent/100)
      // marginAmount = price / (1 + surchargePercent/100) - cost
      // newMargin = (marginAmount / cost) * 100
      const urgencySurchargePercent =
        urgencyLevel === 'urgent' ? (urgencySettings.urgentSurcharge || 0) : 0;
      
      const marginAmount = (numValue / (1 + urgencySurchargePercent / 100)) - totalCost;
      const newMargin = (marginAmount / totalCost) * 100;

      if (newMargin >= 0 && newMargin <= 500) {
        onMarginChange(Math.round(newMargin));
      }

      if (onSellingPriceChange) {
        onSellingPriceChange(numValue);
      }
    }
  };

  return (
    <Card className="">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Результат расчёта</h3>
        </div>
      </div>
      <CardContent className="p-6 space-y-3">
        {/* Себестоимость */}
        {showCostDetails && (
          <>
            <div className="space-y-3">
              <Label className="text-muted-foreground text-sm">
                Себестоимость
              </Label>
              <div className="space-y-1 text-sm">
                {costBreakdown.print > 0 && (
                  <div className="flex justify-between">
                    <span>Печать:</span>
                    <span>{String(formatCurrency(costBreakdown.print))}</span>
                  </div>
                )}
                {costBreakdown.materials > 0 && (
                  <div className="flex justify-between">
                    <span>Материалы:</span>
                    <span>{String(formatCurrency(costBreakdown.materials))}</span>
                  </div>
                )}
                {costBreakdown.placements > 0 && (
                  <div className="flex justify-between">
                    <span>Нанесения:</span>
                    <span>{String(formatCurrency(costBreakdown.placements))}</span>
                  </div>
                )}
                {costBreakdown.programCost && costBreakdown.programCost > 0 && (
                  <div className="flex justify-between">
                    <span>Программа:</span>
                    <span>{String(formatCurrency(costBreakdown.programCost))}</span>
                  </div>
                )}
                {costBreakdown.framesCost && costBreakdown.framesCost > 0 && (
                  <div className="flex justify-between">
                    <span>Рамки:</span>
                    <span>{String(formatCurrency(costBreakdown.framesCost))}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-medium pt-1 border-t">
                <span>Итого себестоимость:</span>
                <span>{String(formatCurrency(totalCost))}</span>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Маржа */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Маржа</Label>
            <Badge variant="secondary">{String(marginPercent)}%</Badge>
          </div>
          <Slider
            value={[marginPercent]}
            onValueChange={(values) => onMarginChange(values[0])}
            min={0}
            max={300}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>150%</span>
            <span>300%</span>
          </div>
          {marginAmount > 0 && (
            <p className="text-sm text-muted-foreground">
              Прибыль: {String(formatCurrency(marginAmount))}
            </p>
          )}
        </div>

        <Separator />

        {/* Срочность */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <Label>Срочный заказ</Label>
            </div>
            <Switch
              checked={urgencyLevel === 'urgent'}
              onCheckedChange={(checked) =>
                onUrgencyChange(checked ? 'urgent' : 'normal')
              }
            />
          </div>
          {urgencyLevel === 'urgent' && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>+{String(formatCurrency(urgencySurcharge))} за срочность</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Итоговая цена */}
        <div className="space-y-3">
          <Label>Цена продажи</Label>
          <Input
            type="number"
            value={manualPriceInput}
            onChange={(e) => handleManualPriceChange(e.target.value)}
            onFocus={() => setIsEditingPrice(true)}
            onBlur={() => setIsEditingPrice(false)}
            className="text-xl font-bold text-right rounded-md"
            min={0}
            step={0.01}
          />
          <p className="text-xs text-muted-foreground">
            Введите цену вручную для автоматического расчёта маржи
          </p>
        </div>

        {/* Цена за единицу */}
        {quantity > 1 && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
            <span className="text-sm">Цена за 1 шт:</span>
            <span className="font-semibold">{String(formatCurrency(pricePerItem))}</span>
          </div>
        )}

        {/* Количество */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Количество:</span>
          <span>{String(quantity)} шт</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default CalculatorResultBlock;
