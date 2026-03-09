"use client";

import { FinishedLineSelectStep } from "./components/finished-line-select-step";
import { PrintSelectionStep } from "./components/print-selection-step";
import { FinishedLineMatrixStep } from "./components/finished-line-matrix-step";
import { FinishedLineSummaryStep } from "./components/finished-line-summary-step";
import { CategoryStep } from "./components/category-step";
import { PositionTypeStep } from "./components/position-type-step";
import { LineCharacteristicsStep } from "./components/line-characteristics-step";
import { LineMatrixStep } from "./components/line-matrix-step";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { PackagingBasicInfoStep } from "./components/packaging-basic-info-step";
import { SummaryStep } from "./components/summary-step";
import { LineSummaryStep } from "./components/line-summary-step";
import { NewItemSidebar } from "./components/new-item-sidebar";
import {
    InventoryAttribute,
    AttributeType,
    Category,
    StorageLocation,
} from "../../types";
import { useNewItemLogic } from "./hooks/useNewItemLogic";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface NewItemPageClientProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
    attributeTypes: AttributeType[];
    users: { id: string; name: string; roleName?: string }[];
}

export function NewItemPageClient({
    categories,
    storageLocations,
    dynamicAttributes,
    initialCategoryId,
    initialSubcategoryId,
    attributeTypes,
    users,
}: NewItemPageClientProps) {
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Склад", href: "/dashboard/warehouse" },
            { label: "Создание позиции", href: "/dashboard/warehouse/items/new" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const logic = useNewItemLogic({
        categories,
        storageLocations,
        dynamicAttributes,
        attributeTypes,
        initialCategoryId,
        initialSubcategoryId,
    });

    const {
        step,
        maxStep,
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
        setValidationError,
        // Состояния для линеек
        creationType,
        setCreationType,
        lineMode,
        setLineMode,
        selectedLineId,
        setSelectedLineId,
        selectedCollectionId,
        setSelectedCollectionId,
        lineName,
        lineDescription,
        commonAttributes,
        matrixSelection,
        setMatrixSelection,
        selectedPrintIds,
        setSelectedPrintIds,
        generatedPositions,
        setGeneratedPositions,
        getSteps,
        lineData,
        setLineData,
        getLineName,
        availableBaseLines,
        availablePrints,
        isLoadingData,
    } = logic;

    const steps = getSteps();
    const isLineCreation = creationType !== "single";

    const categoryAttributes = useMemo(() => {
        return attributeTypes.reduce((acc, t) => {
            const isCategoryMatched = !t.categoryId || t.categoryId === selectedCategory?.id || (formData.subcategoryId && t.categoryId === formData.subcategoryId);
            if (!isCategoryMatched) return acc;

            const values = dynamicAttributes.reduce((valAcc, a) => {
                if (a.type === t.slug) {
                    valAcc.push({ id: a.id, value: a.value, label: a.name });
                }
                return valAcc;
            }, [] as { id: string; value: string; label: string }[]);

            acc.push({
                id: t.id,
                code: t.slug,
                name: t.name,
                values,
                categoryId: t.categoryId
            });
            return acc;
        }, [] as { id: string; code: string; name: string; categoryId?: string | null; values: { id: string; value: string; label: string }[] }[]);
    }, [attributeTypes, dynamicAttributes, selectedCategory?.id, formData.subcategoryId]);

    // Типы характеристик, отфильтрованные по текущей категории/подкатегории (для матрицы и CommonAttributes)
    const filteredAttributeTypes = useMemo(() => {
        return attributeTypes.filter(t => {
            return !t.categoryId ||
                t.categoryId === selectedCategory?.id ||
                (formData.subcategoryId && t.categoryId === formData.subcategoryId);
        });
    }, [attributeTypes, selectedCategory?.id, formData.subcategoryId]);

    return (
        <div className="flex flex-col w-full max-w-[1440px] mx-auto xl:px-0">
            <div className="flex flex-col xl:flex-row xl:h-[calc(100vh-160px)] gap-3 w-full">
                <NewItemSidebar
                    step={step}
                    maxStep={maxStep}
                    steps={steps}
                    isSaving={isSaving}
                    hasSubCategories={hasSubCategories}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    onStepClick={handleSidebarClick}
                />

                <div className="flex-1 min-w-0 relative h-full flex flex-col !overflow-visible">
                    <div className="relative flex-1 min-w-0 flex flex-col min-h-0 !overflow-visible">
                        <div className="crm-card !rounded-3xl shadow-sm transition-all duration-300 flex flex-col h-full min-h-0 relative !p-0">
                            <AnimatePresence mode="wait">
                                {/* Шаг 0: Категория */}
                                {step === 0 && (
                                    <motion.div
                                        key="step-0"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <CategoryStep
                                            topLevelCategories={topLevelCategories}
                                            subCategories={subCategories}
                                            selectedCategory={selectedCategory}
                                            formData={formData}
                                            validationError={validationError}
                                            onCategorySelect={handleCategorySelect}
                                            onSubCategorySelect={handleSubCategorySelect}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            setValidationError={setValidationError}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 1: Тип создания */}
                                {step === 1 && selectedCategory && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <PositionTypeStep
                                            categoryId={formData.subcategoryId || selectedCategory.id}
                                            state={{
                                                creationType,
                                                lineMode,
                                                selectedLineId,
                                                selectedCollectionId,
                                                validationError
                                            }}
                                            actions={{
                                                onCreationTypeChange: setCreationType,
                                                onLineModeChange: setLineMode,
                                                onLineSelect: setSelectedLineId,
                                                onCollectionSelect: setSelectedCollectionId,
                                                onNext: handleNext,
                                                onBack: handleBack,
                                                setValidationError
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 2: Характеристики линейки (для новой БАЗОВОЙ линейки) */}
                                {step === 2 && creationType === "base_line" && lineMode === "new" && (
                                    <motion.div
                                        key="step-2-line"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <LineCharacteristicsStep
                                            categoryAttributes={categoryAttributes}
                                            selectedAttributes={formData.attributes || {}}
                                            updateFormData={updateFormData}
                                            commonAttributeIds={lineData.commonAttributeIds}
                                            customLineName={lineData.customName}
                                            lineDescription={lineData.description}
                                            onCommonAttributesChange={(ids) => setLineData(prev => ({ ...prev, commonAttributeIds: ids }))}
                                            onLineNameChange={(name) => setLineData(prev => ({ ...prev, customName: name }))}
                                            onLineDescriptionChange={(desc) => setLineData(prev => ({ ...prev, description: desc }))}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            errors={validationError ? { global: validationError } : {}}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 2: Выбор базы и принта (для ГОТОВОЙ линейки) */}
                                {step === 2 && creationType === "finished_line" && (
                                    <motion.div
                                        key="step-2-finished"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <FinishedLineSelectStep
                                            collections={[]}
                                            baseLines={availableBaseLines}
                                            selectedCollectionId={selectedCollectionId}
                                            selectedBaseLineId={selectedLineId || null}
                                            isLoading={isLoadingData}
                                            onCollectionChange={(id) => setSelectedCollectionId(id || "")}
                                            onBaseLineChange={(id) => setSelectedLineId(id || "")}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            errors={validationError ? { global: validationError } : {}}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 3: Выбор принтов (для ГОТОВОЙ линейки) */}
                                {step === 3 && creationType === "finished_line" && (
                                    <motion.div
                                        key="step-3-finished-prints"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <PrintSelectionStep
                                            collectionName={availableBaseLines.find(l => l.id === selectedLineId)?.name || "Продукт"}
                                            prints={availablePrints}
                                            selectedPrintIds={selectedPrintIds}
                                            onSelectionChange={setSelectedPrintIds}
                                            onBack={handleBack}
                                            onNext={handleNext}
                                            errors={validationError ? { prints: validationError } : {}}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 4: Матрица вариантов (для ГОТОВОЙ линейки) */}
                                {step === 4 && creationType === "finished_line" && (
                                    <motion.div
                                        key="step-4-finished-matrix"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <FinishedLineMatrixStep
                                            collectionName={availableBaseLines.find(l => l.id === selectedLineId)?.name || "Продукт"}
                                            baseLineName={availableBaseLines.find(l => l.id === selectedLineId)?.name || "Базовая линейка"}
                                            selectedPrintsCount={selectedPrintIds.length}
                                            availableColors={availableBaseLines.find(l => l.id === selectedLineId)?.colors || []}
                                            availableSizes={availableBaseLines.find(l => l.id === selectedLineId)?.sizes || []}
                                            selection={{
                                                colors: (matrixSelection as Record<string, string[]>).colors || [],
                                                sizes: (matrixSelection as Record<string, string[]>).sizes || []
                                            }}
                                            onSelectionChange={(s) => setMatrixSelection(s as never)}
                                            onBack={handleBack}
                                            onNext={handleNext}
                                            errors={validationError ? { global: validationError } : {}}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 2: Характеристики одиночной позиции */}
                                {step === 2 && creationType === "single" && selectedCategory && (
                                    <motion.div
                                        key="step-2-single"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        {isPackaging ? (
                                            <PackagingBasicInfoStep
                                                category={selectedCategory}
                                                categories={categories}
                                                subCategories={subCategories}
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
                                                categories={categories}
                                                subCategories={subCategories}
                                                dynamicAttributes={dynamicAttributes}
                                                attributeTypes={attributeTypes}
                                                formData={formData}
                                                updateFormData={updateFormData}
                                                onNext={handleNext}
                                                onBack={handleBack}
                                                validationError={validationError}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {/* Шаг 3: Матрица позиций (для БАЗОВЫХ линеек) */}
                                {step === 3 && creationType === "base_line" && (
                                    <motion.div
                                        key="step-3-matrix-base"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <LineMatrixStep
                                            category={selectedCategory!}
                                            attributeTypes={filteredAttributeTypes}
                                            dynamicAttributes={dynamicAttributes}
                                            commonAttributes={commonAttributes}
                                            matrixSelection={matrixSelection}
                                            onMatrixSelectionChange={setMatrixSelection}
                                            generatedPositions={generatedPositions}
                                            onPositionsGenerated={setGeneratedPositions}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            validationError={validationError}
                                            setValidationError={setValidationError}
                                            isFinishedLine={false}
                                            selectedDesigns={[]}
                                            onDesignsChange={() => { }}
                                            availableDesigns={[]}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 3: Медиа (для одиночной) */}
                                {step === 3 && creationType === "single" && (
                                    <motion.div
                                        key="step-3-media"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        <MediaStep
                                            category={selectedCategory}
                                            formData={formData}
                                            updateFormData={updateFormData}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                        />
                                    </motion.div>
                                )}

                                {/* Шаг 4: Склад (кроме готовой) */}
                                {step === 4 && creationType !== "finished_line" && selectedCategory && (
                                    <motion.div
                                        key="step-4"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
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
                                    </motion.div>
                                )}

                                {/* Шаг 5: Итог */}
                                {step === 5 && selectedCategory && (
                                    <motion.div
                                        key="step-5"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="h-full w-full flex flex-col"
                                    >
                                        {creationType === "finished_line" ? (
                                            <FinishedLineSummaryStep
                                                lineName={getLineName()}
                                                collectionName={availablePrints?.[0]?.collectionName || "Коллекция"}
                                                baseLineName={availableBaseLines.find(l => l.id === selectedLineId)?.name || "Базовая линейка"}
                                                positions={generatedPositions.map(p => ({
                                                    tempId: p.tempId || Math.random().toString(36).substr(2, 9),
                                                    name: p.name,
                                                    sku: p.sku,
                                                    printName: p.printName || "",
                                                    colorName: p.colorName || "",
                                                    sizeName: p.sizeName || ""
                                                }))}
                                                isSaving={isSubmitting}
                                                onBack={handleBack}
                                                onSubmit={handleSubmit}
                                                errors={validationError ? { submit: validationError } : {}}
                                            />
                                        ) : isLineCreation ? (
                                            <LineSummaryStep
                                                category={selectedCategory}
                                                lineName={lineName}
                                                lineDescription={lineDescription}
                                                lineType={creationType}
                                                lineMode={lineMode}
                                                positions={generatedPositions}
                                                commonAttributes={commonAttributes}
                                                attributeTypes={attributeTypes}
                                                dynamicAttributes={dynamicAttributes}
                                                formData={formData}
                                                storageLocations={storageLocations}
                                                onSubmit={handleSubmit}
                                                onBack={handleBack}
                                                validationError={validationError}
                                                isSubmitting={isSubmitting}
                                            />
                                        ) : (
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
