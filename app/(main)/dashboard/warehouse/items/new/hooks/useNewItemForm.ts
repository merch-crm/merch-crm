import { useState, useCallback, useMemo } from "react";
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
  costPrice: "",
  sellingPrice: "",
  responsibleUserId: "",
  attributes: {}
};

export function useNewItemForm() {
  const [step, _setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(DEFAULT_FORM_DATA);
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setStep = useCallback((val: number | ((prev: number) => number)) => {
    _setStep(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setMaxStep(m => Math.max(m, next));
      return next;
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<ItemFormData> | ((prev: ItemFormData) => Partial<ItemFormData>)) => {
    setFormData((prev: ItemFormData) => {
      const resolvedUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...resolvedUpdates };
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    _setStep(0);
    setMaxStep(0);
    setSelectedCategory(null);
    setValidationError("");
  }, []);

  return useMemo(() => ({
    step,
    setStep,
    maxStep,
    setMaxStep,
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
  }), [
    step, setStep, maxStep, setMaxStep, selectedCategory, setSelectedCategory,
    formData, setFormData, updateFormData, validationError, setValidationError,
    isSaving, setIsSaving, isSubmitting, setIsSubmitting, resetForm
  ]);
}
