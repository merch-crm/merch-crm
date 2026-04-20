/**
 * @fileoverview Модалка настроек расходников калькулятора (обновлённая)
 * @module calculators/components/ConsumablesSettingsModal
 * @requires @/lib/types/calculators
 * @audit Обновлён 2026-03-26
 */

'use client';

import { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
 Package,
 RotateCcw,
 Save,
 Calculator,
 Warehouse,
 ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/ui/submit-button';
import {
 CalculatorType,
 ConsumableItem,
 ConsumablesConfig,
 DEFAULT_CONSUMABLES,
 CALCULATOR_TYPES_CONFIG,
} from '@/lib/types/calculators';
import { formatCurrency } from '@/lib/utils/format';
import { ConsumableItemEditor } from './ConsumableItemEditor';
import { CreateWarehouseItemModal } from './CreateWarehouseItemModal';
import { useWarehouseItems } from '../hooks/use-warehouse-items';
import { useConsumablesDraft } from '../hooks/use-consumables-draft';
import { ConsumableCategory } from '@/lib/types/consumables';

/**
 * Пропсы модалки настроек расходников
 */
interface ConsumablesSettingsModalProps {
 /** Открыта ли модалка */
 isOpen: boolean;
 /** Обработчик закрытия */
 onClose: () => void;
 /** Тип калькулятора */
 calculatorType: CalculatorType;
 /** Текущая конфигурация расходников */
 currentConfig: ConsumablesConfig;
 /** Обработчик сохранения конфигурации */
 onSave: (config: ConsumablesConfig) => Promise<boolean | void>;
}

/**
 * Модалка настроек расходников калькулятора
 */
export function ConsumablesSettingsModal({
 isOpen,
 onClose,
 calculatorType,
 currentConfig,
 onSave,
}: ConsumablesSettingsModalProps) {
 // const { toast } = useToast();
 const config = CALCULATOR_TYPES_CONFIG[calculatorType];
 const defaultConsumables = DEFAULT_CONSUMABLES[calculatorType];

 // Получаем материалы со склада
 const { items: warehouseItems } =
  useWarehouseItems(calculatorType);

 // Локальное состояние для редактирования
 const [localConfig, setLocalConfig] = useState<ConsumablesConfig>(currentConfig);
 const [isSaving, setIsSaving] = useState(false);
 const [showResetConfirm, setShowResetConfirm] = useState(false);
 const [activeTab, setActiveTab] = useState('items');


 // Состояние модалки создания материала
 const [warehouseCreateCategory, setWarehouseCreateCategory] = useState<ConsumableCategory | null>(null);

 /**
  * Черновик
  */
 const { loadDraft, clearDraft } = useConsumablesDraft(
  calculatorType,
  localConfig,
  isOpen
 );

 // Синхронизация при открытии
 useEffect(() => {
  if (isOpen) {
   // Пытаемся загрузить черновик
   const draft = loadDraft();
   if (draft) {
    setLocalConfig(draft);
   } else {
    setLocalConfig(currentConfig);
   }
   setActiveTab('items');
  }
 }, [isOpen, currentConfig, loadDraft]);

 /**
  * Обновление одного расходника
  */
 const handleItemChange = (updatedItem: ConsumableItem) => {
  setLocalConfig((prev) => ({
   ...prev,
   items: (prev?.items || []).map((item) =>
    item.id === updatedItem.id ? updatedItem : item
   ),
  }));
 };

 /**
  * Сброс одного расходника к значениям по умолчанию
  */
 const handleItemReset = (itemId: string) => {
  const defaultItem = defaultConsumables.items.find((d) => d.id === itemId);
  if (defaultItem) {
   handleItemChange({ ...defaultItem });
  }
 };

 /**
  * Сброс всех расходников к значениям по умолчанию
  */
 const handleResetAll = () => {
  setLocalConfig({ ...defaultConsumables });
  setShowResetConfirm(false);
  toast.info('Настройки сброшены', {
   description: 'Все значения возвращены к значениям по умолчанию',
  });
 };

 /**
  * Сохранение конфигурации
  */
 const handleSave = async () => {
  setIsSaving(true);
  try {
   await onSave(localConfig);
   toast.success('Настройки сохранены', {
    description: 'Конфигурация расходников обновлена',
   });
   onClose();
  } catch (_error) {
   toast.error('Ошибка сохранения', {
    description: 'Не удалось сохранить настройки',
   });
  } finally {
   setIsSaving(false);
   clearDraft();
  }
 };

 /**
  * Проверка наличия изменений
  */
 const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(currentConfig);

 /**
  * Подсчёт изменённых расходников
  */
 const modifiedCount = (localConfig?.items || []).filter((item) => {
  const defaultItem = defaultConsumables.items.find((d) => d.id === item.id);
  return (
   defaultItem &&
   (item.pricePerUnit !== defaultItem.pricePerUnit ||
    item.consumptionPerUnit !== defaultItem.consumptionPerUnit ||
    item.source !== defaultItem.source)
  );
 }).length;

 /**
  * Расчёт общей стоимости расходников на единицу
  */
 const totalCostPerUnit = (localConfig?.items || []).reduce(
  (sum, item) => sum + item.pricePerUnit * item.consumptionPerUnit,
  0
 );

 /**
  * Подсчёт расходников со склада
  */
 const warehouseCount = (localConfig?.items || []).filter(
  (item) => item.source === 'warehouse' && item.warehouseItemId
 ).length;

 return (
  <>
  <ResponsiveModal isOpen={isOpen} onClose={onClose} title={`Настройки расходников — ${config.label}`} description="Настройте стоимость и расход материалов для расчёта себестоимости" footer={ <div className="flex flex-col sm:flex-row gap-3 w-full">
     <Button variant="outline" color="gray" onClick={() => setShowResetConfirm(true)}
      disabled={!hasChanges && modifiedCount === 0}
      className="rounded-md"
     >
      <RotateCcw className="mr-2 h-4 w-4" />
      Сбросить все
     </Button>
     <div className="flex gap-3 sm:ml-auto">
      <Button variant="ghost" color="gray" onClick={onClose} className="rounded-md">
       Отмена
      </Button>
      <SubmitButton onClick={handleSave} isLoading={isSaving} disabled={!hasChanges} loadingText="Сохранение..." className="rounded-md">
       <Save className="mr-2 h-4 w-4" />
       Сохранить
      </SubmitButton>
     </div>
    </div>
   }
  >
   <div className="p-6">
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
     <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="items" className="gap-2">
       <Package className="h-4 w-4" />
       Расходники
       {modifiedCount > 0 && (
        <Badge className="ml-1" color="gray">
         {modifiedCount}
        </Badge>
       )}
      </TabsTrigger>
      <TabsTrigger value="summary" className="gap-2">
       <Calculator className="h-4 w-4" />
       Сводка
      </TabsTrigger>
     </TabsList>

     <TabsContent value="items" className="mt-4">
      <ScrollArea className="h-[50vh] pr-4">
       <div className="space-y-3">
        {(localConfig?.items || []).map((item) => {
         const defaultItem = defaultConsumables.items.find(
          (d) => d.id === item.id
         );
         return (
          <ConsumableItemEditor key={item.id} item={item} defaultItem={defaultItem || item} warehouseItems={warehouseItems.filter( (w) => w.category === item.category || !item.category
           )}
           onChange={handleItemChange}
           onReset={() => handleItemReset(item.id)}
           onCreateWarehouseItem={(category) => setWarehouseCreateCategory(category)}
          />
         );
        })}
       </div>
      </ScrollArea>
     </TabsContent>

     <TabsContent value="summary" className="mt-4">
      <div className="space-y-3">
       {/* Статистика */}
       <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-muted/50 rounded-xl text-center">
         <p className="text-2xl font-bold">{localConfig?.items?.length || 0}</p>
         <p className="text-sm text-muted-foreground">Расходников</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-xl text-center">
         <p className="text-2xl font-bold">{warehouseCount}</p>
         <p className="text-sm text-muted-foreground">Со склада</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-xl text-center">
         <p className="text-2xl font-bold">{modifiedCount}</p>
         <p className="text-sm text-muted-foreground">Изменено</p>
        </div>
       </div>

       {/* Таблица расходников */}
       <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
         <thead className="bg-muted/50">
          <tr>
           <th className="text-left p-3 font-medium">Расходник</th>
           <th className="text-right p-3 font-medium">Цена</th>
           <th className="text-right p-3 font-medium">Расход</th>
           <th className="text-right p-3 font-medium">Стоимость</th>
          </tr>
         </thead>
         <tbody>
          {(localConfig?.items || []).map((item) => (
           <tr key={item.id} className="border-t">
            <td className="p-3">
             <div className="flex items-center gap-2">
              {item.name}
              {item.source === 'warehouse' && (
               <Warehouse className="h-3 w-3 text-muted-foreground" />
              )}
             </div>
            </td>
            <td className="p-3 text-right">
             {formatCurrency(item.pricePerUnit)}/{item.unit}
            </td>
            <td className="p-3 text-right">
             {item.consumptionPerUnit} {item.unit}/{item.consumptionUnit}
            </td>
            <td className="p-3 text-right font-medium">
             {formatCurrency(item.pricePerUnit * item.consumptionPerUnit)}
            </td>
           </tr>
          ))}
         </tbody>
         <tfoot className="bg-muted/30 font-medium">
          <tr className="border-t">
           <td colSpan={3} className="p-3 text-right">
            Итого на единицу продукции:
           </td>
           <td className="p-3 text-right text-lg">
            {formatCurrency(totalCostPerUnit)}
           </td>
          </tr>
         </tfoot>
        </table>
       </div>

       {/* Ссылка на склад */}
       <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-700">
         <Warehouse className="h-4 w-4" />
         <span>Материалы можно добавить на складе</span>
        </div>
        <Link href="/dashboard/warehouse">
         <Button variant="ghost" color="gray" size="sm" className="text-blue-700">
          <ExternalLink className="h-4 w-4 mr-1" />
          Перейти
         </Button>
        </Link>
       </div>
      </div>
     </TabsContent>
    </Tabs>
   </div>
  </ResponsiveModal>

   {/* Диалог подтверждения сброса */}
   <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
    <AlertDialogContent>
     <AlertDialogHeader>
      <AlertDialogTitle>Сбросить настройки?</AlertDialogTitle>
      <AlertDialogDescription>
       Все значения расходников будут возвращены к значениям по умолчанию.
       Это действие нельзя отменить.
      </AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
      <AlertDialogCancel className="rounded-md">Отмена</AlertDialogCancel>
      <AlertDialogAction onClick={handleResetAll} className="rounded-md">
       Сбросить
      </AlertDialogAction>
     </AlertDialogFooter>
    </AlertDialogContent>
   </AlertDialog>

   {/* Модалка создания материала */}
   <CreateWarehouseItemModal isOpen={!!warehouseCreateCategory} onClose={() => setWarehouseCreateCategory(null)}
    defaultCategory={warehouseCreateCategory || undefined}
    onCreated={() => {
     // Здесь можно либо обновить список материалов через мутацию,
     // либо просто закрыть модалку, так как список обновится сам (в идеале)
    }}
   />
  </>
 );
}

export default ConsumablesSettingsModal;
