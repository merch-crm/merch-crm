"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, Info } from "lucide-react";
import { useLineName } from "../hooks/use-line-name";
import { cn } from "@/lib/utils";

interface Attribute {
    id: string;
    code: string;
    name: string;
    values: Array<{
        id: string;
        value: string;
        label?: string;
    }>;
}

interface SelectedAttribute {
    attributeId: string;
    attributeCode?: string;
    attributeName: string;
    value: string;
    valueLabel?: string;
}

interface LineCharacteristicsStepProps {
    /** Доступные атрибуты категории */
    categoryAttributes: Attribute[];
    /** Выбранные значения атрибутов (все) */
    selectedAttributes: Record<string, string>;
    /** Общие атрибуты линейки (ID атрибутов) */
    commonAttributeIds: string[];
    /** Пользовательское название линейки */
    customLineName: string;
    /** Описание линейки */
    lineDescription: string;
    /** Callback изменения общих атрибутов */
    onCommonAttributesChange: (ids: string[]) => void;
    /** Callback изменения названия */
    onLineNameChange: (name: string) => void;
    /** Callback изменения описания */
    onLineDescriptionChange: (description: string) => void;
    /** Навигация назад */
    onBack: () => void;
    /** Навигация вперёд */
    onNext: () => void;
    /** Ошибки валидации */
    errors?: Record<string, string>;
}

export function LineCharacteristicsStep({
    categoryAttributes,
    selectedAttributes,
    commonAttributeIds,
    customLineName,
    lineDescription,
    onCommonAttributesChange,
    onLineNameChange,
    onLineDescriptionChange,
    onBack,
    onNext,
    errors,
}: LineCharacteristicsStepProps) {
    // Преобразуем общие атрибуты в формат для генератора
    const commonAttributesForName = useMemo(() => {
        return commonAttributeIds
            .map((attrId) => {
                const attr = categoryAttributes.find((a) => a.id === attrId);
                if (!attr) return null;

                const selectedValue = selectedAttributes[attrId];
                if (!selectedValue) return null;

                const valueObj = attr.values.find((v) => v.id === selectedValue || v.value === selectedValue);

                return {
                    attributeId: attrId,
                    attributeCode: attr.code,
                    attributeName: attr.name,
                    value: selectedValue,
                    valueLabel: valueObj?.label || valueObj?.value || selectedValue,
                };
            })
            .filter(Boolean) as SelectedAttribute[];
    }, [commonAttributeIds, categoryAttributes, selectedAttributes]);

    // Хук для управления названием
    const {
        displayName,
        generatedName,
        isCustom,
        setCustomName,
        resetToGenerated,
    } = useLineName({
        commonAttributes: commonAttributesForName,
        initialCustomName: customLineName,
    });

    // Синхронизируем название с родительским компонентом
    useEffect(() => {
        onLineNameChange(isCustom ? displayName : "");
    }, [displayName, isCustom, onLineNameChange]);

    // Обработчик переключения атрибута
    const handleAttributeToggle = (attributeId: string, checked: boolean) => {
        if (checked) {
            onCommonAttributesChange([...commonAttributeIds, attributeId]);
        } else {
            onCommonAttributesChange(commonAttributeIds.filter((id) => id !== attributeId));
        }
    };

    // Атрибуты, которые можно выбрать как общие (только те, что имеют значение)
    const availableAttributes = categoryAttributes.filter(
        (attr) => selectedAttributes[attr.id]
    );

    return (
        <div className="space-y-3">
            {/* Заголовок */}
            <div>
                <h2 className="text-xl font-semibold">Характеристики линейки</h2>
                <p className="text-muted-foreground mt-1">
                    Выберите, какие характеристики будут общими для всей линейки
                </p>
            </div>

            {/* Выбор общих атрибутов */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        Общие характеристики
                        <Tooltip
                            content="Общие характеристики одинаковы для всех позиций в линейке. Из них формируется название линейки."
                        >
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </Tooltip>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {availableAttributes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Сначала выберите значения атрибутов на предыдущем шаге
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableAttributes.map((attr) => {
                                const isChecked = commonAttributeIds.includes(attr.id);
                                const selectedValue = selectedAttributes[attr.id];
                                const valueObj = attr.values.find(
                                    (v) => v.id === selectedValue || v.value === selectedValue
                                );
                                const displayValue = valueObj?.label || valueObj?.value || selectedValue;

                                return (
                                    <div
                                        key={attr.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                            isChecked ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <Checkbox
                                            id={`attr-${attr.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                                handleAttributeToggle(attr.id, checked as boolean)
                                            }
                                        />
                                        <label
                                            htmlFor={`attr-${attr.id}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <span className="text-sm font-medium">{attr.name}</span>
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {displayValue}
                                            </Badge>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {errors?.commonAttributes && (
                        <p className="text-destructive text-sm mt-2">
                            {errors.commonAttributes}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Название линейки */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Название линейки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Автоматическое название */}
                    {generatedName && (
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Автоматическое название:
                                </p>
                                <p className="font-medium truncate">{generatedName}</p>
                            </div>
                        </div>
                    )}

                    {/* Поле ввода */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="line-name">
                                Своё название <span className="text-muted-foreground">(необязательно)</span>
                            </Label>
                            {isCustom && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetToGenerated}
                                    className="h-auto py-1 px-2 text-xs"
                                >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Сбросить
                                </Button>
                            )}
                        </div>
                        <Input
                            id="line-name"
                            value={isCustom ? displayName : ""}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={generatedName || "Введите название линейки"}
                            className={cn(isCustom && "border-primary")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Оставьте пустым для использования автоматического названия
                        </p>
                    </div>

                    {/* Итоговое название */}
                    <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                            Будет использоваться:
                        </p>
                        <p className="text-lg font-semibold">
                            {displayName || <span className="text-muted-foreground">Название не определено</span>}
                        </p>
                    </div>

                    {errors?.lineName && (
                        <p className="text-destructive text-sm">{errors.lineName}</p>
                    )}
                </CardContent>
            </Card>

            {/* Описание линейки */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Описание</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={lineDescription}
                        onChange={(e) => onLineDescriptionChange(e.target.value)}
                        placeholder="Описание линейки (необязательно)"
                        rows={3}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            {/* Превью */}
            {commonAttributesForName.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Превью названия позиций</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            Название позиций будет формироваться по шаблону:
                        </p>
                        <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                            <span className="text-blue-600">[Изделие]</span>
                            {" "}
                            <span className="text-green-600">{displayName || "[Название линейки]"}</span>
                            {" "}
                            <span className="text-purple-600">[Принт]</span>
                            {" "}
                            <span className="text-orange-600">[Цвет]</span>
                            {" "}
                            <span className="text-red-600">[Размер]</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Пример: Футболка {displayName || "Muse 220"} Овен Белый S
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Навигация */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад
                </Button>
                <Button onClick={onNext}>
                    Далее
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
