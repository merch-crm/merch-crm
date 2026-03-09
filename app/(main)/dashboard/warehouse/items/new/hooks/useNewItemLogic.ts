"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { sortCategories } from "@/app/(main)/dashboard/warehouse/category-utils";
import { Category, StorageLocation, ItemFormData, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import { useNewItemState } from "./use-new-item-state";
import { useNewItemDraft } from "./use-new-item-draft";
import { useNewItemNavigation } from "./use-new-item-navigation";
import { generateLineName, generatePositionName, singularize } from "@/lib/utils/line-name-generator";
import { LineData } from "../types";
import {
    createBaseLineWithPositions,
    createFinishedLineWithPositions,
    createSingleItem,
    getBaseLinesForCategory,
    getPrintsForSelection
} from "../actions";

const CATEGORY_TYPES = {
    packaging: "упаковка",
} as const;

interface UseNewItemLogicProps {
    categories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    initialCategoryId?: string;
    initialSubcategoryId?: string;
}

export function useNewItemLogic({
    categories,
    dynamicAttributes,
    attributeTypes,
    initialCategoryId: _initialCategoryId,
    initialSubcategoryId: _initialSubcategoryId,
}: UseNewItemLogicProps) {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    const state = useNewItemState();
    const draft = useNewItemDraft(isMounted, state, state.setIsSaving);
    const nav = useNewItemNavigation(state.step, state.setStep, state.creationType, state.lineMode, state.setValidationError);

    const [lineData, setLineData] = useState<LineData>({
        customName: "",
        description: "",
        commonAttributeIds: [],
        printCollectionId: null,
        baseLineId: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availableBaseLines, setAvailableBaseLines] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availablePrints, setAvailablePrints] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Initial load from URL parameters
    useEffect(() => {
        const lineId = searchParams.get("lineId");
        const lineType = searchParams.get("lineType");
        if (lineId && lineType) {
            state.setSelectedLineId(lineId);
            state.setLineMode("existing");
            state.setCreationType(lineType === "finished" ? "finished_line" : "base_line");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Загрузка данных для готовой линейки при переходе на шаг 2
    useEffect(() => {
        if (state.step === 2 && state.creationType === "finished_line") {
            const categoryId = state.formData.subcategoryId || state.selectedCategory?.id;
            if (categoryId) {
                setIsLoadingData(true);
                getBaseLinesForCategory(categoryId).then((res) => {
                    setAvailableBaseLines(res || []);
                });
            }
        }
    }, [state.step, state.creationType, state.formData.subcategoryId, state.selectedCategory]);

    useEffect(() => {
        if (state.selectedCollectionId) {
            getPrintsForSelection(state.selectedCollectionId).then((res) => {
                setAvailablePrints(res || []);
            });
        } else {
            setAvailablePrints([]);
        }
    }, [state.selectedCollectionId]);

    // Initial hydration and mounting
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Синхронизация общих характеристик (Common Attributes)
    useEffect(() => {
        if (state.creationType !== "base_line") return;

        const newCommonAttributes: Record<string, { isCommon: boolean; value: string }> = {};

        // Фильтруем по текущей категории и подкатегории
        const categoryId = state.selectedCategory?.id;
        const subcategoryId = state.formData.subcategoryId;
        const relevantTypes = attributeTypes.filter(t =>
            !t.categoryId ||
            t.categoryId === categoryId ||
            (subcategoryId && t.categoryId === subcategoryId)
        );

        relevantTypes.forEach(attr => {
            const isCommonForLine = lineData.commonAttributeIds.includes(attr.id);
            // Пытаемся взять значение из разных вариантов ключей массива
            const attrValue = state.formData.attributes?.[attr.slug] ||
                state.formData.attributes?.[attr.id] ||
                "";

            if (isCommonForLine) {
                newCommonAttributes[attr.slug] = {
                    isCommon: true,
                    value: attrValue
                };
            }
        });

        // Проверяем изменился ли объект перед обновлением (предотвращаем лишние рендеры)
        const isChanged = JSON.stringify(newCommonAttributes) !== JSON.stringify(state.commonAttributes);
        if (isChanged) {
            state.setCommonAttributes(newCommonAttributes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- state — нестабильный объект; полный deps вызовет бесконечный цикл
    }, [lineData.commonAttributeIds, state.formData.attributes, attributeTypes, state.creationType, state.commonAttributes, state.setCommonAttributes, state.selectedCategory?.id, state.formData.subcategoryId]);

    const handleReset = () => {
        draft.clearDraft();
        state.resetForm();
        state.resetMatrixAndLineStates();
        state.setCreationType("single");
        state.setLineMode("new");
        toast("Форма сброшена", "info");
    };

    const subCategories = state.selectedCategory
        ? sortCategories(categories.filter((c) => c.parentId === state.selectedCategory!.id))
        : [];

    const isPackaging = state.selectedCategory?.name.toLowerCase().includes(CATEGORY_TYPES.packaging);
    const topLevelCategories = sortCategories(categories.filter((c) => !c.parentId || c.parentId === ""));
    const hasSubCategories = subCategories.length > 0;

    const handleCategorySelect = (category: Category) => {
        state.setSelectedCategory(category);
        state.setValidationError("");
        state.setFormData((prev: ItemFormData) => ({
            ...prev,
            subcategoryId: "",
            brandCode: "",
            qualityCode: "",
            materialCode: "",
            attributeCode: "",
            sizeCode: "",
            itemName: "",
            attributes: {},
        }));
        state.resetMatrixAndLineStates();
    };

    const handleSubCategorySelect = (subCategory: Category) => {
        if (subCategory.id === state.formData.subcategoryId) return;
        state.setValidationError("");
        state.updateFormData({
            subcategoryId: subCategory.id,
            attributes: {},
            brandCode: "",
            qualityCode: "",
            materialCode: "",
            attributeCode: "",
            sizeCode: "",
        });
        state.resetMatrixAndLineStates();
    };

    const validateStep = (currentStep: number): boolean => {
        state.setValidationError("");

        if (currentStep === 0) {
            if (!state.selectedCategory) {
                state.setValidationError("Выберите категорию");
                return false;
            }
            if (hasSubCategories && !state.formData.subcategoryId) {
                state.setValidationError("Выберите подкатегорию");
                return false;
            }
        }

        if (currentStep === 1) {
            if (state.creationType === "finished_line") {
                if (!state.selectedCollectionId) {
                    state.setValidationError("Выберите коллекцию дизайнов");
                    return false;
                }
            }
        }

        if (currentStep === 3) {
            if (state.creationType === "finished_line") {
                if (state.selectedPrintIds.length === 0) {
                    state.setValidationError("Выберите хотя бы один принт");
                    return false;
                }
            } else if (state.creationType !== "single") {
                if (state.generatedPositions.length === 0) {
                    state.setValidationError("Сгенерируйте позиции");
                    return false;
                }
            }
        }

        if (currentStep === 4) {
            if (state.creationType === "finished_line") {
                if (state.generatedPositions.length === 0) {
                    state.setValidationError("Матрица пуста. Проверьте комбинации.");
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateStep(state.step)) return;
        state.setIsSubmitting(true);
        state.setValidationError("");

        try {
            const categoryId = state.formData.subcategoryId || state.selectedCategory!.id;

            if (state.creationType === "finished_line") {
                const res = await createFinishedLineWithPositions({
                    categoryId,
                    lineName: getLineName(),
                    description: lineData.description,
                    printCollectionId: state.selectedCollectionId!,
                    baseLineId: state.selectedLineId,
                    positions: state.generatedPositions.map(p => ({
                        name: p.name,
                        sku: p.sku,
                        printDesignId: p.designId!,
                        attributes: p.attributes
                    })),
                    stock: {
                        quantity: Number(state.formData.quantity) || 0,
                        locationId: (state.formData.locationId as string) || "",
                        minStock: Number(state.formData.minStock) || 0,
                        userId: (state.formData.userId as string) || ""
                    }
                });

                if (res.success) {
                    toast("Готовая линейка создана", "success");
                    playSound("notification_success");
                    handleReset();
                    window.location.href = `/dashboard/warehouse/lines/${res.lineId}`;
                } else {
                    state.setValidationError(res.error || "Ошибка при создании линейки");
                }
            } else if (state.creationType === "base_line") {
                const res = await createBaseLineWithPositions({
                    line: {
                        name: getLineName(),
                        categoryId,
                        subcategoryId: state.formData.subcategoryId,
                        brandCode: state.formData.brandCode,
                        qualityCode: state.formData.qualityCode,
                        materialCode: state.formData.materialCode,
                        itemType: "base",
                        unit: (state.formData.unit as string) || "шт.",
                    },
                    positions: state.generatedPositions.map(p => ({
                        name: p.name,
                        sku: p.sku,
                        attributes: p.attributes,
                        sizeCode: p.attributes.size || p.attributes.Size,
                        quantity: 0,
                    }))
                });

                if (res.success) {
                    toast("Базовая линейка создана", "success");
                    playSound("notification_success");
                    handleReset();
                    window.location.href = `/dashboard/warehouse/lines/${res.lineId}`;
                } else {
                    state.setValidationError(res.error || "Ошибка при создании линейки");
                }
            } else {
                // Одиночная позиция
                const res = await createSingleItem({
                    ...state.formData,
                    categoryId: state.selectedCategory!.id,
                });
                if (res.success) {
                    toast("Позиция создана", "success");
                    playSound("notification_success");
                    handleReset();
                    window.location.href = `/dashboard/warehouse/items/${res.id}`;
                } else {
                    state.setValidationError(res.error || "Ошибка при создании позиции");
                }
            }
        } catch (error) {
            console.error("[NEW_ITEM_SUBMIT] Error:", error);
            state.setValidationError(error instanceof Error ? error.message : "Произошла ошибка при создании");
            playSound("notification_error");
        } finally {
            state.setIsSubmitting(false);
        }
    };

    const getSteps = () => {
        const currentSubCat = subCategories.find(s => s.id === state.formData.subcategoryId) ||
            categories.find(s => s.id === state.formData.subcategoryId);
        const categoryDesc = currentSubCat?.name || state.selectedCategory?.name || "Выбор категории";

        const typeLabels: Record<string, string> = {
            single: "Одиночная позиция",
            base_line: "Базовая линейка",
            finished_line: "Готовая линейка"
        };
        const typeDesc = typeLabels[state.creationType] || "Тип создания";

        const base = [
            { id: 0, title: "Категория", desc: categoryDesc },
            { id: 1, title: "Тип", desc: typeDesc },
        ];

        if (state.creationType === "single") {
            return [
                ...base,
                { id: 2, title: "Описание", desc: "Характеристики" },
                { id: 3, title: "Галерея", desc: "Фото и медиа" },
                { id: 4, title: "Склад", desc: "Остатки и хранение" },
                { id: 5, title: "Итог", desc: "Проверка и создание" },
            ];
        }

        if (state.creationType === "finished_line") {
            return [
                ...base,
                { id: 2, title: "База", desc: "Коллекция и база" },
                { id: 3, title: "Принты", desc: "Выбор принтов" },
                { id: 4, title: "Матрица", desc: "Комбинации вариантов" },
                { id: 5, title: "Итог", desc: "Подтверждение" },
            ];
        }

        const steps = [...base];
        if (state.lineMode === "new") {
            steps.push({ id: 2, title: "Линейка", desc: "Характеристики линейки" });
        }
        return [
            ...steps,
            { id: 3, title: "Матрица", desc: "Выбор комбинаций" },
            { id: 4, title: "Склад", desc: "Цены и хранение" },
            { id: 5, title: "Итог", desc: "Проверка и создание" }
        ];
    };

    const getLineName = useCallback(() => {
        if (lineData.customName.trim()) {
            return lineData.customName.trim();
        }

        const commonAttributes = lineData.commonAttributeIds
            .map((attrId) => {
                const attrType = attributeTypes.find((t) => t.id === attrId);
                if (!attrType) return null;

                const selectedValueCode = state.formData.attributes?.[attrType.slug];
                if (!selectedValueCode) return null;

                const attrValue = dynamicAttributes.find(
                    (a) => a.type === attrType.slug && a.value === selectedValueCode
                );

                return {
                    attributeId: attrId,
                    attributeCode: attrType.slug,
                    attributeName: attrType.name,
                    value: selectedValueCode,
                    valueLabel: attrValue?.name || selectedValueCode,
                };
            })
            .filter(Boolean);

        return generateLineName({ attributes: commonAttributes as never });
    }, [lineData.customName, lineData.commonAttributeIds, state.formData.attributes, dynamicAttributes, attributeTypes]);

    const generatePositionNames = useCallback((
        positions: Array<{ printName?: string; colorName: string; sizeName: string }>
    ) => {
        const subcategory = categories.find((c) => c.id === state.formData.subcategoryId);

        const productName = subcategory ? singularize(subcategory.name) : "";
        const lineName = getLineName();

        return positions.map((pos) => ({
            ...pos,
            name: generatePositionName({
                productName,
                lineName,
                printName: pos.printName || "",
                colorName: pos.colorName,
                sizeName: pos.sizeName,
            }),
        }));
    }, [state.formData.subcategoryId, categories, getLineName]);

    return {
        ...state,
        subCategories,
        isPackaging,
        topLevelCategories,
        hasSubCategories,
        handleCategorySelect,
        handleSubCategorySelect,
        handleBack: nav.handleBack,
        handleNext: () => nav.handleNext(validateStep),
        handleSubmit,
        handleReset,
        getSteps,
        lineData,
        setLineData,
        getLineName,
        generatePositionNames,
        availableBaseLines,
        availablePrints,
        isLoadingData,
        handleSidebarClick: (target: number) => {
            if (target <= state.maxStep && target !== state.step) {
                state.setStep(target);
                state.setValidationError("");
            }
        }
    };
}
