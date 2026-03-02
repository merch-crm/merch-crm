"use client";
import React, { type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ValueFormState } from "@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";

interface DimensionsFieldsProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
}

export function DimensionsFields({
    valueForm,
    setValueForm
}: DimensionsFieldsProps) {
    const updateDimensionStrings = (l: string, w: string, h: string, u: string) => {
        const name = `${l}×${w}×${h} ${u}`;
        const code = `${l}${w}${h}${u === 'мм' ? 'MM' : u === 'см' ? 'CM' : 'M'}`;
        setValueForm((prev: ValueFormState) => ({
            ...prev,
            length: l,
            width: w,
            height: h,
            dimensionUnit: u as ("мм" | "см" | "м"),
            name: l && w && h ? name : prev.name,
            code: l && w && h ? code : prev.code
        }));
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block ml-1">Длина</label>
                    <Input
                        type="number"
                        value={valueForm.length}
                        onChange={e => updateDimensionStrings(e.target.value, valueForm.width, valueForm.height, valueForm.dimensionUnit)}
                        placeholder="0"
                        className="h-11 rounded-xl bg-white border-slate-100 font-bold text-center shadow-sm focus:border-primary transition-all"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block ml-1">Ширина</label>
                    <Input
                        type="number"
                        value={valueForm.width}
                        onChange={e => updateDimensionStrings(valueForm.length, e.target.value, valueForm.height, valueForm.dimensionUnit)}
                        placeholder="0"
                        className="h-11 rounded-xl bg-white border-slate-100 font-bold text-center shadow-sm focus:border-primary transition-all"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block ml-1">Высота</label>
                    <Input
                        type="number"
                        value={valueForm.height}
                        onChange={e => updateDimensionStrings(valueForm.length, valueForm.width, e.target.value, valueForm.dimensionUnit)}
                        placeholder="0"
                        className="h-11 rounded-xl bg-white border-slate-100 font-bold text-center shadow-sm focus:border-primary transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">Единица измерения</label>
                <div className="grid grid-cols-3 gap-2">
                    {["мм", "см", "м"].map(u => (
                        <button
                            key={u}
                            type="button"
                            onClick={() => updateDimensionStrings(valueForm.length, valueForm.width, valueForm.height, u)}
                            className={cn(
                                "h-10 rounded-xl border-2 font-bold text-xs transition-all shadow-sm",
                                valueForm.dimensionUnit === u
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-slate-100" />
        </div>
    );
}
