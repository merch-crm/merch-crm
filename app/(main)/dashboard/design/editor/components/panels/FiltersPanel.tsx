"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor } from "../EditorProvider";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sun,
    Contrast,
    Palette,
    Droplets,
    RotateCcw,
    Sliders,
} from "lucide-react";
import { FilterType, ImageFilters } from "@/lib/editor";
import { DEFAULT_IMAGE_FILTERS } from "@/lib/editor/constants";

export function FiltersPanel() {
    const { selectedObjects, editor } = useEditor();

    const [filters, setFilters] = useState<ImageFilters>(DEFAULT_IMAGE_FILTERS);

    const selectedObject = selectedObjects[0];
    const isImageSelected = selectedObject?.type === "image";

    // Синхронизация с выбранным изображением
    useEffect(() => {
        if (!selectedObject || selectedObject.type !== "image" || !editor) return;

        const currentFilters = editor.getFilters(selectedObject.id);
        const newFilters = { ...DEFAULT_IMAGE_FILTERS };

        currentFilters.forEach((f) => {
            switch (f.type) {
                case "brightness":
                    newFilters.brightness = f.value;
                    break;
                case "contrast":
                    newFilters.contrast = f.value;
                    break;
                case "saturation":
                    newFilters.saturation = f.value;
                    break;
                case "blur":
                    newFilters.blur = f.value;
                    break;
                case "grayscale":
                    newFilters.grayscale = true;
                    break;
                case "sepia":
                    newFilters.sepia = true;
                    break;
                case "invert":
                    newFilters.invert = true;
                    break;
                case "noise":
                    newFilters.noise = f.value;
                    break;
                case "pixelate":
                    newFilters.pixelate = f.value;
                    break;
            }
        });

        setFilters(newFilters);
    }, [selectedObject, editor]);

    // Применение фильтра
    const applyFilter = useCallback(
        (type: FilterType, value: number | boolean) => {
            if (!editor || !selectedObject || !isImageSelected) return;

            const numValue = typeof value === "boolean" ? (value ? 1 : 0) : value;

            if (numValue === 0 || value === false) {
                editor.removeFilter(selectedObject.id, type);
            } else {
                editor.applyFilter(selectedObject.id, { type, value: numValue });
            }

            setFilters((prev) => ({
                ...prev,
                [type]: value,
            }));
        },
        [editor, selectedObject, isImageSelected]
    );

    // Сброс всех фильтров
    const resetFilters = useCallback(() => {
        if (!editor || !selectedObject || !isImageSelected) return;

        const filterTypes: FilterType[] = [
            "brightness",
            "contrast",
            "saturation",
            "blur",
            "grayscale",
            "sepia",
            "invert",
            "noise",
            "pixelate",
        ];

        filterTypes.forEach((type) => {
            editor.removeFilter(selectedObject.id, type);
        });

        setFilters(DEFAULT_IMAGE_FILTERS);
    }, [editor, selectedObject, isImageSelected]);

    if (!isImageSelected) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Sliders className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Выберите изображение</p>
                <p className="text-xs mt-1">
                    для применения фильтров
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Кнопка сброса */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="h-7 text-xs"
                >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Сбросить
                </Button>
            </div>

            {/* Яркость */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium flex-1">Яркость</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(filters.brightness * 100)}%
                    </span>
                </div>
                <Slider
                    value={[filters.brightness * 100]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => applyFilter("brightness", value / 100)}
                />
            </div>

            {/* Контраст */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium flex-1">Контраст</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(filters.contrast * 100)}%
                    </span>
                </div>
                <Slider
                    value={[filters.contrast * 100]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => applyFilter("contrast", value / 100)}
                />
            </div>

            {/* Насыщенность */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium flex-1">Насыщенность</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(filters.saturation * 100)}%
                    </span>
                </div>
                <Slider
                    value={[filters.saturation * 100]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => applyFilter("saturation", value / 100)}
                />
            </div>

            {/* Размытие */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-medium flex-1">Размытие</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(filters.blur * 100)}%
                    </span>
                </div>
                <Slider
                    value={[filters.blur * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => applyFilter("blur", value / 100)}
                />
            </div>

            <Separator />

            {/* Эффекты */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Эффекты</Label>

                <div className="flex items-center justify-between">
                    <Label className="text-xs">Чёрно-белый</Label>
                    <Switch
                        checked={filters.grayscale}
                        onCheckedChange={(checked) => applyFilter("grayscale", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label className="text-xs">Сепия</Label>
                    <Switch
                        checked={filters.sepia}
                        onCheckedChange={(checked) => applyFilter("sepia", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label className="text-xs">Инверсия</Label>
                    <Switch
                        checked={filters.invert}
                        onCheckedChange={(checked) => applyFilter("invert", checked)}
                    />
                </div>
            </div>

            <Separator />

            {/* Шум */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium flex-1">Шум</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {filters.noise}
                    </span>
                </div>
                <Slider
                    value={[filters.noise]}
                    min={0}
                    max={500}
                    step={10}
                    onValueChange={([value]) => applyFilter("noise", value)}
                />
            </div>

            {/* Пикселизация */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium flex-1">Пикселизация</Label>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {filters.pixelate}
                    </span>
                </div>
                <Slider
                    value={[filters.pixelate]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={([value]) => applyFilter("pixelate", value)}
                />
            </div>
        </div>
    );
}
