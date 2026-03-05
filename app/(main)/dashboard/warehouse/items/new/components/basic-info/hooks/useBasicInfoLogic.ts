import { useEffect, useCallback } from "react";
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
    const isClothing = category.name.toLowerCase().trim() === "одежда" || category.name.toLowerCase().trim().startsWith("одежда ");
    const isPackaging = category.name.toLowerCase().trim().includes("упаковка");
    const isConsumables = category.name.toLowerCase().trim().includes("расходники");

    const categoryAttributes = attributeTypes
        .filter(t => {
            return !t.categoryId ||
                t.categoryId === category.id ||
                (formData.subcategoryId && t.categoryId === formData.subcategoryId);
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const getCodeForSlug = useCallback((slug: string, typeName?: string) => {
        const cleanSlug = slug.toLowerCase().trim();
        const cleanName = typeName?.toLowerCase().trim();

        // 1. Try mirroring in attributes first (most accurate for dynamic/custom slugs)
        if (formData.attributes?.[slug]) return formData.attributes[slug];
        if (formData.attributes?.[cleanSlug]) return formData.attributes[cleanSlug];

        // 2. Try direct slug match for standard fields
        if (cleanSlug === 'brand') return formData.brandCode;
        if (cleanSlug === 'quality') return formData.qualityCode;
        if (cleanSlug === 'material') return formData.materialCode;
        if (cleanSlug === 'color') return formData.attributeCode;
        if (cleanSlug === 'size') return formData.sizeCode;

        // 3. Try mapping by name if it's a known standard type
        if (cleanName === 'бренд') return formData.brandCode;
        if (cleanName === 'качество') return formData.qualityCode;
        if (cleanName === 'материал') return formData.materialCode;
        if (cleanName === 'размер') return formData.sizeCode;
        if (cleanName === 'цвет') return formData.attributeCode;

        return undefined;
    }, [formData]);

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
        }).join('').replace(/[^A-Za-z0-9_-]/g, '');
    };

    // Автогенерация SKU и названия для одежды
    useEffect(() => {
        if (isClothing) {
            const activeCat = formData.subcategoryId ? subCategories.find(c => c.id === formData.subcategoryId) : category;
            const prefix = activeCat?.prefix;

            // 1. SKU Generation
            const shouldShowInSku = (type: string, code?: string) => {
                if (!code) return false;
                const attrType = attributeTypes.find(t => t.slug === type);
                if (attrType && attrType.showInSku === false) return false;
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                return (attr?.meta as { showInSku?: boolean })?.showInSku ?? true;
            };

            const skuParts: string[] = [];
            if (prefix && activeCat?.showInSku !== false) skuParts.push(prefix);

            // 2. Name Generation
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
                if (!code) return null;
                let attr = dynamicAttributes.find(a => a.type === type && a.value === code);

                if (!attr) {
                    const standardNames: Record<string, string> = {
                        brand: "бренд",
                        quality: "качество",
                        material: "материал",
                        color: "цвет",
                        size: "размер"
                    };
                    const targetName = standardNames[type];
                    if (targetName) {
                        const actualType = attributeTypes.find(t => t.name.toLowerCase() === targetName);
                        if (actualType) {
                            attr = dynamicAttributes.find(a => a.type === actualType.slug && a.value === code);
                        }
                    }
                }

                const attrType = attributeTypes.find(t => t.slug === (attr?.type || type));
                if (!attr) {
                    // Capitalize first letter if it's just a raw code
                    return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
                }

                if (attrType && attrType.showInName === false) return null;

                let meta: unknown = attr.meta;
                if (typeof meta === 'string') {
                    try { meta = JSON.parse(meta); } catch { meta = {}; }
                } else if (!meta) {
                    meta = {};
                }

                const typedMeta = meta as { showInName?: boolean; fem?: string; neut?: string };

                if (typedMeta?.showInName === false) return null;
                let result = attr.name;
                if (targetGender === "feminine" && typedMeta?.fem) result = typedMeta.fem;
                else if (targetGender === "neuter" && typedMeta?.neut) result = typedMeta.neut;

                // Capitalize first letter for specific attributes (like Country) or if it's the beginning of a name part
                if (attrType?.name.toLowerCase().includes("страна") || attrType?.name.toLowerCase().includes("country")) {
                    return result.charAt(0).toUpperCase() + result.slice(1);
                }

                return result;
            };

            const nameParts: string[] = [baseName].filter(Boolean);

            categoryAttributes.forEach((type: AttributeType) => {
                // "Артикул" is typically the internal product ID or something, don't show it in name parts if requested
                if (type.name === "Артикул" || type.slug === "article" || type.slug === "sku" || type.slug === "unit" || type.name.toLowerCase().includes("единица измерения")) return;

                const code = getCodeForSlug(type.slug, type.name);
                if (!code) return;

                // Add to SKU
                if (shouldShowInSku(type.slug, code)) {
                    skuParts.push(code);
                }

                // Add to Name
                const name = getAttrName(type.slug, code);
                if (name) nameParts.push(name);
            });

            const generatedSku = transliterate(skuParts.join("-").toUpperCase());
            const generatedName = nameParts.join(" ");

            if (generatedSku !== formData.sku) {
                updateFormData({ sku: generatedSku });
            }

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
        categoryAttributes,
        formData.itemName,
        formData.sku,
        updateFormData,
        getCodeForSlug
    ]);

    return {
        isClothing,
        isPackaging,
        isConsumables,
        categoryAttributes,
        getCodeForSlug
    };
}
