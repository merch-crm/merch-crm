"use client";

import { Category, ItemFormData, StorageLocation, InventoryAttribute, AttributeType } from "@/app/(main)/dashboard/warehouse/types";
import { StepFooter } from "./step-footer";
import { useIsMobile } from "@/hooks/use-mobile";

import { useSummaryLogic } from "./summary/hooks/useSummaryLogic";
import { SummaryHeader } from "./summary/summary-header";
import { AttributesSection } from "./summary/attributes-section";
import { ImageGallery } from "./summary/image-gallery";
import { StorageCard } from "./summary/storage-card";
import { FinanceCard } from "./summary/finance-card";
import { MobileEditSheet } from "./summary/mobile-edit-sheet";

interface SummaryStepProps {
    category: Category;
    subCategories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onSubmit: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function SummaryStep({
    category,
    subCategories,
    storageLocations,
    dynamicAttributes,
    // attributeTypes, // unused
    formData,
    updateFormData,
    onSubmit,
    onBack,
    validationError,
    isSubmitting
}: SummaryStepProps) {
    const isMobile = useIsMobile();
    const logic = useSummaryLogic({ formData, updateFormData, subCategories, dynamicAttributes });

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 px-4 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-10 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-3">
                    {/* Item Name & Status Header */}
                    <SummaryHeader
                        formData={formData}
                        category={category}
                        activeSubcategory={logic.activeSubcategory}
                        accentColor={logic.accentColor}
                        isMobile={isMobile}
                        isEditingName={logic.isEditingName}
                        tempName={logic.tempName || ""}
                        onEditClick={() => logic.setIsEditingName(true)}
                        onNameChange={logic.setTempName}
                        onSaveName={logic.handleSaveName}
                        onCancelName={logic.handleCancelName}
                        onKeyDown={logic.handleKeyDown}
                    />

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-12 gap-3 sm:gap-3">
                        {/* Left Column: Attributes & Gallery */}
                        <div className="col-span-12 lg:col-span-7 space-y-3 sm:space-y-3">
                            <AttributesSection
                                formData={formData}
                                dynamicAttributes={dynamicAttributes}
                                selectedColorName={logic.selectedColor?.name}
                                selectedColorHex={logic.selectedColor?.hex}
                                getAttrName={logic.getAttrName}
                            />

                            <ImageGallery formData={formData} />
                        </div>

                        {/* Right Column: Inventory & Financials Section */}
                        <div className="col-span-12 lg:col-span-5 space-y-3">
                            <StorageCard
                                formData={formData}
                                storageLocations={storageLocations}
                            />

                            <FinanceCard formData={formData} />
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onSubmit}
                nextLabel="Создать позицию"
                isSubmitting={isSubmitting}
                validationError={validationError}
            />

            {/* Mobile Name Edit Sheet */}
            <MobileEditSheet
                isOpen={logic.isEditingName && isMobile}
                tempName={logic.tempName || ""}
                onClose={() => logic.setIsEditingName(false)}
                onNameChange={logic.setTempName}
                onSaveName={logic.handleSaveName}
                onCancelName={logic.handleCancelName}
            />
        </div>
    );
}
