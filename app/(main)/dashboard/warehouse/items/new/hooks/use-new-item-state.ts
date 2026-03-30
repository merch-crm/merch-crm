"use client";

import { useState, useCallback } from "react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useNewItemForm } from "./useNewItemForm";

export type CreationType = "single" | "base_line" | "finished_line";
export type LineMode = "new" | "existing";

export function useNewItemState() {
    const form = useNewItemForm();

    const [creationType, setCreationType] = useState<CreationType>("single");
    const [lineMode, setLineMode] = useState<LineMode>("new");
    const [selectedLineId, setSelectedLineId] = useState("");
    const [selectedCollectionId, setSelectedCollectionId] = useState("");
    const [lineName, setLineName] = useState("");
    const [lineDescription, setLineDescription] = useState("");
    const [commonAttributes, setCommonAttributes] = useState<Record<string, { isCommon: boolean; value: string }>>({});
    const [matrixSelection, setMatrixSelection] = useState<Record<string, string[]>>({});
    const [selectedPrintIds, setSelectedPrintIds] = useState<string[]>([]);
    const [generatedPositions, setGeneratedPositions] = useState<Array<{
        tempId?: string;
        attributes: Record<string, string>;
        name: string;
        sku: string;
        designId?: string;
        baseItemId?: string;
        printName?: string;
        colorName?: string;
        sizeName?: string;
    }>>([]);

    const { setFormData, setValidationError } = form;
    const updateFormData = useCallback(
        (updates: Partial<ItemFormData> | ((prev: ItemFormData) => Partial<ItemFormData>)) => {
            setFormData((prev: ItemFormData) => {
                const resolved = typeof updates === 'function' ? updates(prev) : updates;
                return { ...prev, ...resolved };
            });
            setValidationError("");
        },
        [setFormData, setValidationError]
    );

    const resetMatrixAndLineStates = useCallback(() => {
        setCommonAttributes({});
        setMatrixSelection({});
        setGeneratedPositions([]);
        setLineName("");
        setLineDescription("");
        setSelectedPrintIds([]);
    }, []);

    return {
        ...form,
        creationType, setCreationType,
        lineMode, setLineMode,
        selectedLineId, setSelectedLineId,
        selectedCollectionId, setSelectedCollectionId,
        lineName, setLineName,
        lineDescription, setLineDescription,
        commonAttributes, setCommonAttributes,
        matrixSelection, setMatrixSelection,
        selectedPrintIds, setSelectedPrintIds,
        generatedPositions, setGeneratedPositions,
        updateFormData,
        resetMatrixAndLineStates,
    };
}
