import { useState, useCallback } from "react";
import { ItemFormData, Category } from "@/app/(main)/dashboard/warehouse/types";

export const DEFAULT_FORM_DATA: ItemFormData = {
    subcategoryId: "",
    brandCode: "",
    qualityCode: "",
    materialCode: "",
    attributeCode: "",
    sizeCode: "",
    itemName: "",
    sku: "",
    unit: "шт.",
    description: "",
    width: "",
    height: "",
    depth: "",
    department: "",
    imageFile: null,
    imageBackFile: null,
    imageSideFile: null,
    imageDetailsFiles: [],
    imagePreview: null,
    imageBackPreview: null,
    imageSidePreview: null,
    imageDetailsPreviews: [],
    thumbSettings: { zoom: 1, x: 0, y: 0 },
    storageLocationId: "",
    quantity: "0",
    criticalStockThreshold: "0",
    lowStockThreshold: "10",
    costPrice: "0",
    sellingPrice: "0",
    responsibleUserId: "",
    attributes: {}
};

export function useNewItemForm() {
    const [step, setStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<ItemFormData>(DEFAULT_FORM_DATA);
    const [validationError, setValidationError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
        setFormData((prev: ItemFormData) => ({ ...prev, ...updates }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(DEFAULT_FORM_DATA);
        setStep(0);
        setSelectedCategory(null);
        setValidationError("");
    }, []);

    return {
        step,
        setStep,
        selectedCategory,
        setSelectedCategory,
        formData,
        setFormData,
        updateFormData,
        validationError,
        setValidationError,
        isSaving,
        setIsSaving,
        isSubmitting,
        setIsSubmitting,
        resetForm
    };
}
