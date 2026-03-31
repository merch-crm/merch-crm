import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createInventoryAttributeType } from "../attribute-actions";;
import { playSound } from "@/lib/sounds";
import type { Category, AttributeType } from "../types";

export const transliterateToSlug = (text: string) => {
    const MAP: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '_'
    };
    return text.toLowerCase().split('').map(char => MAP[char] ?? char).join('').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
};


export type DataTypeKey = "text" | "unit" | "color" | "dimensions" | "composition" | "material" | "size" | "brand" | "country" | "density" | "weight" | "volume" | "package" | "consumable";

export const DATA_TYPE_META: Record<DataTypeKey, { name: string; slug: string }> = {
    text: { name: "Общая", slug: "text" },
    unit: { name: "Единица измерения", slug: "unit" },
    color: { name: "Цвет", slug: "color" },
    dimensions: { name: "Габариты", slug: "dimensions" },

    composition: { name: "Состав", slug: "composition" },
    material: { name: "Материал", slug: "material" },
    size: { name: "Размер", slug: "size" },
    brand: { name: "Бренд", slug: "brand" },
    country: { name: "Страна", slug: "country" },
    density: { name: "Плотность", slug: "density" },
    weight: { name: "Вес", slug: "weight" },
    volume: { name: "Объем", slug: "volume" },
    package: { name: "Упаковка", slug: "package" },
    consumable: { name: "Расходники", slug: "consumable" },
};

interface UseAddAttributeTypeProps {
    categories: Category[];
    attributeTypes?: AttributeType[];
}

export function useAddAttributeType({ categories, attributeTypes = [] }: UseAddAttributeTypeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dataTypes, setDataTypesRaw] = useState<DataTypeKey[]>([]);
    const [isSystem, setIsSystem] = useState(false);
    const [hasColor, setHasColor] = useState(false);
    const [hasUnits, setHasUnits] = useState(false);
    const [hasComposition, setHasComposition] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const rootCategories = categories.filter(c => !c.parentId);
    const catParam = searchParams.get("cat");
    const [activeCategoryId, setActiveCategoryId] = useState<string>(catParam || (rootCategories.length > 0 ? rootCategories[0].id : "uncategorized"));

    const existingTypesInActiveCategory = attributeTypes
        .filter(t => (activeCategoryId === "uncategorized" ? !t.categoryId : t.categoryId === activeCategoryId))
        .map(t => t.dataType);

    const toggleDataType = (type: DataTypeKey) => {
        setDataTypesRaw(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
        setError(null);
    };

    const handleOpen = () => {
        setDataTypesRaw([]);
        setIsSystem(false);
        setHasColor(false);
        setHasUnits(false);
        setHasComposition(false);
        setError(null);
        const currentCat = searchParams.get("cat");
        if (currentCat) {
            setActiveCategoryId(currentCat);
        } else if (rootCategories.length > 0) {
            setActiveCategoryId(rootCategories[0].id);
        }
        setIsOpen(true);
    };

    const handleCreate = async () => {
        if (dataTypes.length === 0) {
            setError("Выберите хотя бы один тип данных");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const catIdToSave = activeCategoryId === "uncategorized" ? undefined : activeCategoryId;
            let isAllSuccess = true;

            for (const type of dataTypes) {
                const name = DATA_TYPE_META[type].name;
                const slug = DATA_TYPE_META[type].slug;

                const res = await createInventoryAttributeType({
                    name, slug, category: catIdToSave, isSystem, dataType: type,
                    hasColor, hasUnits, hasComposition
                });

                if (!res.success) {
                    isAllSuccess = false;
                    const errorMsg = res.error || `Ошибка создания: ${name}`;
                    setError(errorMsg);
                    toast(errorMsg, "error");
                    playSound("notification_error");
                    break;
                }
            }

            if (isAllSuccess) {
                toast(dataTypes.length > 1 ? "Разделы созданы" : "Новый раздел создан", "success");
                playSound("notification_success");
                setIsOpen(false);
                router.refresh();
            }
        } catch {
            toast("Ошибка создания", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen, setIsOpen,
        isLoading,
        dataTypes, toggleDataType,
        isSystem, setIsSystem,
        activeCategoryId, setActiveCategoryId,
        hasColor, setHasColor,
        hasUnits, setHasUnits,
        hasComposition, setHasComposition,
        rootCategories,
        existingTypesInActiveCategory,
        error, setError,
        handleOpen,
        handleCreate
    };
}
