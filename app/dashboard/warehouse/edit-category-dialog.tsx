"use client";

import { useState, createElement } from "react";
import { X, Package, Check, Trash2, ChevronDown } from "lucide-react";
import { SubmitButton } from "./submit-button";

import { updateInventoryCategory, deleteInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/auth";
import { Lock } from "lucide-react";

import { Category } from "./inventory-client";
import { CategorySelect } from "./category-select";
import { getCategoryIcon, getColorStyles, ICONS, COLORS, getIconNameFromName, ICON_GROUPS, getIconGroupForIcon } from "./category-utils";

interface EditCategoryDialogProps {
    category: Category & { prefix?: string | null, isSystem?: boolean };
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    user: Session | null;
}

export function EditCategoryDialog({ category, categories, isOpen, onClose, user: _user }: EditCategoryDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (category.icon) return category.icon;
        return getIconNameFromName(category.name);
    });
    const [selectedColor, setSelectedColor] = useState(category.color || "indigo");
    const [selectedParentId, setSelectedParentId] = useState(category.parentId || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subToDelete, setSubToDelete] = useState<string | null>(null);
    const [showIcons, setShowIcons] = useState(false);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    const [subPending, setSubPending] = useState(false);

    const router = useRouter();

    // Find children using parentId
    const subCategories = categories.filter(c => c.parentId === category.id);
    const isParentCategory = !category.parentId;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        formData.set("icon", selectedIcon || "");
        formData.set("color", selectedColor);
        formData.set("parentId", selectedParentId);

        const result = await updateInventoryCategory(category.id, formData);

        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        } else {
            onClose();
            setIsPending(false);
            router.refresh();
        }
    }

    async function handleDeleteCategory() {
        setIsPending(true);
        const result = await deleteInventoryCategory(category.id, deletePassword);
        if (result?.error) {
            setError(result.error);
            setIsPending(false);
            setShowDeleteModal(false);
            setDeletePassword(""); // Clear password on error
        } else {
            setShowDeleteModal(false);
            onClose();
            setIsPending(false);
            router.refresh();
        }
    }


    async function handleDeleteSubcategory(subId: string) {
        setSubToDelete(subId);
    }

    async function confirmDeleteSub() {
        if (!subToDelete) return;
        setSubPending(true);
        const result = await deleteInventoryCategory(subToDelete);
        if (result.success) {
            router.refresh();
        } else {
            alert("Ошибка при удалении");
        }
        setSubPending(false);
        setSubToDelete(null);
    }

    const colors = COLORS;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white rounded-[14px] shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 overflow-visible max-h-[95vh] flex flex-col">
                <div className="flex items-center justify-between p-10 pb-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center", getColorStyles(selectedColor))}>
                                {createElement(getCategoryIcon({ icon: selectedIcon, name: category.name }), { className: "w-6 h-6" })}
                            </div>
                            Редактировать
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Настройка категории: <span className="text-indigo-600 font-bold">{category.name}</span></p>
                    </div>
                    <button
                        type="button"
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[14px] bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form id="edit-category-form" onSubmit={handleSubmit} className="px-8 py-3 flex flex-col overflow-y-auto custom-scrollbar overflow-x-visible">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-[14px] border border-rose-100 animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <div className={cn(
                        "grid gap-x-6 gap-y-2 mb-2",
                        isParentCategory ? "grid-cols-2" : "grid-cols-1"
                    )}>
                        {/* LEFT COLUMN: All Category Information */}
                        <div className={cn(isParentCategory ? "col-span-1" : "col-span-1", "space-y-2")}>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Название категории</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={category.name}
                                        placeholder="Напр. Футболки"
                                        className="w-full h-12 px-4 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Единственное число</label>
                                        <input
                                            name="singularName"
                                            defaultValue={category.singularName || ""}
                                            placeholder="Напр. Футболка"
                                            className="w-full h-12 px-4 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Множественное число</label>
                                        <input
                                            name="pluralName"
                                            defaultValue={(category as any).pluralName || ""}
                                            placeholder="Напр. Футболки"
                                            className="w-full h-12 px-4 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Грамматический род</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'masculine', label: 'Мужской (он)', hint: 'Белый' },
                                            { id: 'feminine', label: 'Женский (она)', hint: 'Белая' },
                                            { id: 'neuter', label: 'Средний (оно)', hint: 'Белое' }
                                        ].map((g) => (
                                            <label key={g.id} className={cn(
                                                "relative flex flex-col items-center justify-center p-3 rounded-[14px] border-2 cursor-pointer transition-all",
                                                (category.gender === g.id || (!category.gender && g.id === 'masculine'))
                                                    ? "border-indigo-500 bg-indigo-50/50"
                                                    : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200"
                                            )}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={g.id}
                                                    defaultChecked={category.gender === g.id || (!category.gender && g.id === 'masculine')}
                                                    className="sr-only"
                                                />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-wider mb-1",
                                                    (category.gender === g.id || (!category.gender && g.id === 'masculine')) ? "text-indigo-600" : "text-slate-400"
                                                )}>{g.label}</span>
                                                <span className="text-[12px] font-bold text-slate-500">{g.hint}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Артикул</label>
                                    <input
                                        name="prefix"
                                        defaultValue={category.prefix || ""}
                                        placeholder="TS"
                                        className="w-full h-12 px-4 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-center tracking-widest uppercase"
                                        onInput={(e) => {
                                            const val = e.currentTarget.value;
                                            if (/[а-яА-ЯёЁ]/.test(val)) alert("Используйте латиницу");
                                            e.currentTarget.value = val.replace(/[^a-zA-Z0-9-]/g, '');
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Приоритет</label>
                                    <input
                                        type="number"
                                        name="sortOrder"
                                        defaultValue={category.sortOrder || 0}
                                        className="w-full h-14 px-6 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white text-center h-12 px-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Описание (опционально)</label>
                                    <textarea
                                        name="description"
                                        defaultValue={category.description || ""}
                                        placeholder="Краткое описание для сайта или склада..."
                                        className="w-full min-h-[80px] p-5 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white leading-relaxed p-5 min-h-[80px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 tracking-widest ml-1 uppercase">Визуальное оформление</label>
                                    <div className="p-4 bg-white rounded-[14px] border border-slate-100 shadow-sm space-y-4 min-h-[140px] flex flex-col justify-center p-4 bg-white">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100 shadow-sm",
                                                    selectedIcon ? "text-slate-900 ring-4 ring-slate-100/50" : "text-slate-300"
                                                )}>
                                                    {createElement(getCategoryIcon({ icon: selectedIcon, name: category.name }), { className: "w-5 h-5" })}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 tracking-widest block leading-none mb-1 uppercase">ИКОНКА</span>
                                                    <span className="text-[11px] font-bold text-slate-700 block leading-none truncate max-w-[70px]">
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
                                                className="h-8 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 text-[9px] font-black tracking-widest text-slate-500 shrink-0 shadow-sm active:scale-95"
                                            >
                                                {showIcons ? "СВЕРНУТЬ" : "ВЫБРАТЬ"}
                                                <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", showIcons && "rotate-180")} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase">Цвет карточки</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {colors.map((color) => {
                                                    const isSelected = selectedColor === color.name;
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            type="button"
                                                            onClick={() => setSelectedColor(color.name)}
                                                            className={cn(
                                                                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm",
                                                                color.class,
                                                                isSelected ? "ring-2 ring-offset-2 ring-slate-300 scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Icon Selection Panel (Overlays or expands below) */}
                            {showIcons && (
                                <div className="p-8 bg-slate-50/50 rounded-[14px] border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ICON_GROUPS.map((group) => {
                                            const isExpanded = expandedGroupId === group.id;
                                            return (
                                                <div key={group.id} className="space-y-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between h-12 px-5 rounded-[14px] transition-all border",
                                                            isExpanded
                                                                ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                                                                : "bg-transparent border-transparent text-slate-400 hover:bg-white/50 hover:text-slate-600 hover:border-slate-100"
                                                        )}
                                                    >
                                                        <span className="text-[11px] font-black tracking-[0.15em] uppercase">{group.label}</span>
                                                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="grid grid-cols-6 gap-3 p-4 bg-white rounded-[14px] shadow-sm border border-slate-100 animate-in zoom-in-95 fade-in duration-200">
                                                            {group.icons.map((item) => {
                                                                const Icon = item.icon;
                                                                const isSelected = selectedIcon === item.name;
                                                                return (
                                                                    <button
                                                                        key={item.name}
                                                                        type="button"
                                                                        onClick={() => setSelectedIcon(item.name)}
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

                            {category.parentId && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 uppercase">Родительская категория</label>
                                    <CategorySelect
                                        categories={categories}
                                        value={selectedParentId}
                                        onChange={setSelectedParentId}
                                        excludeId={category.id}
                                        placeholder="Выберите родителя..."
                                    />
                                </div>
                            )}
                        </div>


                        {/* RIGHT COLUMN: Subcategories (Only for main categories) */}
                        {isParentCategory && (
                            <div className="col-span-1 border-l border-slate-100 pl-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 tracking-widest flex items-center gap-2 uppercase">
                                        ПОДКАТЕГОРИИ
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-black">{subCategories.length}</span>
                                    </label>
                                </div>

                                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-2 -mr-2 scroll-smooth custom-scrollbar">
                                    <style jsx global>{`
                                        .custom-scrollbar::-webkit-scrollbar {
                                            width: 4px;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-track {
                                            background: transparent;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-thumb {
                                            background: #e2e8f0;
                                            border-radius: 20px;
                                        }
                                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                            background: #cbd5e1;
                                        }
                                    `}</style>
                                    {subCategories.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {subCategories.map(sub => {
                                                const IconComponent = getCategoryIcon(sub);
                                                const colorStyle = getColorStyles(sub.color);
                                                return (
                                                    <div key={sub.id} className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-[14px] border border-slate-100 transition-all hover:border-indigo-200 aspect-square">
                                                        <button
                                                            type="button"
                                                            disabled={subPending}
                                                            onClick={() => handleDeleteSubcategory(sub.id)}
                                                            className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[14px] transition-all opacity-0 group-hover:opacity-100"
                                                            title="Удалить подкатегорию"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                        <div className={cn(
                                                            "w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-3 transition-all shrink-0",
                                                            colorStyle
                                                        )}>
                                                            {createElement(IconComponent, { className: "w-7 h-7" })}
                                                        </div>

                                                        <div className="w-full text-center overflow-hidden">
                                                            <div className="text-[12px] font-bold text-slate-700 truncate w-full px-1 leading-tight">{sub.name}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200/50 rounded-[14px] text-slate-400 gap-3 opacity-60">
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Package className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <span className="text-sm font-bold tracking-tight">Нет подкатегорий</span>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-10 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-b-[14px]">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="h-14 px-8 rounded-[14px] flex items-center gap-2.5 text-xs font-black tracking-widest transition-all active:scale-95 shadow-lg bg-white text-rose-500 border border-slate-200 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 shadow-slate-100/50"
                    >
                        <Trash2 className="w-5 h-5" />
                        УДАЛИТЬ КАТЕГОРИЮ
                    </button>

                    <div className="flex items-center gap-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-14 px-10 rounded-[14px] text-slate-500 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Отмена
                        </button>
                        <SubmitButton
                            form="edit-category-form"
                            label="Сохранить изменения"
                            pendingLabel="Сохранение..."
                        />
                    </div>
                </div>
                {/* Custom Delete Confirmation Modal */}
                {
                    subToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                                onClick={() => setSubToDelete(null)}
                            />
                            <div className="relative w-full max-w-[340px] bg-white rounded-[14px] shadow-2xl border border-slate-100 p-8 text-center animate-in zoom-in-95 fade-in duration-200">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-500">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Удалить подкатегорию?</h3>
                                <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8">Это действие нельзя будет отменить. Подкатегория будет полностью удалена из базы.</p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={confirmDeleteSub}
                                        disabled={subPending}
                                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-[14px] font-black text-[11px] tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-100 disabled:opacity-50"
                                    >
                                        {subPending ? "УДАЛЕНИЕ..." : "ДА, УДАЛИТЬ"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubToDelete(null)}
                                        className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-[14px] font-black text-[11px] tracking-widest transition-all active:scale-95"
                                    >
                                        ОТМЕНА
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Main Category Delete Confirmation Modal */}
                {
                    showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                                onClick={() => setShowDeleteModal(false)}
                            />
                            <div className="relative w-full max-w-[400px] bg-white rounded-[14px] shadow-2xl border border-slate-100 p-10 text-center animate-in zoom-in-95 fade-in duration-200">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Удалить категорию?</h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-2">
                                    Вы собираетесь удалить категорию <span className="text-slate-800">«{category.name}»</span>.
                                </p>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                                    {isParentCategory && subCategories.length > 0
                                        ? "Все вложенные подкатегории будут откреплены, но не удалены. Товары станут без категории."
                                        : "Действие необратимо. Товары этой категории станут 'Без категории'."}
                                </p>

                                {category.isSystem && (
                                    <div className="mb-8 space-y-4 p-5 bg-rose-50/50 rounded-[14px] border border-rose-100 ring-4 ring-rose-50/30">
                                        <div className="flex items-center gap-2 text-rose-600 mb-3">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Системная защита</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-rose-500/80 leading-relaxed mb-4 text-left">
                                            Эта категория является системной. Для её удаления необходимо подтверждение паролем администратора.
                                        </p>
                                        <input
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Введите ваш пароль"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-rose-100 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDeleteCategory}
                                        disabled={isPending || (category.isSystem && !deletePassword.trim())}
                                        className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-[14px] font-black text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPending ? (
                                            "Удаление..."
                                        ) : (
                                            <>
                                                {category.isSystem && <Lock className="w-4 h-4 mr-1" />}
                                                Подтвердить удаление
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeletePassword("");
                                        }}
                                        className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-[14px] font-black text-xs tracking-widest transition-all active:scale-95"
                                    >
                                        ОТМЕНА
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
