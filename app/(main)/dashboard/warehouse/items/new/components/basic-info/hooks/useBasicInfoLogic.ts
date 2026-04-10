import { useEffect, useCallback, useRef } from "react";
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

  const getCodeForSlug = useCallback((currentFormData: ItemFormData, slug: string, typeName?: string) => {
    const cleanSlug = slug.toLowerCase().trim();
    const cleanName = typeName?.toLowerCase().trim();

    // 1. Try mirroring in attributes first (most accurate for dynamic/custom slugs)
    if (currentFormData.attributes?.[slug]) return currentFormData.attributes[slug];
    if (currentFormData.attributes?.[cleanSlug]) return currentFormData.attributes[cleanSlug];

    // 2. Try direct slug match for standard fields
    if (cleanSlug === 'brand') return currentFormData.brandCode;
    if (cleanSlug === 'quality') return currentFormData.qualityCode;
    if (cleanSlug === 'material') return currentFormData.materialCode;
    if (cleanSlug === 'color') return currentFormData.attributeCode;
    if (cleanSlug === 'size') return currentFormData.sizeCode;

    // 3. Try mapping by name if it's a known standard type
    if (cleanName === 'бренд') return currentFormData.brandCode;
    if (cleanName === 'качество') return currentFormData.qualityCode;
    if (cleanName === 'материал') return currentFormData.materialCode;
    if (cleanName === 'размер') return currentFormData.sizeCode;
    if (cleanName === 'цвет') return currentFormData.attributeCode;

    return undefined;
  }, []);

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

  // Используем refs для нестабильных ссылок, чтобы не вызывать перезапуск эффекта
  const categoryAttributesRef = useRef(categoryAttributes);
  categoryAttributesRef.current = categoryAttributes;
  const dynamicAttributesRef = useRef(dynamicAttributes);
  dynamicAttributesRef.current = dynamicAttributes;
  const attributeTypesRef = useRef(attributeTypes);
  attributeTypesRef.current = attributeTypes;
  const subCategoriesRef = useRef(subCategories);
  subCategoriesRef.current = subCategories;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const updateFormDataRef = useRef(updateFormData);
  updateFormDataRef.current = updateFormData;

  // Автогенерация SKU и названия для одежды
  useEffect(() => {
    if (!isClothing) return;

    const currentFormData = formData;
    const activeCat = currentFormData.subcategoryId
      ? subCategoriesRef.current.find(c => c.id === currentFormData.subcategoryId)
      : categoryRef.current;
    const prefix = activeCat?.prefix;

    // 1. SKU Generation
    const shouldShowInSku = (type: string, code?: string) => {
      if (!code) return false;
      const attrType = attributeTypesRef.current.find(t => t.slug === type);
      if (attrType && attrType.showInSku === false) return false;
      if (attrType && attrType.showInSku === true) return true;
      const attr = dynamicAttributesRef.current.find(a => a.type === type && a.value === code);
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
      let attr = dynamicAttributesRef.current.find(a => a.type === type && a.value === code);

      if (!attr) {
        const standardNames: Record<string, string> = {
          brand: "бренд", quality: "качество", material: "материал", color: "цвет", size: "размер"
        };
        const targetName = standardNames[type];
        if (targetName) {
          const actualType = attributeTypesRef.current.find(t => t.name.toLowerCase() === targetName);
          if (actualType) {
            attr = dynamicAttributesRef.current.find(a => a.type === actualType.slug && a.value === code);
          }
        }
      }

      const attrType = attributeTypesRef.current.find(t => t.slug === (attr?.type || type));
      if (!attr) return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
      if (attrType && attrType.showInName === false) return null;

      let meta: { showInName?: boolean; fem?: string; neut?: string;[key: string]: unknown } = {};
      const rawMeta = attr.meta;
      if (typeof rawMeta === 'string') {
        try { meta = JSON.parse(rawMeta); } catch { meta = {}; }
      } else if (rawMeta && typeof rawMeta === 'object') {
        meta = rawMeta as Record<string, unknown>;
      }

      if (meta?.showInName === false) return null;

      let result = attr.name;
      if (targetGender === "feminine" && meta?.fem) result = meta.fem;
      else if (targetGender === "neuter" && meta?.neut) result = meta.neut;

      if (attrType?.name.toLowerCase().includes("страна") || attrType?.name.toLowerCase().includes("country")) {
        return result.charAt(0).toUpperCase() + result.slice(1);
      }
      return result;
    };

    const mainNameParts: string[] = [baseName].filter(Boolean);
    const secondaryNameParts: string[] = [];

    categoryAttributesRef.current.forEach((type: AttributeType) => {
      if (type.name === "Артикул" || type.slug === "article" || type.slug === "sku" || type.slug === "unit" || type.name.toLowerCase().includes("единица измерения")) return;

      const code = getCodeForSlug(currentFormData, type.slug, type.name);
      if (!code) return;

      if (shouldShowInSku(type.slug, code)) skuParts.push(code);

      if (type.showInName !== false) {
        const namePart = getAttrName(type.slug, code);
        if (namePart) {
          if (type.slug === 'size' || type.dataType === 'size' || type.name.toLowerCase().includes('размер')) {
            secondaryNameParts.push(namePart);
          } else {
            mainNameParts.push(namePart);
          }
        }
      }
    });

    const generatedSku = transliterate(skuParts.join("-").toUpperCase());
    const generatedName = [...mainNameParts, ...secondaryNameParts].join(" ");

    if (generatedSku !== currentFormData.sku) {
      updateFormDataRef.current({ sku: generatedSku });
    }

    if (generatedName && generatedName !== currentFormData.itemName) {
      updateFormDataRef.current({ itemName: generatedName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formData добавит бесконечный цикл; обновления идут через updateFormDataRef
  }, [
    isClothing,
    formData.subcategoryId,
    subCategories.length,
    formData.brandCode,
    formData.qualityCode,
    formData.materialCode,
    formData.attributeCode,
    formData.sizeCode,
    formData.attributes,
    getCodeForSlug
  ]);

  const getCodeForSlugBound = useCallback((slug: string, typeName?: string) => {
    return getCodeForSlug(formData, slug, typeName);
  }, [formData, getCodeForSlug]);

  return {
    isClothing,
    isPackaging,
    isConsumables,
    categoryAttributes,
    getCodeForSlug: getCodeForSlugBound
  };
}
