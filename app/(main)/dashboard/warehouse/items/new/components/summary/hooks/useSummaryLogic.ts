import { useState, useEffect } from "react";
import { ItemFormData, Category, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import { CLOTHING_COLORS } from "@/app/(main)/dashboard/warehouse/category-utils";

interface UseSummaryLogicProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    category: Category;
    subCategories: Category[];
    dynamicAttributes: InventoryAttribute[];
}

export function useSummaryLogic({
    formData,
    updateFormData,
    category,
    subCategories,
    dynamicAttributes
}: UseSummaryLogicProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(formData.itemName);
    const [prevItemName, setPrevItemName] = useState(formData.itemName);

    // Сбрасываем tempName если изменилось внешнее itemName (например, автогенерация перестроилась)
    useEffect(() => {
        if (formData.itemName !== prevItemName) {
            setPrevItemName(formData.itemName);
            if (!isEditingName) {
                setTempName(formData.itemName);
            }
        }
    }, [formData.itemName, prevItemName, isEditingName]);

    const activeSubcategory = subCategories.find(s => s.id === formData.subcategoryId);
    const selectedColor = CLOTHING_COLORS.find(c => c.code === formData.attributeCode);
    const accentColor = selectedColor?.hex;

    const getAttrName = (type: string, code?: string) => {
        if (!code) return null;
        const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
        return attr ? attr.name : code;
    };

    const handleSaveName = () => {
        updateFormData({ itemName: tempName });
        setIsEditingName(false);
    };

    const handleCancelName = () => {
        setTempName(formData.itemName);
        setIsEditingName(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveName();
        }
        if (e.key === 'Escape') {
            handleCancelName();
        }
    };

    return {
        // State
        isEditingName,
        setIsEditingName,
        tempName,
        setTempName,

        // Derived 
        activeSubcategory,
        selectedColor,
        accentColor,

        // Handlers & Helpers
        handleSaveName,
        handleCancelName,
        handleKeyDown,
        getAttrName
    };
}
