"use client";
import React, { type Dispatch, type SetStateAction } from"react";
import { Maximize, CheckSquare } from"lucide-react";
import { cn } from"@/lib/utils";
import { type ValueFormState } from"@/app/(main)/dashboard/warehouse/hooks/use-warehouse-characteristic";
import { transliterateToSku } from"@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

interface OversizeToggleProps {
  valueForm: ValueFormState;
  setValueForm: Dispatch<SetStateAction<ValueFormState>>;
}

export function OversizeToggle({
  valueForm,
  setValueForm
}: OversizeToggleProps) {
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={() => {
          setValueForm(prev => {
            const isOversizeChecked = !prev.isOversize;
            let newCode = prev.isCodeManuallyEdited ? prev.code : transliterateToSku(prev.name).toUpperCase();
            if (isOversizeChecked) {
              if (!newCode.endsWith("_OS")) newCode +="_OS";
            } else {
              if (newCode.endsWith("_OS")) newCode = newCode.substring(0, newCode.length - 3);
            }
            return {
              ...prev,
              isOversize: isOversizeChecked,
              code: newCode
            };
          });
        }}
        className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
          valueForm.isOversize
            ?"bg-indigo-50 border-indigo-200 shadow-sm"
            :"bg-white border-slate-100 hover:border-slate-200"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            valueForm.isOversize ?"bg-indigo-500 text-white" :"bg-slate-50 text-slate-400"
          )}>
            <Maximize className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className={cn("text-sm font-bold", valueForm.isOversize ?"text-indigo-700" :"text-slate-700")}>
              Oversize
            </div>
            <div className="text-xs font-medium text-slate-400">Свободный крой изделия</div>
          </div>
        </div>
        <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
          valueForm.isOversize ?"bg-indigo-500 border-indigo-500" :"border-slate-200"
        )}>
          {valueForm.isOversize && <CheckSquare className="w-3.5 h-3.5 text-white" />}
        </div>
      </button>
    </div>
  );
}
