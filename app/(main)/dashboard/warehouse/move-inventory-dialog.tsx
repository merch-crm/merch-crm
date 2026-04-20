"use client";

import { ArrowRightLeft, ChevronUp, ChevronDown } from"lucide-react";
import { InventoryItem } from"./types";
import { StorageLocation } from"./storage-locations-tab";
import { Button } from"@/components/ui/button";
import { cn } from"@/lib/utils";
import { Input } from"@/components/ui/input";
import { SubmitButton } from"@/components/ui/submit-button";
import { Select, SelectOption } from"@/components/ui/select";
import { ResponsiveModal } from"@/components/ui/responsive-modal";
import { useMoveInventory } from"./hooks/use-move-inventory";

interface MoveInventoryDialogProps {
  items: InventoryItem[];
  locations: StorageLocation[];
  isOpen?: boolean;
  onClose?: () => void;
  defaultItemId?: string;
  className?: string;
}

export function MoveInventoryDialog({
  items,
  locations,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  defaultItemId,
  className
}: MoveInventoryDialogProps) {
  const {
    isOpen, setIsOpen,
    selectedItemId, setSelectedItemId,
    fromLocationId, setFromLocationId,
    toLocationId, setToLocationId,
    quantity, setQuantity,
    comment, setComment,
    fieldErrors, setFieldErrors,
    isPending,
    handleSubmit
  } = useMoveInventory({ items, locations, externalIsOpen, externalOnClose, defaultItemId });

  const itemOptions: SelectOption[] = (items || []).map(item => ({
    id: item.id,
    title: item.name,
    description: item.sku ? `Артикул: ${item.sku}` : `Остаток: ${item.quantity} шт.`
  }));

  const locationOptions: SelectOption[] = (locations || []).map(loc => ({
    id: loc.id,
    title: loc.name,
    description: loc.description ||"Место хранения"
  }));

  return (
    <>
      {!externalIsOpen && (
        <Button type="button" onClick={() => setIsOpen(true)}
          className={cn("sm:w-auto px-0 sm:px-6 gap-2",
            className
          )}
        >
          <ArrowRightLeft className="w-5 h-5 text-white shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Переместить</span>
        </Button>
      )}

      <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)}
        title="Перемещение товара"
        description="Перемещение товарных позиций между различными складами или местами хранения"
        showVisualTitle={false}
        className="sm:max-w-[720px]"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full overflow-hidden"
          noValidate
        >
          <div className="flex items-center justify-between p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Перемещение</h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Между складами</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-6 flex-1 pb-6 custom-scrollbar space-y-3 pt-2">
            <div className="space-y-1.5 overflow-visible">
              <label className="text-sm font-bold text-slate-700 ml-1">Объект перемещения</label>
              <Select options={itemOptions} value={selectedItemId} disabled={isPending} onChange={(val) => {
                  setSelectedItemId(val);
                  setFieldErrors(prev => ({ ...prev, itemId:"" }));
                }}
                placeholder="Выберите товар из списка..."
                showSearch
                triggerClassName="bg-slate-50"
              />
              {fieldErrors.itemId && <p className="text-xs font-bold text-rose-500 ml-1">{fieldErrors.itemId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Откуда</label>
                <Select options={locationOptions} value={fromLocationId} onChange={(val) => {
                    setFromLocationId(val);
                    setFieldErrors(prev => ({ ...prev, fromLocationId:"" }));
                  }}
                  placeholder="Склад..."
                  showSearch
                  triggerClassName="bg-slate-50"
                />
                {fieldErrors.fromLocationId && <p className="text-xs font-bold text-rose-500 ml-1">{fieldErrors.fromLocationId}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Куда</label>
                <Select options={locationOptions} value={toLocationId} onChange={(val) => {
                    setToLocationId(val);
                    setFieldErrors(prev => ({ ...prev, toLocationId:"" }));
                  }}
                  placeholder="Склад..."
                  showSearch
                  align="end"
                  triggerClassName="bg-slate-50"
                />
                {fieldErrors.toLocationId && <p className="text-xs font-bold text-rose-500 ml-1">{fieldErrors.toLocationId}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Количество <span className="text-rose-500">*</span></label>
              <div className="relative group">
                <input type="number" name="quantity" placeholder="0" value={quantity} onChange={(e) => {
                    setQuantity(e.target.value);
                    setFieldErrors(prev => ({ ...prev, quantity:"" }));
                  }}
                  className={cn("w-full h-12 pl-4 pr-12 rounded-[var(--radius-inner)] border border-slate-200 bg-slate-50 text-sm font-bold outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm",
                    fieldErrors.quantity &&"border-rose-300 bg-rose-50 text-rose-900"
                  )}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setQuantity(prev => String(Number(prev || 0) + 1))}
                    className="w-7 h-4 p-0 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:border-primary/30"
                  >
                    <ChevronUp className="w-2.5 h-2.5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setQuantity(prev => String(Math.max(0, Number(prev || 0) - 1)))}
                    className="w-7 h-4 p-0 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:border-primary/30"
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                  </Button>
                </div>
              </div>
              {fieldErrors.quantity && <p className="text-xs font-bold text-rose-500 ml-1">{fieldErrors.quantity}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Причина перемещения <span className="text-rose-500">*</span></label>
              <Input name="comment" placeholder="Напр: Пополнение дефицита..." value={comment} onChange={(e) => {
                  setComment(e.target.value);
                  setFieldErrors(prev => ({ ...prev, comment:"" }));
                }}
                className={cn("w-full h-12 px-4 rounded-[var(--radius-inner)] border text-sm font-bold outline-none transition-all shadow-sm",
                  fieldErrors.comment ?"border-rose-300 bg-rose-50 text-rose-900" :"border-slate-200 bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/5"
                )}
              />
              {fieldErrors.comment && <p className="text-xs font-bold text-rose-500 ml-1 leading-tight">{fieldErrors.comment}</p>}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center justify-end lg:justify-between gap-3 shrink-0">
            <Button variant="ghost" color="gray" type="button" onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="flex flex-1 lg:flex-none lg:px-8 text-sm font-bold"
            >
              Отмена
            </Button>
            <SubmitButton isLoading={isPending} text="Переместить" loadingText="Обработка..." color="black" className="flex-1 lg:flex-none lg:w-auto lg:px-10 text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-none border-none font-bold" />
          </div>
        </form>
      </ResponsiveModal >
    </>
  );
}


