"use client";

import { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, RotateCcw, Info, Package, FileText, LayoutPanelTop } from "lucide-react";
import { useLineName } from "../hooks/use-line-name";
import { StepFooter } from "./step-footer";
import { cn } from "@/lib/utils";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

interface Attribute {
    id: string;
    code: string;
    name: string;
    categoryId?: string | null;
    values: Array<{
        id: string;
        value: string;
        label?: string;
    }>;
}

interface SelectedAttribute {
    attributeId: string;
    attributeCode?: string;
    attributeName: string;
    value: string;
    valueLabel?: string;
}

interface LineMetadata {
    customLineName: string;
    lineDescription: string;
    onLineNameChange: (name: string) => void;
    onLineDescriptionChange: (description: string) => void;
}

interface LineActions {
    onBack: () => void;
    onNext: () => void;
    updateFormData: (updates: Partial<ItemFormData> | ((prev: ItemFormData) => Partial<ItemFormData>)) => void;
}

interface LineCharacteristicsStepProps {
    categoryAttributes: Attribute[];
    selectedAttributes: Record<string, string>;
    commonAttributeIds: string[];
    onCommonAttributesChange: (ids: string[]) => void;
    lineData: LineMetadata;
    actions: LineActions;
    errors?: Record<string, string>;
}

