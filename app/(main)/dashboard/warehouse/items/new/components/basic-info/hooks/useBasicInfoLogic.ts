import { useEffect } from "react";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { ICONS, getIconNameFromName } from "@/app/(main)/dashboard/warehouse/category-utils";

interface UseBasicInfoLogicProps {
    category: Category;
    subCategories: Category[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    attributeTypes: AttributeType[];
    dynamicAttributes: InventoryAttribute[];
}

export function useBasicInfoLogic({
    category,
    subCategories,
    formData,
    updateFormData,
    attributeTypes,
    dynamicAttributes
}: UseBasicInfoLogicProps) {
    const isClothing = category.name.toLowerCase().includes("одежда");
    const isPackaging = category.name.toLowerCase().includes("упаковка");
    const isConsumables = category.name.toLowerCase().includes("расходники");

    const customTypes = attributeTypes.filter(t => {
        if (["brand", "quality", "material", "size", "color"].includes(t.slug)) return false;
        return !t.categoryId ||
            t.categoryId === category.id ||
            (formData.subcategoryId && t.categoryId === formData.subcategoryId);
    });

    const compositionType = customTypes.find(t => t.slug === 'composition' || t.name.toLowerCase() === 'состав');
    const remainingCustomTypes = customTypes.filter(t => t.id !== compositionType?.id);

    const transliterate = (text: string) => {
        const map: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.split('').map(char => {
            const lowChar = char.toLowerCase();
            const res = map[lowChar] || lowChar;
            return char === char.toUpperCase() ? res.toUpperCase() : res;
        }).join('');
    };

    // Автогенерация SKU и названия для одежды
    useEffect(() => {
        if (isClothing) {
            const activeCat = formData.subcategoryId ? subCategories.find(c => c.id === formData.subcategoryId) : category;
            const prefix = activeCat?.prefix;

            // SKU Generation
            const shouldShowInSku = (type: string, code?: string) => {
                if (!code) return false;
                const attrType = attributeTypes.find(t => t.slug === type);
                if (attrType && attrType.showInSku === false) return false;
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                return (attr?.meta as { showInSku?: boolean })?.showInSku ?? true;
            };

            const skuParts: string[] = [];
            if (prefix && activeCat?.showInSku !== false) skuParts.push(prefix);

            if (shouldShowInSku('brand', formData.brandCode)) skuParts.push(formData.brandCode!);
            if (shouldShowInSku('quality', formData.qualityCode)) skuParts.push(formData.qualityCode!);
            if (shouldShowInSku('material', formData.materialCode)) skuParts.push(formData.materialCode!);
            if (shouldShowInSku('color', formData.attributeCode)) skuParts.push(formData.attributeCode!);
            if (shouldShowInSku('size', formData.sizeCode)) skuParts.push(formData.sizeCode!);

            customTypes.forEach((type: AttributeType) => {
                const code = formData.attributes?.[type.slug];
                if (code && shouldShowInSku(type.slug, code)) {
                    skuParts.push(code);
                }
            });

            const generatedSku = transliterate(skuParts.join("-").toUpperCase());

            if (generatedSku !== formData.sku) {
                updateFormData({ sku: generatedSku });
            }

            const targetGender = activeCat?.gender || "masculine";

            const iconName = activeCat?.icon || (activeCat?.name ? getIconNameFromName(activeCat.name) : null);
            const iconLabel = iconName ? ICONS.find(i => i.name === iconName)?.label : null;

            const getSingularName = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes("футболк")) return "Футболка";
                if (n.includes("худи")) return "Худи";
                if (n.includes("лонгслив")) return "Лонгслив";
                if (n.includes("свитшот")) return "Свитшот";
                if (n.includes("толстовк")) return "Толстовка";
                if (n.includes("куртк")) return "Куртка";
                if (n.includes("бомбер")) return "Бомбер";
                if (n.includes("шорт")) return "Шорты";
                if (n.includes("штан") || n.includes("брюк")) return "Штаны";
                if (n.includes("кепк")) return "Кепка";
                if (n.includes("шапк")) return "Шапка";
                if (n.includes("поло")) return "Поло";
                return name;
            };

            const baseName = activeCat?.showInName !== false
                ? (activeCat?.singularName || iconLabel || (activeCat?.name ? getSingularName(activeCat.name) : ""))
                : "";

            const getAttrName = (type: string, code?: string) => {
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                if (!attr) return code;

                const attrType = attributeTypes.find(t => t.slug === type);
                if (attrType && attrType.showInName === false) return null;

                let meta: unknown = attr.meta;
                if (typeof meta === 'string') {
                    try { meta = JSON.parse(meta); } catch { meta = {}; }
                } else if (!meta) {
                    meta = {};
                }

                const typedMeta = meta as { showInName?: boolean; fem?: string; neut?: string };

                if (typedMeta?.showInName === false) return null;
                if (targetGender === "feminine" && typedMeta?.fem) return typedMeta.fem;
                if (targetGender === "neuter" && typedMeta?.neut) return typedMeta.neut;

                return attr.name;
            };

            const brandName = getAttrName("brand", formData.brandCode);
            const colorName = getAttrName("color", formData.attributeCode);
            const sizeName = getAttrName("size", formData.sizeCode);
            const qualityName = getAttrName("quality", formData.qualityCode);
            const materialName = getAttrName("material", formData.materialCode);

            const nameParts = [
                baseName,
                brandName,
                materialName,
                qualityName,
                colorName,
                sizeName
            ].filter(Boolean);

            customTypes.forEach((type: AttributeType) => {
                const code = formData.attributes?.[type.slug];
                if (code) {
                    const name = getAttrName(type.slug, code);
                    if (name) nameParts.push(name);
                }
            });

            const generatedName = nameParts.join(" ");

            if (generatedName && generatedName !== formData.itemName) {
                updateFormData({ itemName: generatedName });
            }
        }
    }, [
        isClothing,
        category.prefix,
        category.name,
        formData.subcategoryId,
        formData.brandCode,
        formData.qualityCode,
        formData.materialCode,
        formData.attributeCode,
        formData.sizeCode,
        subCategories,
        dynamicAttributes,
        formData.attributes,
        attributeTypes,
        category,
        customTypes,
        formData.itemName,
        formData.sku,
        updateFormData
    ]);

    return {
        isClothing,
        isPackaging,
        isConsumables,
        compositionType,
        remainingCustomTypes
    };
}
