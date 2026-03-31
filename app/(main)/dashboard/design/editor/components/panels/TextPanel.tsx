"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor } from "../EditorProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
} from "lucide-react";
import { TextStyles, Textbox } from "@/lib/editor";

// Системные шрифты
const SYSTEM_FONTS = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: "Courier New", label: "Courier New" },
    { value: "Impact", label: "Impact" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

export function TextPanel() {
    const { selectedObjects, editor } = useEditor();

    const [styles, setStyles] = useState<TextStyles>({
        fontFamily: "Arial",
        fontSize: 24,
        fontWeight: "normal",
        fontStyle: "normal",
        fill: "#000000",
        textAlign: "left",
        underline: false,
        linethrough: false,
        charSpacing: 0,
        lineHeight: 1.2,
    });

    const selectedObject = selectedObjects[0];
    const isTextSelected = selectedObject?.type === "text";

    // Синхронизация с выбранным текстом
    useEffect(() => {
        if (!selectedObject || selectedObject.type !== "text") return;

        const obj = selectedObject.fabricObject as Textbox;
        setStyles({
            fontFamily: obj.fontFamily || "Arial",
            fontSize: obj.fontSize || 24,
            fontWeight: (obj.fontWeight as "normal" | "bold") || "normal",
            fontStyle: (obj.fontStyle as "normal" | "italic") || "normal",
            fill: (obj.fill as string) || "#000000",
            textAlign: (obj.textAlign as "left" | "center" | "right") || "left",
            underline: obj.underline || false,
            linethrough: obj.linethrough || false,
            charSpacing: (obj.charSpacing || 0) / 10,
            lineHeight: obj.lineHeight || 1.2,
        });
    }, [selectedObject]);

    // Применение стилей
    const applyStyles = useCallback(
        (newStyles: Partial<TextStyles>) => {
            if (!editor || !selectedObject || !isTextSelected) return;

            const updatedStyles = { ...styles, ...newStyles };
            setStyles(updatedStyles);
            editor.setTextStyles(selectedObject.id, newStyles);
        },
        [editor, selectedObject, isTextSelected, styles]
    );

    if (!isTextSelected) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Type className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Выберите текст</p>
                <p className="text-xs mt-1">
                    для редактирования стилей
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Шрифт */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Шрифт</Label>
                <Select
                    value={styles.fontFamily}
                    onChange={(value) => applyStyles({ fontFamily: value })}
                    options={SYSTEM_FONTS.map(f => ({ id: f.value, title: f.label }))}
                    className="w-full"
                    triggerClassName="h-9"
                    compact
                />
            </div>

            {/* Размер */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Размер</Label>
                <div className="flex gap-2">
                    <Select
                        value={styles.fontSize.toString()}
                        onChange={(value) =>
                            applyStyles({ fontSize: parseInt(value) })
                        }
                        options={FONT_SIZES.map(s => ({ id: s.toString(), title: s.toString() }))}
                        className="w-24"
                        triggerClassName="h-9 text-left px-3 text-xs"
                        compact
                    />
                    <Input
                        type="number"
                        value={styles.fontSize}
                        onChange={(e) =>
                            applyStyles({ fontSize: parseInt(e.target.value) || 24 })
                        }
                        min={1}
                        max={500}
                        className="h-9 flex-1"
                    />
                </div>
            </div>

            <Separator />

            {/* Стили текста */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Стиль</Label>
                <ToggleGroup
                    type="multiple"
                    className="justify-start"
                    value={[
                        styles.fontWeight === "bold" ? "bold" : "",
                        styles.fontStyle === "italic" ? "italic" : "",
                        styles.underline ? "underline" : "",
                        styles.linethrough ? "linethrough" : ""
                    ].filter(Boolean)}
                    onValueChange={(values: string[]) => {
                        applyStyles({
                            fontWeight: values.includes("bold") ? "bold" : "normal",
                            fontStyle: values.includes("italic") ? "italic" : "normal",
                            underline: values.includes("underline"),
                            linethrough: values.includes("linethrough")
                        });
                    }}
                >
                    <ToggleGroupItem value="bold">
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic">
                        <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline">
                        <Underline className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="linethrough">
                        <Strikethrough className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Выравнивание */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Выравнивание</Label>
                <ToggleGroup
                    type="single"
                    value={styles.textAlign}
                    onValueChange={(value: string) => {
                        if (value) applyStyles({ textAlign: value as TextStyles["textAlign"] });
                    }}
                    className="justify-start"
                >
                    <ToggleGroupItem value="left">
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center">
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right">
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <Separator />

            {/* Цвет */}
            <div className="space-y-3">
                <Label className="text-xs font-medium">Цвет</Label>
                <div className="flex items-center gap-2">
                    <div
                        className="w-9 h-9 rounded-lg border cursor-pointer"
                        style={{ backgroundColor: styles.fill }}
                    >
                        <input
                            type="color"
                            value={styles.fill}
                            onChange={(e) => applyStyles({ fill: e.target.value })}
                            className="w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <Input
                        value={styles.fill}
                        onChange={(e) => applyStyles({ fill: e.target.value })}
                        className="h-9 flex-1 font-mono"
                        maxLength={7}
                    />
                </div>
            </div>

            <Separator />

            {/* Межбуквенный интервал */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Межбуквенный интервал</Label>
                    <span className="text-xs text-muted-foreground">
                        {styles.charSpacing}
                    </span>
                </div>
                <Slider
                    value={[styles.charSpacing]}
                    min={-50}
                    max={200}
                    step={1}
                    onValueChange={([value]) => applyStyles({ charSpacing: value })}
                />
            </div>

            {/* Межстрочный интервал */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Межстрочный интервал</Label>
                    <span className="text-xs text-muted-foreground">
                        {styles.lineHeight.toFixed(1)}
                    </span>
                </div>
                <Slider
                    value={[styles.lineHeight * 10]}
                    min={5}
                    max={30}
                    step={1}
                    onValueChange={([value]) => applyStyles({ lineHeight: value / 10 })}
                />
            </div>
        </div>
    );
}
