import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNewItemForm, DEFAULT_FORM_DATA } from "./useNewItemForm";
import { ItemFormData, Category, StorageLocation, InventoryAttribute, AttributeType } from "@/app/(main)/dashboard/warehouse/types";
import { addInventoryItem } from "@/app/(main)/dashboard/warehouse/item-actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ROUTES } from "@/lib/routes";

const CATEGORY_TYPES = {
    packaging: "упаковка",
    clothing: "одежда",
    consumables: "расходники",
    uncategorized: "без категории",
} as const;

interface UseNewItemLogicProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
}

export function useNewItemLogic({
    categories,
    initialCategoryId,
    initialSubcategoryId
}: UseNewItemLogicProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [isMounted, setIsMounted] = useState(false);

    const {
        step, setStep,
        selectedCategory, setSelectedCategory,
        formData, setFormData,
        validationError, setValidationError,
        isSaving, setIsSaving,
        isSubmitting, setIsSubmitting,
        resetForm
    } = useNewItemForm();

    const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
        setFormData((prev: ItemFormData) => ({ ...prev, ...updates }));
        if (validationError) setValidationError("");
    }, [validationError, setFormData, setValidationError]);

    // Load initial state and draft after mount
    useEffect(() => {
        Promise.resolve().then(() => {
            setIsMounted(true);
        });

        // 1. Initial params
        let initialStep = 0;
        let initialCat: Category | null = null;
        let initialForm = { ...DEFAULT_FORM_DATA };

        if (initialSubcategoryId || initialCategoryId) {
            let resolvedSubId = initialSubcategoryId;
            let resolvedCatId = initialCategoryId;

            if (!resolvedSubId && resolvedCatId) {
                const cat = categories.find(c => c.id === resolvedCatId);
                if (cat?.parentId) {
                    resolvedSubId = resolvedCatId;
                    resolvedCatId = cat.parentId;
                }
            }

            initialCat = resolvedCatId ? (categories.find(c => c.id === resolvedCatId) || null) : null;

            if (initialCat) {
                const hasSubs = categories.some(c => c.parentId === initialCat?.id);
                if (!hasSubs || resolvedSubId) {
                    initialStep = 2;
                }
            }

            if (resolvedSubId) {
                const subCat = categories.find(c => c.id === resolvedSubId);
                const isClothing = subCat?.name.toLowerCase().includes(CATEGORY_TYPES.clothing) || initialCat?.name.toLowerCase().includes(CATEGORY_TYPES.clothing);
                initialForm = {
                    ...initialForm,
                    subcategoryId: resolvedSubId,
                    unit: isClothing ? "шт." : initialForm.unit
                };
            }
        } else {
            // 2. Draft
            const saved = typeof window !== "undefined" ? localStorage.getItem("merch_crm_new_item_draft") : null;
            if (saved) {
                try {
                    const draft = JSON.parse(saved);
                    initialStep = draft.step || 0;
                    if (draft.selectedCategoryId) {
                        initialCat = categories.find(c => c.id === draft.selectedCategoryId) || null;
                    }
                    if (draft.formData) {
                        initialForm = {
                            ...initialForm,
                            ...draft.formData,
                            imageFile: null, imageBackFile: null, imageSideFile: null,
                            imageDetailsFiles: [], imagePreview: null,
                            imageBackPreview: null, imageSidePreview: null,
                            imageDetailsPreviews: []
                        };
                    }
                } catch (e) {
                    console.error("Error parsing draft:", e);
                }
            }
        }

        Promise.resolve().then(() => {
            setStep(initialStep);
            setSelectedCategory(initialCat);
            setFormData(initialForm);
        });
    }, [categories, initialCategoryId, initialSubcategoryId]);

    // Save draft on changes
    useEffect(() => {
        if (!isMounted) return;
        Promise.resolve().then(() => {
            setIsSaving(true);
        });
        const timer = setTimeout(() => {
            const dataToSave = {
                formData: {
                    ...formData,
                    imageFile: null,
                    imageBackFile: null,
                    imageSideFile: null,
                    imageDetailsFiles: [],
                    imagePreview: null,
                    imageBackPreview: null,
                    imageSidePreview: null,
                    imageDetailsPreviews: []
                },
                step,
                selectedCategoryId: selectedCategory?.id
            };
            if (typeof window !== "undefined") {
                localStorage.setItem("merch_crm_new_item_draft", JSON.stringify(dataToSave));
            }
            setIsSaving(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData, step, selectedCategory, isMounted]);

    const clearDraft = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("merch_crm_new_item_draft");
        }
    };

    const handleReset = () => {
        clearDraft();
        resetForm();
        toast("Форма сброшена", "info");
    };

    const subCategories = selectedCategory
        ? categories.filter(c => c.parentId === selectedCategory.id)
        : [];

    const isPackaging = selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.packaging);

    const topLevelCategories = categories
        .filter(c => !c.parentId || c.parentId === "")
        .sort((a, b) => {
            if (a.name.toLowerCase().includes(CATEGORY_TYPES.uncategorized)) return 1;
            if (b.name.toLowerCase().includes(CATEGORY_TYPES.uncategorized)) return -1;
            return a.name.localeCompare(b.name);
        });

    const hasSubCategories = subCategories.length > 0;

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setValidationError("");

        setFormData((prev: ItemFormData) => ({
            ...prev,
            subcategoryId: "",
            brandCode: "",
            qualityCode: "",
            materialCode: "",
            attributeCode: "",
            sizeCode: "",
            itemName: "",
            unit: category.name.toLowerCase().includes(CATEGORY_TYPES.clothing) ? "шт." : prev.unit || "шт."
        }));
    };

    const handleSubCategorySelect = (subCategory: Category) => {
        setValidationError("");
        updateFormData({ subcategoryId: subCategory.id });
    };

    const handleBack = () => {
        setValidationError("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (step === 2) {
            setStep(0);
        } else if (step === 1) {
            setStep(0);
        } else if (step > 2) {
            setStep(step - 1);
        } else {
            router.push(ROUTES.WAREHOUSE.CATEGORIES);
        }
    };

    const validateStep = (currentStep: number): boolean => {
        setValidationError("");
        if (currentStep === 0) {
            if (!selectedCategory) {
                setValidationError("Выберите категорию");
                return false;
            }
            const currentSubCategories = categories.filter(c => c.parentId === selectedCategory.id);
            if (currentSubCategories.length > 0 && !formData.subcategoryId) {
                setValidationError("Выберите подкатегорию");
                return false;
            }
        }

        const isClothing = selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.clothing);
        const isPackaging = selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.packaging);

        if (currentStep === 2) {
            if (hasSubCategories && !formData.subcategoryId) {
                setValidationError("Выберите подкатегорию");
                return false;
            }

            if (isClothing) {
                if (!formData.brandCode) {
                    setValidationError("Выберите бренд");
                    return false;
                }
                if (!formData.qualityCode) {
                    setValidationError("Выберите качество");
                    return false;
                }
                if (!formData.materialCode) {
                    setValidationError("Выберите материал");
                    return false;
                }
                if (!formData.attributeCode) {
                    setValidationError("Выберите цвет");
                    return false;
                }
                if (!formData.sizeCode) {
                    setValidationError("Выберите размер");
                    return false;
                }
            } else if (isPackaging) {
                if (!formData.depth || !formData.width || !formData.height) {
                    setValidationError("Укажите все габариты (Длина, Ширина, Высота)");
                    return false;
                }
                if (!formData.weight) {
                    setValidationError("Укажите вес единицы упаковки");
                    return false;
                }
            } else {
                if (!formData.itemName) {
                    setValidationError("Введите название позиции");
                    return false;
                }
            }
        }

        if (currentStep === 3) {
            if (!formData.imagePreview) {
                setValidationError("Загрузите хотя бы основное фото товара");
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (!validateStep(step)) return;
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setIsSubmitting(true);
        setValidationError("");

        try {
            const submitFormData = new FormData();

            let itemType = "clothing";
            if (selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.packaging)) itemType = "packaging";
            else if (selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.consumables)) itemType = "consumables";

            submitFormData.append("itemType", itemType);

            submitFormData.append("name", formData.itemName || "");
            submitFormData.append("categoryId", formData.subcategoryId || selectedCategory?.id || "");
            submitFormData.append("sku", formData.sku || "");
            submitFormData.append("unit", formData.unit || "шт.");
            submitFormData.append("description", formData.description || "");
            submitFormData.append("quantity", String(formData.quantity) || "0");
            submitFormData.append("criticalStockThreshold", String(formData.criticalStockThreshold) || "0");
            submitFormData.append("lowStockThreshold", String(formData.lowStockThreshold) || "10");
            submitFormData.append("storageLocationId", formData.storageLocationId || "");
            submitFormData.append("costPrice", String(formData.costPrice) || "0");
            submitFormData.append("sellingPrice", String(formData.sellingPrice) || "0");

            submitFormData.append("qualityCode", formData.qualityCode || "");
            submitFormData.append("materialCode", formData.materialCode || "");
            submitFormData.append("brandCode", formData.brandCode || "");
            submitFormData.append("attributeCode", formData.attributeCode || "");
            submitFormData.append("sizeCode", formData.sizeCode || "");

            if (formData.width) submitFormData.append("width", String(formData.width));
            if (formData.height) submitFormData.append("height", String(formData.height));
            if (formData.depth) submitFormData.append("depth", String(formData.depth));
            if (formData.department) submitFormData.append("department", formData.department);

            if (formData.packagingType) submitFormData.append("packagingType", formData.packagingType);
            if (formData.supplierName) submitFormData.append("supplierName", formData.supplierName);
            if (formData.supplierLink) submitFormData.append("supplierLink", formData.supplierLink);
            if (formData.minBatch) submitFormData.append("minBatch", String(formData.minBatch));
            if (formData.weight) submitFormData.append("weight", String(formData.weight));
            if (formData.features) submitFormData.append("features", JSON.stringify(formData.features));

            if (formData.imageFile) submitFormData.append("image", formData.imageFile);
            if (formData.imageBackFile) submitFormData.append("imageBack", formData.imageBackFile);
            if (formData.imageSideFile) submitFormData.append("imageSide", formData.imageSideFile);
            formData.imageDetailsFiles?.forEach((img: File | null) => {
                if (img) submitFormData.append("imageDetails", img);
            });

            const attributes: Record<string, unknown> = {
                ...formData.attributes,
                thumbnailSettings: formData.thumbSettings
            };
            submitFormData.append("thumbnailSettings", JSON.stringify(formData.thumbSettings));
            submitFormData.append("attributes", JSON.stringify(attributes));

            const result = await addInventoryItem(submitFormData);

            if (!result?.success) {
                setValidationError(result.error);
                playSound("notification_error");
                setIsSubmitting(false);
            } else {
                clearDraft();
                playSound("item_created");
                toast("Позиция создана", "success");
                router.push(result.data?.id ? ROUTES.WAREHOUSE.ITEM_DETAIL(result.data.id) : ROUTES.WAREHOUSE.ROOT);
                router.refresh();
            }
        } catch (error) {
            console.error("[NEW_ITEM_SUBMIT] Error creating item:", error);
            setValidationError(
                error instanceof Error
                    ? error.message
                    : "Произошла ошибка при создании позиции"
            );
            playSound("notification_error");
            setIsSubmitting(false);
        }
    };

    const handleSidebarClick = (targetStep: number) => {
        if (targetStep === step) return;

        if (targetStep < step) {
            setStep(targetStep);
            setValidationError("");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (validateStep(step)) {
                if (targetStep > 2 && step < 2) {
                    if (validateStep(2)) {
                        setStep(targetStep);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    setStep(targetStep);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    };

    return {
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
    };
}
