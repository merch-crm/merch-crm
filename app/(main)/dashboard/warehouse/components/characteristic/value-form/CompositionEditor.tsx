"use client";
import React, { type Dispatch, type SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/select";
import { type ValueFormState } from "@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";

const UNIT_OPTIONS: SelectOption[] = [
    { id: "%", title: "%" },
    { id: "шт.", title: "шт." },
    { id: "мм", title: "мм" },
    { id: "см", title: "см" },
    { id: "м", title: "м" },
    { id: "г", title: "г" },
    { id: "кг", title: "кг" },
    { id: "мл", title: "мл" },
    { id: "л", title: "л" },
    { id: "г/м²", title: "г/м²" },
    { id: "уп.", title: "уп." },
];

interface CompositionEditorProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
}

export function CompositionEditor({
    valueForm,
    setValueForm
}: CompositionEditorProps) {
    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
            <label className="text-sm font-bold text-slate-700 block ml-1">Компоненты / Свойства</label>

            <div className="space-y-2">
                {valueForm.compositionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="flex-[2]">
                            <input
                                type="text"
                                value={item.name}
                                onChange={e => {
                                    const val = e.target.value;
                                    setValueForm(prev => {
                                        const items = [...prev.compositionItems];
                                        items[idx] = { ...items[idx], name: val };
                                        return { ...prev, compositionItems: items };
                                    });
                                }}
                                placeholder="Напр: Хлопок"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-300 placeholder:font-medium"
                            />
                        </div>
                        <div className="w-[85px] shrink-0">
                            <Select
                                options={UNIT_OPTIONS}
                                value={item.unit}
                                onChange={val => {
                                    setValueForm(prev => {
                                        const items = [...prev.compositionItems];
                                        items[idx] = { ...items[idx], unit: val };
                                        return { ...prev, compositionItems: items };
                                    });
                                }}
                                compact
                                triggerClassName="h-11"
                            />
                        </div>
                        {valueForm.compositionItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setValueForm(prev => ({
                                    ...prev,
                                    compositionItems: prev.compositionItems.filter((_, i) => i !== idx)
                                }))}
                                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => setValueForm(prev => ({
                    ...prev,
                    compositionItems: [...prev.compositionItems, { name: "", value: "", unit: "%" }]
                }))}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 text-xs font-bold transition-all"
            >
                <Plus className="w-3.5 h-3.5" />
                Добавить компонент
            </button>
        </div>
    );
}
