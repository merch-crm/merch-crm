"use client";

import { useMemo, useEffect, useRef } from "react";
import type {
    Category,
    AttributeType,
    InventoryAttribute,
} from "@/app/(main)/dashboard/warehouse/types";

interface MatrixSelection {
    [attributeSlug: string]: string[];
}

interface PositionPreview {
    attributes: Record<string, string>;
    name: string;
    sku: string;
}

interface UseMatrixGeneratorProps {
    category: Category;
    attributeTypes: AttributeType[];
    dynamicAttributes: InventoryAttribute[];
    commonAttributes: Record<string, { isCommon: boolean; value: string }>;
    matrixSelection: MatrixSelection;
    onPositionsGenerated: (positions: PositionPreview[]) => void;
    isFinishedLine?: boolean;
    selectedDesigns?: string[];
    availableDesigns?: Array<{ id: string; name: string; sku: string }>;
}

export function useMatrixGenerator({
    category,
    attributeTypes,
    dynamicAttributes,
    commonAttributes,
    matrixSelection,
    onPositionsGenerated,
    isFinishedLine,
    selectedDesigns = [],
    availableDesigns = [],
}: UseMatrixGeneratorProps) {
    const lastPositionsRef = useRef<string>("");

    const uniqueAttributes = useMemo(() => {
        return attributeTypes.filter((attr) => {
            const config = commonAttributes[attr.slug];
            return !config?.isCommon;
        });
    }, [attributeTypes, commonAttributes]);

    const attributeValues = useMemo(() => {
        const result: Record<string, Array<{ code: string; name: string; color?: string }>> = {};

        uniqueAttributes.forEach((attr) => {
            const rawValues = dynamicAttributes
                .filter((da) => da.type === attr.id || da.type === attr.slug)
                .map((da) => ({
                    code: da.value,
                    name: da.name,
                    color: (da.meta as Record<string, unknown>)?.hex as string ||
                        (da as unknown as Record<string, unknown>).hex as string ||
                        (da.meta as Record<string, unknown>)?.color as string ||
                        undefined,
                }));

            // Удаляем дубликаты по code (value), чтобы React не ругался на одинаковые key в map
            const uniqueValues = Array.from(new Map(rawValues.map(item => [item.code, item])).values());

            result[attr.slug] = uniqueValues;
        });

        return result;
    }, [uniqueAttributes, dynamicAttributes]);

    const totalCombinations = useMemo(() => {
        let count = 1;
        uniqueAttributes.forEach((attr) => {
            const selected = matrixSelection[attr.slug]?.length || 0;
            if (selected > 0) count *= selected;
        });
        if (isFinishedLine && selectedDesigns.length > 0) {
            count *= selectedDesigns.length;
        }
        return count > 1 ? count : 0;
    }, [matrixSelection, uniqueAttributes, isFinishedLine, selectedDesigns]);

    useEffect(() => {
        const generatePositions = () => {
            const selectedValues: Array<{
                slug: string;
                values: Array<{ code: string; name: string }>;
            }> = [];

            uniqueAttributes.forEach((attr) => {
                const selected = matrixSelection[attr.slug] || [];
                if (selected.length > 0) {
                    const values = (attributeValues[attr.slug] || [])
                        .filter((v) => selected.includes(v.code))
                        .map((v) => ({ code: v.code, name: v.name }));
                    selectedValues.push({ slug: attr.slug, values });
                }
            });

            if (isFinishedLine && selectedDesigns.length > 0) {
                const designValues = availableDesigns
                    .filter((d: { id: string; name: string; sku: string }) => selectedDesigns.includes(d.id))
                    .map((d: { id: string; name: string; sku: string }) => ({ code: d.id, name: d.name }));
                selectedValues.unshift({ slug: "design", values: designValues });
            }

            if (selectedValues.length === 0) {
                if (lastPositionsRef.current !== "[]") {
                    lastPositionsRef.current = "[]";
                    onPositionsGenerated([]);
                }
                return;
            }

            const cartesian = (
                arrays: Array<Array<{ code: string; name: string }>>
            ): Array<Array<{ code: string; name: string }>> => {
                if (arrays.length === 0) return [[]];
                const [first, ...rest] = arrays;
                const restCartesian = cartesian(rest);
                return first.flatMap((item) =>
                    restCartesian.map((combo) => [item, ...combo])
                );
            };

            const combinations = cartesian(selectedValues.map((sv) => sv.values));

            const positions: PositionPreview[] = combinations.map((combo) => {
                const attributes: Record<string, string> = {};
                const nameParts: string[] = [category.name];
                const skuParts: string[] = [category.prefix || ""];

                Object.entries(commonAttributes).forEach(([slug, config]: [string, { isCommon: boolean; value: string }]) => {
                    if (config.isCommon && config.value) {
                        attributes[slug] = config.value;
                        const attr = attributeTypes.find((a) => a.slug === slug);
                        const valueObj = dynamicAttributes.find(
                            (da) => da.type === attr?.id && da.value === config.value
                        );
                        if (valueObj) {
                            nameParts.push(valueObj.name);
                            if (attr?.showInSku) skuParts.push(config.value);
                        }
                    }
                });

                combo.forEach((item, index) => {
                    const sv = selectedValues[index];
                    attributes[sv.slug] = item.code;
                    nameParts.push(item.name);

                    const attr = attributeTypes.find((a) => a.slug === sv.slug);
                    if (attr?.showInSku || sv.slug === "design") {
                        skuParts.push(item.code.toUpperCase());
                    }
                });

                return {
                    attributes,
                    name: nameParts.join(" "),
                    sku: skuParts.filter(Boolean).join("-"),
                };
            });

            const positionsJson = JSON.stringify(positions);
            if (positionsJson !== lastPositionsRef.current) {
                lastPositionsRef.current = positionsJson;
                onPositionsGenerated(positions);
            }
        };

        generatePositions();
    }, [
        matrixSelection,
        selectedDesigns,
        uniqueAttributes,
        attributeValues,
        commonAttributes,
        attributeTypes,
        dynamicAttributes,
        category,
        isFinishedLine,
        availableDesigns,
        onPositionsGenerated,
    ]);

    return {
        uniqueAttributes,
        attributeValues,
        totalCombinations,
    };
}
