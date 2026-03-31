"use client";
import React, { type Dispatch, type SetStateAction } from"react";
import { Input } from"@/components/ui/input";
import { type ValueFormState } from"@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";

interface DensityFieldsProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
}

export function DensityFields({
    valueForm,
    setValueForm
}: DensityFieldsProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block ml-1">Плотность (г/м²)</label>
            <div className="relative">
                <Input
                    type="text"
                    value={valueForm.fullName}
                    onChange={e => {
                        const val = e.target.value.replace(/[^0-9.-]/g, '');
                        setValueForm(prev => ({
                            ...prev,
                            fullName: val,
                            name: val ? `${val} г/м²` :"",
                            code: prev.isCodeManuallyEdited ? prev.code : (val ? `${val.replace(/-/g, '_')}GSM` :"")
                        }));
                    }}
                    placeholder="0"
                    className="h-11 pr-12 rounded-xl bg-white border-slate-100 font-bold shadow-sm focus:border-primary transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">г/м²</span>
            </div>
        </div>
    );
}
