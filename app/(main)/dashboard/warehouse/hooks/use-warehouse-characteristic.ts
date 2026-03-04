import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createInventoryAttribute, deleteInventoryAttribute, updateInventoryAttribute, updateInventoryAttributeType, deleteInventoryAttributeType } from "../attribute-actions";
import type { InventoryAttribute as Attribute, AttributeType } from "../types";
import {
    DESIRED_CATEGORY_ORDER,
    sortAttributeValues,
    transliterateToSku,
    DEFAULT_VALUE_FORM,
    DEFAULT_TYPE_FORM,
    DEFAULT_DELETE_DIALOG
} from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

export interface CompositionItem {
    name: string;
    value: string;
    unit: string;
}

export interface ValueFormState {
    isOpen: boolean;
    targetTypeSlug: string | null;
    editingAttribute: Attribute | null;
    name: string;
    code: string;
    colorHex: string;
    // Dimensions
    length: string;
    width: string;
    height: string;
    dimensionUnit: "мм" | "см" | "м";
    // General metadata
    fullName: string;
    shortName: string;
    isOversize: boolean;
    // Composition
    compositionItems: CompositionItem[];
    // Consumables
    consumableType: string;
    consumableCustomType: string;
    consumableValue: string;
    consumableUnit: string;
    consumableExtra: string;
    error: string;
    isSaving: boolean;
    isCodeManuallyEdited: boolean;
}

