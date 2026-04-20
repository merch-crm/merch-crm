"use client";
import { type SetStateAction, type Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ValueFormState } from "@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";
import { transliterateToSku } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

interface ConsumableFieldsProps {
  valueForm: ValueFormState;
  setValueForm: Dispatch<SetStateAction<ValueFormState>>;
}

export function ConsumableFields({
  valueForm,
  setValueForm
}: ConsumableFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 block ml-1">Тип расходника</label>
        <div className="grid grid-cols-2 gap-2">
          {["краска", "клей", "нитки", "иголки", "пленка", "другое"].map(t => (
            <Button
              key={t}
              variant={valueForm.consumableType === t ? "outline" : "outline"}
              color={valueForm.consumableType === t ? "system" : "neutral"}
              onClick={() => {
                setValueForm(prev => {
                  const typeValue = t === "другое" ? (prev.consumableCustomType || "Свой тип") : t;
                  const newVal = prev.consumableValue;
                  const unit = prev.consumableUnit;
                  const extra = prev.consumableExtra;

                  const namePart = `${typeValue}${newVal ? ` ${newVal}${unit}` : ""}${extra ? ` (${extra})` : ""}`;
                  const codePart = `${transliterateToSku(typeValue).toUpperCase()}${newVal}${transliterateToSku(unit).toUpperCase()}${extra ? transliterateToSku(extra).substring(0, 3).toUpperCase() : ""}`;

                  return {
                    ...prev,
                    consumableType: t,
                    name: namePart,
                    code: prev.isCodeManuallyEdited ? prev.code : codePart
                  };
                });
              }}
              className={cn("h-10 px-3 rounded-xl text-xs font-bold",
                valueForm.consumableType === t && "bg-indigo-50/50"
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
        {valueForm.consumableType ==="другое" && (
          <Input value={valueForm.consumableCustomType} onChange={e => {
              const val = e.target.value;
              setValueForm(prev => {
                const namePart = `${val}${prev.consumableValue ? ` ${prev.consumableValue}${prev.consumableUnit}` :""}${prev.consumableExtra ? ` (${prev.consumableExtra})` :""}`;
                const codePart = `${transliterateToSku(val).toUpperCase()}${prev.consumableValue}${transliterateToSku(prev.consumableUnit).toUpperCase()}${prev.consumableExtra ? transliterateToSku(prev.consumableExtra).substring(0, 3).toUpperCase() :""}`;
                return {
                  ...prev,
                  consumableCustomType: val,
                  name: namePart,
                  code: prev.isCodeManuallyEdited ? prev.code : codePart
                };
              });
            }}
            placeholder="Введите свой тип..."
            className="h-11 mt-2 rounded-xl bg-white border-slate-100 font-bold shadow-sm focus:border-primary transition-all placeholder:text-slate-300 placeholder:font-medium"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 block ml-1">Дополнительная информация</label>
        <Input value={valueForm.consumableExtra} onChange={e => {
            const val = e.target.value;
            setValueForm(prev => {
              const typeValue = prev.consumableType ==="другое" ? prev.consumableCustomType : prev.consumableType;
              const namePart = `${typeValue}${prev.consumableValue ? ` ${prev.consumableValue}${prev.consumableUnit}` :""}${val ? ` (${val})` :""}`;
              const codePart = `${transliterateToSku(typeValue).toUpperCase()}${prev.consumableValue}${transliterateToSku(prev.consumableUnit).toUpperCase()}${val ? transliterateToSku(val).substring(0, 3).toUpperCase() :""}`;
              return {
                ...prev,
                consumableExtra: val,
                name: namePart,
                code: prev.isCodeManuallyEdited ? prev.code : codePart
              };
            });
          }}
          placeholder="Напр: металлизированная, глянцевая..."
          className="h-11 rounded-xl bg-white border-slate-100 font-bold shadow-sm focus:border-primary transition-all placeholder:text-slate-300 placeholder:font-medium"
        />
      </div>
    </div>
  );
}
