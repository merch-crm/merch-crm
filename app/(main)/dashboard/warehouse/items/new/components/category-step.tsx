import { LayoutGrid } from "lucide-react";
import { CategorySelector } from "./category-selector";
import { StepFooter } from "./step-footer";
import { Category, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

interface CategoryStepProps {
    topLevelCategories: Category[];
    subCategories: Category[];
    selectedCategory: Category | null;
    formData: ItemFormData;
    validationError: string;
    onCategorySelect: (category: Category) => void;
    onSubCategorySelect: (subCat: Category) => void;
    onNext: () => void;
    onBack: () => void;
    setValidationError: (err: string) => void;
}

export function CategoryStep({
    topLevelCategories,
    subCategories,
    selectedCategory,
    formData,
    validationError,
    onCategorySelect,
    onSubCategorySelect,
    onNext,
    onBack,
    setValidationError
}: CategoryStepProps) {
    const handleNextClick = () => {
        if (!selectedCategory) {
            setValidationError("Выберите категорию");
            return;
        }
        if (subCategories.length > 0 && !formData.subcategoryId) {
            setValidationError("Выберите подкатегорию");
            return;
        }
        onNext();
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 relative z-10">
                <CategorySelector
                    categories={topLevelCategories}
                    onSelect={onCategorySelect}
                    selectedCategoryId={selectedCategory?.id}
                />

                {selectedCategory && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-200 bg-slate-50/30 pb-6">
                        <div className="px-4 sm:px-10 pt-6 pb-0">
                            <div className="max-w-6xl mx-auto w-full">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                                        <LayoutGrid className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900">Подкатегория</h4>
                                        <p className="text-xs text-slate-500 font-bold opacity-60 mt-1">Выберите уточняющий тип для «{selectedCategory.name}»</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {subCategories.length > 0 ? (
                            <CategorySelector
                                categories={subCategories}
                                onSelect={onSubCategorySelect}
                                variant="compact"
                                hideTitle={true}
                                selectedCategoryId={formData.subcategoryId}
                            />
                        ) : (
                            <div className="px-10 pb-6">
                                <div className="w-full p-6 rounded-[var(--radius)] border-2 border-dashed border-slate-200 bg-white text-slate-400 font-bold flex flex-col items-center gap-2 text-center">
                                    <span>В этой категории нет подкатегорий</span>
                                    <span className="text-xs">Вы можете продолжить выбор</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <StepFooter
                onBack={onBack}
                onNext={handleNextClick}
                validationError={validationError}
            />
        </div>
    );
}
