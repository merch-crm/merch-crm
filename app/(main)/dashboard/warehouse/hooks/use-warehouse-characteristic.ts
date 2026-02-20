import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createInventoryAttribute, deleteInventoryAttribute, updateInventoryAttribute, updateInventoryAttributeType, deleteInventoryAttributeType } from "../attribute-actions";
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

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

export interface ValueFormState {
    isOpen: boolean;
    targetTypeSlug: string | null;
    editingAttribute: Attribute | null;
    name: string;
    code: string;
    colorHex: string;
    error: string;
    isSaving: boolean;
    isCodeManuallyEdited: boolean;
}

export interface TypeFormState {
    editingType: AttributeType | null;
    name: string;
    categoryId: string;
    isSystem: boolean;
    showInSku: boolean;
    showInName: boolean;
    isLoading: boolean;
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

    const [valueForm, setValueForm] = useState<ValueFormState>({
        isOpen: false,
        targetTypeSlug: null,
        editingAttribute: null,
        name: "",
        code: "",
        colorHex: "#000000",
        error: "",
        isSaving: false,
        isCodeManuallyEdited: false
    });

    const [typeForm, setTypeForm] = useState<TypeFormState>({
        editingType: null,
        name: "",
        categoryId: "uncategorized",
        isSystem: false,
        showInSku: true,
        showInName: true,
        isLoading: false
    });

    const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
        attribute: null,
        type: null,
        isDeleting: false,
        isDeletingType: false,
        password: ""
    });

    const editingTypeLatest = typeForm.editingType ? attributeTypes.find(t => t.id === typeForm.editingType?.id) : null;
    const editingTypeValues = editingTypeLatest ? attributes.filter(a => a.type === editingTypeLatest.slug) : [];

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
            isOpen: true,
            targetTypeSlug: typeSlug,
            editingAttribute: null,
            name: "",
            code: "",
            isCodeManuallyEdited: false,
            colorHex: "#000000",
            error: "",
            isSaving: false
        });
    }

    function openEditValue(attr: Attribute) {
        let meta: unknown = attr.meta;
        if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch { meta = {}; }
        } else if (!meta) {
            meta = {};
        }

        const typedMeta = meta as { hex?: string; showInName?: boolean; showInSku?: boolean };

        setValueForm({
            isOpen: true,
            targetTypeSlug: attr.type,
            editingAttribute: attr,
            name: attr.name,
            code: attr.value,
            isCodeManuallyEdited: true,
            colorHex: typedMeta?.hex || "#000000",
            error: "",
            isSaving: false
        });
    }

    async function handleValueSave() {
        if (!valueForm.name.trim()) { setValueForm(prev => ({ ...prev, error: "Введите название" })); return; }
        if (!valueForm.code.trim()) { setValueForm(prev => ({ ...prev, error: "Введите код" })); return; }
        if (!valueForm.targetTypeSlug) return;

        setValueForm(prev => ({ ...prev, error: "", isSaving: true }));

        const meta = {
            ...(valueForm.targetTypeSlug === "color" ? { hex: valueForm.colorHex } : {}),
        };

        try {
            let res;
            if (valueForm.editingAttribute) {
                res = await updateInventoryAttribute(valueForm.editingAttribute.id, { type: valueForm.editingAttribute.type, name: valueForm.name, value: valueForm.code, meta });
            } else {
                res = await createInventoryAttribute({ type: valueForm.targetTypeSlug, name: valueForm.name, value: valueForm.code, meta });
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
            isSystem: type.isSystem || false,
            showInSku: type.showInSku ?? true,
            showInName: type.showInName ?? true,
            isLoading: false
        });
    }

    async function handleTypeUpdate() {
        if (!typeForm.editingType || !typeForm.name.trim()) return;
        setTypeForm(prev => ({ ...prev, isLoading: true }));
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
                    showInName: typeForm.showInName
                }
            );
            if (res.success) {
                toast("Раздел обновлен", "success");
                setTypeForm(prev => ({ ...prev, editingType: null }));
                router.refresh();
            } else {
                toast(res.error || "Ошибка обновления", "error");
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
