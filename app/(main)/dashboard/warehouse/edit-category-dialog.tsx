"use client";

import { useState, createElement } from"react";
import { Trash2, AlertCircle } from "lucide-react";
import { SubmitButton } from"@/components/ui/submit-button";
import { Input } from"@/components/ui/input";
import { Button } from"@/components/ui/button";

import { updateInventoryCategory, deleteInventoryCategory } from"./category-actions";;
import { useRouter } from"next/navigation";
import { cn } from"@/lib/utils";
import type { Session } from "@/lib/session";
import { useToast } from"@/components/ui/toast";


import { Category } from"./types";
import { getCategoryIcon, COLORS, generateCategoryPrefix, ALL_ICONS_MAP, getDynamicGradient, getHexColor } from"./category-utils";
import { ResponsiveModal } from"@/components/ui/responsive-modal";
import { SwitchRow } from"@/components/ui/switch-row";
import { CategoryIconPicker } from"./category-icon-picker";
import { ColorPickerSwatchesGroup } from "@/components/ui/color-picker-variants";



interface EditCategoryDialogProps {
  category: Category & { prefix?: string | null, isSystem?: boolean };
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  user: Session | null;
}

export function EditCategoryDialog({ category, categories, isOpen, onClose }: EditCategoryDialogProps) {
  const { toast } = useToast();
  const [uiState, setUiState] = useState({
    isPending: false,
    deletePassword:"",
    error: null as string | null,
    showDeleteModal: false,
    subToDelete: null as string | null,
    subPending: false,
    prevCategoryId: category.id
  });

  const [formState, setFormState] = useState({
    name: category.name,
    prefix: category.prefix ||"",
    prefixManuallyEdited: false,
    color: category.color ||"primary",
    icon: category.icon ||"tshirt-custom",
    showInSku: category.showInSku ?? true,
    showInName: category.showInName ?? true,
  });

  // Reset state when category changes
  if (category.id !== uiState.prevCategoryId) {
    setUiState(prev => ({
      ...prev,
      prevCategoryId: category.id,
      error: null,
      deletePassword:"",
      showDeleteModal: false,
      subToDelete: null,
      isPending: false,
      subPending: false
    }));
    setFormState({
      name: category.name,
      prefix: category.prefix ||"",
      prefixManuallyEdited: false,
      color: category.color ||"primary",
      icon: category.icon ||"tshirt-custom",
      showInSku: category.showInSku ?? true,
      showInName: category.showInName ?? true,
    });
  }

  const router = useRouter();

  const selectedParentId = category.parentId ||"";
  const subCategories = (categories || []).filter(c => c.parentId === category.id);
  const isParentCategory = !category.parentId;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUiState(prev => ({ ...prev, isPending: true, error: null }));

    const formData = new FormData(event.currentTarget);
    formData.set("icon", formState.icon);
    formData.set("color", formState.color);
    formData.set("parentId", selectedParentId);
    formData.set("showInSku", String(formState.showInSku));
    formData.set("showInName", String(formState.showInName));

    const result = await updateInventoryCategory(category.id, formData);

    if (!result.success) {
      setUiState(prev => ({ ...prev, error: result.error, isPending: false }));
    } else {
      onClose();
      setUiState(prev => ({ ...prev, isPending: false }));
      router.refresh();
    }
  }

  async function handleDeleteCategory() {
    setUiState(prev => ({ ...prev, isPending: true }));
    const result = await deleteInventoryCategory(category.id);
    if (!result.success) {
      setUiState(prev => ({ ...prev, error: result.error, isPending: false, showDeleteModal: false, deletePassword:"" }));
    } else {
      setUiState(prev => ({ ...prev, isPending: false, showDeleteModal: false }));
      onClose();
      router.refresh();
    }
  }

  async function handleDeleteSubcategory(subId: string) {
    setUiState(prev => ({ ...prev, subToDelete: subId }));
  }

  async function confirmDeleteSub() {
    if (!uiState.subToDelete) return;
    setUiState(prev => ({ ...prev, subPending: true }));
    const result = await deleteInventoryCategory(uiState.subToDelete);
    if (result.success) {
      toast("Подкатегория удалена","success");
      router.refresh();
    } else {
      toast(result.error ||"Ошибка при удалении","error");
    }
    setUiState(prev => ({ ...prev, subPending: false, subToDelete: null }));
  }

  const subToDeleteData = subCategories.find(s => s.id === uiState.subToDelete);

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Редактирование категории" description="Изменение параметров названия, цвета, иконки и артикула существующей категории" showVisualTitle={false} className="sm:max-w-[900px]">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-500 shadow-lg shrink-0 text-white"
              )}
              style={getDynamicGradient(formState.color)}
            >
              {createElement(ALL_ICONS_MAP[formState.icon] || getCategoryIcon({ name: formState.name }), { className:"w-6 h-6 stroke-[2.5]" })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">Редактировать</h2>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                Категория: <span className="text-slate-900 font-bold">{category.name}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Two-column layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left column: form */}
          <form id="edit-category-form" onSubmit={handleSubmit} className="flex-1 px-6 py-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar border-r border-slate-100">
            {uiState.error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {uiState.error}
              </div>
            )}

            <div className="flex gap-3">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Название</label>
                <Input name="name" required value={formState.name} placeholder="Напр. Футболки" onChange={(e) => {
                    const name = e.target.value;
                    setFormState(prev => ({
                      ...prev,
                      name,
                      prefix: prev.prefixManuallyEdited ? prev.prefix : generateCategoryPrefix(name)
                    }));
                  }}
                  className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm outline-none shadow-sm"
                />
              </div>
              <div className="space-y-2 w-28">
                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Артикул</label>
                <Input name="prefix" value={formState.prefix} placeholder="TS" className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm outline-none shadow-sm tabular-nums" onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                    setFormState(prev => ({ ...prev, prefix: val, prefixManuallyEdited: true }));
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block ml-1">Описание</label>
              <textarea
                name="description"
                defaultValue={category.description ||""}
                placeholder="Опциональное описание назначения этой категории..."
                className="crm-dialog-textarea rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">Иконка</label>
                <CategoryIconPicker value={formState.icon} color={formState.color} onChange={(iconName) => setFormState(prev => ({ ...prev, icon: iconName }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">Цвет</label>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
                  <ColorPickerSwatchesGroup 
                    value={formState.color} 
                    onChange={(color) => setFormState(prev => ({ ...prev, color }))} 
                    colors={COLORS.map((c) => getHexColor(c.name))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SwitchRow title="Добавлять в артикул" description="" checked={formState.showInSku} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                color="green"
                className="p-3 bg-slate-50 rounded-2xl"
              />
              <SwitchRow title="Добавлять в название" description="" checked={formState.showInName} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
                color="green"
                className="p-3 bg-slate-50 rounded-2xl"
              />
            </div>
          </form>

          {/* Right column: subcategories */}
          {isParentCategory && (
            <div className="w-[360px] shrink-0 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Подкатегории</span>
                <span className="bg-slate-50 text-slate-900 border border-slate-200 w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-bold shadow-sm">{subCategories.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {subCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 border border-slate-100">
                      <span className="text-xl">📂</span>
                    </div>
                    <p className="text-xs font-bold text-slate-300">Нет подкатегорий</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {subCategories.map(sub => {
                      const IconComponent = getCategoryIcon(sub);
                      return (
                        <div key={sub.id} className="group relative flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all cursor-default shadow-sm overflow-visible min-h-[80px]">
                          <Button 
                            variant="solid" 
                            color="red" 
                            size="icon" 
                            disabled={uiState.subPending} 
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <div
                            className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm mb-1.5 transition-all text-white")}
                            style={getDynamicGradient(sub.color)}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 truncate w-full text-center leading-tight">{sub.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 p-4 sm:p-6 sm:pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 grid grid-cols-2 lg:flex items-center lg:justify-between gap-3 shrink-0">
          <Button 
            variant="solid" 
            color="red" 
            onClick={() => setUiState(prev => ({ ...prev, showDeleteModal: true }))}
            className="lg:flex-none lg:px-6 flex items-center justify-center gap-2.5 w-full lg:w-auto font-bold"
          >
            <Trash2 className="w-4 h-4" />
            Удалить
          </Button>
          <Button 
            variant="ghost" 
            color="gray"
            onClick={onClose} 
            className="hidden lg:flex lg:ml-auto lg:px-8 font-bold"
          >
            Отмена
          </Button>

          <SubmitButton 
            form="edit-category-form" 
            isLoading={uiState.isPending} 
            text="Сохранить" 
            loadingText="Сохранение..." 
            className="w-full lg:w-auto lg:min-w-[140px] lg:px-10 font-bold" 
          />
        </div>

        {/* Subcategory Deletion Confirmation */}
        <ResponsiveModal isOpen={!!uiState.subToDelete} onClose={() => setUiState(prev => ({ ...prev, subToDelete: null }))}
          title="Удаление подкатегории"
          description="Подтверждение удаления подкатегории из системы"
        >
          <div className="p-6 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-5 text-rose-500 shadow-sm border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight px-4">
              Удалить подкатегорию «{subToDeleteData?.name}»?
            </h3>
            <p className="text-[12px] font-medium text-slate-400 mb-8 leading-relaxed max-w-[240px]">Это действие нельзя отменить. Подкатегория будет полностью удалена.</p>

            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <Button 
                color="red" 
                onClick={confirmDeleteSub} 
                className="w-full font-bold"
              >
                Удалить
              </Button>
              <Button 
                variant="ghost" 
                color="gray"
                onClick={() => setUiState(prev => ({ ...prev, subToDelete: null }))}
                className="hidden lg:flex w-full font-bold"
              >
                Отмена
              </Button>
            </div>
          </div>
        </ResponsiveModal>

        {/* Category Deletion Confirmation */}
        <ResponsiveModal isOpen={uiState.showDeleteModal} onClose={() => { setUiState(prev => ({ ...prev, showDeleteModal: false, deletePassword:"" })); }}
          title="Удаление категории"
          description="Подтверждение удаления основной категории и всех связанных данных"
          showVisualTitle={false}
        >
          <div className="p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-50 rounded-xl flex items-center justify-center mb-6 text-rose-500 shadow-sm border border-rose-100">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight px-4">
              Удалить категорию «{category.name}»?
            </h3>
            <p className="text-[13px] font-bold text-rose-400 mb-8 leading-relaxed px-2">Все товары станут «Без категории»</p>

            {category.isSystem && (
              <div className="mb-8 w-full p-5 bg-rose-50/50 rounded-xl border border-rose-100 text-left shadow-inner">
                <label className="text-sm font-bold text-rose-600 mb-3 block">Системная защита</label>
                <input
                  type="password"
                  value={uiState.deletePassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUiState(prev => ({ ...prev, deletePassword: val }));
                  }}
                  placeholder="Пароль от аккаунта"
                  className="w-full h-11 px-4 rounded-xl border border-rose-200 bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none text-sm font-bold shadow-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="flex flex-col gap-3 w-full items-center">
              <Button 
                color="red" 
                onClick={handleDeleteCategory} 
                disabled={uiState.isPending || (category.isSystem && !uiState.deletePassword.trim())} 
                className="w-full max-w-[320px] font-bold"
              >
                {uiState.isPending ?"Удаление..." :"Удалить категорию"}
              </Button>
              <Button 
                variant="ghost" 
                color="gray"
                onClick={() => { setUiState(prev => ({ ...prev, showDeleteModal: false, deletePassword:"" })); }}
                className="w-full font-bold"
              >
                Отмена
              </Button>
            </div>
          </div>
        </ResponsiveModal>
      </div>
    </ResponsiveModal >
  );
}
