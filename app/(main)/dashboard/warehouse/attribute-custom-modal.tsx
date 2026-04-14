"use client";

import React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ColorPickerSquare } from "@/components/ui/color-picker-variants";
import { cn } from "@/lib/utils";
import type { AttributeType } from "./types";
import { Plus, Trash2, Shapes, Ruler, Palette, Box, Hash, Layers, Shirt, Maximize, Tag, Globe, Weight, Droplets, Package, Waves, Wrench, type LucideIcon } from "lucide-react";
interface CustomForm {
  name: string;
  hex: string;
  l: string;
  w: string;
  h: string;
  u: "MM" | "CM" | "M";
  weightUnit: "G" | "KG";
  volumeUnit: "ML" | "L";
  quantityUnit: string;
  composition: { name: string; percent: string }[];
  fullName: string;
  shortName: string;
  code: string;
  isCodeManuallyEdited: boolean;
  measureValue: string;
  measureUnit: string;
}

interface AttributeCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  label?: string;
  customForm: CustomForm;
  setCustomForm: React.Dispatch<React.SetStateAction<CustomForm>>;
  isSaving: boolean;
  onSave: () => void;
  currentAttributeType: AttributeType | undefined;
  transliterate: (text: string) => string;
  CharacteristicsLink: React.ComponentType;
}

const DATA_TYPE_ICONS: Record<string, LucideIcon> = {
  text: Shapes, unit: Ruler, color: Palette, dimensions: Box, quantity: Hash,
  composition: Layers, material: Shirt, size: Maximize,
  brand: Tag, country: Globe, density: Waves, weight: Weight, volume: Droplets, package: Package, consumable: Wrench
};


