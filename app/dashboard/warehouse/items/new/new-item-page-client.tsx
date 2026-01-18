"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, LayoutGrid, Package, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, StorageLocation, InventoryAttribute, AttributeType, ItemFormData } from "../../types";
import { CategorySelector } from "./components/category-selector";
import { BasicInfoStep } from "./components/basic-info-step";
import { MediaStep } from "./components/media-step";
import { StockStep } from "./components/stock-step";
import { addInventoryItem } from "../../actions";
import { useToast } from "../../../../../components/ui/toast";

interface NewItemPageClientProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    measurementUnits?: { id: string; name: string }[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
}

export function NewItemPageClient({
    categories,
    storageLocations,
    dynamicAttributes,
    attributeTypes,
    measurementUnits = [],
    initialCategoryId,
    initialSubcategoryId
}: NewItemPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState("");

    const [formData, setFormData] = useState<ItemFormData>({
        categoryId: "",
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
        imageFile: null as File | null,
        imageBackFile: null as File | null,
        imageSideFile: null as File | null,
        imageDetailsFiles: [] as File[],
        imagePreview: null as string | null,
        imageBackPreview: null as string | null,
        imageSidePreview: null as string | null,
        imageDetailsPreviews: [] as string[],
        thumbSettings: { zoom: 1, x: 0, y: 0 },
        storageLocationId: "",
        quantity: "0",
        criticalStockThreshold: "0",
        lowStockThreshold: "10",
        attributes: {} as Record<string, string>
    });

    const DRAFT_KEY = "merch_crm_new_item_draft";

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
                            imageFile: null, imageBackFile: null, imageSideFile: null, imageDetailsFiles: [],
                            imagePreview: null, imageBackPreview: null, imageSidePreview: null, imageDetailsPreviews: []
                        }));
                        if (draft.step) setStep(draft.step);
                        if (draft.selectedCategoryId) {
                            const cat = categories.find(c => c.id === draft.selectedCategoryId);
                            if (cat) setSelectedCategory(cat);
                        }
                    }, 0);
                }
            } catch (error) { console.error(error); }
        }
    }, [initialCategoryId, initialSubcategoryId, categories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                formData: {
                    ...formData,
                    imageFile: null, imageBackFile: null, imageSideFile: null, imageDetailsFiles: [],
                    imagePreview: null, imageBackPreview: null, imageSidePreview: null, imageDetailsPreviews: []
                },
                step,
                selectedCategoryId: selectedCategory?.id
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData, step, selectedCategory]);

    useEffect(() => {
        if (isInitialized || !categories.length) return;
        setTimeout(() => {
            if (initialSubcategoryId) {
                const sub = categories.find(c => c.id === initialSubcategoryId);
                if (sub && sub.parentId) {
                    const parent = categories.find(c => c.id === sub.parentId);
                    if (parent) {
                        setSelectedCategory(parent);
                        setFormData(prev => ({ ...prev, subcategoryId: sub.id, unit: parent.name.toLowerCase().includes("одежда") ? "шт" : prev.unit }));
                        setStep(1);
                        setIsInitialized(true);
                        return;
                    }
                }
            }
            if (initialCategoryId) {
                const cat = categories.find(c => c.id === initialCategoryId);
                if (cat) { setSelectedCategory(cat); setStep(1); }
            }
            setIsInitialized(true);
        }, 0);
    }, [initialCategoryId, initialSubcategoryId, categories, isInitialized]);

    const subCategories = selectedCategory ? categories.filter(c => c.parentId === selectedCategory.id) : [];
    const topLevelCategories = categories.filter(c => !c.parentId || c.parentId === "");

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setFormData(prev => ({
            ...prev,
            categoryId: category.id,
            subcategoryId: "",
            itemName: "",
            sku: "",
            unit: category.name.toLowerCase().includes("одежда") ? "шт" : "шт"
        }));
        setStep(1);
    };

    const updateFormData = (updates: Partial<ItemFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        if (validationError) setValidationError("");
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const finalData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                if (key === "imageFile" && value instanceof File) finalData.append("image", value);
                else if (key === "imageBackFile" && value instanceof File) finalData.append("imageBack", value);
                else if (key === "imageSideFile" && value instanceof File) finalData.append("imageSide", value);
                else if (key === "imageDetailsFiles" && Array.isArray(value)) value.forEach(f => f instanceof File && finalData.append("imageDetails", f));
                else if (key === "attributes") finalData.append("attributes", JSON.stringify(value));
                else if (key === "thumbSettings") finalData.append("thumbSettings", JSON.stringify(value));
                else if (typeof value === "string") finalData.append(key, value);
            });
            const res = await addInventoryItem(finalData);
            if (res.success) {
                toast({ title: "Успех", description: "Товар создан" });
                localStorage.removeItem(DRAFT_KEY);
                router.push(`/dashboard/warehouse/${selectedCategory?.id}`);
            } else {
                toast({ title: "Ошибка", description: res.error || "Ошибка", variant: "destructive" });
            }
        } catch {
            toast({ title: "Ошибка", description: "Ошибка", variant: "destructive" });
        } finally { setIsSubmitting(false); }
    };

    const steps = [
        { title: "Категория", icon: <LayoutGrid className="w-5 h-5" /> },
        { title: "Инфо", icon: <Package className="w-5 h-5" /> },
        { title: "Медиа", icon: <Save className="w-5 h-5" /> },
        { title: "Склад", icon: <Package className="w-5 h-5" /> }
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-white overflow-hidden">
            <div className="px-8 pt-8 pb-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-500" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
                    {steps.map((s, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all border-4", step >= idx ? "bg-indigo-600 border-white text-white shadow-lg ring-1 ring-indigo-600" : "bg-white border-white text-slate-300 ring-1 ring-slate-200")}>
                                {step > idx ? <Check className="w-5 h-5" /> : s.icon}
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", step >= idx ? "text-indigo-600" : "text-slate-400")}>{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {step === 0 && <CategorySelector categories={topLevelCategories} onSelect={handleCategorySelect} selectedCategoryId={selectedCategory?.id || ""} />}
                {step === 1 && selectedCategory && (
                    <BasicInfoStep
                        category={selectedCategory}
                        subCategories={subCategories}
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                        dynamicAttributes={dynamicAttributes}
                        attributeTypes={attributeTypes}
                        measurementUnits={measurementUnits}
                        validationError={validationError}
                    />
                )}
                {step === 2 && <MediaStep formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {step === 3 && selectedCategory && (
                    <StockStep
                        category={selectedCategory}
                        storageLocations={storageLocations as any}
                        formData={formData}
                        updateFormData={updateFormData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                        validationError={validationError}
                    />
                )}
            </div>
        </div>
    );
}
