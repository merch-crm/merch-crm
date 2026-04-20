/**
 * @fileoverview Компонент редактирования одного расходника в упрощенном или продвинутом режиме
 * @module calculators/components/ConsumableItemEditor
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
 RotateCcw,
 Info,
 ChevronDown,
 ChevronUp,
 Calculator,
 Plus,
 AlertCircle,
} from 'lucide-react';
import { ConsumableItem, ConsumableSource } from '@/lib/types/calculators';
import { CONSUMPTION_HINTS, ConsumableCategory } from '@/lib/types/consumables';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/**
 * Материал со склада
 */
interface WarehouseItem {
 id: string;
 name: string;
 price: number;
 unit: string;
 stock: number;
 category: string;
}

/**
 * Пропсы компонента
 */
interface ConsumableItemEditorProps {
 /** Расходник */
 item: ConsumableItem;
 /** Значение по умолчанию */
 defaultItem: ConsumableItem;
 /** Материалы со склада */
 warehouseItems?: WarehouseItem[];
 /** Упрощенный режим (скрывает тех. детали) */
 showAdvanced?: boolean;
 /** Обработчик изменения */
 onChange: (updated: ConsumableItem) => void;
 /** Обработчик сброса */
 onReset: () => void;
 /** Обработчик создания материала на складе */
 onCreateWarehouseItem?: (category: ConsumableCategory) => void;
 /** Отключён */
 disabled?: boolean;
}

/**
 * Валидация значений
 */
interface ValidationErrors {
 pricePerUnit?: string;
 consumptionPerUnit?: string;
}

/**
 * Компонент редактирования одного расходника
 */
