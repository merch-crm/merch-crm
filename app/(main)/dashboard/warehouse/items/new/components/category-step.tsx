import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
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
        // Outer: flex-col, fills parent height, no overflow
        <div className="flex flex-col h-full min-h-0">

            {/* Content area — grows to fill space, no scroll */}
            <div className="flex-1 flex flex-col min-h-0">

                {/* Top-level categories */}
                <div className={cn(
                    "transition-all duration-700 ease-in-out min-h-0 flex flex-col",
                    selectedCategory
                        ? "flex-1 mb-3"
                        : "flex-1 mb-2 sm:mb-4"
                )}>
                    <CategorySelector
                        categories={topLevelCategories}
                        onSelect={onCategorySelect}
                        selectedCategoryId={selectedCategory?.id}
                        isCompact={!!selectedCategory}
                        rightElement={
                            validationError && (
                                <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-in fade-in slide-in-from-top-4 whitespace-nowrap z-[60]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs font-bold leading-none">{validationError}</span>
                                </div>
                            )
                        }
                    />
                </div>

                {/* Subcategory section — appears when category selected */}
                {selectedCategory && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-top-4 duration-500 pt-2 sm:pt-4 border-t border-slate-100">
                        {/* Subcategory header */}
                        <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">Выберите подкатегорию</h4>
                                <p className="text-xs sm:text-[11px] text-slate-500 font-bold opacity-60 mt-0.5 sm:mt-1 truncate">Для категории «{selectedCategory.name}»</p>
                            </div>
                        </div>

                        {/* Subcategory cards */}
                        <div
                            key={selectedCategory?.id}
                            className="min-h-0 min-h-[80px] xl:min-h-[100px] overflow-hidden animate-in fade-in duration-300"
                        >
                            {subCategories.length > 0 ? (
                                <CategorySelector
                                    categories={subCategories}
                                    onSelect={onSubCategorySelect}
                                    variant="compact"
                                    hideTitle={true}
                                    selectedCategoryId={formData.subcategoryId}
                                    isCompact={false}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-4 px-6 border-2 border-dashed border-slate-200 rounded-[20px] bg-slate-50/50">
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-400 mb-1 text-center">Нет подкатегорий</h3>
                                    <p className="text-xs sm:text-xs text-slate-400 font-medium text-center">Вы можете продолжить выбор</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer — always at the bottom, never scrolls away */}
            <div className="card-breakout card-breakout-bottom shrink-0 mt-2">
                <StepFooter
                    onBack={onBack}
                    onNext={handleNextClick}
                    validationError={undefined}
                />
            </div>
        </div>
    );
}
