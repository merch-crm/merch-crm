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
            className={cn("mt-auto pb-0 pt-0 transition-all duration-500",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
            style={{ width: containerDims ? containerDims.w : '100%' }}
        >
            <div className="space-y-3">
                {/* ZOOM SLIDER */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 px-0.5">
                        <span>Масштаб</span>
                        <span className={cn("transition-colors", !disabled ? "text-indigo-500" : "text-slate-400")}>
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Slider
                            value={[zoom || 1]}
                            onValueChange={([val]) => onUpdatePitch({ zoom: val })}
                            min={1}
                            max={3}
                            step={0.01}
                            className="flex-1"
                        />
                        <Button
                            onClick={onReset}
                            size="icon"
                            variant="ghost"
                            className="w-5 h-5 rounded-full bg-slate-100/50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
                            title="Сбросить"
                        >
                            <RotateCcw className="w-2.5 h-2.5" />
                        </Button>
                    </div>
                </div>

                {/* X/Y Sliders */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 px-0.5">По горизонтали</div>
                        <Slider
                            disabled={maxBounds.x <= 0}
                            value={[x || 0]}
                            onValueChange={([val]) => onUpdatePitch({ x: val })}
                            min={-Math.max(1, maxBounds.x)}
                            max={Math.max(1, maxBounds.x)}
                            step={0.5}
                            className={cn(maxBounds.x <= 0 && "opacity-50")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 px-0.5">По вертикали</div>
                        <Slider
                            disabled={maxBounds.y <= 0}
                            value={[y || 0]}
                            onValueChange={([val]) => onUpdatePitch({ y: val })}
                            min={-Math.max(1, maxBounds.y)}
                            max={Math.max(1, maxBounds.y)}
                            step={0.5}
                            className={cn(maxBounds.y <= 0 && "opacity-50")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
