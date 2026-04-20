"use client";

import { Plus, Shapes, Ruler, Palette, Box, Layers, Maximize, Tag, Globe, Weight, Droplets, Package, Component, Waves, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category, AttributeType } from "./types";
import { useAddAttributeType } from "./hooks/use-add-attribute-type";

interface AddAttributeTypeDialogProps {
  categories: Category[];
  attributeTypes?: AttributeType[];
  className?: string;
}


export function AddAttributeTypeDialog({ categories, attributeTypes = [], className }: AddAttributeTypeDialogProps) {
  const {
    isOpen, setIsOpen,
    isLoading,
    dataTypes: selectedDataTypes, toggleDataType,
    activeCategoryId, setActiveCategoryId,
    rootCategories,
    existingTypesInActiveCategory,
    error,
    handleOpen,
    handleCreate
  } = useAddAttributeType({ categories, attributeTypes });

  const activeCategoryName = activeCategoryId === "uncategorized"
    ? "Без категории"
    : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

  const dataTypes = [
    { id: "text", title: "Общая", icon: Shapes },
    { id: "unit", title: "Единица измерения", icon: Ruler },
    { id: "color", title: "Цвет", icon: Palette },
    { id: "dimensions", title: "Габариты", icon: Box },

    { id: "composition", title: "Состав", icon: Component },
    { id: "material", title: "Материал", icon: Layers },
    { id: "size", title: "Размер", icon: Maximize },
    { id: "brand", title: "Бренд", icon: Tag },
    { id: "country", title: "Страна", icon: Globe },
    { id: "density", title: "Плотность", icon: Waves },
    { id: "weight", title: "Вес", icon: Weight },
    { id: "volume", title: "Объем", icon: Droplets },
    { id: "package", title: "Упаковка", icon: Package },
    { id: "consumable", title: "Расходники", icon: Wrench },
  ] as const;

  return (
    <>
      <Button 
        onClick={handleOpen} 
        className={cn(
          "sm:w-auto px-0 sm:px-6 gap-2 text-sm font-bold", 
          className 
        )}
      >
        <Plus className="size-4 text-white shrink-0" />
        <span className="hidden sm:inline">Новая характеристика</span>
      </Button>

      <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)}
        title="Новая характеристика"
        description="Создание нового типа характеристики для товаров в каталоге"
        showVisualTitle={false}
        className="sm:max-w-[520px]"
      >
        <form
          id="add-attribute-type-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedDataTypes.length) return;
            handleCreate();
          }}
          className="flex flex-col bg-white"
        >
          <div className="flex items-center justify-between p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                {(() => {
                  const Icon = selectedDataTypes.length === 1
                    ? dataTypes.find(t => t.id === selectedDataTypes[0])?.icon || Plus
                    : Plus;
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Характеристика</h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Категория: <span className="text-primary font-bold">{activeCategoryName}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 space-y-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-2 overflow-visible">
              <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Категория</label>

              <Select value={activeCategoryId} onChange={setActiveCategoryId} options={ [ ...rootCategories .filter(c => c.name.toLowerCase() !== "без категории")
                      .map(c => ({ id: c.id, title: c.name })),
                    { id: "uncategorized", title: "Без категории" }
                  ]
                }
                placeholder="Выберите категорию"
                showSearch={true}
                className="w-full"
              />
            </div>



            <div className="space-y-3 pt-1">
              <label className="text-sm font-bold text-slate-700 block ml-1">Тип данных</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {dataTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedDataTypes.includes(type.id);
                  const isAlreadyExists = existingTypesInActiveCategory.includes(type.id);

                  return (
                    <Button
                      key={type.id}
                      variant="ghost"
                      asChild
                      onClick={() => !isAlreadyExists && toggleDataType(type.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 h-auto rounded-[var(--radius-inner)] border-2 transition-all gap-2 relative ring-offset-0",
                        isSelected
                          ? "bg-primary/5 border-primary text-primary hover:bg-primary/5"
                          : isAlreadyExists
                            ? "bg-emerald-50/30 border-emerald-200 text-emerald-600/80 cursor-not-allowed opacity-70 hover:bg-emerald-50/30"
                            : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100/80 hover:border-slate-200"
                      )}
                    >
                      <div>
                        <div className="relative">
                          <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : isAlreadyExists ? "text-emerald-500/70" : "text-slate-400" )} />
                          {isAlreadyExists && (
                            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-white shadow-sm">
                              <Plus className="w-2 h-2 text-white rotate-45" />
                            </div>
                          )}
                        </div>
                        <span className={cn("text-xs font-bold text-center leading-none",
                          isAlreadyExists ? "text-emerald-600/80" : ""
                        )}>
                          {type.title}
                        </span>
                        {isAlreadyExists && (
                          <div className="absolute inset-0 bg-white/20 rounded-[var(--radius-inner)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-black text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-emerald-100">Создано</span>
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>



            {error && (
              <p className="text-xs font-bold text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </p>
            )}
          </div>

          <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end lg:justify-between gap-3 shrink-0">
            <Button 
              variant="ghost" 
              color="gray"
              onClick={() => setIsOpen(false)}
              className="flex-1 lg:flex-none h-11 lg:px-8 font-bold text-sm rounded-xl"
            >
              Отмена
            </Button>
            <SubmitButton 
              isLoading={isLoading} 
              disabled={isLoading} 
              className="h-11 flex-1 lg:flex-none lg:px-10 rounded-xl shadow-sm border-none font-bold text-sm" 
              text="Создать" 
              loadingText="Создание..." 
            />
          </div>
        </form>
      </ResponsiveModal>

    </>
  );
}
