"use client";

import { Category, ItemFormData, StorageLocation, InventoryAttribute, AttributeType } from "@/app/(main)/dashboard/warehouse/types";
import { StepFooter } from "./step-footer";
import { useIsMobile } from "@/hooks/use-mobile";

import { useSummaryLogic } from "./summary/hooks/useSummaryLogic";
import { LivePreviewCard } from "./live-preview-card";

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
    attributeTypes,
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
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
                <div className="space-y-3 sm:space-y-3 pb-2 p-4 sm:p-6 lg:p-8">
                    {/* Item Name & Status Header */}
                    <LivePreviewCard
                        formData={formData}
                        category={category}
                        attributeTypes={attributeTypes}
                        dynamicAttributes={dynamicAttributes}
                        activeSubcategory={logic.activeSubcategory}
                        accentColor={logic.accentColor}
                        isMobile={isMobile}
                        nameEdit={{
                            isEditing: logic.isEditingName,
                            tempName: logic.tempName || "",
                            onEditClick: () => logic.setIsEditingName(true),
                            onNameChange: logic.setTempName,
                            onSaveName: logic.handleSaveName,
                            onCancelName: logic.handleCancelName,
                            onKeyDown: logic.handleKeyDown,
                        }}
                    />

                    {/* Finance & Storage — 2 equal columns on desktop, 1 on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3 items-stretch">
                        <FinanceCard formData={formData} />

                        <StorageCard
                            formData={formData}
                            storageLocations={storageLocations}
                        />
                    </div>

                    {/* Photo Gallery */}
                    <ImageGallery formData={formData} />
                </div>
            </div>

            <div className="mt-auto shrink-0">
                <StepFooter
                    onBack={onBack}
                    onNext={onSubmit}
                    nextLabel="Создать позицию"
                    isSubmitting={isSubmitting}
                    validationError={validationError}
                />
            </div>

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
