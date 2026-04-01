"use client";

import {
    Package,
    Tag,
    AlertTriangle,
    ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn, formatPlural } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type {
    Category,
    AttributeType,
    InventoryAttribute,
    ItemFormData,
    StorageLocation,
} from "@/app/(main)/dashboard/warehouse/types";
import type { CreationType, LineMode } from "./position-type-step";

interface PositionPreview {
    tempId: string;
    attributes: Record<string, string>;
    name: string;
    sku: string;
}

interface LineSummaryStepProps {
    category: Category;
    lineName: string;
    lineDescription: string;
    lineType: CreationType;
    lineMode: LineMode;
    positions: PositionPreview[];
    commonAttributes: Record<string, { isCommon: boolean; value: string }>;
    attributeTypes: AttributeType[];
    dynamicAttributes: InventoryAttribute[];
    formData: ItemFormData;
    storageLocations: StorageLocation[];
    onSubmit: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function LineSummaryStep({
    category,
    lineName,
    lineDescription,
    lineType,
    lineMode,
    positions,
    commonAttributes,
    attributeTypes,
    dynamicAttributes,
    formData,
    storageLocations,
    onSubmit,
    onBack,
    validationError,
    isSubmitting,
}: LineSummaryStepProps) {
    const [showPositions, setShowPositions] = useState(false);

    const storageLocation = storageLocations.find(
        (l) => l.id === formData.storageLocationId
    );

    const getAttributeValueName = (slug: string, code: string): string => {
        const attr = attributeTypes.find((a) => a.slug === slug);
        if (!attr) return code;
        const value = dynamicAttributes.find(
            (da) => da.type === attr.id && da.value === code
        );
        return value?.name || code;
    };

    const isFinished = lineType === "finished_line";
    const isNewLine = lineMode === "new";

    const totalQuantity = positions.length * (Number(formData.quantity) || 0);
    const totalCost =
        positions.length *
        (Number(formData.quantity) || 0) *
        (Number(formData.costPrice) || 0);

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="p-8 space-y-3">
                    {/* Заголовок */}
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "w-12 h-12 rounded-[var(--radius)] flex items-center justify-center shrink-0 shadow-lg",
                                isFinished
                                    ? "bg-green-600 shadow-green-200"
                                    : "bg-blue-600 shadow-blue-200"
                            )}
                        >
                            {isFinished ? (
                                <Tag className="w-6 h-6 text-white" />
                            ) : (
                                <Package className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Проверка и создание
                            </h2>
                            <p className="text-xs font-bold text-slate-700 opacity-60">
                                {isNewLine
                                    ? "Проверьте данные новой линейки"
                                    : "Проверьте позиции для добавления"}
                            </p>
                        </div>
                    </div>

                    {/* Информация о линейке */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{lineName}</CardTitle>
                                    <CardDescription>{category.name}</CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        isFinished
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                    }
                                >
                                    {isFinished ? "Готовая линейка" : "Базовая линейка"}
                                </Badge>
                            </div>
                        </CardHeader>
                        {lineDescription ? (
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{lineDescription}</p>
                            </CardContent>
                        ) : null}
                    </Card>

                    {/* Общие характеристики */}
                    {Object.entries(commonAttributes).some(([_, c]) => c.isCommon && c.value) ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Общие характеристики
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(commonAttributes)
                                        .filter(([_, c]) => c.isCommon && c.value)
                                        .map(([slug, config]) => {
                                            const attr = attributeTypes.find((a) => a.slug === slug);
                                            return (
                                                <Badge
                                                    key={slug}
                                                    variant="secondary"
                                                    className="text-sm"
                                                >
                                                    {attr?.name}: {getAttributeValueName(slug, config.value)}
                                                </Badge>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Статистика */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Позиций</CardDescription>
                                <CardTitle className="text-2xl">{positions.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Кол-во каждой</CardDescription>
                                <CardTitle className="text-2xl">
                                    {formData.quantity || 0} шт.
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Всего единиц</CardDescription>
                                <CardTitle className="text-2xl">{totalQuantity} шт.</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Общая стоимость</CardDescription>
                                <CardTitle className="text-2xl">
                                    {totalCost.toLocaleString()} ₽
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Склад */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Хранение и цены</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Склад:</span>
                                <span className="font-medium">
                                    {storageLocation?.name || "Не выбран"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Себестоимость:</span>
                                <span className="font-medium">{formData.costPrice || 0} ₽</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Цена продажи:</span>
                                <span className="font-medium">
                                    {formData.sellingPrice || 0} ₽
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Список позиций — аккордеон через нативный HTML */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowPositions(!showPositions)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-base text-slate-900"
                        >
                            <span>Список позиций ({positions.length})</span>
                            <ChevronDown
                                className={cn(
                                    "w-5 h-5 text-slate-500 transition-transform",
                                    showPositions && "rotate-180"
                                )}
                            />
                        </button>
                        {showPositions && (
                            <table className="crm-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="w-12 px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">#</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">Название</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">SKU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.slice(0, 50).map((pos, index) => (
                                        <tr key={pos.tempId} className="border-b border-slate-100 last:border-0">
                                            <td className="font-mono text-slate-500 px-4 py-3">
                                                {index + 1}
                                            </td>
                                            <td className="font-medium px-4 py-3">
                                                {pos.name}
                                            </td>
                                            <td className="font-mono text-sm text-slate-600 px-4 py-3">
                                                {pos.sku}
                                            </td>
                                        </tr>
                                    ))}
                                    {positions.length > 50 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="text-center text-slate-500 px-4 py-3"
                                            >
                                                ... и ещё {positions.length - 50} позиций
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Предупреждение */}
                    {positions.length > 100 && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-900">Много позиций</p>
                                <p className="text-sm text-amber-700">
                                    Создание {positions.length} позиций может занять некоторое
                                    время. Пожалуйста, дождитесь завершения.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ошибка валидации */}
                    {validationError && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 animate-in fade-in">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-sm font-medium">{validationError}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto shrink-0">
                <StepFooter
                    onBack={onBack}
                    onNext={onSubmit}
                    nextLabel={
                        isSubmitting
                            ? "Создание..."
                            : `Создать ${positions.length} ${formatPlural(positions.length, ["позицию", "позиции", "позиций"])}`
                    }
                    isNextDisabled={isSubmitting}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}
