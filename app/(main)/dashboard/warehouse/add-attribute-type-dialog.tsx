"use client";

import { Plus, Shapes, Ruler, Palette, Box, Hash, Layers, Maximize, Tag, Globe, Weight, Droplets, Package, Component, Waves, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category } from "./types";
import { useAddAttributeType } from "./hooks/use-add-attribute-type";

interface AddAttributeTypeDialogProps {
    categories: Category[];
    className?: string;
}


export function AddAttributeTypeDialog({ categories, className }: AddAttributeTypeDialogProps) {
    const {
        isOpen, setIsOpen,
        isLoading,
        dataType, setDataType,
        activeCategoryId, setActiveCategoryId,
        rootCategories,
        error,
        handleOpen,
        handleCreate
    } = useAddAttributeType({ categories });

    const activeCategoryName = activeCategoryId === "uncategorized"
        ? "Без категории"
        : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

    const dataTypes = [
        { id: "text", title: "Общая", icon: Shapes },
        { id: "unit", title: "Единица измерения", icon: Ruler },
        { id: "color", title: "Цвет", icon: Palette },
        { id: "dimensions", title: "Габариты", icon: Box },
        { id: "quantity", title: "Количество", icon: Hash },

        { id: "composition", title: "Состав", icon: Component },
        { id: "material", title: "Материал", icon: Layers },
        { id: "size", title: "Размер", icon: Maximize },
        { id: "brand", title: "Бренд", icon: Tag },
        { id: "country", title: "Страна", icon: Globe },
        { id: "density", title: "Плотность", icon: Waves },
        { id: "weight", title: "Вес", icon: Weight },
        { id: "volume", title: "Объем", icon: Droplets },
        { id: "package", title: "Упаковка", icon: Package },
        { id: "consumable", title: "Расходники", icon: Wrench },
    ] as const;

    return (
        <>
            <Button
                type="button"
                onClick={handleOpen}
                className={cn(
                    "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5",
                    className
                )}
            >
                <Plus className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline">Новая характеристика</span>
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новая характеристика"
                description="Создание нового типа характеристики для товаров в каталоге"
                showVisualTitle={false}
                className="sm:max-w-[520px]"
            >
                <form
                    id="add-attribute-type-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!dataType) return;
                        handleCreate();
                    }}
                    className="flex flex-col bg-white"
                >
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                                {(() => {
                                    const Icon = dataTypes.find(t => t.id === dataType)?.icon || Plus;
                                    return <Icon className="w-6 h-6 text-primary" />;
                                })()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Характеристика</h2>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                    Группа: <span className="text-primary font-bold">{activeCategoryName}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 space-y-3 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2 overflow-visible">
                            <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Раздел каталога товаров</label>

                            <Select
                                value={activeCategoryId}
                                onChange={setActiveCategoryId}
                                options={
                                    [
                                        ...rootCategories
                                            .filter(c => c.name.toLowerCase() !== "без категории")
                                            .map(c => ({ id: c.id, title: c.name })),
                                        { id: "uncategorized", title: "Без категории" }
                                    ]
                                }
                                placeholder="Выберите категорию"
                                showSearch={true}
                                className="w-full"
                            />
                        </div>



                        <div className="space-y-3 pt-1">
                            <label className="text-sm font-bold text-slate-700 block ml-1">Тип данных</label>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {dataTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = dataType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setDataType(type.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-[var(--radius-inner)] border-2 transition-all gap-2",
                                                isSelected
                                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                    : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/80 hover:border-slate-200"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-slate-400")} />
                                            <span className="text-xs font-bold tracking-tight text-center leading-none">
                                                {type.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>



                        {error && (
                            <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end lg:justify-between gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 lg:flex-none h-12 lg:px-8 text-slate-400 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            isLoading={isLoading}
                            disabled={isLoading}
                            variant="btn-dark"
                            className="h-12 flex-1 lg:flex-none lg:w-auto lg:px-10 rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm border-none"
                            text="Сохранить"
                            loadingText="Сохранение..."
                        />
                    </div>
                </form>
            </ResponsiveModal>

        </>
    );
}
