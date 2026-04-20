"use client";

import { Plus, Minus, AlertCircle, Package, RefreshCw, Check, ArrowRightLeft } from "lucide-react";

import { cn, formatUnit } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import { StorageLocation } from "./storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/session";
import { useAdjustStock } from "./hooks/use-adjust-stock";

interface AdjustStockDialogProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    storageLocationId?: string | null;
    costPrice?: number | string | null;
  };
  locations: StorageLocation[];
  itemStocks?: { storageLocationId: string, quantity: number }[];
  isOpen: boolean; // Added
  onClose: () => void;
  initialType?: "in" | "out" | "set";
  user?: Session | null;
}


export function AdjustStockDialog({ item, locations, itemStocks, isOpen, onClose, initialType = "in", user }: AdjustStockDialogProps) {

  const {
    amount, setAmount,
    type, setType,
    selectedLocationId, setSelectedLocationId,
    toLocationId, setToLocationId,
    reason, setReason,
    costPrice, setCostPrice,
    isSubmitting,
    error,
    handleSubmit
  } = useAdjustStock({ item, locations, initialType, onClose });

  const canSeeCost = user?.roleSlug === "admin" || user?.roleSlug === "management" || user?.departmentName === "Отдел продаж";

  const currentStockOnLocation = Array.isArray(itemStocks)
    ? itemStocks.find(s => s.storageLocationId === selectedLocationId)?.quantity ?? 0
    : 0;

  if (!item) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Корректировка остатков" showVisualTitle={false} className="sm:max-w-[800px]">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Корректировка</h2>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                Объект: <span className="text-slate-900 font-bold">{item.name}</span>
              </p>
            </div>
          </div>
        </div>

        <form id="adjust-stock-form" onSubmit={handleSubmit} className="px-6 py-4 pt-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-3">
            {/* 1. Context: Where and What */}
            <div className="space-y-3">
              <div className="space-y-2 overflow-visible">
                <div className={cn("grid gap-3", type === "transfer" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">
                      {type === "transfer" ? "Откуда (источник)" : "Склад"}
                    </label>
                    <StorageLocationSelect value={selectedLocationId} onChange={setSelectedLocationId} options={Array.isArray(locations) ? locations : []} stocks={itemStocks} className="w-full" />
                  </div>
                  {type === "transfer" && (
                    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
                      <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Куда (получатель)</label>
                      <StorageLocationSelect value={toLocationId} onChange={setToLocationId} options={Array.isArray(locations) ? locations.filter(l => l.id !== selectedLocationId) : []}
                        stocks={itemStocks}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Операция</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'in', label: 'Приход', icon: Plus, color: 'emerald' },
                    { id: 'out', label: 'Расход', icon: Minus, color: 'rose' },
                    { id: 'set', label: 'Коррект.', icon: RefreshCw, color: 'primary' },
                    { id: 'transfer', label: 'Перемещ.', icon: ArrowRightLeft, color: 'indigo' }
                  ].map((op) => {
                    const isActive = type === op.id;
                    return (
                      <Button key={op.id} type="button" variant="ghost" onClick={() => {
                          setType(op.id as "in" | "out" | "set" | "transfer");
                          if (op.id === 'set') setAmount(item.quantity);
                          else if (op.id === 'transfer') setAmount(1);
                        }}
                        className={cn("flex flex-col items-center justify-center h-14 rounded-[var(--radius-inner)] border transition-all active:scale-95 shadow-sm group/op p-0",
                          isActive
                            ? (op.color === 'emerald' ? "bg-emerald-50 border-emerald-200 text-emerald-600 ring-2 ring-emerald-500/10 hover:bg-emerald-50 hover:text-emerald-600" :
                              op.color === 'rose' ? "bg-rose-50 border-rose-200 text-rose-600 ring-2 ring-rose-500/10 hover:bg-rose-50 hover:text-rose-600" :
                                op.color === 'indigo' ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/10 hover:bg-indigo-50 hover:text-indigo-600" :
                                  "bg-primary/5 border-primary/20 text-primary ring-2 ring-primary/10 hover:bg-primary/5 hover:text-primary")
                            : "bg-white border-slate-200 text-slate-400 hover:bg-white hover:text-slate-400"
                        )}
                      >
                        <op.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isActive && "stroke-[3]")} />
                        <span className="text-xs sm:text-xs font-black mt-1">{op.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Transaction Preview Bento Block */}
            <div className={cn("rounded-[var(--radius-inner)] p-6 relative overflow-hidden group transition-all duration-500 shadow-crm-xl border",
              type === 'in' ? "bg-gradient-to-br from-emerald-50/50 via-white to-emerald-500/10 shadow-emerald-500/10 border-emerald-500/20" :
                type === 'out' ? "bg-gradient-to-br from-rose-50/50 via-white to-rose-500/10 shadow-rose-500/10 border-rose-500/20" : "bg-gradient-to-br from-indigo-50/50 via-white to-primary/10 shadow-primary/10 border-primary/20"
            )}>
              {/* Decorative Background Elements: Dynamic Pattern based on operation */}
              <div className={cn("absolute inset-0 opacity-[0.08] pointer-events-none overflow-hidden select-none transition-colors duration-500 flex items-center justify-end pr-8",
                type === 'in' ? "text-emerald-500" : type === 'out' ? "text-rose-500" : "text-primary"
              )}>
                {(() => {
                  const BgIcon = type === 'in' ? Plus : type === 'out' ? Minus : RefreshCw;
                  return <BgIcon className="w-48 h-48 -rotate-12 translate-x-12" strokeWidth={2.5} />;
                })()}
              </div>

              <div className="relative z-10 flex items-center justify-between min-h-[90px]">
                <div className="space-y-2.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-900 shadow-md">
                    <Package className="w-3 h-3 text-slate-300" />
                    <span className="text-xs font-black text-white px-1 truncate max-w-[120px]">
                      {type === "transfer" ? (locations.find(l => l.id === selectedLocationId)?.name || "Источник") : "Было"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pl-1">
                    <span className="text-4xl font-black text-slate-900 tabular-nums">
                      {selectedLocationId ? currentStockOnLocation : item.quantity}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{formatUnit(item.unit)}</span>
                  </div>
                </div>

                <div className="px-6 flex items-center justify-center relative">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 relative z-20",
                    type === 'in' ? "bg-emerald-500 shadow-emerald-500/30" :
                      type === 'out' ? "bg-rose-500 shadow-rose-500/30" :
                        type === 'transfer' ? "bg-indigo-500 shadow-indigo-500/30" : "bg-primary shadow-lg shadow-primary/30"
                  )}>
                    {type === 'in' ? (
                      <Plus className="w-7 h-7 text-white stroke-[3.5]" />
                    ) : type === 'out' ? (
                      <Minus className="w-7 h-7 text-white stroke-[3.5]" />
                    ) : type === 'transfer' ? (
                      <ArrowRightLeft className="w-7 h-7 text-white stroke-[2.5]" />
                    ) : (
                      <RefreshCw className="w-6 h-6 text-white stroke-[3.5]" />
                    )}
                    {/* Animation ring */}
                    <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20",
                      type === 'in' ? "bg-emerald-500" :
                        type === 'out' ? "bg-rose-500" :
                          type === 'transfer' ? "bg-indigo-500" : "bg-primary"
                    )} />
                  </div>
                  <div className={cn("absolute w-24 h-[2px] bg-gradient-to-r from-transparent to-transparent",
                    type === 'in' ? "via-emerald-500/30" :
                      type === 'out' ? "via-rose-500/30" : "via-primary/30"
                  )} />
                </div>

                <div className="space-y-2.5 text-right flex-1">
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-lg transition-all duration-500",
                    type === 'in' ? "bg-emerald-500 border-emerald-600 shadow-emerald-500/20" :
                      type === 'out' ? "bg-rose-500 border-rose-600 shadow-rose-500/20" :
                        type === 'transfer' ? "bg-indigo-600 border-indigo-700 shadow-indigo-500/20" : "bg-primary border-primary-600 shadow-primary/20"
                  )}>
                    {type === 'in' ? <Plus className="w-3 h-3 text-white" /> :
                      type === 'out' ? <Minus className="w-3 h-3 text-white" /> :
                        type === 'transfer' ? <ArrowRightLeft className="w-3 h-3 text-white" /> :
                          <Check className="w-3 h-3 text-white" />}
                    <span className="text-xs font-black text-white px-1 truncate max-w-[120px]">
                      {type === "transfer" ? (locations.find(l => l.id === toLocationId)?.name || "Получатель") : "Станет"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 justify-end pr-1">
                    <span className={cn("text-5xl font-black tabular-nums drop-shadow-sm transition-colors duration-500",
                      type === 'in' ? "text-emerald-600" :
                        type === 'out' ? "text-rose-600" :
                          type === 'transfer' ? "text-indigo-600" : "text-primary"
                    )}>
                      {type === 'in' ? currentStockOnLocation + amount :
                        type === 'out' ? currentStockOnLocation - amount :
                          type === 'transfer' ? (Array.isArray(itemStocks) ? (itemStocks.find(s => s.storageLocationId === toLocationId)?.quantity ?? 0) + amount : amount) :
                            amount}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{formatUnit(item.unit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Inputs: Amount & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Quantity Block */}
              <div className={cn("space-y-2", (type === "in" || type === "out") && canSeeCost ? "sm:col-span-2" : "sm:col-span-5")}>
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">
                  {type === "set" ? "Новое количество" : "Количество"}
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] flex items-stretch p-1.5 h-[72px] shadow-inner transition-all group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setAmount(prev => Math.max(0, prev - 1))}
                    className="w-14 h-full rounded-[var(--radius-inner)] text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm"
                  >
                    <Minus className="w-5 h-5 stroke-[3]" />
                  </Button>

                  <div className="flex-1 flex items-center justify-center gap-1.5 relative px-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className={cn(
                        "w-full bg-transparent border-none text-center font-black text-slate-900 outline-none tabular-nums p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        amount.toString().length > 7 ? "text-xl" :
                          amount.toString().length > 5 ? "text-2xl" : "text-3xl"
                      )}
                    />
                    <span className="text-sm font-bold text-slate-400 mt-1 shrink-0">
                      {formatUnit(item.unit)}
                    </span>
                  </div>

                  <Button type="button" variant="ghost" size="icon" onClick={() => setAmount(prev => prev + 1)}
                    className="w-14 h-full rounded-[var(--radius-inner)] text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-sm"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </Button>
                </div>
              </div>

              {/* Price Block */}
              {(type === "in" || type === "out") && canSeeCost && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 sm:col-span-3">
                  <label className="text-sm font-bold text-slate-700 block mb-2 pr-1 text-right">
                    {type === "in" ? "Цена закупки" : "Цена списания"}
                  </label>
                  <div className="grid grid-cols-5 gap-2 h-[72px]">
                    <div className="col-span-2 bg-slate-100/50 border border-dashed border-slate-200 rounded-[var(--radius-inner)] px-3 flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-slate-400 mb-0.5">Предыдущая</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black text-slate-500 tabular-nums" suppressHydrationWarning>
                          {item.costPrice ? Math.round(Number(item.costPrice)).toLocaleString('ru-RU') : "0"}
                        </span>
                        <span className="text-xs font-bold text-slate-400">₽</span>
                      </div>
                    </div>
                    <div className="col-span-3 relative group h-full">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder={item.costPrice ? String(item.costPrice) : "0"}
                        className="w-full h-full bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] pl-4 pr-8 text-3xl font-black text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all tabular-nums shadow-inner"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300 pointer-events-none">
                        ₽
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Reason */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Причина <span className="text-rose-500">*</span></label>
              <textarea
                value={reason}
                required
                onChange={(e) => setReason(e.target.value)}
                placeholder="Напр: Приемка от поставщика..."
                className="w-full min-h-[80px] p-3 rounded-[var(--radius-inner)] border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-slate-300 leading-snug shadow-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold leading-none">{error}</p>
              </div>
            )}
          </div>
        </form>

        <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center justify-end lg:justify-between gap-3 shrink-0">
          <Button type="button" color="gray" variant="ghost" onClick={onClose} className="flex-1 lg:flex-none lg:px-8 font-bold text-sm">
            Отмена
          </Button>
          <SubmitButton form="adjust-stock-form" isLoading={isSubmitting} text="Сохранить" loadingText="Сохранение..." color="black" disabled={isSubmitting || amount <= 0 || !reason.trim()} className="flex-1 lg:flex-none lg:w-auto lg:px-10 font-bold text-sm shadow-sm transition-all border-none" />
        </div>
      </div>
    </ResponsiveModal>
  );
}
