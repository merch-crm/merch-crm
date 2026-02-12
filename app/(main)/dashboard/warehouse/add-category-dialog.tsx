"use client";

import { useState, createElement } from "react";
import { FolderPlus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "./submit-button";
import { addInventoryCategory } from "./actions";
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

    const [error, setError] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryPrefix, setCategoryPrefix] = useState("");
    const [prefixManuallyEdited, setPrefixManuallyEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState("primary");
    const [showInSku, setShowInSku] = useState(true);
    const [showInName, setShowInName] = useState(true);
    const [_selectedParentId] = useState<string>(parentId || "");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const prefix = formData.get("prefix") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название категории";
        if (!prefix || prefix.trim().length < 2) newErrors.prefix = "Введите артикул категории (напр. TS)";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setError(null);
        setFieldErrors({});

        formData.set("icon", getIconNameFromName(name));
        formData.set("color", selectedColor);
        formData.set("parentId", _selectedParentId);
        formData.set("showInSku", String(showInSku));
        formData.set("showInName", String(showInName));
        const result = await addInventoryCategory(formData);

        if (result.error) {
            setError(result.error);
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
                    setCategoryName("");
                    setCategoryPrefix("");
                    setPrefixManuallyEdited(false);
                    setFieldErrors({});
                    setError(null);
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
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg text-white bg-gradient-to-br", getGradientStyles(selectedColor))}>
                                {createElement(getCategoryIcon({ name: categoryName }), { className: "w-6 h-6 stroke-[2.5]" })}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                    {parentId ? "Подкатегория" : "Новая категория"}
                                </h2>
                                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Настройка параметров раздела</p>
                            </div>
                        </div>
                    </div>

                    <form id="add-category-form" onSubmit={handleSubmit} noValidate className="px-6 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
                        <div className="flex gap-4">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название категории</label>
                                <Input
                                    name="name"
                                    required
                                    value={categoryName}
                                    placeholder="Напр. Футболки"
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setCategoryName(name);
                                        if (!prefixManuallyEdited) {
                                            setCategoryPrefix(generateCategoryPrefix(name));
                                        }
                                    }}
                                    className={cn(
                                        "h-11 rounded-[var(--radius-inner)] font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm",
                                        fieldErrors.name
                                            ? "border-rose-300 bg-rose-50 text-rose-900"
                                            : "border-slate-200 bg-slate-50"
                                    )}
                                    onInput={() => {
                                        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
                                    }}
                                />
                                {fieldErrors.name && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.name}</p>}
                            </div>
                            <div className="space-y-1.5 w-24">
                                <label className="text-sm font-bold text-slate-700 ml-1">Артикул</label>
                                <Input
                                    name="prefix"
                                    required
                                    value={categoryPrefix}
                                    placeholder="TS"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                        setCategoryPrefix(val);
                                        setPrefixManuallyEdited(true);
                                        if (fieldErrors.prefix) setFieldErrors(prev => ({ ...prev, prefix: "" }));
                                    }}
                                    className={cn(
                                        "h-11 rounded-[var(--radius-inner)] font-bold text-slate-900 placeholder:text-slate-300 text-center text-sm shadow-sm",
                                        fieldErrors.prefix
                                            ? "border-rose-300 bg-rose-50 text-rose-900"
                                            : "border-slate-200 bg-slate-50"
                                    )}
                                />
                                {fieldErrors.prefix && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.prefix}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Описание категории</label>
                            <textarea
                                name="description"
                                placeholder="Опциональное описание назначения этой категории..."
                                className="w-full min-h-[70px] p-4 rounded-[var(--radius-inner)] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm text-slate-900 placeholder:text-slate-300 resize-none bg-slate-50 leading-relaxed shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-2 shadow-sm">
                                <span className="text-sm font-bold text-slate-700 leading-none">Иконка</span>
                                <div className="flex items-center justify-center py-1">
                                    <div className={cn("w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center transition-all shadow-md text-white bg-gradient-to-br", getGradientStyles(selectedColor))}>
                                        {createElement(getCategoryIcon({ name: categoryName }), { className: "w-5 h-5 stroke-[2.5]" })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                                <span className="text-sm font-bold text-slate-700 leading-none">Цвет</span>
                                <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2.5">
                                    {COLORS.map((color) => {
                                        const isSelected = selectedColor === color.name;
                                        return (
                                            <Button
                                                key={color.name}
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedColor(color.name)}
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
                            <div className="p-3 bg-slate-100 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                                <div className={cn("flex items-center justify-between group w-full")}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-bold text-slate-900 leading-[1.1]"><span className="sm:whitespace-nowrap">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в артикул</span></span>
                                        <span className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-wider mt-0.5">Будет в SKU</span>
                                    </div>
                                    <Switch
                                        checked={showInSku}
                                        onCheckedChange={setShowInSku}
                                        variant="success"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-100 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                                <div className={cn("flex items-center justify-between group w-full")}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-bold text-slate-900 leading-[1.1]"><span className="sm:whitespace-nowrap">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в название</span></span>
                                        <span className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-wider mt-0.5">Будет в имени</span>
                                    </div>
                                    <Switch
                                        checked={showInName}
                                        onCheckedChange={setShowInName}
                                        variant="success"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </form>

                    <div className="sticky bottom-0 z-10 shrink-0 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end lg:justify-between gap-3 mt-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex h-11 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            form="add-category-form"
                            label="Сохранить"
                            pendingLabel="Выполняется..."
                            className="h-11 flex-1 lg:flex-none lg:w-auto lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50"
                        />
                    </div>
                </div>
            </ResponsiveModal>
        </>
    );
}
