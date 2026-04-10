"use client";

import { Grid3X3, Palette, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import type {
  Category,
  AttributeType,
  InventoryAttribute,
} from "@/app/(main)/dashboard/warehouse/types";
import { CombinationCounter } from "./line-matrix/combination-counter";
import { MatrixPreviewTable } from "./line-matrix/matrix-preview-table";
import { DesignSelection } from "./line-matrix/design-selection";
import { useMatrixGenerator } from "./line-matrix/use-matrix-generator";

interface MatrixSelection {
  [attributeSlug: string]: string[];
}

interface PositionPreview {
  tempId: string;
  attributes: Record<string, string>;
  name: string;
  sku: string;
}

interface LineMatrixStepProps {
  category: Category;
  attributeTypes: AttributeType[];
  dynamicAttributes: InventoryAttribute[];
  commonAttributes: Record<string, { isCommon: boolean; value: string }>;
  matrixSelection: MatrixSelection;
  onMatrixSelectionChange: (selection: MatrixSelection) => void;
  generatedPositions: PositionPreview[];
  onPositionsGenerated: (positions: PositionPreview[]) => void;
  onNext: () => void;
  onBack: () => void;
  validationError: string;
  setValidationError: (error: string) => void;
  isFinishedLine?: boolean;
  selectedDesigns?: string[];
  onDesignsChange?: (designs: string[]) => void;
  availableDesigns?: Array<{ id: string; name: string; sku: string }>;
}

export function LineMatrixStep({
  category,
  attributeTypes,
  dynamicAttributes,
  commonAttributes,
  matrixSelection,
  onMatrixSelectionChange,
  generatedPositions,
  onPositionsGenerated,
  onNext,
  onBack,
  validationError,
  setValidationError,
  isFinishedLine = false,
  selectedDesigns = [],
  onDesignsChange,
  availableDesigns = [],
}: LineMatrixStepProps) {
  const {
    uniqueAttributes,
    attributeValues,
    totalCombinations,
  } = useMatrixGenerator({
    category,
    attributeTypes,
    dynamicAttributes,
    commonAttributes,
    matrixSelection,
    onPositionsGenerated,
    isFinishedLine,
    selectedDesigns,
    availableDesigns,
  });

  const handleValueToggle = (slug: string, code: string, checked: boolean) => {
    const current = matrixSelection[slug] || [];
    const updated = checked
      ? [...current, code]
      : current.filter((c) => c !== code);

    onMatrixSelectionChange({
      ...matrixSelection,
      [slug]: updated,
    });
  };

  const handleSelectAll = (slug: string, selectAll: boolean) => {
    const values = attributeValues[slug] || [];
    onMatrixSelectionChange({
      ...matrixSelection,
      [slug]: selectAll ? values.map((v) => v.code) : [],
    });
  };

  const handleNext = () => {
    setValidationError("");
    if (generatedPositions.length === 0) {
      setValidationError("Выберите хотя бы одно значение для создания позиций");
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Матрица позиций
              </h2>
              <p className="text-xs font-bold text-slate-700 opacity-60">
                Выберите комбинации для создания позиций
              </p>
            </div>
          </div>

          <CombinationCounter count={totalCombinations} />

          {isFinishedLine && (
            <DesignSelection availableDesigns={availableDesigns} selectedDesigns={selectedDesigns} onDesignsChange={onDesignsChange || (() => { })}
            />
          )}

          {uniqueAttributes.map((attr) => {
            const values = attributeValues[attr.slug] || [];
            const selected = matrixSelection[attr.slug] || [];
            const isColor = attr.dataType === "color";
            const isSize = attr.slug === "size" || attr.name.toLowerCase().includes("размер");
            const Icon = isColor ? Palette : isSize ? Ruler : Grid3X3;

            return (
              <div key={attr.id} className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-slate-600" />
                    {attr.name}
                    <Badge className="ml-2" color="neutral">
                      {selected.length} / {values.length}
                    </Badge>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(attr.slug, selected.length !== values.length)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {selected.length === values.length ? "Снять все" : "Выбрать все"}
                  </button>
                </div>

                {/* Кружки с цветом — для атрибутов у которых есть hex */}
                {isColor && values.some(v => v.color) && (
                  <div className="flex flex-wrap gap-2">
                    {values.filter(v => v.color).map((value) => {
                      const isSelected = selected.includes(value.code);
                      return (
                        <Tooltip key={value.code} content={value.name}>
                          <button
                            type="button"
                            onClick={() => handleValueToggle(attr.slug, value.code, !isSelected)}
                            className={cn("w-10 h-10 rounded-xl border-2 transition-all", isSelected ? "border-blue-500 ring-2 ring-blue-200 scale-110" : "border-slate-200 hover:border-slate-300")}
                            style={{ backgroundColor: value.color }}
                          />
                        </Tooltip>
                      );
                    })}
                  </div>
                )}

                {/* Лейблы — для цветов без hex и всех нецветных атрибутов */}
                {values.some(v => !isColor || !v.color) && (
                  <div className={cn("flex flex-wrap gap-2", !isColor && "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6")}>
                    {values.filter(v => !isColor || !v.color).map((value) => {
                      const isSelected = selected.includes(value.code);
                      return (
                        <label key={value.code} className={cn("flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all", isSelected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200")}>
                          <Checkbox checked={isSelected} onCheckedChange={(checked) => handleValueToggle(attr.slug, value.code, checked as boolean)} />
                          {isColor && (
                            <span
                              className="w-4 h-4 rounded-full border border-slate-200 shrink-0"
                              style={{ backgroundColor: value.color || '#e2e8f0' }}
                            />
                          )}
                          <span className="text-sm font-medium whitespace-nowrap">{value.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {values.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Нет значений для этой характеристики</p>}
              </div>
            );
          })}

          {uniqueAttributes.length === 0 && <div className="text-center py-8 text-slate-500">Все характеристики отмечены как общие. Будет создана одна позиция.</div>}

          <MatrixPreviewTable positions={generatedPositions} />

          {validationError && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-medium">{validationError}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto shrink-0">
        <StepFooter onBack={onBack} onNext={handleNext} />
      </div>
    </div>
  );
}
