"use client";
import React, { type Dispatch, type SetStateAction } from "react";
import { LucideIcon, Palette, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { type ValueFormState, type TypeFormState } from "@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";
import { transliterateToSku } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

interface StandardFieldsProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
    typeForm: TypeFormState;
    setTypeForm: Dispatch<SetStateAction<TypeFormState>>;
    showShortName: boolean;
    isConsumable: boolean;
    placeholders: { full: string; short: string; code: string };
}

const CompactToggle = ({
    icon: Icon,
    title,
    checked,
    onCheckedChange
}: {
    icon: LucideIcon;
    title: string;
    checked: boolean;
    onCheckedChange: (val: boolean) => void
}) => (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">{title}</span>
        </div>
        <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="scale-75 origin-right"
        />
    </div>
);

export function StandardFields({
    valueForm,
    setValueForm,
    typeForm,
    setTypeForm,
    showShortName,
    isConsumable,
    placeholders
}: StandardFieldsProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">Название</label>
                <Input
                    value={valueForm.fullName}
                    onChange={e => {
                        const val = e.target.value;
                        setValueForm(prev => ({
                            ...prev,
                            fullName: val,
                            code: prev.isCodeManuallyEdited ? prev.code : transliterateToSku(val).toUpperCase()
                        }));
                    }}
                    placeholder={placeholders.full}
                    className="h-11 rounded-xl bg-white border-slate-100 font-bold shadow-sm focus:border-primary transition-all placeholder:text-slate-300 placeholder:font-medium"
                    required
                />
            </div>

            {showShortName && (
                <div className="space-y-1.5 pt-1">
                    <label className="text-sm font-bold text-slate-700 block ml-1">Сокращенное название (при необходимости)</label>
                    <Input
                        value={valueForm.name}
                        onChange={e => setValueForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={placeholders.short}
                        className="h-11 rounded-xl bg-white border-slate-100 font-bold shadow-sm focus:border-primary transition-all placeholder:text-slate-300 placeholder:font-medium"
                    />
                </div>
            )}

            {isConsumable && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <CompactToggle
                        icon={Palette}
                        title="Выбор цвета"
                        checked={typeForm.hasColor}
                        onCheckedChange={val => setTypeForm(prev => ({ ...prev, hasColor: val }))}
                    />
                    <CompactToggle
                        icon={Layers}
                        title="Состав / Компоненты"
                        checked={typeForm.hasComposition}
                        onCheckedChange={val => setTypeForm(prev => ({ ...prev, hasComposition: val }))}
                    />
                </div>
            )}
        </div>
    );
}
