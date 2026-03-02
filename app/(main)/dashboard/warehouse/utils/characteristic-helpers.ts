import type { InventoryAttribute as Attribute, AttributeType } from "../types";

export const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};

export const DESIRED_CATEGORY_ORDER = ["Одежда", "Упаковка", "Расходники"];

export const getColorHex = (meta: unknown): string => {
    if (typeof meta === 'object' && meta !== null && 'hex' in meta) {
        return (meta as { hex: string }).hex;
    }
    return "#000000";
};

export const transliterateToSku = (text: string) => {
    const transliterated = text.toLowerCase().split('').map(char => {
        if (char === ' ') return '';
        return RUSSIAN_TO_LATIN_MAP[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '');
    return transliterated.substring(0, 3);
};

// Normalised unit weights — supports both Cyrillic display values and Latin SKU codes
const UNIT_WEIGHTS: Record<string, number> = {
    // Length (Cyrillic display names)
    "мм": 1, "см": 2, "м": 3,
    // Length (Latin SKU codes)
    "mm": 1, "sm": 2, "m": 3,
    // Weight
    "г": 1, "кг": 1000,
    "g": 1, "kg": 1000,
    // Volume
    "мл": 1, "л": 1000,
    "ml": 1, "l": 1000
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];

const getSizeRank = (rawSize: string): number => {
    // Strip _OS (Oversize) suffix to rank oversize and normal together
    const s = rawSize.toUpperCase().replace(/_OS$/, "").trim();
    const exactIndex = SIZE_ORDER.indexOf(s);
    if (exactIndex !== -1) {
        // Oversize variants go just after their base size
        const isOversize = rawSize.toUpperCase().endsWith("_OS");
        return exactIndex * 2 + (isOversize ? 1 : 0);
    }

    // European / numeric sizes (e.g. 44, 46, 48)
    const num = parseInt(s);
    if (!isNaN(num)) return 1000 + num;

    return 9999;
};

export const sortAttributeValues = (values: Attribute[], dataType: string): Attribute[] => {
    return [...values].sort((a, b) => {
        // 1. Pure numeric types — sort by numeric value, normalising units
        if (["quantity", "density", "weight", "volume"].includes(dataType)) {
            const numA = parseFloat(a.value);
            const numB = parseFloat(b.value);

            if (!isNaN(numA) && !isNaN(numB)) {
                const unitA = a.value.replace(/[0-9.,\s]/g, '').toLowerCase();
                const unitB = b.value.replace(/[0-9.,\s]/g, '').toLowerCase();

                if (unitA !== unitB) {
                    const wA = UNIT_WEIGHTS[unitA] ?? 1;
                    const wB = UNIT_WEIGHTS[unitB] ?? 1;
                    return (numA * wA) - (numB * wB);
                }

                return numA - numB;
            }
        }

        // 2. Unit types (мм → см → м, also handles Latin codes MM → SM → M)
        if (dataType === "unit") {
            const wA = UNIT_WEIGHTS[a.value.toLowerCase()] ?? 999;
            const wB = UNIT_WEIGHTS[b.value.toLowerCase()] ?? 999;
            if (wA !== wB) return wA - wB;
        }

        // 3. Clothing sizes (XS → S → M → S_OS → M_OS…)
        if (dataType === "size") {
            const rankA = getSizeRank(a.value);
            const rankB = getSizeRank(b.value);
            if (rankA !== rankB) return rankA - rankB;
        }

        // Default: locale-aware alphabetical with numeric awareness
        return a.name.localeCompare(b.name, 'ru', { numeric: true, sensitivity: 'base' });
    });
};

export const DEFAULT_VALUE_FORM = {
    isOpen: false,
    targetTypeSlug: null as string | null,
    editingAttribute: null as Attribute | null,
    name: "",
    code: "",
    colorHex: "#000000",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "мм" as "мм" | "см" | "м",
    fullName: "",
    shortName: "",
    isOversize: false,
    compositionItems: [{ name: "", value: "", unit: "%" }],
    consumableType: "краска",
    consumableCustomType: "",
    consumableValue: "",
    consumableUnit: "мл",
    consumableExtra: "",
    error: "",
    isSaving: false,
    isCodeManuallyEdited: false
};

export const DEFAULT_TYPE_FORM = {
    editingType: null as AttributeType | null,
    name: "",
    categoryId: "uncategorized",
    dataType: "text" as AttributeType["dataType"],
    isSystem: false,
    showInSku: true,
    showInName: true,
    hasColor: false,
    hasUnits: false,
    hasComposition: false,
    isLoading: false,
    error: null as string | null
};

export const DEFAULT_DELETE_DIALOG = {
    attribute: null as Attribute | null,
    type: null as AttributeType | null,
    isDeleting: false,
    isDeletingType: false,
    password: ""
};
