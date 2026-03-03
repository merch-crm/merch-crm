"use client";
import React, { type Dispatch, type SetStateAction } from"react";
import { Trash2, Loader2, AlertCircle, Check, X, Pencil } from"lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { ColorPicker } from"@/components/ui/color-picker";
import { Switch } from"@/components/ui/switch";
import { cn } from"@/lib/utils";
import { AttributeType } from"../../types";
import { type ValueFormState, type TypeFormState, type DeleteDialogState } from"@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";

// Sub-components
import { DimensionsFields } from"./value-form/DimensionsFields";
import { DensityFields } from"./value-form/DensityFields";
import { ConsumableFields } from"./value-form/ConsumableFields";
import { StandardFields } from"./value-form/StandardFields";
import { CompositionEditor } from"./value-form/CompositionEditor";
import { OversizeToggle } from"./value-form/OversizeToggle";

interface ValueFormProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
    handleValueSave: () => void;
    setDeleteDialog: Dispatch<SetStateAction<DeleteDialogState>>;
    attributeTypes: AttributeType[];
    typeForm: TypeFormState;
    setTypeForm: Dispatch<SetStateAction<TypeFormState>>;
}

export function ValueForm({
    valueForm,
    setValueForm,
    handleValueSave,
    setDeleteDialog,
    attributeTypes,
    typeForm,
    setTypeForm
}: ValueFormProps) {
    const targetType = attributeTypes.find(t => t.slug === valueForm.targetTypeSlug);
    const isDimensions = targetType?.dataType ==="dimensions";
    const isCompositionType = targetType?.dataType ==="composition";
    const isDensity = targetType?.dataType ==="density";
    const isConsumable = targetType?.dataType ==="consumable";
    const showCompositionEditor = !!(isCompositionType || typeForm.hasComposition || isConsumable);
    const isColorType = targetType?.dataType ==="color";
    const showColorPicker = !!(isColorType || typeForm.hasColor);
    const hasUnits = !!(targetType?.dataType ==="unit" || targetType?.hasUnits || typeForm.hasUnits || targetType?.hasComposition);
    const showShortName = targetType?.dataType ==="text" || (hasUnits && !typeForm.hasComposition);
    const hideNames = !!(isDimensions || isCompositionType || isDensity);

    const getPlaceholders = () => {
        const type = targetType?.dataType;
        if (type ==="color") return { full:"Напр: Синий", short:"", code:"BLU" };
        if (type ==="unit") return { full:"Напр: миллиметр", short:"Напр: мм", code:"MM" };
        if (type ==="material") return { full:"Напр: Пленка", short:"", code:"PLN" };
        if (type ==="size") return { full:"Напр: XL", short:"", code:"XL" };
        if (type ==="brand") return { full:"Напр: Авангард", short:"", code:"AVG" };
        if (type ==="country") return { full:"Напр: Россия", short:"", code:"RUS" };
        if (type ==="package") return { full:"Напр: Коробка", short:"", code:"BOX" };
        if (type ==="density") return { full:"0", short:"", code:"GSM" };
        return { full:"Напр: Значение", short:"Напр: Зн", code:"VAL" };
    };

    const placeholders = getPlaceholders();

    const isSaveDisabled = showCompositionEditor
        ? valueForm.isSaving
        : (valueForm.isSaving || !valueForm.name.trim() || !valueForm.code.trim());

    return (
        <div className={cn("flex flex-col bg-white w-full md:w-5/12 p-0 md:overflow-hidden shrink-0 relative h-full",
            !valueForm.isOpen &&"hidden md:flex"
        )}>
            {valueForm.isOpen ? (
                <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex items-start justify-between gap-3 p-6 pb-3">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                {valueForm.editingAttribute ?"Редактирование значения" :"Новое значение"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {valueForm.editingAttribute && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setDeleteDialog(prev => ({ ...prev, attribute: valueForm.editingAttribute }))}
                                    className="w-9 h-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => setValueForm(prev => ({ ...prev, isOpen: false }))}
                                className="w-9 h-9 p-0 text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                title="Отменить"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={handleValueSave}
                                disabled={isSaveDisabled}
                                variant="btn-dark"
                                className="w-9 h-9 p-0 rounded-xl shadow-sm transition-all"
                                title="Сохранить"
                            >
                                {valueForm.isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-3">
                        {valueForm.error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="text-xs font-bold leading-tight">{valueForm.error}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {isDimensions && (
                                <DimensionsFields valueForm={valueForm} setValueForm={setValueForm} />
                            )}

                            {isDensity && (
                                <DensityFields valueForm={valueForm} setValueForm={setValueForm} />
                            )}

                            {isConsumable && (
                                <ConsumableFields valueForm={valueForm} setValueForm={setValueForm} />
                            )}

                            {!hideNames && !isDensity && (
                                <StandardFields
                                    valueForm={valueForm}
                                    setValueForm={setValueForm}
                                    typeForm={typeForm}
                                    setTypeForm={setTypeForm}
                                    showShortName={showShortName}
                                    isConsumable={isConsumable}
                                    placeholders={placeholders}
                                />
                            )}

                            {showCompositionEditor && (
                                <CompositionEditor valueForm={valueForm} setValueForm={setValueForm} />
                            )}

                            {targetType?.dataType ==="size" && (
                                <OversizeToggle valueForm={valueForm} setValueForm={setValueForm} />
                            )}

                            {(isColorType || isConsumable || typeForm.hasColor) && (
                                <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between ml-1 mb-1">
                                        <label className="text-sm font-bold text-slate-700 block">Цвет (HEX)</label>
                                        {isConsumable && (
                                            <Switch
                                                checked={typeForm.hasColor}
                                                onCheckedChange={(val: boolean) => setTypeForm((prev: TypeFormState) => ({ ...prev, hasColor: val }))}
                                                className="scale-75 origin-right"
                                            />
                                        )}
                                    </div>
                                    {showColorPicker && (
                                        <ColorPicker
                                            color={valueForm.colorHex}
                                            onChange={val => setValueForm((prev: ValueFormState) => ({ ...prev, colorHex: val }))}
                                            isInline={true}
                                        />
                                    )}
                                </div>
                            )}

                            {!showCompositionEditor && (
                                <div className="space-y-1.5 pt-2">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Артикул</label>
                                    <Input
                                        value={valueForm.code}
                                        readOnly={isDimensions}
                                        onChange={e => {
                                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                                            setValueForm((prev: ValueFormState) => ({ ...prev, code: val, isCodeManuallyEdited: true }));
                                        }}
                                        placeholder={placeholders.code}
                                        className={cn("w-full h-11 px-4 rounded-xl bg-white border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-300 placeholder:font-medium font-bold text-sm text-slate-900 shadow-sm",
                                            isDimensions &&"bg-slate-50 cursor-not-allowed text-slate-500"
                                        )}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col pt-2">
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 select-none pb-10">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                            <Pencil className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Редактирование</h4>
                        <p className="text-sm font-medium text-slate-500 max-w-[250px]">
                            Выберите значение из списка слева, чтобы изменить его параметры
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
