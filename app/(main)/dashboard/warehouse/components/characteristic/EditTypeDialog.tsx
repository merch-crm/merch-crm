"use client";
import React, { type Dispatch, type SetStateAction } from "react";
import { Plus, Trash2, Loader2, Tag, Hash, Shapes, Ruler, Palette, Box, Layers, Maximize, Globe, Weight, Droplets, Package, Component, Waves, Wrench } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth";
import { AttributeType, type InventoryAttribute as Attribute, Category, AttributeMeta } from "../../types";
import { type ValueFormState, type TypeFormState, type DeleteDialogState } from "@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";
import { getColorHex } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";
import { SwitchRow } from "@/components/ui/switch-row";
import { cn } from "@/lib/utils";
import { ValueForm } from "./ValueForm";
import { getCategoryIcon } from "../../category-utils";



export interface EditTypeActions {
    openAddValue: (slug: string) => void;
    openEditValue: (attr: Attribute) => void;
    setDeleteDialog: Dispatch<SetStateAction<DeleteDialogState>>;
    handleTypeUpdate: () => void;
    handleValueSave: () => void;
}

interface EditTypeDialogProps {
    typeState: {
        form: TypeFormState;
        setForm: Dispatch<SetStateAction<TypeFormState>>;
        latest: AttributeType | null | undefined;
        values: Attribute[];
    };
    valueState: {
        form: ValueFormState;
        setForm: Dispatch<SetStateAction<ValueFormState>>;
    };
    actions: EditTypeActions;
    user: Session | null | undefined;
    attributeTypes: AttributeType[];
    categories: Category[];
}

