"use client";

import { Palette } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DesignSelectionProps {
  availableDesigns: Array<{ id: string; name: string; sku: string }>;
  selectedDesigns: string[];
  onDesignsChange: (designs: string[]) => void;
}

export function DesignSelection({
  availableDesigns,
  selectedDesigns,
  onDesignsChange,
}: DesignSelectionProps) {
  if (availableDesigns.length === 0) {
    return (
      <div className="space-y-3 p-6 rounded-2xl bg-green-50 border border-green-100 text-center">
        <p className="text-sm text-slate-500 py-4">
          В выбранной коллекции нет макетов
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-6 rounded-2xl bg-green-50 border border-green-100">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-5 h-5 text-green-600" />
          Макеты дизайнов
        </h4>
        <button
          type="button"
          onClick={() =>
            onDesignsChange(
              selectedDesigns.length === availableDesigns.length
                ? []
                : availableDesigns.map((d) => d.id)
            )
          }
          className="text-xs text-green-600 hover:underline"
        >
          {selectedDesigns.length === availableDesigns.length
            ? "Снять все"
            : "Выбрать все"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {availableDesigns.map((design) => {
          const isSelected = selectedDesigns.includes(design.id);
          return (
            <label
              key={design.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                isSelected
                  ? "border-green-400 bg-green-100"
                  : "border-slate-200 bg-white hover:border-green-200"
              )}
            >
              <Checkbox checked={isSelected} onCheckedChange={(checked) => {
                  const updated = checked
                    ? [...selectedDesigns, design.id]
                    : selectedDesigns.filter((id) => id !== design.id);
                  onDesignsChange(updated);
                }}
              />
              <span className="text-sm font-medium truncate">
                {design.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
