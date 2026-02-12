"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, RotateCcw, Loader2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { addInventoryItem } from "../../actions";
import { CategorySelector } from "./components/category-selector";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { PackagingBasicInfoStep } from "./components/packaging-basic-info-step";
import { SummaryStep } from "./components/summary-step";
import { StepFooter } from "./components/step-footer";
import { InventoryAttribute, AttributeType, ItemFormData, Category, StorageLocation } from "../../types";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ROUTES } from "@/lib/routes";

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

const DEFAULT_FORM_DATA: ItemFormData = {
    subcategoryId: "",
    brandCode: "",
    qualityCode: "",
    materialCode: "",
    attributeCode: "",
    sizeCode: "",
    itemName: "",
    sku: "",
    unit: "шт",
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

const CATEGORY_TYPES = {
    packaging: "упаковка",
    clothing: "одежда",
    consumables: "расходники",
    uncategorized: "без категории",
} as const;

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
    const router = useRouter();
    const { toast } = useToast();

    // 0: Category
    // 1: SubCategory (conditional)
    // 2: Basic Info
    // 3: Media
    // 4: Stock
    // State with lazy initialization
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState(0);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState<ItemFormData>(DEFAULT_FORM_DATA);

    const [validationError, setValidationError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        if (validationError) setValidationError("");
    }, [validationError]);

    // Load initial state and draft after mount
    useEffect(() => {
        setMounted(true);

        // 1. Initial params
        let initialStep = 0;
        let initialCat: Category | null = null;
        let initialForm = { ...DEFAULT_FORM_DATA };

        if (initialSubcategoryId || initialCategoryId) {
            let resolvedSubId = initialSubcategoryId;
            let resolvedCatId = initialCategoryId;

            // Если передана только категория, но у нее есть родитель - значит это подкатегория
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
                    unit: isClothing ? "шт" : initialForm.unit
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

        setStep(initialStep);
        setSelectedCategory(initialCat);
        setFormData(initialForm);
    }, [categories, initialCategoryId, initialSubcategoryId]);

    // Save draft on changes
    useEffect(() => {
        if (!mounted) return;
        setIsSaving(true);
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
        }, 1000); // Debounce saving

        return () => clearTimeout(timer);
    }, [formData, step, selectedCategory, mounted]);

    const clearDraft = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("merch_crm_new_item_draft");
        }
    };



    const handleReset = () => {
        clearDraft();
        setStep(0);
        setSelectedCategory(null);
        setValidationError("");
        setFormData(DEFAULT_FORM_DATA);
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

        // Reset form
        setFormData(prev => ({
            ...prev,
            subcategoryId: "",
            brandCode: "",
            qualityCode: "",
            materialCode: "",
            attributeCode: "",
            sizeCode: "",
            itemName: "",
            unit: category.name.toLowerCase().includes(CATEGORY_TYPES.clothing) ? "шт" : prev.unit || "шт"
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
            // From Basic Info -> Category Selection
            setStep(0);
        } else if (step === 1) {
            // From SubCategory -> Category
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
                // ...clothing specific validation
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

            // Determine item type
            let itemType = "clothing";
            if (selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.packaging)) itemType = "packaging";
            else if (selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.consumables)) itemType = "consumables";

            submitFormData.append("itemType", itemType);

            // Basic fields
            submitFormData.append("name", formData.itemName || "");
            submitFormData.append("categoryId", formData.subcategoryId || selectedCategory?.id || "");
            submitFormData.append("sku", formData.sku || "");
            submitFormData.append("unit", formData.unit || "шт");
            submitFormData.append("description", formData.description || "");
            submitFormData.append("quantity", formData.quantity || "0");
            submitFormData.append("criticalStockThreshold", formData.criticalStockThreshold || "0");
            submitFormData.append("lowStockThreshold", formData.lowStockThreshold || "10");
            submitFormData.append("storageLocationId", formData.storageLocationId || "");
            submitFormData.append("costPrice", formData.costPrice || "0");
            submitFormData.append("sellingPrice", formData.sellingPrice || "0");

            submitFormData.append("qualityCode", formData.qualityCode || "");
            submitFormData.append("materialCode", formData.materialCode || "");
            submitFormData.append("brandCode", formData.brandCode || "");
            submitFormData.append("attributeCode", formData.attributeCode || "");
            submitFormData.append("sizeCode", formData.sizeCode || "");

            if (formData.width) submitFormData.append("width", formData.width);
            if (formData.height) submitFormData.append("height", formData.height);
            if (formData.depth) submitFormData.append("depth", formData.depth);
            if (formData.department) submitFormData.append("department", formData.department);

            // Packaging specific
            if (formData.packagingType) submitFormData.append("packagingType", formData.packagingType);
            if (formData.supplierName) submitFormData.append("supplierName", formData.supplierName);
            if (formData.supplierLink) submitFormData.append("supplierLink", formData.supplierLink);
            if (formData.minBatch) submitFormData.append("minBatch", formData.minBatch);
            if (formData.weight) submitFormData.append("weight", formData.weight as string);
            if (formData.features) submitFormData.append("features", JSON.stringify(formData.features));

            if (formData.imageFile) submitFormData.append("image", formData.imageFile);
            if (formData.imageBackFile) submitFormData.append("imageBack", formData.imageBackFile);
            if (formData.imageSideFile) submitFormData.append("imageSide", formData.imageSideFile);
            formData.imageDetailsFiles?.forEach(img => {
                if (img) submitFormData.append("imageDetails", img);
            });

            const attributes: Record<string, unknown> = {
                ...formData.attributes,
                thumbnailSettings: formData.thumbSettings
            };
            submitFormData.append("thumbnailSettings", JSON.stringify(formData.thumbSettings));
            submitFormData.append("attributes", JSON.stringify(attributes));

            const result = await addInventoryItem(submitFormData);

            if (result?.error) {
                setValidationError(result.error);
                playSound("notification_error");
                setIsSubmitting(false);
            } else {
                clearDraft();
                playSound("item_created");
                toast("Позиция создана", "success");
                router.push(result?.id ? ROUTES.WAREHOUSE.ITEM_DETAIL(result.id) : ROUTES.WAREHOUSE.ROOT);
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

    const steps = [
        { id: 0, title: "Тип позиции", desc: "Категория и вид" },
        { id: 2, title: "Описание", desc: "Характеристики" },
        { id: 3, title: "Галерея", desc: "Фото и медиа" },
        { id: 4, title: "Склад", desc: "Остатки и хранение" },
        { id: 5, title: "Итог", desc: "Проверка и создание" }
    ];



    return (
        <div className="flex flex-col">
            <div className="flex flex-col xl:flex-row min-h-[calc(100vh-160px)] gap-4 xl:gap-6">
                {/* Sidebar (Vertical Studio Navigation) - Responsive */}
                <aside className={cn(
                    "crm-card !rounded-3xl flex flex-col shrink-0 z-40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-medium",
                    "w-full xl:w-[320px] h-auto xl:h-full sticky xl:static top-0"
                )}>
                    {/* Tablet/Mobile Horizontal Step View */}
                    <div className="xl:hidden flex items-center gap-3 p-3 border-b border-slate-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            aria-label="Вернуться назад"
                            className="w-10 h-10 shrink-0 rounded-[14px] bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors active:scale-95 hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <div className="flex-1 py-1">
                            <div className="flex items-center justify-between gap-1 w-full">
                                {steps.map((s, idx) => {
                                    const isActive = step === s.id;
                                    const isCompleted = step > s.id;

                                    if (s.id === 1 && !hasSubCategories && step !== 1) return null;

                                    return (
                                        <Button
                                            key={idx}
                                            variant={isActive ? "default" : "ghost"}
                                            onClick={() => {
                                                if (s.id === step) return;

                                                if (s.id < step) {
                                                    setStep(s.id);
                                                    setValidationError("");
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                } else {
                                                    if (validateStep(step)) {
                                                        if (s.id > 2 && step < 2) {
                                                            if (validateStep(2)) {
                                                                setStep(s.id);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }
                                                        } else {
                                                            setStep(s.id);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }
                                                }
                                            }}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 px-1 py-2 rounded-[12px] h-auto transition-all",
                                                isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                                                isActive ? "bg-white text-slate-900 shadow-sm" : isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-white border border-slate-200"
                                            )}>
                                                {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : idx + 1}
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-bold whitespace-nowrap hidden sm:inline-block",
                                                isActive ? "text-white" : "text-slate-700"
                                            )}>
                                                {s.title}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-crm-blink shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            )}
                        </div>
                    </div>

                    {/* Desktop Full View */}
                    <div className="hidden xl:flex flex-col h-full">
                        <div className="p-6 shrink-0">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm h-auto p-0 hover:bg-transparent justify-start"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Назад
                            </Button>

                            <h1 className="text-xl font-bold text-slate-900  leading-tight">
                                Новая позиция
                            </h1>
                            <p className="text-[11px] text-slate-500 font-bold  opacity-60 mt-1">
                                Создание карточки товара
                            </p>
                        </div>

                        <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                            {steps.map((s, idx) => {
                                const isActive = step === s.id;
                                const isCompleted = step > s.id;

                                // Hide subcategory step logic was already handled in the mapping but we keep it safe
                                if (s.id === 1 && !hasSubCategories && step !== 1) return null;

                                return (
                                    <Button
                                        key={idx}
                                        variant={isActive ? "default" : "ghost"}
                                        onClick={() => {
                                            if (s.id === step) return;

                                            if (s.id < step) {
                                                setStep(s.id);
                                                setValidationError("");
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            } else {
                                                // When clicking ahead, validate current step
                                                if (validateStep(step)) {
                                                    // Additionally, if jumping to step 3 or 4, validate step 2
                                                    if (s.id > 2 && step < 2) {
                                                        if (validateStep(2)) {
                                                            setStep(s.id);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    } else {
                                                        setStep(s.id);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "relative w-full text-left p-4 rounded-[var(--radius)] h-auto transition-all duration-300 flex items-center justify-start gap-4 group",
                                            isActive ? "bg-primary text-white shadow-md shadow-black/10 hover:bg-primary" : "text-slate-400 hover:bg-slate-50 shadow-none"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                            isActive ? "bg-white/20 border-white/30" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-200"
                                        )}>
                                            {isCompleted ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <span className="text-base font-bold">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className={cn("text-sm font-bold leading-none mb-1.5", isActive ? "text-white" : "text-slate-900")}>
                                                {s.title}
                                            </div>
                                            <div className={cn("text-[11px] font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>
                                                {s.desc}
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>

                        <div className="h-[80px] shrink-0 border-t border-slate-200 bg-white z-30 px-7 flex items-center">
                            <div className="flex items-center justify-between gap-3 w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-[var(--radius)] bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                        {isSaving ? (
                                            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-crm-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold  text-slate-400 mb-0.5">Черновик</div>
                                        <div className="text-[10px] font-bold text-slate-900 whitespace-nowrap">
                                            {isSaving ? "Сохранение..." : "Сохранено"}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-2xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-[10px] font-bold text-slate-400 hover:text-slate-900 group"
                                >
                                    <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                                    Начать заново
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative h-full flex flex-col gap-4 pb-4 xl:pb-8 px-1">
                    <div className="relative flex-1 flex flex-col min-h-0">
                        <div className="crm-card !p-0 !rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full min-h-0 relative">
                            {step === 0 && (
                                <div className="flex flex-col h-full min-h-0">
                                    <div className="flex-1 overflow-y-auto min-h-0">

                                        <CategorySelector
                                            categories={topLevelCategories}
                                            onSelect={handleCategorySelect}
                                            selectedCategoryId={selectedCategory?.id}
                                        />

                                        {selectedCategory && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-200 bg-slate-50/30 pb-6">
                                                <div className="px-4 sm:px-10 pt-6 pb-0">
                                                    <div className="max-w-6xl mx-auto w-full">
                                                        <div className="mb-4 flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                                                                <LayoutGrid className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-bold text-slate-900">Подкатегория</h4>
                                                                <p className="text-[10px] text-slate-500 font-bold opacity-60 mt-1">Выберите уточняющий тип для «{selectedCategory.name}»</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {subCategories.length > 0 ? (
                                                    <CategorySelector
                                                        categories={subCategories}
                                                        onSelect={handleSubCategorySelect}
                                                        variant="compact"
                                                        hideTitle={true}
                                                        selectedCategoryId={formData.subcategoryId}
                                                    />
                                                ) : (
                                                    <div className="px-10 pb-6">
                                                        <div className="w-full p-6 rounded-[var(--radius)] border-2 border-dashed border-slate-200 bg-white text-slate-400 font-bold flex flex-col items-center gap-2 text-center">
                                                            <span>В этой категории нет подкатегорий</span>
                                                            <span className="text-xs">Вы можете продолжить выбор</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <StepFooter
                                        onBack={handleBack}
                                        onNext={() => {
                                            if (!selectedCategory) {
                                                setValidationError("Выберите категорию");
                                                return;
                                            }
                                            if (subCategories.length > 0 && !formData.subcategoryId) {
                                                setValidationError("Выберите подкатегорию");
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                        validationError={validationError}
                                    />
                                </div>
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
