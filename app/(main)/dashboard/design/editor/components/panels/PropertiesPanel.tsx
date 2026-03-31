"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor } from "../EditorProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
    Move,
    RotateCw,
    Maximize2,
    Blend,
} from "lucide-react";

export function PropertiesPanel() {
    const { selectedObjects, editor } = useEditor();

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [rotation, setRotation] = useState(0);
    const [opacity, setOpacity] = useState(100);

    const selectedObject = selectedObjects[0];

    // Синхронизация с выбранным объектом
    useEffect(() => {
        if (!selectedObject) return;

        const obj = selectedObject.fabricObject;
        setPosition({
            x: Math.round(obj.left ?? 0),
            y: Math.round(obj.top ?? 0),
        });
        setSize({
            width: Math.round(obj.getScaledWidth()),
            height: Math.round(obj.getScaledHeight()),
        });
        setRotation(Math.round(obj.angle ?? 0));
        setOpacity(Math.round((obj.opacity ?? 1) * 100));
    }, [selectedObject]);

    // Обработчики изменений
    const handlePositionChange = useCallback(
        (axis: "x" | "y", value: number) => {
            if (!editor || !selectedObject) return;

            const newPos = { ...position, [axis]: value };
            setPosition(newPos);
            editor.setObjectPosition(selectedObject.id, newPos.x, newPos.y);
        },
        [editor, selectedObject, position]
    );

    const handleRotationChange = useCallback(
        (value: number) => {
            if (!editor || !selectedObject) return;

            setRotation(value);
            editor.setObjectRotation(selectedObject.id, value);
        },
        [editor, selectedObject]
    );

    const handleOpacityChange = useCallback(
        (value: number) => {
            if (!editor || !selectedObject) return;

            setOpacity(value);
            editor.setObjectOpacity(selectedObject.id, value / 100);
        },
        [editor, selectedObject]
    );

    if (!selectedObject) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Move className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Выберите объект</p>
                <p className="text-xs mt-1">
                    для редактирования свойств
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Позиция */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Позиция</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">X</Label>
                        <Input
                            type="number"
                            value={position.x}
                            onChange={(e) =>
                                handlePositionChange("x", parseInt(e.target.value) || 0)
                            }
                            className="h-8"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Y</Label>
                        <Input
                            type="number"
                            value={position.y}
                            onChange={(e) =>
                                handlePositionChange("y", parseInt(e.target.value) || 0)
                            }
                            className="h-8"
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Размер (только отображение) */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Размер</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Ширина</Label>
                        <Input
                            type="number"
                            value={size.width}
                            disabled
                            className="h-8 bg-muted"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Высота</Label>
                        <Input
                            type="number"
                            value={size.height}
                            disabled
                            className="h-8 bg-muted"
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Используйте углы объекта для изменения размера
                </p>
            </div>

            <Separator />

            {/* Поворот */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Поворот</h4>
                </div>
                <div className="flex items-center gap-3">
                    <Slider
                        value={[rotation]}
                        min={0}
                        max={360}
                        step={1}
                        onValueChange={([value]) => handleRotationChange(value)}
                        className="flex-1"
                    />
                    <div className="w-16">
                        <Input
                            type="number"
                            value={rotation}
                            onChange={(e) =>
                                handleRotationChange(parseInt(e.target.value) || 0)
                            }
                            min={0}
                            max={360}
                            className="h-8 text-center"
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">°</span>
                </div>
            </div>

            <Separator />

            {/* Прозрачность */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Blend className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Прозрачность</h4>
                </div>
                <div className="flex items-center gap-3">
                    <Slider
                        value={[opacity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => handleOpacityChange(value)}
                        className="flex-1"
                    />
                    <div className="w-16">
                        <Input
                            type="number"
                            value={opacity}
                            onChange={(e) =>
                                handleOpacityChange(parseInt(e.target.value) || 0)
                            }
                            min={0}
                            max={100}
                            className="h-8 text-center"
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">%</span>
                </div>
            </div>
        </div>
    );
}