export function EditTypeDialog({
    typeState,
    valueState,
    actions,
    user,
    attributeTypes,
    categories
}: EditTypeDialogProps) {
    const { form: typeForm, setForm: setTypeForm, latest: editingTypeLatest, values: editingTypeValues } = typeState;
    const { form: valueForm, setForm: setValueForm } = valueState;
    const { openAddValue, openEditValue, setDeleteDialog, handleTypeUpdate, handleValueSave } = actions;
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

    const currentTypeMeta = dataTypes.find(t => t.id === typeForm.dataType) || dataTypes[0];
    const Icon = currentTypeMeta.icon;

    return (
        <ResponsiveModal
            isOpen={!!typeForm.editingType}
            onClose={() => {
                setTypeForm((prev: TypeFormState) => ({ ...prev, editingType: null }));
                setValueForm((prev: ValueFormState) => ({ ...prev, isOpen: false }));
            }}
            hideClose
            title="Настройка раздела"
            showVisualTitle={false}
            className="w-full md:max-w-5xl md:h-[800px] flex flex-col p-0 overflow-hidden rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
        >
            <div className="flex flex-col h-full md:overflow-hidden">
                {/* Global Header */}
                <div className="flex items-center justify-between p-6 shrink-0 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                            <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                {typeForm.name || "Новый раздел"}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Управление разделом «{currentTypeMeta.title}»
                            </p>
                        </div>
                    </div>

                    {/* Category Badge - Beautifully positioned on the right */}
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm backdrop-blur-sm">
                        {(() => {
                            const category = categories.find(c => c.id === typeForm.categoryId);
                            const categoryName = category?.name || "Без категории";
                            const IconComp = category ? getCategoryIcon(category) : Layers;
                            return (
                                <>
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100/50">
                                        <IconComp className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[11px] font-bold text-slate-400 leading-none mb-1">Категория</span>
                                        <span className="text-sm font-bold text-slate-900 leading-none">
                                            {categoryName}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
                    {/* LEFT COLUMN: Type Settings & Values List */}
                    <div className="flex flex-col bg-slate-50/50 md:overflow-y-auto custom-scrollbar md:border-r border-slate-100 w-full md:w-7/12 shrink-0">
                        <div className="p-6 space-y-3">


                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block ml-1">Настройки</label>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                    <SwitchRow
                                        icon={Hash}
                                        title="Добавлять в артикул"
                                        description=""
                                        checked={typeForm.showInSku}
                                        onCheckedChange={(val: boolean) => setTypeForm((prev: TypeFormState) => ({ ...prev, showInSku: val }))}
                                        variant="success"
                                        className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl"
                                    />
                                    <SwitchRow
                                        icon={Tag}
                                        title="Добавлять в название"
                                        description=""
                                        checked={typeForm.showInName}
                                        onCheckedChange={(val: boolean) => setTypeForm((prev: TypeFormState) => ({ ...prev, showInName: val }))}
                                        variant="success"
                                        className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl"
                                    />
                                </div>
                            </div>



                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Значения ({editingTypeValues.length})</label>
                                </div>

                                <div className={cn(
                                    "flex-1 overflow-y-auto custom-scrollbar p-1 max-h-[350px]",
                                    editingTypeLatest?.dataType === "composition"
                                        ? "grid grid-cols-1 gap-2 content-start items-stretch"
                                        : "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2 content-start items-stretch"
                                )}>
                                    {editingTypeValues.map(attr => (
                                        <div role="button" tabIndex={0}
                                            key={attr.id}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            onClick={() => openEditValue(attr)}
                                            className={cn(
                                                "h-full min-h-[52px] flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 shadow-sm border group",
                                                valueForm.isOpen && valueForm.editingAttribute?.id === attr.id
                                                    ? "bg-primary/5 ring-1 ring-primary/20 border-primary/20"
                                                    : "bg-white border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            {(editingTypeLatest?.dataType === "color" || editingTypeLatest?.hasColor || (attr.meta as AttributeMeta)?.hex) ? (
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full shadow-inner flex-shrink-0 border border-slate-200",
                                                )} style={{ backgroundColor: getColorHex(attr.meta) }} />
                                            ) : (
                                                <div className="w-6 h-6 rounded-md bg-slate-50 shadow-sm flex items-center justify-center text-primary flex-shrink-0 border border-primary/10 group-hover:bg-white transition-colors">
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                            )}

                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 px-1 truncate">
                                                    <span className="font-bold text-[13px] text-slate-700 leading-tight truncate">
                                                        {(attr.meta as AttributeMeta)?.fullName || attr.name}
                                                        {editingTypeLatest?.dataType === "density" && !((attr.meta as AttributeMeta)?.fullName || attr.name).includes("г/м") && " г/м²"}
                                                    </span>
                                                    {(attr.meta as AttributeMeta)?.isOversize && (
                                                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-black border border-indigo-100/50">
                                                            oversize
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-[11px] font-bold text-slate-400 tabular-nums shrink-0 truncate max-w-[80px]">
                                                {attr.value}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                        className={cn(
                                            "h-full min-h-[52px] w-full bg-slate-50/50 hover:bg-slate-100/80 text-slate-600 text-[13px] font-bold border border-slate-200 border-dashed rounded-xl transition-all shadow-sm flex items-center justify-center",
                                            editingTypeValues.length === 0 && "col-span-full"
                                        )}
                                    >
                                        <Plus className="w-4 h-4 mr-2 text-slate-500" />
                                        Добавить значение
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Value Form */}
                    <ValueForm
                        valueForm={valueForm}
                        setValueForm={setValueForm}
                        handleValueSave={handleValueSave}
                        setDeleteDialog={setDeleteDialog}
                        attributeTypes={attributeTypes}
                        typeForm={typeForm}
                        setTypeForm={setTypeForm}
                    />
                </div>

                {/* Global Footer */}
                <div className="p-6 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0 sm:rounded-b-[var(--radius-outer)] gap-3 relative z-10">
                    {editingTypeLatest && (
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialog((prev: DeleteDialogState) => ({ ...prev, type: editingTypeLatest }))}
                            disabled={editingTypeLatest.isSystem && user?.roleName !== "Администратор"}
                            className="h-11 px-5 font-bold text-sm flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-inner)] transition-all disabled:opacity-30 disabled:grayscale shrink-0"
                        >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Удалить раздел</span>
                        </Button>
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setTypeForm((prev: TypeFormState) => ({ ...prev, editingType: null }));
                                setValueForm((prev: ValueFormState) => ({ ...prev, isOpen: false }));
                            }}
                            className="hidden md:flex h-11 px-6 text-slate-400 hover:text-slate-600 font-bold text-sm hover:bg-slate-50"
                        >
                            Закрыть
                        </Button>

                        <Button
                            onClick={handleTypeUpdate}
                            disabled={typeForm.isLoading}
                            variant="btn-dark"
                            className="px-8 h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            {typeForm.isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            Сохранить настройки раздела
                        </Button>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
