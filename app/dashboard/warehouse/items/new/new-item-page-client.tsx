"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { addInventoryItem } from "../../actions";
import { CategorySelector } from "./components/category-selector";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { Category, StorageLocation, InventoryAttribute, AttributeType, ItemFormData } from "../../types";
import { useToast } from "../../../../../components/ui/toast";

interface NewItemPageClientProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    measurementUnits: { id: string; name: string }[];
    dynamicAttributes: InventoryAttribute[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
    attributeTypes: AttributeType[];
}

export function NewItemPageClient({
    categories,
    storageLocations,
    measurementUnits,
    dynamicAttributes,
    initialCategoryId,
    initialSubcategoryId,
    attributeTypes
}: NewItemPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();

    // 0: Category
    // 1: SubCategory (conditional)
    // 2: Basic Info
    // 3: Media
    // 4: Stock
    const [step, setStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [validationError, setValidationError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Form state settings
    const [formData, setFormData] = useState<ItemFormData>({
        // Step 2: Basic Info
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

        // Step 3: Media
        imageFile: null as File | null,
        imageBackFile: null as File | null,
        imageSideFile: null as File | null,
        imageDetailsFiles: [] as File[],

        imagePreview: null as string | null,
        imageBackPreview: null as string | null,
        imageSidePreview: null as string | null,
        imageDetailsPreviews: [] as string[],
        thumbSettings: { zoom: 1, x: 0, y: 0 },

        // Step 4: Stock
        storageLocationId: "",
        quantity: "0",
        criticalStockThreshold: "0",
        lowStockThreshold: "10",
        attributes: {} as Record<string, string>
    });

    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Draft key for localStorage
    const DRAFT_KEY = "merch_crm_new_item_draft";

    const updateFormData = (updates: Partial<ItemFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // Load draft on mount
    useEffect(() => {
        if (initialCategoryId || initialSubcategoryId) return;

        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.formData) {
                    setTimeout(() => {
                        setFormData(prev => ({
                            ...prev,
                            ...draft.formData,
                            // Ensure we don't try to load files from JSON
                            imageFile: null,
                            imageBackFile: null,
                            imageSideFile: null,
                            imageDetailsFiles: [],
                            imagePreview: null,
                            imageBackPreview: null,
                            imageSidePreview: null,
                            imageDetailsPreviews: []
                        }));
                        if (draft.step) setStep(draft.step);
                        if (draft.selectedCategoryId) {
                            const cat = categories.find(c => c.id === draft.selectedCategoryId);
                            if (cat) setSelectedCategory(cat);
                        }
                    }, 0);
                }
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
        }
    }, [initialCategoryId, initialSubcategoryId, categories]);

    // Save draft on changes
    useEffect(() => {
        setTimeout(() => setIsSavingDraft(true), 0);
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
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
            setIsSavingDraft(false);
        }, 1000); // Debounce saving

        return () => clearTimeout(timer);
    }, [formData, step, selectedCategory]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
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

    // Initialize from URL params
    useEffect(() => {
        if (isInitialized) return;
        if (!categories.length) return;

        setTimeout(() => {
            if (initialSubcategoryId) {
                const sub = categories.find(c => c.id === initialSubcategoryId);
                if (sub && sub.parentId) {
                    const parent = categories.find(c => c.id === sub.parentId);
                    if (parent) {
                        setSelectedCategory(parent);
                        setFormData(prev => ({
                            ...prev,
                            subcategoryId: sub.id,
                            unit: parent.name.toLowerCase().includes("одежда") ? "шт" : prev.unit
                        }));
                        setStep(2); // Skip straight to Basic Info
                        setIsInitialized(true);
                        return;
                    }
                }
            }

            if (initialCategoryId) {
                const cat = categories.find(c => c.id === initialCategoryId);
                if (cat) {
                    if (cat.parentId) {
                        // It's a subcategory passed as categoryId
                        const parent = categories.find(c => c.id === cat.parentId);
                        if (parent) {
                            setSelectedCategory(parent);
                            setFormData(prev => ({
                                ...prev,
                                subcategoryId: cat.id,
                                unit: parent.name.toLowerCase().includes("одежда") ? "шт" : prev.unit
                            }));
                            setStep(2);
                            setIsInitialized(true);
                        }
                    } else {
                        // Top level category
                        setSelectedCategory(cat);
                        setFormData(prev => ({
                            ...prev,
                            unit: cat.name.toLowerCase().includes("одежда") ? "шт" : prev.unit
                        }));
                        // Check if we need subcategory selection
                        setStep(0); // Always start at 0 if top level
                        setIsInitialized(true);
                    }
                }
            } else {
                // If no initial params, we consider it initialized (either from draft or empty)
                setIsInitialized(true);
            }
        }, 0);
    }, [initialCategoryId, initialSubcategoryId, categories, isInitialized]);

    const subCategories = selectedCategory
        ? categories.filter(c => c.parentId === selectedCategory.id)
        : [];

    const topLevelCategories = categories.filter(c => !c.parentId || c.parentId === "");
    const hasSubCategories = subCategories.length > 0;

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);

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
        updateFormData({ subcategoryId: subCategory.id });
        setStep(2);
    };

    const handleBack = () => {
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
        const isClothing = selectedCategory?.name.toLowerCase().includes("одежда");

        if (currentStep === 2) {
            if (isClothing) {
                if (hasSubCategories && !formData.subcategoryId) {
                    setValidationError("Выберите подкатегорию");
                    return false;
                }

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
        <div className="h-[calc(100vh-100px)] flex gap-4 p-4 -m-4">
            {/* Sidebar (Vertical Studio Navigation) */}
            <aside className="w-[300px] bg-white border border-slate-200 rounded-[14px] flex flex-col shrink-0 relative z-20 h-full shadow-lg shadow-slate-200/50 overflow-hidden">
                <div className="p-7 shrink-0">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-6 transition-all group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </button>

                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        Новая позиция
                    </h1>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">
                        Создание карточки товара
                    </p>
                </div>

                <div className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                    {steps.map((s, idx) => {
                        const isActive = currentStepIndex === s.id;
                        const isCompleted = currentStepIndex > s.id;

                        // Hide subcategory step logic was already handled in the mapping but we keep it safe
                        if (s.id === 1 && !hasSubCategories && currentStepIndex !== 1) return null;

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (s.id < currentStepIndex || validateStep(currentStepIndex)) {
                                        setStep(s.id);
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

                <div className="p-6 pb-8 shrink-0 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[14px] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isSavingDraft ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                                )} />
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Черновик</div>
                                <div className="text-[10px] font-bold text-slate-900 whitespace-nowrap">
                                    {isSavingDraft ? "Сохранение..." : "Сохранено"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 group"
                        >
                            <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                            Начать заново
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="relative z-10 min-h-full flex flex-col">
                    <div className="w-full">
                        <div className="bg-white rounded-[14px] shadow-2xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden flex flex-col">
                            {step === 0 && (
                                <div className="flex flex-col">
                                    <CategorySelector
                                        categories={topLevelCategories}
                                        onSelect={handleCategorySelect}
                                        selectedCategoryId={selectedCategory?.id}
                                    />

                                    {selectedCategory && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 bg-slate-50/30">
                                            <div className="px-6 py-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                        Выберите подкатегорию для &quot;{selectedCategory.name}&quot;
                                                    </h3>
                                                </div>
                                            </div>

                                            {subCategories.length > 0 ? (
                                                <CategorySelector
                                                    categories={subCategories}
                                                    onSelect={handleSubCategorySelect}
                                                    variant="compact"
                                                    hideTitle={true}
                                                />
                                            ) : (
                                                <div className="px-10 pb-10">
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="w-full p-6 rounded-[14px] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-600 font-bold flex flex-col items-center gap-2"
                                                    >
                                                        <span>В этой категории нет подкатегорий</span>
                                                        <span className="text-xs uppercase tracking-widest">Нажмите здесь, чтобы продолжить</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                </div>
            </main>
        </div>
    );
}
