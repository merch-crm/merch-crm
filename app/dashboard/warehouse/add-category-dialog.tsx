"use client";

import { useState, createElement } from "react";
import { X, FolderPlus, Package, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import { addInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getIconNameFromName, getColorStyles, ICONS, COLORS, ICON_GROUPS, getCategoryIcon } from "./category-utils";

export function AddCategoryDialog({ parentId, buttonText = "Добавить категорию" }: { categories?: unknown[], parentId?: string, buttonText?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState("");
    const [iconManuallySelected, setIconManuallySelected] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [selectedColor, setSelectedColor] = useState("primary");
    const [_selectedParentId] = useState<string>(parentId || "");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();


    const colors = COLORS;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const prefix = formData.get("prefix") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название категории";
        if (!prefix || prefix.trim().length < 2) newErrors.prefix = "Введите префикс артикула (напр. TS)";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setError(null);
        setFieldErrors({});

        formData.set("icon", selectedIcon);
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
                onClick={() => setIsOpen(true)}
                className="h-12 btn-primary rounded-full px-6 gap-2 font-bold inline-flex items-center justify-center"
            >
                <FolderPlus className="w-5 h-5" />
                {buttonText}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-6xl bg-white rounded-[var(--radius)] shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 overflow-visible max-h-[95vh] flex flex-col">
                        <div className="flex items-center justify-between p-10 pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center transition-all duration-500", getColorStyles(selectedColor))}>
                                        {(() => {
                                            const Icon = ICONS.find(i => i.name === selectedIcon)?.icon || Package;
                                            return <Icon className="w-6 h-6" />;
                                        })()}
                                    </div>
                                    {parentId ? "Новая подкатегория" : "Новая категория"}
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium">Создание новой категории для товаров и материалов</p>
                            </div>
                            <button
                                type="button"
                                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius)] bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form id="add-category-form" onSubmit={handleSubmit} noValidate className="px-10 py-6 flex flex-col overflow-visible custom-scrollbar overflow-x-visible">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mb-4">
                                {/* LEFT COLUMN: Basic Info */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="grid grid-cols-3 gap-8 col-span-2">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-semibold text-slate-500 ml-1">Название категории</label>
                                            <input
                                                name="name"
                                                required
                                                placeholder="Напр. Футболки"
                                                onChange={(e) => {
                                                    const name = e.target.value;
                                                    setCategoryName(name);
                                                    if (!iconManuallySelected && name) {
                                                        setSelectedIcon(getIconNameFromName(name));
                                                    }
                                                }}
                                                className={cn(
                                                    "input-premium w-full px-6 rounded-[var(--radius)] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-lg",
                                                    fieldErrors.name
                                                        ? "border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                                                        : "border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary bg-slate-50/50 hover:bg-white"
                                                )}
                                                onInput={() => {
                                                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-semibold text-slate-500 ml-1">Артикул</label>
                                            <input
                                                name="prefix"
                                                required
                                                placeholder="TS"
                                                className={cn(
                                                    "input-premium w-full px-6 rounded-[var(--radius)] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center text-lg",
                                                    fieldErrors.prefix
                                                        ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                        : "border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary bg-slate-50/50 hover:bg-white"
                                                )}
                                                onInput={(e) => {
                                                    const val = e.currentTarget.value;
                                                    if (/[а-яА-ЯёЁ]/.test(val)) alert("Используйте латиницу");
                                                    e.currentTarget.value = val.replace(/[^a-zA-Z0-9-]/g, '');
                                                    if (fieldErrors.prefix) setFieldErrors(prev => ({ ...prev, prefix: "" }));
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">Описание</label>
                                        <textarea
                                            name="description"
                                            placeholder="Краткое описание для сайта..."
                                            className="w-full min-h-[140px] p-5 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Hierarchy & Visuals */}
                                <div className="space-y-8">
                                    {/* Parent category selection removed as per request */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* ICON BLOCK */}
                                        <div className="relative p-4 bg-white rounded-[var(--radius)] border border-slate-100 shadow-sm flex flex-col justify-center gap-3 min-h-[100px]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100 shadow-sm", selectedIcon ? "text-slate-900 ring-4 ring-slate-100/50" : "text-slate-300")}>
                                                        {createElement(getCategoryIcon({ icon: selectedIcon, name: categoryName }), { className: "w-7 h-7" })}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-500 block leading-none mb-1.5">ИКОНКА</span>
                                                        <span className="text-[12px] font-bold text-slate-700 block leading-none truncate max-w-[100px]">
                                                            {ICONS.find(i => i.name === selectedIcon)?.label || "Не выбрана"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowIcons(!showIcons)}
                                                    className="h-10 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 text-[10px] font-bold text-slate-500 group active:scale-95 shadow-sm"
                                                >
                                                    {showIcons ? (
                                                        <>СВЕРНУТЬ <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" /></>
                                                    ) : (
                                                        <>ВЫБРАТЬ <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" /></>
                                                    )}
                                                </button>
                                            </div>

                                            {showIcons && (
                                                <div className="absolute top-[110%] left-0 w-[400px] z-50 bg-white rounded-[18px] shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    <div className="space-y-4">
                                                        {ICON_GROUPS.map((group) => (
                                                            <div key={group.id} className="space-y-2">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">{group.label}</div>
                                                                <div className="grid grid-cols-6 gap-2">
                                                                    {group.icons.map((item) => {
                                                                        const Icon = item.icon;
                                                                        const isSelected = selectedIcon === item.name;
                                                                        return (
                                                                            <button
                                                                                key={item.name}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedIcon(item.name);
                                                                                    setIconManuallySelected(true);
                                                                                    setShowIcons(false);
                                                                                }}
                                                                                className={cn(
                                                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/50 hover:shadow-md hover:scale-110 hover:text-primary active:scale-95",
                                                                                    isSelected && "bg-primary border-primary text-white hover:bg-primary hover:text-white"
                                                                                )}
                                                                                title={item.label}
                                                                            >
                                                                                <Icon className="w-5 h-5" />
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* COLOR BLOCK */}
                                        <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-100 shadow-sm flex flex-col justify-center gap-3 min-h-[100px]">
                                            <span className="text-[10px] font-bold text-slate-500 block">Цвет карточки</span>
                                            <div className="flex flex-wrap gap-2">
                                                {colors.map((color) => {
                                                    const isSelected = selectedColor === color.name;
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            type="button"
                                                            onClick={() => setSelectedColor(color.name)}
                                                            className={cn(
                                                                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm",
                                                                color.class,
                                                                isSelected ? "ring-2 ring-offset-2 ring-slate-300 scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="w-5 h-5 text-white stroke-[4]" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>


                                    {error && (
                                        <div className="p-5 rounded-[var(--radius)] bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        <div className="shrink-0 p-10 border-t border-slate-100 bg-slate-50/10 rounded-b-[18px]">
                            <SubmitButton
                                form="add-category-form"
                                label={parentId ? "Создать подкатегорию" : "Создать категорию"}
                                pendingLabel="Создание..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
