"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import {
    SILKSCREEN_GARMENTS,
    SILKSCREEN_POSITIONS,
    SILKSCREEN_PRINT_SIZES,
    SILKSCREEN_INK_TYPES,
    type SilkscreenPrintInput,
} from "../../silkscreen-types";

type SilkscreenOrderActions = {
    onUpdate: (updates: Partial<SilkscreenPrintInput>) => void;
    onRemove: () => void;
    onUpdatePosition: (index: number, updates: Partial<SilkscreenPrintInput['positions'][number]>) => void;
    onAddPosition: () => void;
    onAddColor: (posIndex: number) => void;
    onRemoveColor: (posIndex: number, colorIndex: number) => void;
    onUpdateColor: (posIndex: number, colorIndex: number, updates: Partial<SilkscreenPrintInput['positions'][number]['colors'][number]>) => void;
};

interface SilkscreenOrderCardProps {
    order: SilkscreenPrintInput;
    actions: SilkscreenOrderActions;
}

export function SilkscreenOrderCard({
    order,
    actions
}: SilkscreenOrderCardProps) {
    const { onUpdate, onRemove, onUpdatePosition, onAddPosition, onAddColor, onRemoveColor, onUpdateColor } = actions;
    return (
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                        <div className="space-y-2">
                            <Label>Изделие</Label>
                            <Select
                                value={order.garmentId}
                                onChange={(val) => onUpdate({ garmentId: val })}
                                options={SILKSCREEN_GARMENTS.map((g) => ({ id: g.id, title: g.name }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Количество (шт)</Label>
                            <Input
                                type="number"
                                min={1}
                                value={order.quantity}
                                onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id={`dark-${order.id}`}
                                checked={order.isDarkGarment}
                                onCheckedChange={(val) => onUpdate({ isDarkGarment: !!val })}
                            />
                            <Label htmlFor={`dark-${order.id}`}>Темное изделие</Label>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground tracking-normal">Принты / Позиции</h4>
                        <Button variant="outline" size="sm" onClick={onAddPosition} className="h-7 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Добавить позицию
                        </Button>
                    </div>

                    {order.positions.map((pos, pIndex) => (
                        <div key={pIndex} className="bg-muted/50 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Расположение</Label>
                                    <Select
                                        value={pos.positionId}
                                        onChange={(val) => onUpdatePosition(pIndex, { positionId: val })}
                                        options={SILKSCREEN_POSITIONS.map((p) => ({ id: p.id, title: p.name }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Размер</Label>
                                    <Select
                                        value={pos.sizeId}
                                        onChange={(val) => onUpdatePosition(pIndex, { sizeId: val })}
                                        options={SILKSCREEN_PRINT_SIZES.map((s) => ({ id: s.id, title: `${s.name} (${s.width}×${s.height}мм)` }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Цвета (сетки)</Label>
                                    <Button variant="ghost" size="sm" onClick={() => onAddColor(pIndex)} className="h-6 text-xs px-2">
                                        + цвет
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pos.colors.map((color, cIndex) => (
                                        <Badge key={cIndex} variant="secondary" className="pr-1 gap-2 bg-background border flex items-center">
                                            <div className="w-28 pl-1">
                                                <Select
                                                    value={color.inkType}
                                                    onChange={(val) => onUpdateColor(pIndex, cIndex, { inkType: val })}
                                                    options={SILKSCREEN_INK_TYPES.map((ink) => ({ id: ink.id, title: ink.name }))}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 border-l pl-2">
                                                <Checkbox
                                                    className="w-3 h-3"
                                                    checked={color.isUnderbase}
                                                    onCheckedChange={(val) => onUpdateColor(pIndex, cIndex, { isUnderbase: !!val })}
                                                />
                                                <span className="text-xs">Подл.</span>
                                            </div>
                                            {pos.colors.length > 1 && (
                                                <button type="button" onClick={() => onRemoveColor(pIndex, cIndex)} className="ml-1 text-muted-foreground hover:text-destructive">
                                                    <Plus className="w-3 h-3 rotate-45" />
                                                </button>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
