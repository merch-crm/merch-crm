/**
 * @fileoverview Модалка настройки срочности заказа
 * @module calculators/components/UrgencySettingsModal
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect } from 'react';
import {
 ResponsiveModal,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Save, Info } from 'lucide-react';
import { UrgencySettings } from '@/lib/types/calculators';
import { formatCurrency } from '@/lib/utils/format';

/**
 * Пропсы модалки настройки срочности
 */
interface UrgencySettingsModalProps {
 /** Открыта ли модалка */
 isOpen: boolean;
 /** Обработчик закрытия */
 onClose: () => void;
 /** Текущие настройки */
 settings: UrgencySettings;
 /** Обработчик сохранения */
 onSave: (settings: UrgencySettings) => void;
}

/**
 * Модалка настройки срочности заказа
 */
export function UrgencySettingsModal({
 isOpen,
 onClose,
 settings,
 onSave,
}: UrgencySettingsModalProps) {
 const [localSettings, setLocalSettings] = useState<UrgencySettings>(settings);

 // Синхронизация при открытии
 useEffect(() => {
  if (isOpen) {
   setLocalSettings(settings);
  }
 }, [isOpen, settings]);

 /**
  * Обработчик сохранения
  */
 const handleSave = () => {
  onSave(localSettings);
  onClose();
 };

 /**
  * Проверка изменений
  */
 const hasChanges =
  localSettings.urgentSurcharge !== settings.urgentSurcharge;

 return (
  <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Настройки срочности" description="Укажите наценку за срочное выполнение заказа" footer={ <div className="flex justify-end gap-3 w-full">
     <Button variant="ghost" color="gray" onClick={onClose} className="rounded-md">
      Отмена
     </Button>
     <Button onClick={handleSave} disabled={!hasChanges} className="rounded-md">
      <Save className="mr-2 h-4 w-4" />
      Сохранить
     </Button>
    </div>
   }
  >
   <div className="space-y-3 px-6 py-4">
    {/* Обычный заказ */}
    <Card className="rounded-xl">
     <CardContent className="p-4">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-md">
         <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
         <p className="font-medium">Обычный</p>
         <p className="text-sm text-muted-foreground">
          Стандартные сроки выполнения
         </p>
        </div>
       </div>
       <Badge color="gray">+{formatCurrency(0)}</Badge>
      </div>
     </CardContent>
    </Card>

    {/* Срочный заказ */}
    <Card className="rounded-xl border-orange-200 bg-orange-50/50">
     <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-md">
         <Zap className="h-5 w-5 text-orange-500" />
        </div>
        <div>
         <p className="font-medium">Срочный</p>
         <p className="text-sm text-muted-foreground">
          Ускоренное выполнение
         </p>
        </div>
       </div>
      </div>

      <div className="space-y-2">
       <Label htmlFor="urgent-surcharge">Наценка за срочность</Label>
       <div className="flex items-center gap-2">
        <Input id="urgent-surcharge" type="number" value={localSettings.urgentSurcharge} onChange={(e) => {
          const newSurcharge = parseFloat(e.target.value) || 0;
          setLocalSettings(prev => ({
           ...prev,
           urgentSurcharge: newSurcharge,
           // Также обновляем текущую наценку, если уровень уже установлен в 'urgent'
           surcharge: prev.level === 'urgent' ? newSurcharge : 0
          }));
         }}
         className="rounded-md"
         min={0}
         step={100}
        />
        <span className="text-muted-foreground">₽</span>
       </div>
      </div>
     </CardContent>
    </Card>

    {/* Подсказка */}
    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
     <Info className="h-4 w-4 mt-0.5 shrink-0" />
     <p>
      Наценка за срочность добавляется к итоговой стоимости заказа
      при включении переключателя «Срочный заказ» в расчёте.
     </p>
    </div>
   </div>
  </ResponsiveModal>
 );
}

export default UrgencySettingsModal;