export function AttributeCustomModal({
  isOpen,
  onClose,
  type,
  label,
  customForm,
  setCustomForm,
  isSaving,
  onSave,
  currentAttributeType,
  transliterate,
  CharacteristicsLink
}: AttributeCustomModalProps) {
  const isColorType = currentAttributeType?.dataType === "color" || currentAttributeType?.hasColor || type === "color";
  const hasUnits = currentAttributeType?.hasUnits;
  const hasComposition = currentAttributeType?.hasComposition;
  const isDimensions = currentAttributeType?.dataType === "dimensions";

  const isWeight = currentAttributeType?.dataType === "weight";
  const isVolume = currentAttributeType?.dataType === "volume";
  const isComposition = currentAttributeType?.dataType === "composition";
  const isNumeric = ["weight", "volume", "density"].includes(currentAttributeType?.dataType || "");
  const TypeIcon = (currentAttributeType && DATA_TYPE_ICONS[currentAttributeType.dataType]) || (type === "color" ? Palette : Plus);

  const displayLabel = label || (
    type === "brand" ? "Бренд" :
      type === "material" ? "Материал" :
        type === "size" ? "Размер" :
          type === "quality" ? "Качество ткани" : type
  );

  const title = isColorType ? "Новый цвет" :
    type === "brand" ? "Новый бренд" :
      type === "material" ? "Новый материал" :
        type === "size" ? "Новый размер" :
          type === "quality" ? "Новое качество" :
            displayLabel.toLowerCase() === "состав" ? "Новый состав" : "Новая опция";

  const subtitle = isColorType ? "Добавление оттенка в палитру" : `Раздел: ${displayLabel}`;
  const Icon = TypeIcon;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl" title={title} showVisualTitle={false}>
      <div className="flex flex-col overflow-hidden rounded-[var(--radius-outer)]">
        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 pb-5 bg-slate-50/30 overflow-y-auto custom-scrollbar space-y-3">
          <div className={cn("grid gap-3", !isColorType && "grid-cols-2")}>
            {isDimensions ? (
              <div className="space-y-3 col-span-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">Длина</label>
                    <Input type="number" value={customForm.l} onChange={e => setCustomForm(prev => ({ ...prev, l: e.target.value }))}
                      className="h-11 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">Ширина</label>
                    <Input type="number" value={customForm.w} onChange={e => setCustomForm(prev => ({ ...prev, w: e.target.value }))}
                      className="h-11 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">Высота</label>
                    <Input type="number" value={customForm.h} onChange={e => setCustomForm(prev => ({ ...prev, h: e.target.value }))}
                      className="h-11 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Ед. измерения</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "MM", title: "мм" },
                      { id: "CM", title: "см" },
                      { id: "M", title: "м" }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCustomForm(prev => ({ ...prev, u: item.id as "MM" | "CM" | "M" }))}
                        className={cn("h-9 rounded-lg border-2 font-bold text-xs transition-all",
                          customForm.u === item.id
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-slate-100 text-slate-400"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (isWeight || isVolume) ? (
              <div className="space-y-3 pt-2 w-full col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  {isWeight ? "Вес" : "Объем"}
                </label>
                <div className="flex gap-2">
                  <Input type="number" value={customForm.name} onChange={e => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 flex-1 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold px-4"
                    placeholder="0"
                  />
                  <div className="w-32">
                    <Select value={isWeight ? customForm.weightUnit : customForm.volumeUnit} onChange={v => setCustomForm(prev => ({
                        ...prev,
                        [isWeight ? 'weightUnit' : 'volumeUnit']: v
                      }))}
                      options={isWeight ? [
                        { id: "G", title: "г" },
                        { id: "KG", title: "кг" }
                      ] : [
                        { id: "ML", title: "мл" },
                        { id: "L", title: "л" }
                      ]}
                      placeholder="Ед."
                    />
                  </div>
                </div>
              </div>
            ) : isComposition ? (
              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700">Состав материалов</label>
                  <div className={cn("text-xs font-bold px-2 py-0.5 rounded-full border",
                    customForm.composition.reduce((acc, curr) => acc + (parseInt(curr.percent) || 0), 0) === 100
                      ? "text-emerald-500 bg-emerald-50 border-emerald-100"
                      : "text-rose-500 bg-rose-50 border-rose-100"
                  )}>
                    Всего: {customForm.composition.reduce((acc, curr) => acc + (parseInt(curr.percent) || 0), 0)}%
                  </div>
                </div>
                <div className="space-y-2">
                  {customForm.composition.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input className="flex-1 h-11 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold" placeholder="Напр: Хлопок" value={item.name} onChange={e => {
                          const newComp = [...customForm.composition];
                          newComp[index].name = e.target.value;
                          setCustomForm(prev => ({ ...prev, composition: newComp }));
                        }}
                      />
                      <div className="w-24 relative">
                        <Input type="number" className="h-11 pr-8 rounded-[var(--radius-inner)] bg-white border-slate-200 text-center font-bold" placeholder="0" value={item.percent} onChange={e => {
                            const newComp = [...customForm.composition];
                            newComp[index].percent = e.target.value;
                            setCustomForm(prev => ({ ...prev, composition: newComp }));
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                      </div>
                      {customForm.composition.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-[var(--radius-inner)] text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100" onClick={() => {
                            setCustomForm(prev => ({
                              ...prev,
                              composition: prev.composition.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="ghost" className="w-full h-11 border-2 border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 font-bold text-sm gap-2 rounded-[var(--radius-inner)]" onClick={() => setCustomForm(prev => ({
                    ...prev,
                    composition: [...prev.composition, { name: "", percent: "" }]
                  }))}
                >
                  <Plus className="w-4 h-4" /> Добавить материал
                </Button>
              </div>
            ) : (
              <>
                {!isDimensions && (
                  <div className="space-y-3">
                    <div className="space-y-1.5 flex-1 w-full">
                      <label className="text-sm font-bold text-slate-700 ml-1">Название {(currentAttributeType?.dataType === "density" || type === "density") && "(г/м²)"}</label>
                      <Input placeholder={isColorType ? "Напр: Синий" : isNumeric ? "0" : "Напр: Хлопок"} className="w-full h-12 px-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium font-bold text-sm text-slate-900 shadow-sm" value={customForm.fullName} onChange={e => {
                          const val = e.target.value;
                          setCustomForm(prev => {
                            const brandTranslit = (currentAttributeType?.dataType === "brand" || type === "brand") ? val.substring(0, 3).toUpperCase() : transliterate(val).toUpperCase();
                            return {
                              ...prev,
                              fullName: val,
                              name: val || prev.shortName || prev.name,
                              code: prev.isCodeManuallyEdited ? prev.code : brandTranslit
                            };
                          });
                        }}
                        onKeyDown={(e) => e.key === "Enter" && onSave()}
                        autoFocus
                      />
                    </div>
                    {(hasUnits || hasComposition) && (
                      <div className="space-y-1.5 flex-1 w-full">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          {hasComposition ? "Значение (%)" : "Величина"}
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input type="number" value={customForm.measureValue} onChange={e => {
                                const val = e.target.value;
                                setCustomForm(prev => {
                                  const unit = hasComposition ? "%" : prev.measureUnit;
                                  const namePart = prev.fullName || (val ? `${val}${unit}` : "");
                                  const codePart = val ? `${val}${transliterate(unit).toUpperCase()}` : "";
                                  return {
                                    ...prev,
                                    measureValue: val,
                                    measureUnit: unit,
                                    name: namePart,
                                    code: prev.isCodeManuallyEdited ? prev.code : codePart
                                  };
                                });
                              }}
                              placeholder="0"
                              className={cn("h-12 rounded-[var(--radius-inner)] bg-white border-slate-200 font-bold",
                                hasComposition && "pr-8"
                              )}
                            />
                            {hasComposition && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            )}
                          </div>
                          {hasUnits && (
                            <div className="w-24">
                              <Input value={customForm.measureUnit} onChange={e => {
                                  const val = e.target.value;
                                  setCustomForm(prev => {
                                    const namePart = prev.fullName || (prev.measureValue ? `${prev.measureValue}${val}` : val);
                                    const codePart = prev.measureValue ? `${prev.measureValue}${transliterate(val).toUpperCase()}` : transliterate(val).toUpperCase();
                                    return {
                                      ...prev,
                                      measureUnit: val,
                                      name: namePart,
                                      code: prev.isCodeManuallyEdited ? prev.code : codePart
                                    };
                                  });
                                }}
                                placeholder="Ед."
                                className="h-12 rounded-[var(--radius-inner)] bg-white border-slate-200 text-center font-bold"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Артикул</label>
                  <Input placeholder="SIN" className={cn("w-full h-12 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-300 placeholder:font-medium font-bold text-sm text-slate-900 shadow-sm", isDimensions && "bg-slate-100 cursor-not-allowed text-slate-400" )} readOnly={isDimensions} value={customForm.code} onChange={e => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                      setCustomForm(prev => ({ ...prev, code: val, isCodeManuallyEdited: true }));
                    }}
                  />
                </div>

                {isColorType && (
                   <ColorPickerSquare label="Выбор цвета" className="w-full col-span-2 mt-2" value={customForm.hex || "#3B82F6"} onChange={(hex: string) => setCustomForm(prev => ({ ...prev, hex }))} />
                )}
              </>
            )}
          </div>

          {!isColorType && (
            <p className="text-xs text-slate-400 font-bold mt-4 ml-1 opacity-60">
              Короткий код для артикула генерируется автоматически на основе названия
            </p>
          )}

          <CharacteristicsLink />
        </div>

        <div className="p-6 pt-0 bg-white shrink-0 mt-auto">
          <Button color="dark" className="w-full h-12 rounded-[var(--radius-inner)] font-bold text-base disabled:opacity-50" onClick={onSave} disabled={ isDimensions ? (!customForm.l || !customForm.w || !customForm.h) : currentAttributeType?.dataType === "composition" ? (customForm.composition.reduce((acc, curr) => acc + (parseInt(curr.percent) || 0), 0) !== 100) :
                  !customForm.name.trim() || isSaving
            }
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Сохранение...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Добавить характеристику</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal >
  );
}

