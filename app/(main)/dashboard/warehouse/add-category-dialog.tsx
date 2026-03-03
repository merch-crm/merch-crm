"use client";

import { useState, createElement } from"react";
import { FolderPlus, Check, AlertCircle } from"lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { SubmitButton } from"@/components/ui/submit-button";
import { addInventoryCategory } from"./category-actions";;
import { useRouter } from"next/navigation";
import { cn } from"@/lib/utils";
import { getIconNameFromName, getCategoryIcon, COLORS, generateCategoryPrefix, getDynamicGradient, getHexColor } from"./category-utils";
import { ResponsiveModal } from"@/components/ui/responsive-modal";
import { CategoryIconPicker } from"./category-icon-picker";
import { SwitchRow } from"@/components/ui/switch-row";


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
            <Input
                className={cn("h-12 rounded-[var(--radius-inner)] font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm",
                    error
                        ?"border-rose-300 bg-rose-50 text-rose-900"
                        :"border-slate-200 bg-slate-50",
                    className
                )}
                {...props}
            />
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
                type="button"
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
                className={cn("h-10 w-10 sm:h-11 sm:w-auto rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-primary/20 transition-all active:scale-95",
                    className
                )}
            >
                <FolderPlus className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{buttonText}</span>
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
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
                                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Настройка параметров раздела</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 pt-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
                        <div className="flex gap-3">
                            <div className="space-y-1.5 flex-1">
                                <ValidatedInput
                                    label="Название"
                                    name="name"
                                    required
                                    value={formState.name}
                                    placeholder="Напр. Футболки"
                                    error={uiState.fieldErrors.name}
                                    onChange={(e) => {
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
                                <ValidatedInput
                                    label="Артикул"
                                    name="prefix"
                                    required
                                    value={formState.prefix}
                                    placeholder="TS"
                                    error={uiState.fieldErrors.prefix}
                                    className=""
                                    onChange={(e) => {
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
                                className="crm-dialog-textarea"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 block ml-1">Иконка</label>
                                <CategoryIconPicker
                                    value={formState.icon}
                                    color={formState.color}
                                    onChange={(iconName) => setFormState(prev => ({ ...prev, icon: iconName, iconManuallyEdited: true }))}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 block ml-1">Цвет</label>
                                <div className="p-3 sm:p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-10 gap-2 sm:gap-3 px-0.5">
                                        {COLORS.map((color) => {
                                            const colorHex = getHexColor(color.name);
                                            const normalizedFormColor = (formState.color ||"").toLowerCase();
                                            const isSelected = normalizedFormColor === color.name.toLowerCase() || normalizedFormColor === colorHex.toLowerCase();
                                            return (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setFormState(prev => ({ ...prev, color: colorHex }))}
                                                    className={cn("w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 relative active:scale-95 p-0 outline-none",
                                                        !isSelected &&"opacity-90 hover:opacity-100 hover:scale-105"
                                                    )}
                                                    style={{
                                                        backgroundColor: colorHex,
                                                        boxShadow: isSelected
                                                            ? `0 0 0 2px white, 0 0 0 2.5px ${colorHex}`
                                                            : `0 1px 2px rgba(0,0,0,0.05)`
                                                    }}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3.5]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <SwitchRow
                                title={"Добавлять в\u00A0артикул"}
                                description=""
                                checked={formState.showInSku}
                                onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                                variant="success"
                                className="p-3 bg-slate-50"
                            />
                            <SwitchRow
                                title={"Добавлять в\u00A0название"}
                                description=""
                                checked={formState.showInName}
                                onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
                                variant="success"
                                className="p-3 bg-slate-50"
                            />
                        </div>


                        {uiState.error && (
                            <div className="crm-error-box">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {uiState.error}
                            </div>
                        )}
                    </div>

                    <div className="crm-dialog-footer">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex h-12 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            text="Сохранить"
                            loadingText="Выполняется..."
                            variant="btn-dark"
                            className="h-12 flex-1 lg:flex-none lg:w-auto lg:px-10 rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50"
                        />
                    </div>
                </form>
            </ResponsiveModal >
        </>
    );
}
