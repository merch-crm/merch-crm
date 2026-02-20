import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ImageThumbControlsProps {
    disabled: boolean;
    containerDims: { w: number; h: number } | null;
    zoom: number;
    x: number;
    y: number;
    maxBounds: { x: number; y: number };
    onUpdatePitch: (settings: Partial<{ zoom: number; x: number; y: number }>) => void;
    onReset: () => void;
}

export function ImageThumbControls({
    disabled,
    containerDims,
    zoom,
    x,
    y,
    maxBounds,
    onUpdatePitch,
    onReset
}: ImageThumbControlsProps) {
    return (
        <div
            className={cn(
                "mt-1 pb-0 pt-2 transition-all duration-500",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
            style={{ width: containerDims ? containerDims.w : '100%' }}
        >
            <div className="space-y-4">
                {/* ZOOM SLIDER */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2 relative pt-2">
                        <div className="flex justify-between items-center text-[13px] font-bold text-slate-700 absolute top-[-9px] w-full">
                            <span>Масштаб</span>
                            <span className={cn("transition-colors", !disabled ? "text-primary" : "text-slate-700")}>
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>
                        <Slider
                            value={[zoom]}
                            onValueChange={([val]) => onUpdatePitch({ zoom: val })}
                            min={1}
                            max={3}
                            step={0.05}
                            className="mt-2"
                        />
                    </div>
                    <Button
                        onClick={onReset}
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0 mt-3"
                        title="Сбросить"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </Button>
                </div>

                {/* X/Y Sliders */}
                <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-2 relative pt-2">
                            <div className="flex justify-between items-center text-[13px] font-bold text-slate-700 absolute top-[-9px] w-full">
                                <span className="whitespace-nowrap">По горизонтали</span>
                            </div>
                            <Slider
                                disabled={maxBounds.x <= 0}
                                value={[x]}
                                onValueChange={([val]) => onUpdatePitch({ x: val })}
                                min={-Math.max(1, maxBounds.x)}
                                max={Math.max(1, maxBounds.x)}
                                step={1}
                                className={cn("mt-2", maxBounds.x <= 0 && "opacity-50")}
                            />
                        </div>

                        <div className="space-y-2 relative pt-2">
                            <div className="flex justify-between items-center text-[13px] font-bold text-slate-700 absolute top-[-9px] w-full">
                                <span className="whitespace-nowrap">По вертикали</span>
                            </div>
                            <Slider
                                disabled={maxBounds.y <= 0}
                                value={[y]}
                                onValueChange={([val]) => onUpdatePitch({ y: val })}
                                min={-Math.max(1, maxBounds.y)}
                                max={Math.max(1, maxBounds.y)}
                                step={1}
                                className={cn("mt-2", maxBounds.y <= 0 && "opacity-50")}
                            />
                        </div>
                    </div>
                    <div className="w-6 shrink-0" aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
