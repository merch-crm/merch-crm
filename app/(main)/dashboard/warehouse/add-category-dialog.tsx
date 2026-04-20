"use client";

import { useState, createElement } from"react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { SubmitButton } from"@/components/ui/submit-button";
import { addInventoryCategory } from"./category-actions";
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
    sm:"w-8 h-8 rounded-[12px]",
    md:"w-12 h-12 rounded-[16px]",
    lg:"w-16 h-16 rounded-[20px]"
  };
  const iconSizeClasses = {
    sm:"w-4 h-4",
    md:"w-6 h-6",
    lg:"w-8 h-8"
  };

  return (
    <div
      className={cn("flex items-center justify-center shrink-0 transition-all duration-500 text-white shadow-lg shadow-black/5 backdrop-blur-sm",
        sizeClasses[size]
      )}
      style={getDynamicGradient(color)}
    >
      {createElement(getCategoryIcon({ icon: iconName }), {
        className: cn("stroke-[2.5] drop-shadow-md", iconSizeClasses[size])
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
    <div className="space-y-1.5 flex-1">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block ml-1">{label}</label>
      <Input 
        className={cn(
          "h-12 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm transition-all duration-200", 
          error ? "border-rose-200 bg-rose-50/50 text-rose-900 ring-rose-500/10 focus:ring-4" : "border-slate-200 bg-white hover:bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-500/5", 
          className 
        )} 
        {...props} 
      />
      {error && <p className="text-[11px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">{error}</p>}
    </div>
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
        color="dark"
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
          "h-12 sm:w-auto px-6 sm:px-10 rounded-2xl gap-3 shadow-xl shadow-black/5 hover:shadow-black/10 active:scale-95 transition-all",
          className
        )}
      >
        <div className="flex items-center justify-center size-6 bg-white/20 rounded-lg">
          <Plus className="size-4 stroke-[3]" />
        </div>
        <span className="font-extrabold tracking-tight text-base">{buttonText}</span>
      </Button>

      <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)}
        title={parentId ?"Новая подкатегория" :"Новая категория"}
        description="Создание новой категории или подкатегории для товаров в инвентаре"
        showVisualTitle={false}
        hideClose={true}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between p-8 pb-4 shrink-0">
            <div className="flex items-center gap-5">
              <CategoryIconPreview iconName={formState.icon} color={formState.color} size="lg" />
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                  {parentId ?"Подкатегория" :"Категория"}
                </h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2 ml-0.5">Настройка параметров раздела</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 pt-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex gap-4">
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
              <div className="w-28">
                <ValidatedInput label="Артикул" name="prefix" required value={formState.prefix} placeholder="TS" error={uiState.fieldErrors.prefix} onChange={(e) => {
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

            <div className="space-y-1.5 group">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block ml-1 group-focus-within:text-slate-900 transition-colors">Описание</label>
              <textarea
                name="description"
                placeholder="Опциональное описание..."
                className="crm-dialog-textarea rounded-xl min-h-[80px] bg-white border-slate-200 focus:bg-white focus:ring-4 focus:ring-slate-500/5 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block ml-1">Иконка</label>
                <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-200/50">
                  <CategoryIconPicker value={formState.icon} color={formState.color} onChange={(iconName) => setFormState(prev => ({ ...prev, icon: iconName, iconManuallyEdited: true }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block ml-1">Цвет</label>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 shadow-sm overflow-x-auto custom-scrollbar">
                  <ColorPickerSwatchesGroup 
                    value={formState.color} 
                    onChange={(color) => setFormState(prev => ({ ...prev, color }))} 
                    colors={COLORS.map((c) => getHexColor(c.name))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SwitchRow title={"В артикул"} description="" checked={formState.showInSku} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                color="success"
                className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl"
              />
              <SwitchRow title={"В название"} description="" checked={formState.showInName} onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
                color="success"
                className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl"
              />
            </div>


            {uiState.error && (
              <div className="crm-error-box">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uiState.error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-8 pt-4">
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              onClick={() => setIsOpen(false)}
              className="h-12 px-8 rounded-xl font-bold hover:bg-slate-100"
            >
              Отмена
            </Button>
            <SubmitButton
              text="Создать"
              loadingText="Создание..."
              className="h-12 px-10 rounded-xl font-black uppercase tracking-tight shadow-lg shadow-black/10"
              color="dark"
            />
          </div>
        </form>
      </ResponsiveModal >
    </>
  );
}
