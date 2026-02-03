"use client";

import { useState, createElement } from "react";
import { X, FolderPlus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import { addInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getIconNameFromName, getColorStyles, getCategoryIcon, COLORS } from "./category-utils";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

const generateCategoryPrefix = (name: string): string => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    let result = "";

    if (words.length >= 2) {
        // First letters of first two words
        result = words.slice(0, 2).map(w => w[0]).join("");
    } else {
        // First three characters of the first word
        const word = words[0];
        result = word.slice(0, Math.min(word.length, 3));
    }

    return result.toLowerCase()
        .split('')
        .map(char => RUSSIAN_TO_LATIN_MAP[char] || char)
        .join('')
        .replace(/[^a-z0-9]/g, '')
        .toUpperCase();
};

export function AddCategoryDialog({ parentId, buttonText = "Добавить категорию" }: { parentId?: string, buttonText?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryPrefix, setCategoryPrefix] = useState("");
    const [prefixManuallyEdited, setPrefixManuallyEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState("primary");
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
                onClick={() => {
                    setCategoryName("");
                    setCategoryPrefix("");
                    setPrefixManuallyEdited(false);
                    setFieldErrors({});
                    setError(null);
                    setIsOpen(true);
                }}
                className="h-11 btn-primary rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm border-none"
            >
                <FolderPlus className="w-5 h-5" />
                {buttonText}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-outer)] shadow-2xl border-none animate-in zoom-in-95 fade-in duration-300 flex flex-col my-auto shrink-0 max-h-[92vh] overflow-visible">
                        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-[var(--radius-inner)] flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm border border-black/5", getColorStyles(selectedColor))}>
                                    {createElement(getCategoryIcon({ name: categoryName }), { className: "w-6 h-6" })}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {parentId ? "Подкатегория" : "Новая категория"}
                                    </h2>
                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Настройка параметров раздела</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form id="add-category-form" onSubmit={handleSubmit} noValidate className="px-6 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 overflow-visible">
                            <div className="flex gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Название категории</label>
                                    <input
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
                                            "w-full h-11 px-4 rounded-[var(--radius-inner)] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm shadow-sm",
                                            fieldErrors.name
                                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                                : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 bg-white"
                                        )}
                                        onInput={() => {
                                            if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
                                        }}
                                    />
                                    {fieldErrors.name && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.name}</p>}
                                </div>
                                <div className="space-y-1.5 w-24">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Артикул</label>
                                    <input
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
                                            "w-full h-11 px-4 rounded-[var(--radius-inner)] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center text-sm shadow-sm",
                                            fieldErrors.prefix
                                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                                : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 bg-white"
                                        )}
                                    />
                                    {fieldErrors.prefix && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.prefix}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-2 overflow-visible shadow-sm">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Иконка</label>
                                    <div className="flex items-center justify-center py-1">
                                        <div className={cn("w-10 h-10 shrink-0 rounded-[var(--radius-inner)] flex items-center justify-center transition-all shadow-md", getColorStyles(selectedColor))}>
                                            {createElement(getCategoryIcon({ name: categoryName }), { className: "w-5 h-5" })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                                    <span className="text-sm font-bold text-slate-500">Цветовая схема</span>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map((color) => {
                                            const isSelected = selectedColor === color.name;
                                            return (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color.name)}
                                                    className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm",
                                                        color.class,
                                                        isSelected ? "ring-2 ring-offset-2 ring-primary/40 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Описание категории</label>
                                <textarea
                                    name="description"
                                    placeholder="Опциональное описание назначения этой категории..."
                                    className="w-full min-h-[70px] p-4 rounded-[var(--radius-inner)] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-medium text-sm text-slate-900 placeholder:text-slate-300 resize-none bg-white leading-relaxed shadow-sm"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </form>

                        <div className="shrink-0 p-6 pt-2 bg-white rounded-b-[var(--radius-outer)]">
                            <SubmitButton
                                form="add-category-form"
                                label={parentId ? "Создать подкатегорию" : "Создать категорию"}
                                pendingLabel="Выполняется..."
                                className="w-full h-11 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
