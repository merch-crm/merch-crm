"use client";

import { useState, createElement } from "react";
import { FolderPlus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "./submit-button";
import { addInventoryCategory } from "./category-actions";;
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getIconNameFromName, getGradientStyles, getCategoryIcon, COLORS, generateCategoryPrefix } from "./category-utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";


interface AddCategoryDialogProps {
    parentId?: string;
    buttonText?: string;
    className?: string;
    isOpen?: boolean; // Controlled
    onOpenChange?: (open: boolean) => void; // Controlled
}

interface SwitchRowProps {
    mainLabel: string;
    subLabel: string;
    checked: boolean;
    onCheckedChange: (val: boolean) => void;
}

function SwitchRow({ mainLabel, subLabel, checked, onCheckedChange }: SwitchRowProps) {
    return (
        <div className="crm-switch-row">
            <div className={cn("flex items-center justify-between group w-full")}>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-900 leading-[1.1]"><span className="sm:whitespace-nowrap">{mainLabel}</span></span>
                    <span className="text-xs text-slate-400 font-bold leading-tight mt-0.5">{subLabel}</span>
                </div>
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    variant="success"
                />
            </div>
        </div>
    );
}

function CategoryIconPreview({ name, color, size = "md" }: { name: string, color: string, size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8 rounded-[10px]",
        md: "w-10 h-10 rounded-[12px]",
        lg: "w-12 h-12 rounded-[14px]"
    };
    const iconSizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <div className={cn(
            "flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg text-white bg-gradient-to-br",
            sizeClasses[size],
            getGradientStyles(color)
        )}>
            {createElement(getCategoryIcon({ name }), {
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
            <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
            <Input
                className={cn(
                    "h-11 rounded-[var(--radius-inner)] font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm",
                    error
                        ? "border-rose-300 bg-rose-50 text-rose-900"
                        : "border-slate-200 bg-slate-50",
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
    buttonText = "Добавить категорию",
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
        name: "",
        prefix: "",
        prefixManuallyEdited: false,
        color: "primary",
        showInSku: true,
        showInName: true,
        parentId: parentId || ""
    });
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const prefix = formData.get("prefix") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название категории";
        if (!prefix || prefix.trim().length < 2) newErrors.prefix = "Введите артикул категории (напр. TS)";

        if (Object.keys(newErrors).length > 0) {
            setUiState(prev => ({ ...prev, fieldErrors: newErrors }));
            return;
        }

        setUiState(prev => ({ ...prev, error: null, fieldErrors: {} }));

        formData.set("icon", getIconNameFromName(name));
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
                        name: "",
                        prefix: "",
                        prefixManuallyEdited: false
                    }));
                    setUiState({ error: null, fieldErrors: {} });
                    setIsOpen(true);
                }}
                className={cn(
                    "h-10 w-10 sm:h-11 sm:w-auto rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-primary/20 transition-all active:scale-95",
                    className
                )}
            >
                <FolderPlus className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{buttonText}</span>
            </Button>

            <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={parentId ? "Новая подкатегория" : "Новая категория"} showVisualTitle={false} hideClose={true}>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <CategoryIconPreview name={formState.name} color={formState.color} size="lg" />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                    {parentId ? "Подкатегория" : "Новая категория"}
                                </h2>
                                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Настройка параметров раздела</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
                        <div className="flex gap-3">
                            <div className="space-y-1.5 flex-1">
                                <ValidatedInput
                                    label="Название категории"
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
                                            prefix: prev.prefixManuallyEdited ? prev.prefix : generateCategoryPrefix(name)
                                        }));
                                    }}
                                    onInput={() => {
                                        if (uiState.fieldErrors.name) setUiState(prev => ({
                                            ...prev,
                                            fieldErrors: { ...prev.fieldErrors, name: "" }
                                        }));
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
                                    className="text-center"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                        setFormState(prev => ({ ...prev, prefix: val, prefixManuallyEdited: true }));
                                        if (uiState.fieldErrors.prefix) setUiState(prev => ({
                                            ...prev,
                                            fieldErrors: { ...prev.fieldErrors, prefix: "" }
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Описание категории</label>
                            <textarea
                                name="description"
                                placeholder="Опциональное описание назначения этой категории..."
                                className="crm-dialog-textarea"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-2 shadow-sm">
                                <span className="text-sm font-bold text-slate-700 leading-none">Иконка</span>
                                <div className="flex items-center justify-center py-1">
                                    <CategoryIconPreview name={formState.name} color={formState.color} size="md" />
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                                <span className="text-sm font-bold text-slate-700 leading-none">Цвет</span>
                                <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2.5">
                                    {COLORS.map((color) => {
                                        const isSelected = formState.color === color.name;
                                        return (
                                            <Button
                                                key={color.name}
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setFormState(prev => ({ ...prev, color: color.name }))}
                                                className={cn(
                                                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm p-0",
                                                    color.class,
                                                    isSelected ? "ring-2 ring-offset-2 ring-primary/40 scale-110" : "opacity-80 hover:opacity-100"
                                                )}
                                            >
                                                {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[4]" />}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SwitchRow
                                mainLabel="Добавлять в артикул"
                                subLabel="Будет в SKU"
                                checked={formState.showInSku}
                                onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                            />
                            <SwitchRow
                                mainLabel="Добавлять в название"
                                subLabel="Будет в имени"
                                checked={formState.showInName}
                                onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
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
                            className="flex h-11 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            label="Сохранить"
                            pendingLabel="Выполняется..."
                            className="h-11 flex-1 lg:flex-none lg:w-auto lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50"
                        />
                    </div>
                </form>
            </ResponsiveModal>
        </>
    );
}
