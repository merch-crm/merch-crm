/**
 * @fileoverview Блок результата расчёта калькулятора
 * @module calculators/components/CalculatorResultBlock
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect } from 'react';
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
 /** Количество принтов (для рулонной печати) */
 printCount?: number;
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
 printCount,
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
    onMarginChange(Math.round(newMargin * 100) / 100);
   }

   if (onSellingPriceChange) {
    onSellingPriceChange(numValue);
   }
  }
 };

 return (
  <div className="crm-card">
   <div className="card-breakout px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50 -mt-[var(--current-padding)]">
    <div className="flex items-center gap-3">
     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
      <TrendingUp className="h-5 w-5 text-indigo-600" />
     </div>
     <h3 className="text-lg font-bold text-slate-900 ">Результат расчёта</h3>
    </div>
   </div>
   <div className="pt-6 space-y-3">
    {/* Себестоимость */}
    {showCostDetails && (
     <div className="space-y-3">
      <Label className="text-slate-500 text-sm font-normal">
       Себестоимость
      </Label>
      <div className="space-y-1.5 text-sm">
       {costBreakdown.print > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-x-2">
         <span className="text-slate-500">Печать:</span>
         <span className="font-bold text-slate-700">{String(formatCurrency(costBreakdown.print))}</span>
        </div>
       )}
       {costBreakdown.materials > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-x-2">
         <span className="text-slate-500">Материалы:</span>
         <span className="font-bold text-slate-700">{String(formatCurrency(costBreakdown.materials))}</span>
        </div>
       )}
       {costBreakdown.placements > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-x-2">
         <span className="text-slate-500">Нанесения:</span>
         <span className="font-bold text-slate-700">{String(formatCurrency(costBreakdown.placements))}</span>
        </div>
       )}
       {costBreakdown.programCost && costBreakdown.programCost > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-x-2">
         <span className="text-slate-500">Программа:</span>
         <span className="font-bold text-slate-700">{String(formatCurrency(costBreakdown.programCost))}</span>
        </div>
       )}
       {costBreakdown.framesCost && costBreakdown.framesCost > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-x-2">
         <span className="text-slate-500">Рамки:</span>
         <span className="font-bold text-slate-700">{String(formatCurrency(costBreakdown.framesCost))}</span>
        </div>
       )}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-x-2 pt-2 border-t border-slate-100">
       <span className="font-bold text-slate-900">Итого себестоимость:</span>
       <span className="font-black text-indigo-600">{String(formatCurrency(totalCost))}</span>
      </div>
      <Separator className="bg-slate-100" />
     </div>
    )}

    {/* Маржа */}
    <div className="space-y-3">
     <div className="flex items-center justify-between">
      <Label className="font-bold text-slate-700">Маржа</Label>
      <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-100" color="gray">{String(marginPercent)}%</Badge>
     </div>
     <Slider value={[marginPercent]} onValueChange={(values) => onMarginChange(values[0])}
      min={0}
      max={300}
      step={5}
      className="w-full"
     />
     <div className="flex justify-between text-xs sm:text-xs font-black text-slate-400">
      <span>0%</span>
      <span>150%</span>
      <span>300%</span>
     </div>
     {marginAmount > 0 && (
      <p className="text-xs sm:text-sm font-medium text-emerald-600 flex items-center gap-1.5">
       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
       Прибыль: <span className="font-bold">{String(formatCurrency(marginAmount))}</span>
      </p>
     )}
     <Separator className="bg-slate-100" />
    </div>

    {/* Срочность */}
    <div className="space-y-3">
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
       <div className="p-1.5 bg-orange-50 rounded-lg">
        <Zap className="h-4 w-4 text-orange-500" />
       </div>
       <Label className="font-bold text-slate-700">Срочный заказ</Label>
      </div>
      <Switch checked={urgencyLevel === 'urgent'} onCheckedChange={(checked) =>
        onUrgencyChange(checked ? 'urgent' : 'normal')
       }
       className="scale-90"
      />
     </div>
     {urgencyLevel === 'urgent' && (
      <div className="flex items-center gap-2 text-xs sm:text-xs font-bold text-orange-700 bg-orange-50/80 p-2.5 rounded-xl border border-orange-100/50">
       <AlertCircle className="h-3.5 w-3.5" />
       <span>+{String(formatCurrency(urgencySurcharge))} за срочность</span>
      </div>
     )}
     <Separator className="bg-slate-100" />
    </div>

    {/* Итоговая цена */}
    <div className="space-y-3 pt-1">
     <Label className="text-sm font-normal text-slate-500">Цена продажи</Label>
     <div className="relative group">
      <Input type="number" value={manualPriceInput} onChange={(e) => handleManualPriceChange(e.target.value)}
       onFocus={() => setIsEditingPrice(true)}
       onBlur={() => setIsEditingPrice(false)}
       className="h-12 sm:h-14 text-lg sm:text-xl font-black text-right rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all pr-10"
       min={0}
       step={0.01}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold pointer-events-none group-focus-within:text-indigo-400">
       ₽
      </div>
     </div>
     <p className="text-xs sm:text-xs text-slate-400 font-medium leading-relaxed">
      Измените цену для автоматического расчёта маржи
     </p>
    </div>

     {/* Цена за единицу */}
     {quantity > 1 && (
      <div className="flex flex-wrap justify-between items-center p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 gap-2 mb-4">
       <span className="text-sm font-bold text-slate-600">Цена за 1 шт:</span>
       <span className="text-lg font-black text-indigo-600">{String(formatCurrency(pricePerItem))}</span>
      </div>
     )}

     {/* Количество */}
     <div className="space-y-2 pt-4 border-t border-slate-100 bg-white">
      <div className="flex flex-wrap justify-between items-center text-sm gap-x-2">
       <span className="text-slate-500 font-normal text-sm">Количество изделий:</span>
       <span className="font-bold text-slate-900">{String(quantity)} шт</span>
      </div>
      {printCount !== undefined && printCount > 0 && (
       <div className="flex flex-wrap justify-between items-center text-sm gap-x-2">
        <span className="text-slate-500 font-normal text-sm">Количество принтов:</span>
        <span className="font-bold text-slate-900">{String(printCount)} шт</span>
       </div>
      )}
     </div>
   </div>
  </div>
 );
}

export default CalculatorResultBlock;
