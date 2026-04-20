"use client";

import React, { useRef, useEffect } from "react";

import { Edit3, Save, Trash2, X, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InventoryItem, Category } from "@/app/(main)/dashboard/warehouse/types";
import { cn } from "@/lib/utils";

interface ItemHeaderProps {
  item: InventoryItem;
  isEditing: boolean;
  isSaving: boolean;
  isAnyUploading: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onEdit: () => void;
  onUnarchive: () => void;
}

export const ItemHeader = React.memo(({
  item,
  isEditing,
  isSaving,
  isAnyUploading,
  editName,
  onEditNameChange,
  onCancel,
  onSave,
  onEdit,
  onUnarchive,
}: ItemHeaderProps) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editName]);

  return (
    <div className={cn("space-y-0.5 w-full",
      item.isArchived && "opacity-80"
    )}>
      {/* Status Banner for Archive */}
      {item.isArchived && (
        <div className="w-full bg-destructive/10 border border-destructive/20 p-4 rounded-3xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-destructive text-destructive-foreground flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-destructive leading-none mb-1">Архив товара</p>
              <p className="text-xs font-medium text-destructive/80 leading-none">Этот товар не отображается в общем каталоге и заказах.</p>
            </div>
          </div>
          <Button size="md" onClick={onUnarchive} className="h-11 px-8 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-bold shadow-lg shadow-destructive/10 transition-all active:scale-95 gap-2">
            <RefreshCcw className="w-4 h-4" />
            Восстановить
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            {isEditing ? (
              <div className="relative group w-full">
                <textarea
                  ref={textareaRef}
                  value={editName}
                  onChange={e => onEditNameChange(e.target.value)}
                  aria-label="Название товара"
                  className="text-2xl md:text-3xl font-bold text-foreground bg-transparent outline-none w-full border-b-2 border-primary/30 focus:border-primary transition-colors pb-1 placeholder:text-muted-foreground/30 resize-none overflow-hidden"
                  placeholder="Название…"
                  rows={1}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    color="neutral" 
                    size="icon" 
                    onClick={() => router.push('/dashboard/warehouse')}
                    className="size-11 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 group"
                  >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                  </Button>
                  <h1
                    className="text-2xl md:text-4xl font-black text-slate-900 leading-tight md:whitespace-normal md:overflow-visible pr-2 cursor-pointer outline-none focus-visible:text-primary min-w-0"
                    onDoubleClick={onEdit}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEdit();
                      }
                    }}
                  >
                    {(() => {
                      const cat = item.category as Category | null;

                      const forceSingular = (name: string, metadataSingular?: string | null) => {
                        if (metadataSingular && metadataSingular.toLowerCase() !== name.toLowerCase()) return metadataSingular;
                        if (!name) return "";
                        const n = name.toLowerCase();
                        if (n.includes("футболк")) return "Футболка";
                        if (n.includes("худи")) return "Худи";
                        if (n.includes("лонгслив")) return "Лонгслив";
                        if (n.includes("свитшот")) return "Свитшот";
                        if (n.includes("толстовк")) return "Толстовка";
                        if (n.includes("куртк")) return "Куртка";
                        if (n.includes("бомбер")) return "Бомбер";
                        if (n.includes("шорт")) return "Шорты";
                        if (n.includes("штан") || n.includes("брюк")) return "Штаны";
                        if (n.includes("кепк")) return "Кепка";
                        if (n.includes("шапк")) return "Шапка";
                        if (n.includes("поло")) return "Поло";
                        if (n.endsWith("ки")) return name.slice(0, -2) + "ка";
                        return name;
                      };

                      const singularName = cat?.singularName || (cat?.name ? forceSingular(cat.name) : "");

                      if (singularName) {
                        const pluralOptions = [cat?.name, cat?.pluralName].filter(Boolean) as string[];
                        const sortedPlurals = pluralOptions.sort((a, b) => b.length - a.length);

                        for (const plural of sortedPlurals) {
                          if (item.name.toLowerCase().startsWith(plural.toLowerCase())) {
                            return singularName + item.name.substring(plural.length);
                          }
                        }

                        const lowerName = item.name.toLowerCase();
                        if (lowerName.startsWith("футболки")) return "Футболка" + item.name.substring(9);
                        if (lowerName.startsWith("худи")) return "Худи" + item.name.substring(5);
                      }
                      return item.name;
                    })()}
                  </h1>
                </div>

                <div className="flex items-center gap-3 ml-[52px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-400">
                      Артикул:
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {item.sku || '—'}
                    </span>
                  </div>

                  <div className="w-1 h-1 rounded-full bg-slate-300" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400">
                      Последнее обновление:
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {(() => {
                        const dateVal = item.updatedAt;
                        if (!dateVal) return '—';
                        const d = new Date(dateVal);
                        const now = new Date(); // suppressHydrationWarning
                        const isToday = d.toDateString() === now.toDateString();

                        if (isToday) {
                          return `Сегодня, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
                        }
                        return d.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto lg:ml-0">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={onCancel} aria-label="Отменить изменения" className="h-11 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                <span className="hidden md:inline">Отмена</span>
              </Button>
              <Button onClick={onSave} type="button" disabled={isSaving || isAnyUploading} aria-label="Сохранить изменения" className="h-11 px-6 sm:px-10 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm border-none shadow-xl shadow-black/10 hover:bg-slate-800 flex items-center justify-center transition-all active:scale-95 gap-2">
                {isSaving ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAnyUploading ? "Загрузка…" : "Сохранить"}</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {!item.isArchived && (
                <Button onClick={onEdit} aria-label="Редактировать товар" className="h-11 px-6 sm:px-8 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xl shadow-black/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Редактировать</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.isSaving === nextProps.isSaving &&
    prevProps.isAnyUploading === nextProps.isAnyUploading &&
    prevProps.editName === nextProps.editName &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.sku === nextProps.item.sku &&
    prevProps.item.updatedAt === nextProps.item.updatedAt
  );
});

ItemHeader.displayName = "ItemHeader";
