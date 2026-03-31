"use client";

import { useState } from "react";
import { Droplet, Image as ImageIcon, Type, X } from "lucide-react";
import Image from "next/image";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useEditor } from "../EditorProvider";
import { WatermarkConfig, WatermarkPosition } from "@/lib/editor/types";

const defaultConfig: WatermarkConfig = {
    enabled: false,
    type: "text",
    text: "© Merch CRM",
    imagePath: undefined,
    position: "center",
    opacity: 0.3,
    scale: 1,
    rotation: -30,
    color: "#000000",
    fontSize: 48,
};

const positionOptions = [
    { value: "center", title: "По центру", id: "center" },
    { value: "top-left", title: "Сверху слева", id: "top-left" },
    { value: "top-right", title: "Сверху справа", id: "top-right" },
    { value: "bottom-left", title: "Снизу слева", id: "bottom-left" },
    { value: "bottom-right", title: "Снизу справа", id: "bottom-right" },
    { value: "tile", title: "Плитка", id: "tile" },
];

export function WatermarkPanel() {
    const { editor } = useEditor();
    const [config, setConfig] = useState<WatermarkConfig>(defaultConfig);
    const [previewVisible, setPreviewVisible] = useState(false);

    const updateConfig = (updates: Partial<WatermarkConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Создаём URL для превью
        const url = URL.createObjectURL(file);
        updateConfig({ imagePath: url, type: "image" });
    };

    const _handleApplyWatermark = () => {
        if (!editor) return;
        editor.setWatermarkConfig(config);
    };

    const handlePreview = () => {
        if (!editor) return;

        // if (previewVisible) {
        //   editor.hideWatermark();
        // } else {
        //   editor.showWatermark({...});
        // }
        setPreviewVisible(!previewVisible);
    };

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Водяной знак</Label>
                        <p className="text-xs text-muted-foreground">
                            Добавляется при экспорте
                        </p>
                    </div>
                    <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => updateConfig({ enabled })}
                    />
                </div>

                {config.enabled && (
                    <>
                        <Separator />

                        {/* Type */}
                        <Tabs
                            value={config.type}
                            onValueChange={(type) => updateConfig({ type: type as "text" | "image" })}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text">
                                    <Type className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Текст
                                </TabsTrigger>
                                <TabsTrigger value="image">
                                    <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Изображение
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-3 mt-4">
                                <div className="space-y-2">
                                    <Label>Текст</Label>
                                    <Input
                                        value={config.text || ""}
                                        onChange={(e) => updateConfig({ text: e.target.value })}
                                        placeholder="© Merch CRM"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Размер шрифта</Label>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            value={[config.fontSize || 48]}
                                            min={12}
                                            max={120}
                                            step={1}
                                            onValueChange={([value]) => updateConfig({ fontSize: value })}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-right">{config.fontSize || 48}px</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Цвет</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            value={config.color || "#000000"}
                                            onChange={(e) => updateConfig({ color: e.target.value })}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={config.color || "#000000"}
                                            onChange={(e) => updateConfig({ color: e.target.value })}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-3 mt-4">
                                <div className="space-y-2">
                                    <Label>Изображение</Label>
                                    {config.imagePath ? (
                                        <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                                            <Image
                                                src={config.imagePath}
                                                alt="Watermark"
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={() => updateConfig({ imagePath: undefined })}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="watermark-image"
                                            />
                                            <label
                                                htmlFor="watermark-image"
                                                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
                                                Нажмите для загрузки
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Масштаб</Label>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            value={[(config.scale || 1) * 100]}
                                            min={10}
                                            max={200}
                                            step={5}
                                            onValueChange={([value]) => updateConfig({ scale: value / 100 })}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-right">{Math.round((config.scale || 1) * 100)}%</span>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Separator />

                        {/* Position */}
                        <div className="space-y-2">
                            <Label>Расположение</Label>
                            <Select
                                value={config.position}
                                onChange={(position) => updateConfig({ position: position as WatermarkPosition })}
                                options={positionOptions}
                                triggerClassName="w-full"
                            />
                        </div>

                        {/* Opacity */}
                        <div className="space-y-2">
                            <Label>Прозрачность</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    value={[config.opacity * 100]}
                                    min={5}
                                    max={100}
                                    step={5}
                                    onValueChange={([value]) => updateConfig({ opacity: value / 100 })}
                                    className="flex-1"
                                />
                                <span className="w-12 text-sm text-right">{Math.round(config.opacity * 100)}%</span>
                            </div>
                        </div>

                        {/* Rotation */}
                        <div className="space-y-2">
                            <Label>Поворот</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    value={[config.rotation || -30]}
                                    min={-180}
                                    max={180}
                                    step={5}
                                    onValueChange={([value]) => updateConfig({ rotation: value })}
                                    className="flex-1"
                                />
                                <span className="w-12 text-sm text-right">{config.rotation || -30}°</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handlePreview}
                            >
                                <Droplet className="mr-2 h-4 w-4" />
                                {previewVisible ? "Скрыть" : "Предпросмотр"}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            Водяной знак будет добавлен автоматически при экспорте изображения
                        </p>
                    </>
                )}
            </div>
        </ScrollArea>
    );
}
