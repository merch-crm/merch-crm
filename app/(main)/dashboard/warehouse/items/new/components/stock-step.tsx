"use client";

import {
  AlertTriangle,
  Warehouse,
  Plus,
  Minus,
  Check,
  Banknote,
  Package,
  MapPin
} from "lucide-react";
import { cn, formatPlural } from "@/lib/utils";
import { Category, StorageLocation, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useBranding } from "@/components/branding-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AddStorageLocationDialog } from "@/app/(main)/dashboard/warehouse/add-storage-location-dialog";
import { StepFooter } from "./step-footer";

interface StockStepProps {
  category: Category;
  storageLocations: StorageLocation[];
  users: { id: string; name: string; roleName?: string }[];
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  validationError: string;
  isSubmitting: boolean;
  isLineCreation?: boolean;
  positionsCount?: number;
}

export function StockStep({
  storageLocations,
  users,
  formData,
  updateFormData,
  onNext,
  onBack,
  validationError,
  isSubmitting,
  isLineCreation = false,
  positionsCount = 0,
}: StockStepProps) {
  const { currencySymbol } = useBranding();

  const adjustValue = (field: keyof ItemFormData, delta: number) => {
    if (!formData) return;
    const value = formData[field];
    if (typeof value !== 'string' && typeof value !== 'number') return;

    const current = parseInt(value.toString() || "0") || 0;
    updateFormData({ [field]: Math.max(0, current + delta).toString() });
  };

  const selectedUnit = formData.unit || "шт.";

  const isCostPriceValid = formData.costPrice !== "" && formData.costPrice !== undefined && formData.costPrice !== null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        <div className="p-6 space-y-2.5">
          {/* Заголовок */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
              <Warehouse className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {isLineCreation ? "Склад и цены для линейки" : "Склад и хранение"}
              </h2>
              <p className="text-xs font-bold text-slate-700 opacity-60">
                {isLineCreation
                  ? `Настройки применятся ко всем ${positionsCount} ${formatPlural(positionsCount, ["позиции", "позициям", "позициям"])}`
                  : "Укажите остатки и место хранения"}
              </p>
            </div>
          </div>

          {/* Информация о линейке */}
          {isLineCreation && positionsCount > 0 && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">
                  Создание {positionsCount} позиций
                </p>
                <p className="text-xs text-blue-700/80">
                  Указанные количество и цены будут применены к каждой позиции в линейке
                </p>
              </div>
            </div>
          )}

          {/* ROW 1: Остатки и лимиты & Финансы */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {/* LEFT COLUMN: ОСТАТКИ */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Остатки и лимиты</h3>
              </div>

              <div className="space-y-2.5">
                {/* Quantity */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-sm font-black text-slate-700">Начальный остаток</Label>
                    <div className="flex items-center gap-1 bg-slate-100/50 p-0.5 rounded-lg border border-slate-200/50">
                      {["шт.", "см", "м", "гр", "кг", "мл", "л"].map((u) => (
                        <Button
                          key={u}
                          variant="ghost"
                          onClick={() => updateFormData({ unit: u })}
                          className={cn(
                            "px-2 py-0.5 h-6 rounded-md text-xs font-black transition-all border-none shadow-none",
                            formData.unit === u
                              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 hover:bg-white hover:text-indigo-600"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                          )}
                        >
                          {u.toLowerCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-colors rounded-[20px] p-1.5 flex items-center w-full">
                    <Button type="button" variant="ghost" onClick={() => adjustValue('quantity', -1)}
                      className="w-12 h-12 rounded-[14px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shrink-0 p-0"
                    >
                      <Minus className="w-5 h-5" strokeWidth={3} />
                    </Button>

                    <div className="flex-1 flex justify-center items-center gap-1.5">
                      <Input type="text" inputMode="decimal" value={formData.quantity} onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          updateFormData({ quantity: val });
                        }}
                        className="w-auto text-center text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none px-2"
                        style={{ width: `${Math.max(2, (formData.quantity || "0").toString().length) * 18}px`, minWidth: '40px' }}
                      />
                      <span className="text-xs font-black text-slate-400 mt-1 select-none">
                        {selectedUnit}
                      </span>
                    </div>

                    <Button type="button" variant="ghost" onClick={() => adjustValue('quantity', 1)}
                      className="w-12 h-12 rounded-[14px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95 shrink-0 p-0"
                    >
                      <Plus className="w-5 h-5" strokeWidth={3} />
                    </Button>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-black text-slate-700 px-1">Предупреждение</Label>
                    <div className="bg-amber-50 border border-amber-200/80 hover:border-amber-300 transition-colors rounded-[18px] px-5 py-3 flex items-center justify-between">
                      <Input type="text" inputMode="decimal" value={formData.lowStockThreshold} onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          updateFormData({ lowStockThreshold: val });
                        }}
                        className="flex-1 text-lg font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none"
                      />
                      <span className="text-xs font-bold text-amber-500/70 ml-1 shrink-0">{selectedUnit}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-black text-slate-700 px-1">Критический лимит</Label>
                    <div className="bg-rose-50 border border-rose-200/80 hover:border-rose-300 transition-colors rounded-[18px] px-5 py-3 flex items-center justify-between">
                      <Input type="text" inputMode="decimal" value={formData.criticalStockThreshold} onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          updateFormData({ criticalStockThreshold: val });
                        }}
                        className="flex-1 text-lg font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none"
                      />
                      <p className="text-xs font-bold text-slate-400 group-hover:text-amber-500 whitespace-nowrap transition-colors">
                        В резерве
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ФИНАНСЫ */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <Banknote className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Финансы</h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-black text-slate-700 px-1 flex items-center gap-1">
                    Себестоимость <span className="text-rose-500">*</span>
                  </Label>
                  <div className={cn("relative bg-slate-50 rounded-[18px] px-5 py-4 border transition-colors w-full", isCostPriceValid ? "border-slate-100/50 hover:border-slate-200" : "border-rose-300 bg-rose-50/30")}>
                    <Input type="text" inputMode="decimal" placeholder="Введите значение" value={formData.costPrice || ""} onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        updateFormData({ costPrice: val });
                      }}
                      className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-8 min-w-0 h-auto shadow-none placeholder:text-slate-300 placeholder:font-medium placeholder:text-lg"
                    />
                    <span className="absolute right-5 bottom-4 text-sm font-bold text-slate-300">{currencySymbol}</span>
                  </div>
                  {!isCostPriceValid && (
                    <p className="text-xs font-bold text-rose-500 px-1 mt-1">Обязательное поле — укажите себестоимость</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-black text-slate-700 px-1 flex items-baseline gap-1">
                    Продажа <span className="text-xs font-bold text-slate-400 ml-1">(Опционально)</span>
                  </Label>
                  <div className="relative bg-slate-50 rounded-[18px] px-5 py-4 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                    <Input type="text" inputMode="decimal" placeholder="Введите значение" value={formData.sellingPrice || ""} onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        updateFormData({ sellingPrice: val });
                      }}
                      className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-8 min-w-0 h-auto shadow-none placeholder:text-slate-300 placeholder:font-medium placeholder:text-lg"
                    />
                    <span className="absolute right-5 bottom-4 text-sm font-bold text-slate-300">{currencySymbol}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER HORIZONTAL */}
          <div className="h-px bg-slate-100 w-full" />

          {/* ROW 2: Размещение */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 leading-tight">Размещение</h3>
            </div>

            {(storageLocations || []).length === 0 ? (
              <div className="p-5 rounded-[22px] bg-amber-50 border border-amber-100 text-amber-600 text-sm font-bold flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Сначала настройте склад.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {(storageLocations || []).map(loc => {
                  const isSelected = formData.storageLocationId === loc.id;
                  const styles = {
                    warehouse: isSelected ? "bg-indigo-50/30 border-indigo-200 text-indigo-900" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300",
                    production: isSelected ? "bg-amber-50/30 border-amber-200 text-amber-900" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300",
                    office: isSelected ? "bg-emerald-50/30 border-emerald-200 text-emerald-900" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300",
                  }[(loc.type as 'warehouse' | 'production' | 'office') || 'office'];

                  return (
                    <Button
                      key={loc.id}
                      variant="ghost"
                      onClick={() => updateFormData({ storageLocationId: loc.id })}
                      className={cn(
                        "p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col gap-2.5 h-auto w-full group relative",
                        styles,
                        isSelected && "shadow-sm ring-1 ring-slate-200/50 border-transparent hover:border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "bg-white/80 shadow-sm" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                        )}>
                          <Warehouse className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <div className="bg-primary rounded-full p-1">
                            <Check className="w-3 h-3 text-white" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      <div className="truncate text-left w-full">
                        <div className="font-bold text-sm text-slate-900 truncate">{loc.name}</div>
                        <div className="text-xs font-bold text-slate-400 mt-0.5">
                          {loc.type === "warehouse" ? "склад" : loc.type === "production" ? "производство" : "офис"}
                        </div>
                      </div>
                    </Button>
                  );
                })}
                <AddStorageLocationDialog users={users} trigger={
                  <Button variant="ghost" className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 h-auto group cursor-pointer aspect-square sm:aspect-auto sm:h-[114px] shadow-none">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 group-hover:border-primary/50 group-hover:bg-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="font-black text-xs">Добавить</div>
                  </Button>
                }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto shrink-0">
        <StepFooter onBack={onBack} onNext={onNext} nextLabel="Далее" isNextDisabled={!formData.storageLocationId || !isCostPriceValid} isSubmitting={isSubmitting} validationError={validationError} />
      </div>
    </div>
  );
}
