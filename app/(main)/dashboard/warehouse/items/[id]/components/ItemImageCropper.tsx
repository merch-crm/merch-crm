"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThumbSettings {
    zoom: number;
    x: number;
    y: number;
}

interface ItemImageCropperProps {
    thumbSettings: ThumbSettings;
    updateThumb: (settings: Partial<ThumbSettings>) => void;
    resetThumbSettings: () => void;
    maxBounds: { x: number; y: number };
}

interface AxisSliderProps {
    label: string;
    value: number;
    bound: number;
    onChange: (value: number) => void;
}

function AxisSlider({ label, value, bound, onChange }: AxisSliderProps) {
    const normalizedPos = bound > 0
        ? `${50 + (Math.max(-1, Math.min(1, value / bound)) * 50)}%`
        : '50%';
    const barLeft = value < 0 && bound > 0
        ? normalizedPos
        : '50%';
    const barWidth = bound > 0
        ? `${Math.abs(Math.max(-1, Math.min(1, value / bound))) * 50}%`
        : '0%';

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span className="whitespace-nowrap">{label}</span>
            </div>
            <div className="relative h-6 flex items-center select-none touch-none">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-muted-foreground/30 rounded-full z-0" />
                    <div
                        className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                        style={{ left: barLeft, width: barWidth }}
                    />
                </div>
                <div
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-border bg-background transition-all duration-75 pointer-events-none z-20",
                        bound <= 0 && "bg-muted-foreground/30",
                        value !== 0 && "border-primary/20 ring-2 ring-primary/10"
                    )}
                    style={{ left: normalizedPos }}
                />
                <input
                    type="range"
                    min={-Math.max(1, bound)}
                    max={Math.max(1, bound)}
                    step="1"
                    value={value ?? 0}
                    disabled={bound <= 0}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onDoubleClick={() => onChange(0)}
                    className={cn(
                        "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0",
                        bound <= 0 && "cursor-not-allowed"
                    )}
                />
            </div>
        </div>
    );
}

export function ItemImageCropper({

    thumbSettings,
    updateThumb,
    resetThumbSettings,
    maxBounds
}: ItemImageCropperProps) {
    return (
        <div className="crm-card rounded-3xl p-4 animate-in fade-in slide-in-from-top-4 duration-500 col-span-2 md:col-span-1">
            <div className="space-y-3">
                {/* ZOOM SLIDER */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                            <span>Масштаб</span>
                            <span className="text-primary">{Math.round((thumbSettings.zoom ?? 1) * 100)}%</span>
                        </div>
                        <div className="relative h-6 flex items-center select-none touch-none">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden">
                                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                <div
                                    className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                                    style={{
                                        left: '0%',
                                        width: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                    }}
                                />
                            </div>
                            <div
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-border bg-background transition-all duration-75 pointer-events-none z-20",
                                    thumbSettings.zoom !== 1 && "border-primary/20 ring-2 ring-primary/10"
                                )}
                                style={{
                                    left: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                }}
                            />
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={thumbSettings.zoom ?? 1}
                                onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })}
                                onDoubleClick={() => updateThumb({ zoom: 1 })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0"
                            />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetThumbSettings}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors p-0 border-none shadow-none"
                        title="Сбросить"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </Button>
                </div>

                {/* X/Y Sliders */}
                <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                        <AxisSlider
                            label="По горизонтали"
                            value={thumbSettings.x ?? 0}
                            bound={maxBounds.x}
                            onChange={(v) => updateThumb({ x: v })}
                        />
                        <AxisSlider
                            label="По вертикали"
                            value={thumbSettings.y ?? 0}
                            bound={maxBounds.y}
                            onChange={(v) => updateThumb({ y: v })}
                        />
                    </div>
                    <div className="w-6 shrink-0" aria-hidden="true" />

                </div>
            </div>
        </div>
    );
}
