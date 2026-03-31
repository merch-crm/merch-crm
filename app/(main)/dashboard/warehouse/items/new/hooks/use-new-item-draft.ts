"use client";

import { useEffect } from "react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

export function useNewItemDraft(
    isMounted: boolean,
    state: {
        formData: ItemFormData;
        step: number;
        maxStep: number;
        selectedCategory?: { id: string } | null;
        creationType: string;
        lineMode: string;
        selectedLineId: string;
        selectedCollectionId: string;
        lineName: string;
        lineDescription: string;
        commonAttributes: Record<string, { isCommon: boolean; value: string }>;
        matrixSelection: Record<string, string[]>;
        selectedPrintIds: string[];
    },
    setIsSaving: (val: boolean) => void
) {
    useEffect(() => {
        if (!isMounted) return;
        setIsSaving(true);

        const timer = setTimeout(() => {
            const dataToSave = {
                formData: {
                    ...state.formData,
                    imageFile: null,
                    imageBackFile: null,
                    imageSideFile: null,
                    imageDetailsFiles: [],
                    imagePreview: null,
                    imageBackPreview: null,
                    imageSidePreview: null,
                    imageDetailsPreviews: [],
                },
                step: state.step,
                maxStep: state.maxStep,
                selectedCategoryId: state.selectedCategory?.id,
                creationType: state.creationType,
                lineMode: state.lineMode,
                selectedLineId: state.selectedLineId,
                selectedCollectionId: state.selectedCollectionId,
                lineName: state.lineName,
                lineDescription: state.lineDescription,
                commonAttributes: state.commonAttributes,
                matrixSelection: state.matrixSelection,
                selectedPrintIds: state.selectedPrintIds,
            };

            if (typeof window !== "undefined") {
                localStorage.setItem("merch_crm_new_item_draft", JSON.stringify(dataToSave));
            }
            setIsSaving(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        state.formData, state.step, state.maxStep, state.selectedCategory,
        state.creationType, state.lineMode, state.selectedLineId,
        state.selectedCollectionId, state.lineName, state.lineDescription,
        state.commonAttributes, state.matrixSelection, state.selectedPrintIds,
        isMounted, setIsSaving
    ]);

    const clearDraft = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("merch_crm_new_item_draft");
        }
    };

    return { clearDraft };
}
