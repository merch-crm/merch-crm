"use client";

import { useState, createElement } from"react";
import { FolderPlus, AlertCircle } from "lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { SubmitButton } from"@/components/ui/submit-button";
import { addInventoryCategory } from"./category-actions";;
import { useRouter } from"next/navigation";
import { cn } from"@/lib/utils";
import { getIconNameFromName, getCategoryIcon, COLORS, generateCategoryPrefix, getDynamicGradient, getHexColor } from"./category-utils";
import { ResponsiveModal } from"@/components/ui/responsive-modal";
import { CategoryIconPicker } from "./category-icon-picker";
import { SwitchRow } from "@/components/ui/switch-row";
import { ColorPickerSwatchesGroup } from "@/components/ui/color-picker-variants";


interface AddCategoryDialogProps {
  parentId?: string;
  buttonText?: string;
  className?: string;
  isOpen?: boolean; // Controlled
  onOpenChange?: (open: boolean) => void; // Controlled
}



function CategoryIconPreview({ iconName, color, size ="md" }: { iconName: string, color: string, size?:"sm" |"md" |"lg" }) {
  const sizeClasses = {
    sm:"w-8 h-8 rounded-[10px]",
    md:"w-10 h-10 rounded-[12px]",
    lg:"w-12 h-12 rounded-[14px]"
  };
  const iconSizeClasses = {
    sm:"w-4 h-4",
    md:"w-5 h-5",
    lg:"w-6 h-6"
  };

  return (
    <div
      className={cn("flex items-center justify-center shrink-0 transition-all duration-500 text-white",
        sizeClasses[size]
      )}
      style={getDynamicGradient(color)}
    >
      {createElement(getCategoryIcon({ icon: iconName }), {
        className: cn("stroke-[2.5]", iconSizeClasses[size])
      })}
    </div>
  );
}

interface ValidatedInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  error?: string | null;
}

function ValidatedInput({ label, error, className, ...props }: ValidatedInputProps) {
  return (
    <>
      <label className="text-sm font-bold text-slate-700 block ml-1">{label}</label>
      <Input className={cn("h-10 rounded-lg font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm", error ?"border-rose-300 bg-rose-50 text-rose-900" :"border-slate-200 bg-slate-50", className )} {...props} />
      {error && <p className="text-xs font-bold text-rose-500 ml-1">{error}</p>}
    </>
  );
}

export function AddCategoryDialog({
  parentId,
  buttonText ="Добавить категорию",
  className,
  isOpen: controlledIsOpen,
  onOpenChange
}: AddCategoryDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setInternalIsOpen(open);
  };

  const [uiState, setUiState] = useState({
    error: null as string | null,
    fieldErrors: {} as Record<string, string>
  });

  const [formState, setFormState] = useState({
    name:"",
    prefix:"",
    prefixManuallyEdited: false,
    color:"primary",
    icon:"tshirt-custom",
    iconManuallyEdited: false,
    showInSku: true,
    showInName: true,
    parentId: parentId ||""
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const prefix = formData.get("prefix") as string;

    const newErrors: Record<string, string> = {};
    if (!name || name.trim().length < 2) newErrors.name ="Введите название";
    if (!prefix || prefix.trim().length < 2) newErrors.prefix ="Введите артикул";

    if (Object.keys(newErrors).length > 0) {
      setUiState(prev => ({ ...prev, fieldErrors: newErrors }));
      return;
    }

    setUiState(prev => ({ ...prev, error: null, fieldErrors: {} }));

    formData.set("icon", formState.icon);
    formData.set("color", formState.color);
    formData.set("parentId", formState.parentId);
    formData.set("showInSku", String(formState.showInSku));
    formData.set("showInName", String(formState.showInName));
    const result = await addInventoryCategory(formData);

    if (!result.success) {
      setUiState(prev => ({ ...prev, error: result.error }));
    } else {
      setIsOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button 
        onClick={() => {
          setFormState(prev => ({
            ...prev,
            name:"",
            prefix:"",
            prefixManuallyEdited: false
          }));
          setUiState({ error: null, fieldErrors: {} });
          setIsOpen(true);
        }}
        className={cn(
          "h-11 sm:w-auto px-5 sm:px-8 rounded-xl gap-2.5",
          className
        )}
      >
        <Plus className="size-4.5 stroke-[2.5]" />
        <span className="font-bold tracking-tight">{buttonText}</span>
      </Button>

      <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)}
        title={parentId ?"Новая подкатегория" :"Новая категория"}
        description="Создание новой категории или подкатегории для товаров в инвентаре"
        showVisualTitle={false}
        hideClose={true}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3">
              <CategoryIconPreview iconName={formState.icon} color={formState.color} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {parentId ?"Подкатегория" :"Новая категория"}
                </h2>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Настройка параметров раздела</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 pt-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1">
                <ValidatedInput label="Название" name="name" required value={formState.name} placeholder="Напр. Футболки" error={uiState.fieldErrors.name} onChange={(e) => {
                    const name = e.target.value;
                    setFormState(prev => ({
                      ...prev,
                      name,
                      prefix: prev.prefixManuallyEdited ? prev.prefix : generateCategoryPrefix(name),
                      icon: prev.iconManuallyEdited ? prev.icon : getIconNameFromName(name)
                    }));
                  }}
                  onInput={() => {
                    if (uiState.fieldErrors.name || (!formState.prefixManuallyEdited && uiState.fieldErrors.prefix)) {
                      setUiState(prevUi => ({
                        ...prevUi,
                        fieldErrors: {
                          ...prevUi.fieldErrors,
                          name:"",
                          ...(!formState.prefixManuallyEdited ? { prefix:"" } : {})
                        }
                      }));
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5 w-24">
                <ValidatedInput label="Артикул" name="prefix" required value={formState.prefix} placeholder="TS" error={uiState.fieldErrors.prefix} className="" onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                    setFormState(prev => ({ ...prev, prefix: val, prefixManuallyEdited: true }));
                    if (uiState.fieldErrors.prefix) setUiState(prev => ({
                      ...prev,
                      fieldErrors: { ...prev.fieldErrors, prefix:"" }
                    }));
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block ml-1">Описание</label>
              <textarea
                name="description"
                placeholder="Опциональное описание назначения этой категории..."
                className="crm-dialog-textarea rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">Иконка</label>
                <CategoryIconPicker value={formState.icon} color={formState.color} onChange={(iconName) => setFormState(prev => ({ ...prev, icon: iconName, iconManuallyEdited: true }))}
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
              <SwitchRow title={"Добавлять в\u00A0артикул"} description="" checked={formState.showInSku} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                color="success"
                className="p-3 bg-slate-50 rounded-2xl"
              />
              <SwitchRow title={"Добавлять в\u00A0название"} description="" checked={formState.showInName} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
                color="success"
                className="p-3 bg-slate-50 rounded-2xl"
              />
            </div>


            {uiState.error && (
              <div className="crm-error-box">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uiState.error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 pt-2">
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              onClick={() => setIsOpen(false)}
              className="h-11 px-6 rounded-xl font-bold"
            >
              Отмена
            </Button>
            <SubmitButton
              text="Создать категорию"
              loadingText="Выполняется..."
              className="h-11 px-8 rounded-xl font-bold"
            />
          </div>
        </form>
      </ResponsiveModal >
    </>
  );
}
