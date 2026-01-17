"use client";

import { useState, createElement } from "react";
import { X, FolderPlus, Package, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import { addInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Category } from "./inventory-client";
import { CategorySelect } from "./category-select";
import { getIconNameFromName, getColorStyles, ICONS, COLORS, ICON_GROUPS, getIconGroupForIcon, getCategoryIcon } from "./category-utils";

export function AddCategoryDialog({ categories, parentId, buttonText = "Добавить категорию" }: { categories: Category[], parentId?: string, buttonText?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState("");
    const [iconManuallySelected, setIconManuallySelected] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>("clothing");
    const [categoryName, setCategoryName] = useState("");
    const [selectedColor, setSelectedColor] = useState("indigo");
    const [selectedParentId, setSelectedParentId] = useState<string>(parentId || "");
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

        setIsPending(true);
        setError(null);
        setFieldErrors({});

        formData.set("icon", selectedIcon);
        formData.set("color", selectedColor);
        formData.set("parentId", selectedParentId);
        const result = await addInventoryCategory(formData);

        if (result.error) {
            setError(result.error);
            setIsPending(false);
        } else {
            setIsOpen(false);
            setIsPending(false);
            router.refresh();
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95"
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

                    <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 overflow-visible max-h-[95vh] flex flex-col">
                        <div className="flex items-center justify-between p-10 pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500", getColorStyles(selectedColor))}>
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
                                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form id="add-category-form" onSubmit={handleSubmit} noValidate className="px-10 py-6 flex flex-col overflow-y-auto custom-scrollbar overflow-x-visible">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mb-4">
                                {/* LEFT COLUMN: Basic Info */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 uppercase">Название категории</label>
                                        <input
                                            name="name"
                                            required
                                            placeholder="Напр. Футболки"
                                            autoFocus
                                            onChange={(e) => {
                                                const name = e.target.value;
                                                setCategoryName(name);
                                                if (!iconManuallySelected && name) {
                                                    setSelectedIcon(getIconNameFromName(name));
                                                }
                                            }}
                                            className={cn(
                                                "w-full h-14 px-6 rounded-[20px] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-lg",
                                                fieldErrors.name
                                                    ? "border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 hover:bg-white"
                                            )}
                                            onInput={() => {
                                                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 uppercase">Артикул</label>
                                        <input
                                            name="prefix"
                                            required
                                            placeholder="TS"
                                            className={cn(
                                                "w-full h-14 px-6 rounded-[20px] border transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center tracking-widest uppercase",
                                                fieldErrors.prefix
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 hover:bg-white"
                                            )}
                                            onInput={(e) => {
                                                const val = e.currentTarget.value;
                                                if (/[а-яА-ЯёЁ]/.test(val)) alert("Используйте латиницу");
                                                e.currentTarget.value = val.replace(/[^a-zA-Z0-9-]/g, '');
                                                if (fieldErrors.prefix) setFieldErrors(prev => ({ ...prev, prefix: "" }));
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Приоритет</label>
                                        <input
                                            type="number"
                                            name="sortOrder"
                                            defaultValue={0}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white text-center"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Описание</label>
                                        <textarea
                                            name="description"
                                            placeholder="Краткое описание для сайта..."
                                            className="w-full min-h-[140px] p-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Hierarchy & Visuals */}
                                <div className="space-y-8">
                                    {parentId && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Родительская категория</label>
                                            <CategorySelect
                                                categories={categories}
                                                value={selectedParentId}
                                                onChange={setSelectedParentId}
                                                disabled={!!parentId}
                                                placeholder="Выберите родителя..."
                                            />
                                        </div>
                                    )}

                                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6 min-h-[220px] flex flex-col justify-center">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100 shadow-sm", selectedIcon ? "text-slate-900 ring-4 ring-slate-100/50" : "text-slate-300")}>
                                                    {createElement(getCategoryIcon({ icon: selectedIcon, name: categoryName }), { className: "w-8 h-8" })}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-slate-400 tracking-widest block leading-none mb-1.5 uppercase">ИКОНКА</span>
                                                    <span className="text-[14px] font-bold text-slate-700 block leading-none">
                                                        {ICONS.find(i => i.name === selectedIcon)?.label || "Не выбрана"}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowIcons(!showIcons);
                                                    if (!showIcons && selectedIcon) {
                                                        setExpandedGroupId(getIconGroupForIcon(selectedIcon)?.id || ICON_GROUPS[0].id);
                                                    }
                                                }}
                                                className="h-12 px-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 group active:scale-95 shadow-sm"
                                            >
                                                {showIcons ? (
                                                    <>Свернуть <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /></>
                                                ) : (
                                                    <>Выбрать <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /></>
                                                )}
                                            </button>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase">Цвет карточки</span>
                                            <div className="flex flex-wrap gap-2.5">
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

                                    {showIcons && (
                                        <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-1 gap-4">
                                                {ICON_GROUPS.map((group) => {
                                                    const isExpanded = expandedGroupId === group.id;
                                                    return (
                                                        <div key={group.id} className="space-y-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between h-12 px-5 rounded-xl transition-all border",
                                                                    isExpanded
                                                                        ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                                                                        : "bg-transparent border-transparent text-slate-400 hover:bg-white/50 hover:text-slate-600 hover:border-slate-100"
                                                                )}
                                                            >
                                                                <span className="text-[11px] font-black tracking-[0.15em] uppercase">{group.label}</span>
                                                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                                                            </button>

                                                            {isExpanded && (
                                                                <div className="grid grid-cols-6 gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 animate-in zoom-in-95 fade-in duration-200">
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
                                                                                }}
                                                                                className={cn(
                                                                                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-95 group",
                                                                                    isSelected
                                                                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200 scale-110"
                                                                                        : "bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                                                                )}
                                                                                title={item.label}
                                                                            >
                                                                                <Icon className={cn("w-5 h-5", isSelected ? "scale-110" : "group-hover:scale-110")} />
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        <div className="shrink-0 p-10 border-t border-slate-100 bg-slate-50/10 rounded-b-[3rem]">
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
