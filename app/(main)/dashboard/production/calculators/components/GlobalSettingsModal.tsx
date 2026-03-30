/**
 * @fileoverview Единая модалка настроек (Финальная версия: Цены + Срочность объединены, футер на месте)
 * @module calculators/components/GlobalSettingsModal
 */

'use client';

import { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
} from 'lucide-react';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/ui/submit-button';
import { 
  CalculatorType, 
  GlobalCalculatorSettings,
  ConsumableItem
} from '@/lib/types/calculators';
import { ConsumableItemEditor } from './ConsumableItemEditor';
import { useWarehouseItems } from '../hooks/use-warehouse-items';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { IconType } from "@/components/ui/stat-card";

const { 
  Settings2: IconSettings, 
  RotateCcw: IconReset, 
  Wallet: IconWallet, 
  Zap: IconZap, 
  Box: IconBox, 
  Eye: IconEye, 
  EyeOff: IconEyeOff, 
  TrendingUp: IconTrend 
} = LucideIcons;

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
  settings: GlobalCalculatorSettings;
  onSave: (settings: GlobalCalculatorSettings) => Promise<void>;
  onReset: () => Promise<void>;
}

type TabType = 'main' | 'materials';

/**
 * Кастомный инпут
 */
function SimpleInput({ 
  value, 
  onChange, 
  unit, 
  label,
  description,
  disabled = false
}: { 
  value: number; 
  onChange: (val: number) => void; 
  unit?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col ml-1">
        {label && <Label className="text-sm font-black text-slate-900 tracking-tight">{label}</Label>}
        {description && <p className="text-xs font-bold text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="relative group">
        <Input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-14 rounded-[20px] border-slate-100 bg-slate-50/30 px-6 text-xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all shadow-none disabled:bg-slate-50 disabled:text-slate-300"
        />
        {unit && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 bg-white/50 px-2 py-1 rounded-lg border border-slate-100/50">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Карточка выбора (TabCard)
 */
function ActionCard({ 
  active, 
  onClick, 
  icon: Icon, 
  label,
  sublabel,
  colorClass = "text-indigo-500"
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: IconType; 
  label: string;
  sublabel: string;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden group text-left",
        active 
          ? cn("border-slate-900 bg-slate-900 scale-[1.02] shadow-xl shadow-slate-200", colorClass) 
          : "border-slate-100 bg-white hover:border-slate-200 shadow-none grayscale-[0.8] opacity-70"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-all",
        active ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <span className={cn(
            "text-base font-black tracking-tight block",
            active ? "text-white" : "text-slate-900"
        )}>{label}</span>
        <span className={cn(
            "text-sm font-bold tracking-tight block",
            active ? "text-white/60" : "text-slate-400"
        )}>{sublabel}</span>
      </div>
      {active && (
         <div className="absolute -right-2 -top-2 opacity-10">
            <Icon className="h-20 w-20 text-white" />
         </div>
      )}
    </button>
  );
}

export function GlobalSettingsModal({
  isOpen,
  onClose,
  calculatorType,
  settings: initialSettings,
  onSave,
  onReset,
}: GlobalSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GlobalCalculatorSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { items: warehouseItems } = useWarehouseItems(calculatorType);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localSettings);
      toast.success('Настройки успешно применены');
      onClose();
    } catch (_err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await onReset();
      toast.info('Настройки сброшены к заводским');
    } catch (_err) {
      toast.error('Ошибка при сбросе');
    }
  };

  const updatePrintConfig = (updates: Partial<typeof localSettings.printConfig>) => {
    setLocalSettings(prev => ({
      ...prev,
      printConfig: { ...prev.printConfig, ...updates }
    }));
  };

  const updateUrgencyConfig = (updates: Partial<typeof localSettings.urgencyConfig>) => {
    setLocalSettings(prev => ({
      ...prev,
      urgencyConfig: { ...prev.urgencyConfig, ...updates }
    }));
  };

  const updateMarginConfig = (updates: Partial<typeof localSettings.marginConfig>) => {
    setLocalSettings(prev => ({
      ...prev,
      marginConfig: { ...prev.marginConfig, ...updates }
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      showVisualTitle={false}
      className="max-w-2xl bg-white rounded-[40px] overflow-hidden"
    >
      <div className="flex flex-col bg-white">
        {/* Хедер */}
        <div className="flex items-center justify-between p-10 pb-4">
          <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-3">
                 <div className="p-3 bg-indigo-50 rounded-[20px] border border-indigo-100 shadow-sm">
                    <IconSettings className="h-6 w-6 text-indigo-500" />
                 </div>
                 Настройки
              </h2>
              <p className="text-[14px] font-bold text-slate-400 tracking-tight ml-16">
                 Управляйте прибылью и ресурсами
              </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-slate-50 text-slate-300"
          >
            <LucideIcons.X className="h-6 w-6" />
          </Button>
        </div>

        {/* Табы */}
        <div className="px-10 flex gap-3 mt-4">
             <ActionCard 
                active={activeTab === 'main'} 
                onClick={() => setActiveTab('main')} 
                icon={IconWallet} 
                label="Цены и Срочность"
                sublabel="Сколько мы берем"
             />
             <ActionCard 
                active={activeTab === 'materials'} 
                onClick={() => setActiveTab('materials')} 
                icon={IconBox} 
                label="Расходники"
                sublabel="Что используем"
             />
          </div>

        <div className="p-10 pt-8 space-y-3">
          <ScrollArea className="h-[460px] -mx-2 px-2">
            <div className="space-y-3 pb-6">
              {/* РАЗДЕЛ: ЦЕНЫ И СРОЧНОСТЬ (ОБЪЕДИНЕНО) */}
              {activeTab === 'main' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  {/* Базовая цена */}
                  <div className="space-y-3">
                      <Label className="text-base font-black text-slate-900 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                         Основные параметры
                      </Label>
                      <div className="grid grid-cols-2 gap-3 p-6 bg-slate-50/40 rounded-[32px] border border-slate-100/50">
                         <SimpleInput 
                           label="Цена для клиента"
                           description="Базовая цена за 1 м2"
                           value={localSettings.printConfig.basePrice || 0}
                           onChange={(v) => updatePrintConfig({ basePrice: v })}
                           unit="₽/М2"
                         />
                         <SimpleInput 
                           label="Желаемая маржа"
                           description="Ваша прибыль с заказа"
                           value={localSettings.marginConfig.defaultMargin}
                           onChange={(v) => updateMarginConfig({ defaultMargin: v })}
                           unit="%"
                         />
                      </div>
                  </div>
                  
                  {/* Срочность */}
                  <div className="space-y-3">
                      <Label className="text-base font-black text-slate-900 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                         Наценки за скорость
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm space-y-3 transition-all hover:border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                                    <IconTrend className="h-4 w-4" />
                                </div>
                                <span className="font-extrabold text-slate-900">Экспресс</span>
                            </div>
                            <SimpleInput 
                                value={localSettings.urgencyConfig.expressMarkup} 
                                onChange={(v) => updateUrgencyConfig({ expressMarkup: v })}
                                unit="%"
                            />
                         </div>
                         <div className="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm space-y-3 transition-all hover:border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-50 text-red-500">
                                    <IconZap className="h-4 w-4" fill="currentColor" />
                                </div>
                                <span className="font-extrabold text-slate-900">Горит!</span>
                            </div>
                            <SimpleInput 
                                value={localSettings.urgencyConfig.urgentMarkup} 
                                onChange={(v) => updateUrgencyConfig({ urgentMarkup: v })}
                                unit="%"
                            />
                         </div>
                      </div>
                  </div>

                  {/* Минималка */}
                  <div className="p-6 bg-slate-50/40 rounded-[24px] border border-slate-100/50">
                      <SimpleInput 
                        label="Минимальный чек (₽)" 
                        description="Для маленьких заказов"
                        value={localSettings.printConfig.minOrderFee || 0} 
                        onChange={(v) => updatePrintConfig({ minOrderFee: v })}
                        unit="₽"
                      />
                  </div>
                </div>
              )}

              {/* РАЗДЕЛ: РАСХОДНИКИ */}
              {activeTab === 'materials' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                   <div className="flex items-center justify-between px-2">
                      <div className="space-y-0.5">
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">Список материалов</h3>
                         <p className="text-sm font-bold text-slate-400">Пленки, краска, клей и др.</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors tracking-tight gap-2"
                      >
                         {showAdvanced ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
                         {showAdvanced ? "Скрыть тех. детали" : "Для профи"}
                      </Button>
                   </div>
                   
                   <div className="grid gap-3">
                        {localSettings.consumablesConfig?.items?.map((item: ConsumableItem) => (
                           <ConsumableItemEditor 
                               key={item.id}
                               item={item}
                               defaultItem={item} // В реальности тут должен быть DEFAULT_CONSUMABLES
                               showAdvanced={showAdvanced}
                               warehouseItems={warehouseItems?.filter((w) => w.category === item.category || !item.category)}
                               onChange={(updated) => {
                                 setLocalSettings(prev => ({
                                   ...prev,
                                   consumablesConfig: {
                                     ...prev.consumablesConfig,
                                     items: (prev.consumablesConfig?.items || []).map((i) => i.id === updated.id ? updated : i)
                                   }
                                 }));
                               }}
                               onReset={() => {}} 
                           />
                        ))}
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ФУТЕР — ЯВНО ВЫДЕЛЕННЫЙ БЛОК */}
          <div className="flex items-center justify-between pt-10 border-t border-slate-100 mt-2">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors tracking-tight px-0"
              >
                Отмена
              </Button>
              <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={handleReset}
                    className="h-16 w-16 rounded-[24px] text-slate-200 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100 group"
                  >
                    <IconReset className="h-6 w-6 group-active:rotate-[-90deg] transition-transform duration-500" />
                  </Button>
                  <SubmitButton 
                    onClick={handleSave} 
                    isLoading={isSaving}
                    loadingText="Сохранение..."
                    className="h-16 min-w-[240px] rounded-[28px] bg-slate-900 hover:bg-slate-800 text-white font-black text-xl transition-all shadow-2xl shadow-slate-200 active:scale-95"
                  >
                    <LucideIcons.Save className="h-6 w-6 mr-3" />
                    Применить
                  </SubmitButton>
              </div>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
