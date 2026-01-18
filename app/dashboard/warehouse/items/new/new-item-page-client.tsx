"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, RotateCcw, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

import { addInventoryItem } from "../../actions";
import { CategorySelector } from "./components/category-selector";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { StepFooter } from "./components/step-footer";
import { InventoryAttribute, AttributeType, ItemFormData, Category, StorageLocation } from "../../types";
import { useToast } from "../../../../../components/ui/toast";

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
    const router = useRouter();
    const { toast } = useToast();

    // 0: Category
    // 1: SubCategory (conditional)
    // 2: Basic Info
    // 3: Media
    // 4: Stock
    // State with lazy initialization
    const [step, setStep] = useState(() => {
        if (typeof window === 'undefined') return 0;

        // 1. Initial params from URL
        if (initialCategoryId || initialSubcategoryId) {
            // If we have initial category/subcategory, we usually jump to basic info (step 2)
            // unless the initial category has subcategories and no subcategory is provided.
            const catIdToFind = initialSubcategoryId
                ? categories.find(c => c.id === initialSubcategoryId)?.parentId
                : initialCategoryId;
            const cat = catIdToFind ? categories.find(c => c.id === catIdToFind) : null;
            if (cat) {
                const hasSubs = categories.some(c => c.parentId === cat.id);
                if (hasSubs && !initialSubcategoryId) {
                    return 0; // Stay on category selection if parent has subs but no sub is selected
                }
            }
            return 2; // Jump to basic info
        }

        // 2. Draft
        const saved = localStorage.getItem("merch_crm_new_item_draft");
        if (saved) {
            try { return JSON.parse(saved).step || 0; } catch { return 0; }
        }
        return 0;
    });

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
        if (typeof window === 'undefined') return null;

        // 1. Initial params
        const catIdToFind = initialSubcategoryId
            ? categories.find(c => c.id === initialSubcategoryId)?.parentId
            : initialCategoryId;

        if (catIdToFind) {
            return categories.find(c => c.id === catIdToFind) || null;
        }

        // 2. Draft
        const saved = localStorage.getItem("merch_crm_new_item_draft");
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.selectedCategoryId) {
                    return categories.find(c => c.id === draft.selectedCategoryId) || null;
                }
            } catch { return null; }
        }
        return null;
    });

    const [formData, setFormData] = useState<ItemFormData>(() => {
        const defaultData: ItemFormData = {
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
            attributes: {}
        };

        if (typeof window === 'undefined') return defaultData;

        // 1. Initial params
        if (initialSubcategoryId) {
            const subCat = categories.find(c => c.id === initialSubcategoryId);
            const isClothing = subCat?.name.toLowerCase().includes("одежда");
            return {
                ...defaultData,
                subcategoryId: initialSubcategoryId,
                unit: isClothing ? "шт" : "шт"
            };
        } else if (initialCategoryId) {
            const cat = categories.find(c => c.id === initialCategoryId);
            const isClothing = cat?.name.toLowerCase().includes("одежда");
            return {
                ...defaultData,
                unit: isClothing ? "шт" : "шт"
            };
        }

        // 2. Draft
        const saved = localStorage.getItem("merch_crm_new_item_draft");
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.formData) {
                    return {
                        ...defaultData,
                        ...draft.formData,
                        // Clear files/previews as they cannot be serialized
                        imageFile: null, imageBackFile: null, imageSideFile: null,
                        imageDetailsFiles: [], imagePreview: null,
                        imageBackPreview: null, imageSidePreview: null,
                        imageDetailsPreviews: []
                    };
                }
            } catch { return defaultData; }
        }

        return defaultData;
    });

    const [validationError, setValidationError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormData = (updates: Partial<ItemFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        if (validationError) setValidationError("");
    };

    // Save draft on changes
    useEffect(() => {
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
            localStorage.setItem("merch_crm_new_item_draft", JSON.stringify(dataToSave));
        }, 1000); // Debounce saving

        return () => clearTimeout(timer);
    }, [formData, step, selectedCategory]);

    const clearDraft = () => {
        localStorage.removeItem("merch_crm_new_item_draft");
    };



    const handleReset = () => {
        clearDraft();
        setStep(0);
        setSelectedCategory(null);
        setValidationError("");
        setFormData({
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
            attributes: {}
        });
        toast("Форма сброшена", "info");
    };



    const subCategories = selectedCategory
        ? categories.filter(c => c.parentId === selectedCategory.id)
        : [];

    const topLevelCategories = categories.filter(c => !c.parentId || c.parentId === "");
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
            unit: category.name.toLowerCase().includes("одежда") ? "шт" : prev.unit || "шт"
        }));
    };

    const handleSubCategorySelect = (subCategory: Category) => {
        setValidationError("");
        updateFormData({ subcategoryId: subCategory.id });
    };

    const handleBack = () => {
        setValidationError("");
        if (step === 2) {
            // From Basic Info -> Category Selection
            setStep(0);
        } else if (step > 2) {
            setStep(step - 1);
        } else {
            router.back();
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

        const isClothing = selectedCategory?.name.toLowerCase().includes("одежда");

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
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setIsSubmitting(true);
        setValidationError("");

        try {
            const submitFormData = new FormData();

            // Determine item type
            let itemType = "clothing";
            if (selectedCategory?.name.toLowerCase().includes("упаковка")) itemType = "packaging";
            else if (selectedCategory?.name.toLowerCase().includes("расходники")) itemType = "consumables";

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

            submitFormData.append("qualityCode", formData.qualityCode || "");
            submitFormData.append("materialCode", formData.materialCode || "");
            submitFormData.append("brandCode", formData.brandCode || "");
            submitFormData.append("attributeCode", formData.attributeCode || "");
            submitFormData.append("sizeCode", formData.sizeCode || "");

            if (formData.width) submitFormData.append("width", formData.width);
            if (formData.height) submitFormData.append("height", formData.height);
            if (formData.depth) submitFormData.append("depth", formData.depth);
            if (formData.department) submitFormData.append("department", formData.department);

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
                setIsSubmitting(false);
            } else {
                clearDraft();
                toast("Позиция создана", "success");
                router.push(result?.id ? `/dashboard/warehouse/items/${result.id}` : "/dashboard/warehouse");
                router.refresh();
            }
        } catch {
            setValidationError("Произошла ошибка при создании позиции");
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 0, title: "Тип позиции", desc: "Категория и вид" },
        { id: 2, title: "Описание", desc: "Характеристики" },
        { id: 3, title: "Галерея", desc: "Фото и медиа" },
        { id: 4, title: "Склад", desc: "Остатки и хранение" }
    ];

    const currentStepIndex = step;

    return (
        <div className="h-[calc(100vh-130px)] flex flex-col overflow-hidden bg-slate-50/50">
            <div className="px-8 pt-6 shrink-0">
                <Breadcrumbs
                    items={[
                        { label: "Склад", href: "/dashboard/warehouse", icon: Package },
                        { label: "Новая позиция" },
                        ...(selectedCategory ? [{ label: selectedCategory.name }] : []),
                        ...(() => {
                            const sub = subCategories.find(s => s.id === formData.subcategoryId);
                            return sub ? [{ label: sub.name }] : [];
                        })()
                    ]}
                />
            </div>
            <div className="flex-1 flex min-h-0 gap-6 px-8 pb-8 pt-4">
                {/* Sidebar (Vertical Studio Navigation) */}
                <aside className="w-[320px] bg-white border border-slate-200 rounded-[24px] flex flex-col shrink-0 relative z-20 h-full shadow-xl shadow-slate-200/60 overflow-hidden text-medium">
                    <div className="p-6 shrink-0">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Назад
                        </button>

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            Новая позиция
                        </h1>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">
                            Создание карточки товара
                        </p>
                    </div>

                    <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                        {steps.map((s, idx) => {
                            const isActive = currentStepIndex === s.id;
                            const isCompleted = currentStepIndex > s.id;

                            // Hide subcategory step logic was already handled in the mapping but we keep it safe
                            if (s.id === 1 && !hasSubCategories && currentStepIndex !== 1) return null;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (s.id === currentStepIndex) return;

                                        if (s.id < currentStepIndex) {
                                            setStep(s.id);
                                            setValidationError("");
                                        } else {
                                            // When clicking ahead, validate current step
                                            if (validateStep(currentStepIndex)) {
                                                // Additionally, if jumping to step 3 or 4, validate step 2
                                                if (s.id > 2 && currentStepIndex < 2) {
                                                    if (validateStep(2)) {
                                                        setStep(s.id);
                                                    }
                                                } else {
                                                    setStep(s.id);
                                                }
                                            }
                                        }
                                    }}
                                    className={cn(
                                        "relative w-full text-left p-4 rounded-[14px] transition-all duration-300 flex items-center gap-4 group",
                                        isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                        isActive ? "bg-white/10 border-white/20" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-100"
                                    )}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <span className="text-base font-black">{idx + 1}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={cn("text-xs font-black uppercase tracking-widest leading-none mb-1", isActive ? "text-white" : "text-slate-900")}>
                                            {s.title}
                                        </div>
                                        <div className={cn("text-[10px] font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>
                                            {s.desc}
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="absolute right-4 w-1 h-1 rounded-full bg-indigo-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-[80px] shrink-0 border-t border-slate-100 bg-white z-30 px-7 flex items-center">
                        <div className="flex items-center justify-between gap-3 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-[14px] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Черновик</div>
                                    <div className="text-[10px] font-bold text-slate-900 whitespace-nowrap">Сохранено</div>
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 group"
                            >
                                <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                                Начать заново
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 overflow-hidden relative h-full flex flex-col gap-4">
                    <div className="relative z-10 flex-1 flex flex-col min-h-0">
                        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden flex flex-col h-full min-h-0 relative">
                            {step === 0 && (
                                <div className="flex flex-col h-full min-h-0">
                                    <div className="flex-1 overflow-y-auto min-h-0">

                                        <CategorySelector
                                            categories={topLevelCategories}
                                            onSelect={handleCategorySelect}
                                            selectedCategoryId={selectedCategory?.id}
                                        />

                                        {selectedCategory && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 bg-slate-50/30 pb-6">
                                                <div className="px-10 pt-6 pb-0 font-medium">
                                                    <div className="max-w-6xl mx-auto w-full">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                                Выберите подкатегорию для &quot;{selectedCategory.name}&quot;
                                                            </h3>
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
                                                        <div className="w-full p-6 rounded-[14px] border-2 border-dashed border-slate-200 bg-white text-slate-400 font-bold flex flex-col items-center gap-2">
                                                            <span>В этой категории нет подкатегорий</span>
                                                            <span className="text-xs uppercase tracking-widest">Вы можете продолжить выбор</span>
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
