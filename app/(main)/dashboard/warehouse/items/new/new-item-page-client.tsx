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
        initialSubcategoryId
    });

    const steps = [
        { id: 0, title: "Тип позиции", desc: "Категория и вид" },
        { id: 2, title: "Описание", desc: "Характеристики" },
        { id: 3, title: "Галерея", desc: "Фото и медиа" },
        { id: 4, title: "Склад", desc: "Остатки и хранение" },
        { id: 5, title: "Итог", desc: "Проверка и создание" }
    ];

    return (
        <div className="flex flex-col">
            <div className="flex flex-col xl:flex-row min-h-[calc(100vh-160px)] gap-3 xl:gap-4">
                <NewItemSidebar
                    step={step}
                    steps={steps}
                    isSaving={isSaving}
                    hasSubCategories={hasSubCategories}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    onStepClick={handleSidebarClick}
                />

                <main className="flex-1 relative h-full flex flex-col gap-3 pb-4 xl:pb-8 px-1">
                    <div className="relative flex-1 flex flex-col min-h-0">
                        <div className="crm-card !p-0 !rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full min-h-0 relative">
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
                </main>
            </div>
        </div>
    );
}
