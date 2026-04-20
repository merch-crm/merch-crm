"use client";

import Link from "next/link";
import { ClipboardList, Settings2, Ruler, Wrench, Printer, Shirt, Scissors } from "lucide-react";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useBasicInfoLogic } from "./basic-info/hooks/useBasicInfoLogic";
import { LivePreviewCard } from "./live-preview-card";

interface BasicInfoStepProps {
  category: Category;
  categories: Category[];
  subCategories: Category[];
  dynamicAttributes: InventoryAttribute[];
  attributeTypes: AttributeType[];
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData> | ((prev: ItemFormData) => Partial<ItemFormData>)) => void;
  onNext: () => void;
  onBack: () => void;
  validationError: string;
}

export function BasicInfoStep({
  category,
  categories,
  subCategories,
  formData,
  updateFormData,
  onNext,
  onBack,
  validationError,
  dynamicAttributes,
  attributeTypes = [],
}: BasicInfoStepProps) {

  const {
    isClothing,
    isPackaging,
    isConsumables,
    categoryAttributes,
    getCodeForSlug
  } = useBasicInfoLogic({
    category,
    subCategories,
    formData,
    updateFormData,
    attributeTypes,
    dynamicAttributes
  });


  const handleAttributeChange = (slug: string, typeName: string, code: string, _optionName: string) => {
    const normalizedSlug = slug.toLowerCase().trim();
    const normalizedTypeName = typeName.toLowerCase().trim();

    updateFormData((prev: ItemFormData) => {
      const currentAttrs = prev.attributes || {};

      // Determine which field to update (canonical slug)
      const effectiveSlug = (normalizedSlug === 'brand' || normalizedTypeName.includes('бренд')) ? 'brand' :
        (normalizedSlug === 'quality' || normalizedTypeName.includes('качество')) ? 'quality' :
          (normalizedSlug === 'material' || normalizedTypeName.includes('материал')) ? 'material' :
            (normalizedSlug === 'size' || normalizedTypeName.includes('размер')) ? 'size' :
              (normalizedSlug === 'color' || normalizedTypeName.includes('цвет')) ? 'color' :
                (normalizedSlug === 'unit' || normalizedTypeName.includes('единица измерения')) ? 'unit' : normalizedSlug;

      // Update both the specific field AND the attributes pool (by slug)
      const updates: Partial<ItemFormData> = {
        attributes: {
          ...currentAttrs,
          [slug]: code       // For getCodeForSlug to keep dropdown state
        }
      };

      if (effectiveSlug === 'brand') updates.brandCode = code;
      if (effectiveSlug === 'quality') updates.qualityCode = code;
      if (effectiveSlug === 'material') updates.materialCode = code;
      if (effectiveSlug === 'size') updates.sizeCode = code;
      if (effectiveSlug === 'color') updates.attributeCode = code;
      if (effectiveSlug === 'unit') updates.unit = code;

      return updates;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 !overflow-visible">
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        <div className="flex flex-col min-h-full pb-10 p-8">

          {/* Preview Header Block (New Light Theme) */}
          <LivePreviewCard formData={formData} category={category} attributeTypes={attributeTypes} dynamicAttributes={dynamicAttributes} activeSubcategory={formData.subcategoryId ? (subCategories.find((s: Category) => s.id === formData.subcategoryId) || categories.find((s: Category) => s.id === formData.subcategoryId)) : undefined}
            className="mb-4"
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Основная информация</h2>
                <p className="text-xs font-bold text-slate-700 opacity-60">Заполните ключевые характеристики вашей позиции</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col pt-4 min-h-0">
            <div className="flex-1 flex flex-col gap-2.5">



              <div>
                {categoryAttributes.length > 0 ? (
                  <div className="flex flex-col space-y-2.5 pt-1.5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 grid-flow-row-dense w-full">
                      {categoryAttributes.map((attr) => {
                        return (
                          <div key={attr.id}>
                            <AttributeSelector type={attr.slug} label={attr.name} value={(getCodeForSlug(attr.slug, attr.name) as string) || ""} onChange={(optionName, code) => handleAttributeChange(attr.slug, attr.name, code, optionName)}
                              categoryId={attr.categoryId || category.id}
                              initialAttributeType={attr}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  !isClothing && (
                    <div className="flex-1 flex items-center justify-center py-10">
                      <div className="bg-white shadow-sm border border-slate-100 rounded-[24px] px-[var(--radius-padding)] py-10 flex flex-col items-center text-center space-y-3 overflow-hidden relative group max-w-2xl w-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 bg-indigo-50 rounded-[32px] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-white border border-indigo-100 rounded-[32px] shadow-sm transform group-hover:scale-105 transition-transform duration-500" />
                          <Settings2 className="w-10 h-10 text-indigo-500 relative transform group-hover:-rotate-12 transition-transform duration-500" />
                        </div>

                        <div className="relative space-y-2 max-w-sm">
                          <h4 className="text-xl font-bold text-slate-900 ">Характеристики еще не заданы</h4>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                            Для этой категории пока не настроены дополнительные поля.
                            Вы можете добавить их в настройках, чтобы сделать описание позиций более детальным.
                          </p>
                        </div>

                        <Button asChild variant="ghost" className="relative flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95">
                          <Link href="/dashboard/warehouse/characteristics">
                            <Settings2 className="w-4 h-4" />
                            Настроить характеристики
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Дополнительно */}
              {(isPackaging || isConsumables) && (
                <div className="flex flex-col space-y-3 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200 text-white shrink-0">
                      {isPackaging ? <Ruler className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 leading-tight">Технические параметры</h4>
                      <p className="text-xs font-bold text-slate-700 opacity-60">Размеры и назначение</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {isPackaging && (
                      <div className="grid grid-cols-3 gap-2">
                        {['width', 'height', 'depth'].map(dim => (
                          <div key={dim} className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-500 ml-1">
                              {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                            </label>
                            <div className="relative">
                              <Input type="number" value={(formData[dim as keyof ItemFormData] as string) || ""} onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold focus-visible:border-slate-300 transition-all shadow-none"
                                placeholder="0"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">СМ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isConsumables && (
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-500 ml-1">Область применения</label>
                        <Select options={[ { id: "printing", title: "Печатный цех", icon: <Printer className="w-4 h-4 opacity-50" /> },
                            { id: "embroidery", title: "Вышивальный цех", icon: <Shirt className="w-4 h-4 opacity-50" /> },
                            { id: "sewing", title: "Швейный цех", icon: <Scissors className="w-4 h-4 opacity-50" /> },
                          ]}
                          value={formData.department || ""}
                          onChange={(val) => updateFormData({ department: val })}
                          placeholder="Выберите отдел..."
                          className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto shrink-0">
        <StepFooter onBack={onBack} onNext={onNext} validationError={validationError} />
      </div>
    </div>
  );
}