export function ConsumableItemEditor({
 item,
 defaultItem,
 warehouseItems = [],
 showAdvanced = false,
 onChange,
 onReset,
 onCreateWarehouseItem,
 disabled = false,
}: ConsumableItemEditorProps) {
 const [isExpanded, setIsExpanded] = useState(false);
 const [errors, setErrors] = useState<ValidationErrors>({});

 // Проверка изменений
 const isModified =
  item.pricePerUnit !== defaultItem.pricePerUnit ||
  item.consumptionPerUnit !== defaultItem.consumptionPerUnit ||
  item.source !== defaultItem.source;

 // Выбранный материал со склада
 const selectedWarehouseItem = warehouseItems.find(
  (w) => w.id === item.warehouseItemId
 );

 // Подсказка по расходу
 const hint = CONSUMPTION_HINTS[item.id as keyof typeof CONSUMPTION_HINTS];

 // Расчёт стоимости на единицу продукции
 const costPerUnit = item.pricePerUnit * item.consumptionPerUnit;

 /**
  * Валидация значения
  */
 const validateField = (
  field: 'pricePerUnit' | 'consumptionPerUnit',
  value: number
 ): string | undefined => {
  if (value < 0) {
   return 'Значение не может быть отрицательным';
  }
  if (field === 'pricePerUnit' && value === 0 && item.source === 'manual') {
   return 'Укажите цену';
  }
  if (field === 'consumptionPerUnit' && value === 0) {
   return 'Укажите расход';
  }
  return undefined;
 };

 /**
  * Обработчик изменения цены
  */
 const handlePriceChange = (value: string) => {
  const numValue = parseFloat(value) || 0;
  const error = validateField('pricePerUnit', numValue);
  setErrors((prev) => ({ ...prev, pricePerUnit: error }));
  onChange({ ...item, pricePerUnit: numValue });
 };

 /**
  * Обработчик изменения расхода
  */
 const handleConsumptionChange = (value: string) => {
  const numValue = parseFloat(value) || 0;
  const error = validateField('consumptionPerUnit', numValue);
  setErrors((prev) => ({ ...prev, consumptionPerUnit: error }));
  onChange({ ...item, consumptionPerUnit: numValue });
 };

 /**
  * Смена источника данных
  */
 const handleSourceChange = (source: ConsumableSource) => {
  onChange({
   ...item,
   source,
   warehouseItemId: source === 'manual' ? undefined : item.warehouseItemId,
  });
 };

 /**
  * Выбор материала со склада
  */
 const handleWarehouseSelect = (warehouseId: string) => {
  const warehouseItem = warehouseItems.find((w) => w.id === warehouseId);
  if (warehouseItem) {
   setErrors((prev) => ({ ...prev, pricePerUnit: undefined }));
   onChange({
    ...item,
    warehouseItemId: warehouseId,
    pricePerUnit: warehouseItem.price,
   });
  }
 };

 /**
  * Есть ли ошибки валидации
  */
 const hasErrors = Object.values(errors).some((e) => !!e);

 return (
  <Card className={cn( "rounded-[24px] border-slate-100 shadow-sm transition-all overflow-hidden bg-white hover:border-slate-200", isModified && "ring-1 ring-indigo-500/20 border-indigo-200", hasErrors && "ring-1 ring-red-500/20 border-red-200" )}>
   <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
    <CardContent className="p-6">
     {/* Заголовок */}
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
       <CollapsibleTrigger asChild>
        <Button variant="ghost" color="gray" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 transition-colors">
         {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
         ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
         )}
        </Button>
       </CollapsibleTrigger>
       <div className="space-y-1">
        <div className="flex items-center gap-3">
         <span className="font-black text-lg text-slate-900 ">{item.name}</span>
         {isModified && (
          <Badge color="purple" variant="outline" className="text-xs font-black px-2 py-0.5 rounded-full text-indigo-600 bg-indigo-50 border-indigo-200">
           изменено
          </Badge>
         )}
        </div>
        <div className="flex items-center gap-2">
          {item.source === 'warehouse' && selectedWarehouseItem && (
            <Badge className="text-xs font-black px-1.5 py-0 rounded-lg bg-teal-50 text-teal-700 border-teal-100 border" color="gray">
            Склад: {selectedWarehouseItem.name}
            </Badge>
          )}
          <p className="text-xs text-slate-400 font-bold leading-none">
            Себестоимость: {formatCurrency(item.pricePerUnit)}/{item.unit}
          </p>
        </div>
       </div>
      </div>

      <div className="flex items-center gap-3">
       {/* Итоговая стоимость для бизнеса */}
       <div className="text-right">
        <p className="text-xl font-black text-indigo-600 leading-none">
         {formatCurrency(costPerUnit)}
        </p>
        <p className="text-xs text-slate-300 font-black mt-1">
         за {item.consumptionUnit}
        </p>
       </div>

       {/* Кнопка сброса */}
       <Tooltip content="Сбросить к заводским">
        <Button variant="ghost" color="gray" size="icon" onClick={onReset} disabled={!isModified || disabled} className="h-10 w-10 rounded-xl hover:bg-slate-50 transition-colors text-slate-200 hover:text-indigo-600">
         <RotateCcw className="h-4 w-4" />
        </Button>
       </Tooltip>
      </div>
     </div>

     {/* Развёрнутое содержимое */}
     <CollapsibleContent className="pt-8 space-y-3 animate-in slide-in-from-top-2 duration-400">
      {/* Источник данных */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="space-y-3">
          <Label className="text-[12px] font-black text-slate-400 ml-1">Источник цены</Label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name={`source-${item.id}`}
              checked={item.source === 'manual'}
              onChange={() => handleSourceChange('manual')}
              disabled={disabled}
              className="h-5 w-5 accent-slate-900 border-slate-200"
            />
            <div className="flex items-center gap-2 text-[13px] font-black text-slate-500 group-hover:text-slate-900 transition-colors ">
              Вручную
            </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name={`source-${item.id}`}
              checked={item.source === 'warehouse'}
              onChange={() => handleSourceChange('warehouse')}
              disabled={disabled}
              className="h-5 w-5 accent-indigo-600"
            />
            <div className="flex items-center gap-2 text-[13px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors ">
              Склад
            </div>
            </label>
          </div>
        </div>

        {/* Основное поле цены (Всегда на виду) */}
        <div className="space-y-2">
          <Label className="text-[12px] font-black text-slate-400 ml-1">Цена за {item.unit}</Label>
          <div className="relative">
            <Input type="number" value={item.pricePerUnit} onChange={(e) => handlePriceChange(e.target.value)}
              disabled={disabled || item.source === 'warehouse'}
              className={cn(
                "h-12 rounded-[16px] pr-10 font-black text-lg bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-indigo-500/5",
                errors.pricePerUnit ? 'border-red-500' : ''
              )}
              min={0}
              step={0.01}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">
              ₽
            </span>
          </div>
        </div>
      </div>

      {/* Выбор материала со склада */}
      {item.source === 'warehouse' && (
       <div className="space-y-3 animate-in fade-in zoom-in-95 px-1 bg-indigo-50/30 p-5 rounded-[20px] border border-indigo-100/30">
        <Label className="text-[12px] font-black text-indigo-400 ml-1">Выберите материал со склада</Label>
        {warehouseItems.length > 0 ? (
        <Select value={item.warehouseItemId || ''} onChange={handleWarehouseSelect} disabled={disabled} placeholder="Выберите из каталога..." className="rounded-[16px] h-14 border-indigo-100 bg-white font-black text-lg shadow-sm" options={warehouseItems.map((w) => ({
          id: w.id,
          title: w.name,
          description: `${formatCurrency(w.price)}/${w.unit}`,
         }))}
        />
        ) : (
         <div className="flex items-center justify-between p-5 bg-white border border-red-100 rounded-[18px]">
          <span className="text-xs font-bold text-red-400 flex items-center gap-2">
           <AlertCircle className="w-4 h-4" />
           Пусто на складе
          </span>
          {onCreateWarehouseItem && (
           <Button variant="outline" color="gray" size="sm" onClick={() =>
             onCreateWarehouseItem(item.category as ConsumableCategory)
            }
            className="rounded-xl font-black bg-white text-xs px-4"
           >
            <Plus className="h-3 w-3 mr-2" />
            Добавить
           </Button>
          )}
         </div>
        )}
       </div>
      )}

      {/* Технические детали (Скрыты по умолчанию) */}
      {showAdvanced && (
        <div className="space-y-3 animate-in slide-in-from-top-1 duration-300">
          <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-500">
               <Calculator className="w-4 h-4" />
               <span className="text-[12px] font-black ">Инженерные настройки</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 ml-1">Расход на {item.consumptionUnit}</Label>
                <div className="relative">
                  <Input type="number" value={item.consumptionPerUnit} onChange={(e) => handleConsumptionChange(e.target.value)}
                    disabled={disabled}
                    className="h-12 rounded-[16px] pr-12 font-black border-slate-100 bg-white"
                    min={0}
                    step={0.1}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">
                    {item.unit}
                  </span>
                </div>
              </div>
              
              {hint && (
                <div className="flex items-start gap-3 bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-indigo-400" />
                  <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600 leading-tight">{hint.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-500 ">
                      Рекомендация:
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {hint.typicalRange}
                    </span>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!showAdvanced && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-300 font-bold italic">
          <span>* Технические параметры расхода скрыты. Используются значения по умолчанию.</span>
        </div>
      )}
     </CollapsibleContent>
    </CardContent>
   </Collapsible>
  </Card>
 );
}

export default ConsumableItemEditor;