export function LineCharacteristicsStep({
    categoryAttributes,
    selectedAttributes,
    commonAttributeIds,
    onCommonAttributesChange,
    lineData,
    actions,
    errors,
}: LineCharacteristicsStepProps) {
    const { customLineName, lineDescription, onLineNameChange, onLineDescriptionChange } = lineData;
    const { onBack, onNext, updateFormData } = actions;

    // Преобразуем общие атрибуты в формат для генератора
    const commonAttributesForName = useMemo(() => {
        return commonAttributeIds
            .map((attrId) => {
                const attr = categoryAttributes.find((a) => a.id === attrId);
                if (!attr) return null;

                const selectedValue = selectedAttributes[attrId];
                if (!selectedValue) return null;

                const valueObj = attr.values.find((v) => v.id === selectedValue || v.value === selectedValue);

                return {
                    attributeId: attrId,
                    attributeCode: attr.code,
                    attributeName: attr.name,
                    value: selectedValue,
                    valueLabel: valueObj?.label || valueObj?.value || selectedValue,
                };
            })
            .filter(Boolean) as SelectedAttribute[];
    }, [commonAttributeIds, categoryAttributes, selectedAttributes]);

    // Хук для управления названием
    const {
        displayName,
        generatedName,
        isCustom,
        setCustomName,
        resetToGenerated,
    } = useLineName({
        commonAttributes: commonAttributesForName,
        initialCustomName: customLineName,
    });

    // Синхронизируем название с родительским компонентом
    const lastSyncedName = useRef<string>("");
    useEffect(() => {
        const nameToSync = isCustom ? displayName : "";
        if (lastSyncedName.current !== nameToSync) {
            lastSyncedName.current = nameToSync;
            onLineNameChange(nameToSync);
        }
    }, [displayName, isCustom, onLineNameChange]);

    // Обработчик переключения атрибута
    const handleAttributeToggle = (attributeId: string, checked: boolean) => {
        if (checked) {
            onCommonAttributesChange([...commonAttributeIds, attributeId]);
        } else {
            onCommonAttributesChange(commonAttributeIds.filter((id) => id !== attributeId));
        }
    };

    // Обработчик изменения значения атрибута
    const handleAttributeValueChange = (attributeCode: string, value: string) => {
        updateFormData((prev: ItemFormData) => ({
            ...prev,
            attributes: {
                ...(prev.attributes || {}),
                [attributeCode]: value,
            },
        }));
    };

    // Атрибуты, которые можно выбрать
    const availableAttributes = categoryAttributes;

    return (
        <div className="flex flex-col h-full min-h-0 !overflow-visible">
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
                <div className="flex flex-col min-h-full pb-10 p-8 space-y-3">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-xl shadow-slate-200">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">Характеристики линейки</h2>
                                <p className="text-xs font-bold text-slate-500 opacity-80">Настройте общие параметры для всех позиций</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex gap-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-indigo-500">
                                <Info className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[12px] font-bold text-indigo-900 leading-tight">Что такое «Общая характеристика»?</p>
                                <p className="text-xs font-medium text-indigo-700/80 leading-relaxed">
                                    Это параметр, который будет одинаковым для всех товаров в линейке.
                                    Они автоматически формируют основу названия вашей линейки.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Выбор общих атрибутов */}
                    <div className="space-y-3">
                        {availableAttributes.length === 0 ? (
                            <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center">
                                <p className="text-sm font-bold text-slate-400">У этой категории нет настраиваемых характеристик</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableAttributes.map((attr) => {
                                    const isCommon = commonAttributeIds.includes(attr.id);
                                    const selectedValue = selectedAttributes[attr.code] || selectedAttributes[attr.id];

                                    return (
                                        <div
                                            key={attr.id}
                                            className={cn(
                                                "relative flex flex-col gap-3 p-4 rounded-2xl border transition-all bg-white hover:shadow-md hover:border-slate-300",
                                                isCommon
                                                    ? "border-indigo-500 shadow-sm ring-1 ring-indigo-500/10"
                                                    : "border-slate-200 shadow-none"
                                            )}
                                        >
                                            {/* Селектор значения */}
                                            <AttributeSelector
                                                type={attr.code}
                                                label={attr.name}
                                                value={selectedValue || ""}
                                                onChange={(_name: string, value: string) => handleAttributeValueChange(attr.code, value)}
                                                allowCustom={true}
                                                categoryId={attr.categoryId || undefined}
                                                headerAction={
                                                    <label className="flex items-center gap-1.5 cursor-pointer group/label">
                                                        <div className={cn(
                                                            "w-[14px] h-[14px] rounded-[4px] border flex items-center justify-center transition-all shrink-0",
                                                            isCommon ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white group-hover/label:border-indigo-400"
                                                        )}>
                                                            {isCommon && <div className="w-1 h-1 bg-white rounded-[1px]" />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-xs font-bold select-none transition-colors leading-none tracking-normal",
                                                            isCommon ? "text-indigo-600" : "text-slate-400 group-hover/label:text-slate-600"
                                                        )}>
                                                            Общая характеристика
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={isCommon}
                                                            onChange={(e) => handleAttributeToggle(attr.id, e.target.checked)}
                                                        />
                                                    </label>
                                                }
                                            />

                                            {isCommon && (
                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-200 select-none pointer-events-none z-10 animate-in fade-in zoom-in duration-300">
                                                    В названии линейки
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {errors?.commonAttributes && (
                            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-1">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-bold">{errors.commonAttributes}</span>
                            </div>
                        )}
                    </div>

                    {/* Название и описание */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Название */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Название линейки</h3>
                            </div>

                            <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="line-name" className="text-[13px] font-bold text-slate-500 leading-none">
                                            Своё название <span className="opacity-60">(необязательно)</span>
                                        </Label>
                                        {isCustom && (
                                            <button
                                                type="button"
                                                onClick={resetToGenerated}
                                                className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Сбросить
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        id="line-name"
                                        value={isCustom ? displayName : ""}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder={generatedName || "Введите название линейки"}
                                        className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-white text-sm font-bold focus-visible:border-indigo-300 transition-all shadow-none"
                                    />
                                    <p className="text-xs font-bold text-slate-400 ml-1">
                                        Оставьте пустым для автоматического формирования
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full" />
                                    <p className="text-xs font-bold text-slate-400 mb-1 leading-none">Итоговое название:</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">
                                        {displayName || <span className="text-slate-300 italic">Название не определено</span>}
                                    </p>
                                    {generatedName && !isCustom && (
                                        <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-indigo-500">
                                            <Sparkles className="w-3 h-3" />
                                            <span>Сформировано автоматически</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errors?.lineName && (
                                <p className="text-xs font-bold text-rose-500 ml-1">{errors.lineName}</p>
                            )}
                        </div>

                        {/* Описание */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                    <LayoutPanelTop className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Описание</h3>
                            </div>

                            <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 h-full">
                                <Textarea
                                    value={lineDescription}
                                    onChange={(e) => onLineDescriptionChange(e.target.value)}
                                    placeholder="Описание линейки (необязательно)"
                                    className="w-full min-h-[160px] p-5 rounded-xl border border-slate-100 bg-white text-sm font-bold focus-visible:border-indigo-300 transition-all shadow-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Превью шаблона */}
                    {commonAttributesForName.length > 0 && (
                        <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-indigo-400 opacity-80">Превью структуры</h4>
                                    <p className="text-lg font-black leading-tight max-w-xl">
                                        Названия всех позиций в линейке будут автоматически обновляться при изменении характеристик
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[13px] font-mono bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                                    <span className="text-blue-400">[Изделие]</span>
                                    <span className="text-indigo-300 font-bold">{displayName || "Линейка"}</span>
                                    <span className="text-emerald-400">[Принт]</span>
                                    <span className="text-amber-400">[Цвет]</span>
                                    <span className="text-rose-400">[Размер]</span>
                                </div>
                            </div>

                            <p className="relative z-10 text-xs font-bold text-white/40 mt-6 leading-none ">
                                <span className="text-white/60">ПРИМЕР:</span> Футболка <span className="text-white">{displayName || "Muse 220"}</span> Овен Белый S
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto shrink-0 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                <StepFooter
                    onBack={onBack}
                    onNext={onNext}
                    validationError={undefined}
                />
            </div>
        </div>
    );
}