export interface TypeFormState {
    editingType: AttributeType | null;
    name: string;
    categoryId: string;
    dataType: "text" | "unit" | "color" | "dimensions" | "quantity" | "composition" | "material" | "size" | "brand" | "country" | "density" | "weight" | "volume" | "package" | "consumable";
    isSystem: boolean;
    showInSku: boolean;
    showInName: boolean;
    hasColor: boolean;
    hasUnits: boolean;
    hasComposition: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface DeleteDialogState {
    attribute: Attribute | null;
    type: AttributeType | null;
    isDeleting: boolean;
    isDeletingType: boolean;
    password: string;
}

interface UseWarehouseCharacteristicProps {
    attributes: Attribute[];
    attributeTypes: AttributeType[];
    categories: Category[];
}

export function useWarehouseCharacteristic({ attributes, attributeTypes, categories }: UseWarehouseCharacteristicProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const rootCategories = useMemo(() => {
        return categories
            .filter(c => !c.parentId)
            .sort((a, b) => {
                const indexA = DESIRED_CATEGORY_ORDER.indexOf(a.name);
                const indexB = DESIRED_CATEGORY_ORDER.indexOf(b.name);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [categories]);

    const hasUncategorized = attributeTypes.some(t => !t.categoryId);

    const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
        const cat = searchParams.get("cat");
        if (cat) return cat;
        if (rootCategories.length > 0) return rootCategories[0].id;
        if (hasUncategorized) return "uncategorized";
        return "";
    });

    const [valueForm, setValueForm] = useState<ValueFormState>(DEFAULT_VALUE_FORM);
    const [typeForm, setTypeForm] = useState<TypeFormState>(DEFAULT_TYPE_FORM);
    const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(DEFAULT_DELETE_DIALOG);

    const editingTypeLatest = typeForm.editingType ? attributeTypes.find(t => t.id === typeForm.editingType?.id) : null;
    const editingTypeValues = useMemo(() => {
        if (!editingTypeLatest) return [];
        const baseValues = attributes.filter(a => a.type === editingTypeLatest.slug);
        return sortAttributeValues(baseValues, editingTypeLatest.dataType);
    }, [editingTypeLatest, attributes]);

    useEffect(() => {
        const cat = searchParams.get("cat");
        if (cat) {
            setActiveCategoryId(cat);
            return;
        }

        const isActiveValid = activeCategoryId === "uncategorized" || rootCategories.some(c => c.id === activeCategoryId);
        if (!activeCategoryId || !isActiveValid) {
            if (rootCategories.length > 0) {
                setActiveCategoryId(rootCategories[0].id);
            } else if (hasUncategorized) {
                setActiveCategoryId("uncategorized");
            }
        }
    }, [rootCategories, hasUncategorized, activeCategoryId, searchParams]);

    const handleCategoryChange = (id: string) => {
        setActiveCategoryId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set("cat", id);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    function openAddValue(typeSlug: string) {
        setValueForm({
            ...DEFAULT_VALUE_FORM,
            isOpen: true,
            targetTypeSlug: typeSlug
        });
    }

    function openEditValue(attr: Attribute) {
        const type = attributeTypes.find(t => t.slug === attr.type);
        if (type) openEditType(type);

        let meta: unknown = attr.meta;
        if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch { meta = {}; }
        } else if (!meta) {
            meta = {};
        }

        const typedMeta = meta as {
            hex?: string;
            length?: string;
            width?: string;
            height?: string;
            dimensionUnit?: "мм" | "см" | "м";
            fullName?: string;
            shortName?: string;
            isOversize?: boolean;
            items?: { name: string; value?: string; percent?: string; unit?: string }[];
            consumableType?: string;
            consumableCustomType?: string;
            consumableValue?: string;
            consumableUnit?: string;
            consumableExtra?: string;
        };

        const compositionItems = typedMeta?.items && typedMeta.items.length > 0
            ? typedMeta.items.map((it) => ({
                name: it.name || "",
                value: it.value || it.percent || "",
                unit: it.unit || "%"
            }))
            : [{ name: "", value: "", unit: "%" }];

        const isDensity = type?.dataType === "density";
        const isWeight = type?.dataType === "weight";
        const isVolume = type?.dataType === "volume";

        // IMPORTANT: The short version is attr.name, the full version is typedMeta.fullName
        // If meta.fullName is missing, we fall back to name
        const initialFullName = typedMeta?.fullName || attr.name;

        // For numeric types, we might want to strip units if they were accidentally saved in fullName
        if (isDensity || isWeight || isVolume) {
            // But let's keep it simple for now and just use what's in meta or attr.name
        }

        setValueForm({
            isOpen: true,
            targetTypeSlug: attr.type,
            editingAttribute: attr,
            name: attr.name, // Short version
            code: attr.value,
            isCodeManuallyEdited: false,
            colorHex: typedMeta?.hex || "#000000",
            length: typedMeta?.length || "",
            width: typedMeta?.width || "",
            height: typedMeta?.height || "",
            dimensionUnit: typedMeta?.dimensionUnit || "мм",
            fullName: initialFullName, // Full version
            shortName: attr.name, // Also track shortName explicitly if needed for UI
            isOversize: typedMeta?.isOversize || false,
            compositionItems,
            consumableType: typedMeta?.consumableType || "краска",
            consumableCustomType: typedMeta?.consumableCustomType || "",
            consumableValue: typedMeta?.consumableValue || "",
            consumableUnit: typedMeta?.consumableUnit || "мл",
            consumableExtra: typedMeta?.consumableExtra || "",
            error: "",
            isSaving: false
        });

        if (type?.dataType === "consumable" && typedMeta?.hex) {
            setTypeForm(prev => ({ ...prev, hasColor: true }));
        }
    }

    async function handleValueSave() {
        if (!valueForm.targetTypeSlug) return;

        const currentType = attributeTypes.find(t => t.slug === valueForm.targetTypeSlug);
        const dataType = currentType?.dataType;
        const isComposition = dataType === "composition";
        const isConsumable = dataType === "consumable";
        const hasComposition = typeForm.hasComposition || isComposition || isConsumable;
        const hasColor = (dataType === "color") || typeForm.hasColor;
        const isDimensions = dataType === "dimensions";
        const filled = (hasComposition || isComposition) ? valueForm.compositionItems.filter(i => i.name.trim()) : [];

        let effectiveName = valueForm.name;
        let effectiveCode = valueForm.code;

        if ((hasComposition || isComposition) && !isConsumable) {
            if (filled.length === 0) { setValueForm(prev => ({ ...prev, error: "Добавьте хотя бы один компонент" })); return; }
            effectiveName = filled.map(i => `${i.name}${i.unit === '%' ? '%' : ` ${i.unit}`}`).join(",");
            effectiveCode = filled.map(i => `${transliterateToSku(i.name).substring(0, 4).toUpperCase()}${transliterateToSku(i.unit).toUpperCase()}`).join("");
            setValueForm(prev => ({ ...prev, name: effectiveName, code: effectiveCode }));
        } else if (isConsumable) {
            const typeValue = valueForm.consumableType === "другое" ? valueForm.consumableCustomType : valueForm.consumableType;
            if (hasComposition) {
                const compName = filled.map(i => `${i.name}${i.unit === '%' ? '%' : ` ${i.unit}`}`).join(",");
                const compCode = filled.map(i => `${transliterateToSku(i.name).substring(0, 4).toUpperCase()}${transliterateToSku(i.unit).toUpperCase()}`).join("");
                effectiveName = `${typeValue}${compName ? ` ${compName}` : ""}${valueForm.consumableExtra ? ` (${valueForm.consumableExtra})` : ""}`;
                if (!valueForm.isCodeManuallyEdited) {
                    effectiveCode = `${transliterateToSku(typeValue).toUpperCase()}${compCode}${valueForm.consumableExtra ? transliterateToSku(valueForm.consumableExtra).substring(0, 3).toUpperCase() : ""}`;
                }
            } else {
                effectiveName = `${typeValue}${valueForm.consumableValue ? ` ${valueForm.consumableValue}${valueForm.consumableUnit}` : ""}${valueForm.consumableExtra ? ` (${valueForm.consumableExtra})` : ""}`;
                if (!valueForm.isCodeManuallyEdited) {
                    effectiveCode = `${transliterateToSku(typeValue).toUpperCase()}${valueForm.consumableValue}${transliterateToSku(valueForm.consumableUnit).toUpperCase()}${valueForm.consumableExtra ? transliterateToSku(valueForm.consumableExtra).substring(0, 3).toUpperCase() : ""}`;
                }
            }
        } else {
            if (!valueForm.name.trim()) { setValueForm(prev => ({ ...prev, error: "Введите название" })); return; }
            if (!valueForm.code.trim()) { setValueForm(prev => ({ ...prev, error: "Введите код" })); return; }
        }

        const normalizedCode = effectiveCode.trim().toUpperCase();
        const isDuplicate = editingTypeValues.some((attr: Attribute) => {
            if (valueForm.editingAttribute && attr.id === valueForm.editingAttribute.id) return false;
            return normalizedCode === attr.value.trim().toUpperCase();
        });

        if (isDuplicate) {
            setValueForm(prev => ({ ...prev, error: "Значение с таким кодом уже существует", isSaving: false }));
            toast("Значение с таким кодом уже существует", "error");
            return;
        }

        const meta = {
            hex: hasColor ? valueForm.colorHex : undefined,
            length: isDimensions ? valueForm.length : undefined,
            width: isDimensions ? valueForm.width : undefined,
            height: isDimensions ? valueForm.height : undefined,
            dimensionUnit: isDimensions ? valueForm.dimensionUnit : undefined,
            fullName: valueForm.fullName,
            shortName: valueForm.shortName,
            isOversize: (dataType === "size") ? valueForm.isOversize : undefined,
            items: (hasComposition || isComposition) ? filled : undefined,
            consumableType: isConsumable ? valueForm.consumableType : undefined,
            consumableCustomType: isConsumable ? valueForm.consumableCustomType : undefined,
            consumableValue: isConsumable ? valueForm.consumableValue : undefined,
            consumableUnit: isConsumable ? valueForm.consumableUnit : undefined,
            consumableExtra: isConsumable ? valueForm.consumableExtra : undefined,
        };

        try {
            setValueForm(prev => ({ ...prev, isSaving: true }));
            let res;
            if (valueForm.editingAttribute) {
                res = await updateInventoryAttribute(valueForm.editingAttribute.id, { type: valueForm.editingAttribute.type, name: effectiveName, value: effectiveCode, meta });
            } else {
                res = await createInventoryAttribute({ type: valueForm.targetTypeSlug, name: effectiveName, value: effectiveCode, meta });
            }

            if (!res.success) {
                setValueForm(prev => ({ ...prev, error: res.error || "Ошибка при сохранении" }));
            } else {
                toast(valueForm.editingAttribute ? "Обновлено успешно" : "Добавлено успешно", "success");
                setValueForm(prev => ({ ...prev, isOpen: false }));
                router.refresh();
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Save error:", err);
            setValueForm(prev => ({ ...prev, error: "Ошибка при сохранении" }));
        } finally {
            setValueForm(prev => ({ ...prev, isSaving: false }));
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteDialog.attribute) return;
        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
        try {
            const res = await deleteInventoryAttribute(deleteDialog.attribute.id);
            if (res.success) {
                toast("Удалено успешно", "success");
                setDeleteDialog(prev => ({ ...prev, attribute: null }));
                if (valueForm.editingAttribute?.id === deleteDialog.attribute.id) {
                    setValueForm(prev => ({ ...prev, isOpen: false }));
                }
                router.refresh();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Delete error:", err);
            toast("Ошибка при удалении", "error");
        } finally {
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    }

    async function handleDeleteTypeConfirm() {
        if (!deleteDialog.type) return;
        setDeleteDialog(prev => ({ ...prev, isDeletingType: true }));
        try {
            const res = await deleteInventoryAttributeType(deleteDialog.type.id, deleteDialog.password);
            if (res.success) {
                toast("Раздел удален", "success");
                setDeleteDialog(prev => ({ ...prev, type: null, password: "" }));
                setTypeForm(prev => ({ ...prev, editingType: null }));
                router.refresh();
            } else {
                toast(res.error || "Ошибка удаления", "error");
                setDeleteDialog(prev => ({ ...prev, password: "" }));
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Delete type error:", err);
            toast("Ошибка удаления", "error");
            setDeleteDialog(prev => ({ ...prev, password: "" }));
        } finally {
            setDeleteDialog(prev => ({ ...prev, isDeletingType: false }));
        }
    }

    function openEditType(type: AttributeType) {
        setTypeForm({
            editingType: type,
            name: type.name,
            categoryId: type.categoryId || "uncategorized",
            dataType: type.dataType || "text",
            isSystem: type.isSystem || false,
            showInSku: type.showInSku ?? true,
            showInName: type.showInName ?? true,
            hasColor: type.hasColor ?? false,
            hasUnits: type.hasUnits ?? false,
            hasComposition: type.hasComposition ?? false,
            isLoading: false,
            error: null
        });
    }

    async function handleTypeUpdate() {
        if (!typeForm.editingType || !typeForm.name.trim()) return;
        setTypeForm(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const catId = typeForm.categoryId === "uncategorized" ? null : typeForm.categoryId;
            const res = await updateInventoryAttributeType(
                typeForm.editingType.id,
                {
                    name: typeForm.name,
                    slug: typeForm.editingType.slug,
                    category: catId,
                    isSystem: typeForm.isSystem,
                    showInSku: typeForm.showInSku,
                    showInName: typeForm.showInName,
                    dataType: typeForm.dataType,
                    hasColor: typeForm.hasColor,
                    hasComposition: typeForm.hasComposition
                }
            );
            if (res.success) {
                toast("Раздел обновлен", "success");
                setTypeForm(prev => ({ ...prev, editingType: null }));
                router.refresh();
            } else {
                const errorMsg = res.error || "Ошибка обновления";
                setTypeForm(prev => ({ ...prev, error: errorMsg }));
                toast(errorMsg, "error");
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Update type error:", err);
            toast("Ошибка обновления", "error");
        } finally {
            setTypeForm(prev => ({ ...prev, isLoading: false }));
        }
    }

    const filteredTypes = activeCategoryId === "uncategorized"
        ? attributeTypes.filter(t => !t.categoryId)
        : attributeTypes.filter(t => t.categoryId === activeCategoryId);

    return {
        rootCategories,
        hasUncategorized,
        activeCategoryId,
        valueForm, setValueForm,
        typeForm, setTypeForm,
        deleteDialog, setDeleteDialog,
        editingTypeLatest,
        editingTypeValues,
        filteredTypes,
        handleCategoryChange,
        openAddValue,
        openEditValue,
        handleValueSave,
        handleDeleteConfirm,
        handleDeleteTypeConfirm,
        openEditType,
        handleTypeUpdate
    };
}
