"use client";

import { CategoryStep } from "./components/category-step";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { PackagingBasicInfoStep } from "./components/packaging-basic-info-step";
import { SummaryStep } from "./components/summary-step";
import { NewItemSidebar } from "./components/new-item-sidebar";
import { InventoryAttribute, AttributeType, Category, StorageLocation } from "../../types";
import { useNewItemLogic } from "./hooks/useNewItemLogic";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { useEffect } from "react";

interface NewItemPageClientProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    measurementUnits: { id: string; name: string }[];
    dynamicAttributes: InventoryAttribute[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
    attributeTypes: AttributeType[];
    users: { id: string; name: string }[];
}

export function NewItemPageClient({
    categories,
    storageLocations,
    measurementUnits,
    dynamicAttributes,
    initialCategoryId,
    initialSubcategoryId,
    attributeTypes,
    users
}: NewItemPageClientProps) {
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Склад", href: "/dashboard/warehouse" },
            { label: "Создание позиции", href: "/dashboard/warehouse/items/new" }
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const {
        step,
        selectedCategory,
        formData,
        validationError,
        isSaving,
        isSubmitting,
        subCategories,
        isPackaging,
        topLevelCategories,
        hasSubCategories,
        updateFormData,
        handleCategorySelect,
        handleSubCategorySelect,
        handleBack,
        handleNext,
        handleSubmit,
        handleReset,
        handleSidebarClick,
        setValidationError
    } = useNewItemLogic({
        categories,
        storageLocations,
        initialCategoryId,
        initialSubcategoryId,
        attributeTypes
    });

    const steps = [
        { id: 0, title: "Категория", desc: "Выбор категории" },
        { id: 2, title: "Описание", desc: "Характеристики" },
        { id: 3, title: "Галерея", desc: "Фото и медиа" },
        { id: 4, title: "Склад", desc: "Остатки и хранение" },
        { id: 5, title: "Итог", desc: "Проверка и создание" }
    ];

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col xl:flex-row xl:h-[calc(100vh-160px)] gap-2 xl:gap-2 w-full">
                <NewItemSidebar
                    step={step}
                    steps={steps}
                    isSaving={isSaving}
                    hasSubCategories={hasSubCategories}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    onStepClick={handleSidebarClick}
                />

                <div className="flex-1 min-w-0 relative h-full flex flex-col gap-2 !overflow-visible">
                    <div className="relative flex-1 min-w-0 flex flex-col min-h-0 !overflow-visible">
                        <div className="crm-card !rounded-3xl shadow-sm transition-all duration-300 flex flex-col h-full min-h-0 relative !overflow-visible !p-0">
                            {step === 0 && (
                                <CategoryStep
                                    topLevelCategories={topLevelCategories}
                                    subCategories={subCategories}
                                    selectedCategory={selectedCategory}
                                    formData={formData}
                                    validationError={validationError}
                                    onCategorySelect={handleCategorySelect}
                                    onSubCategorySelect={handleSubCategorySelect}
                                    onNext={() => {
                                        if (!selectedCategory) {
                                            setValidationError("Выберите категорию");
                                            return;
                                        }
                                        if (subCategories.length > 0 && !formData.subcategoryId) {
                                            setValidationError("Выберите подкатегорию");
                                            return;
                                        }
                                        handleNext();
                                    }}
                                    onBack={handleBack}
                                    setValidationError={setValidationError}
                                />
                            )}

                            {step === 2 && selectedCategory && (
                                isPackaging ? (
                                    <PackagingBasicInfoStep
                                        category={selectedCategory}
                                        subCategories={subCategories}
                                        measurementUnits={measurementUnits}
                                        dynamicAttributes={dynamicAttributes}
                                        attributeTypes={attributeTypes}
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        validationError={validationError}
                                    />
                                ) : (
                                    <BasicInfoStep
                                        category={selectedCategory}
                                        subCategories={subCategories}
                                        measurementUnits={measurementUnits}
                                        dynamicAttributes={dynamicAttributes}
                                        attributeTypes={attributeTypes}
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        validationError={validationError}
                                    />
                                )
                            )}

                            {step === 3 && (
                                <MediaStep
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}

                            {step === 4 && selectedCategory && (
                                <StockStep
                                    category={selectedCategory}
                                    storageLocations={storageLocations}
                                    users={users}
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    validationError={validationError}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {step === 5 && selectedCategory && (
                                <SummaryStep
                                    category={selectedCategory}
                                    subCategories={subCategories}
                                    storageLocations={storageLocations}
                                    dynamicAttributes={dynamicAttributes}
                                    attributeTypes={attributeTypes}
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    onSubmit={handleSubmit}
                                    onBack={handleBack}
                                    validationError={validationError}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
